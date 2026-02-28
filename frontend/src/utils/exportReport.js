// frontend/src/utils/exportReport.js
// ══════════════════════════════════════════════════════════════════════════════
// Professional Report Export Utility
// Generates CSV, JSON, and PDF-style HTML reports with headers, metadata,
// statistical summaries, and formatted sensor data tables.
// ══════════════════════════════════════════════════════════════════════════════

import { THRESHOLDS } from './thresholds';

// ── Helpers ──────────────────────────────────────────────────────────────────

const SENSOR_LABELS = { temp: 'Température', hmdt: 'Humidité', gaz: 'Gaz' };
const SENSOR_UNITS = { temp: '°C', hmdt: '%', gaz: 'ppm' };

/**
 * Normalise a reading to {temperature, humidity, gas, timestamp}
 */
function normalise(r) {
  return {
    temperature: r.temp ?? r.temperature ?? null,
    humidity: r.hmdt ?? r.humidity ?? null,
    gas: r.gaz ?? r.gas ?? null,
    timestamp: r.timestamp,
  };
}

/**
 * Compute stats for an array of numbers (ignoring nulls).
 */
function computeStats(values) {
  const valid = values.filter((v) => v !== null && v !== undefined && !isNaN(v));
  if (valid.length === 0) return { min: '—', max: '—', avg: '—', count: 0 };
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const avg = valid.reduce((s, v) => s + v, 0) / valid.length;
  return { min: min.toFixed(2), max: max.toFixed(2), avg: avg.toFixed(2), count: valid.length };
}

function fmtDate(d) {
  return new Date(d).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function fmtDateShort(d) {
  return new Date(d).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function alertLevel(type, value) {
  const t = THRESHOLDS[type];
  if (!t || value === null) return 'Normal';
  if (value >= t.critical.max || value <= t.critical.min) return 'Critique';
  if (value >= t.warning.max || value <= t.warning.min) return 'Attention';
  return 'Normal';
}

function triggerLink(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── CSV Export ───────────────────────────────────────────────────────────────

/**
 * Generates a professional CSV with metadata header rows, summary section,
 * and a properly formatted data table.
 */
export function exportCSV({ device, readings, stats, timeRange, options = {} }) {
  const rows = [];
  const sep = options.separator || ',';
  const norm = readings.map(normalise);

  // ── Report header (comment rows)
  rows.push(`# RAPPORT DE DONNÉES CAPTEUR — ${device.deviceName || device.MAC}`);
  rows.push(`# Généré le : ${fmtDate(new Date())}`);
  rows.push(`# Appareil : ${device.deviceName || '—'}`);
  rows.push(`# Adresse MAC : ${device.MAC}`);
  rows.push(`# Emplacement : ${device.location || '—'}`);
  rows.push(`# Période : ${timeRange}`);
  rows.push(`# Nombre d'enregistrements : ${norm.length}`);
  rows.push(`#`);

  // ── Summary section
  const tempStats = computeStats(norm.map((r) => r.temperature));
  const hmdtStats = computeStats(norm.map((r) => r.humidity));
  const gazStats = computeStats(norm.map((r) => r.gas));

  rows.push(`# ── RÉSUMÉ STATISTIQUE ──`);
  rows.push(`# Température (°C) — Min: ${tempStats.min} | Max: ${tempStats.max} | Moy: ${tempStats.avg}`);
  rows.push(`# Humidité (%)     — Min: ${hmdtStats.min} | Max: ${hmdtStats.max} | Moy: ${hmdtStats.avg}`);
  rows.push(`# Gaz (ppm)        — Min: ${gazStats.min}  | Max: ${gazStats.max}  | Moy: ${gazStats.avg}`);
  rows.push(`#`);

  // Time range row
  if (norm.length > 0) {
    const sorted = [...norm].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    rows.push(`# Début : ${fmtDate(sorted[0].timestamp)}`);
    rows.push(`# Fin   : ${fmtDate(sorted[sorted.length - 1].timestamp)}`);
    rows.push(`#`);
  }

  // ── Column headers
  const headers = [
    'N°',
    'Date & Heure',
    `Température (°C)`,
    'Alerte Temp.',
    `Humidité (%)`,
    'Alerte Humid.',
    `Gaz (ppm)`,
    'Alerte Gaz',
    'Adresse MAC',
  ];
  rows.push(headers.join(sep));

  // ── Data rows
  const sorted = [...norm].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  sorted.forEach((r, i) => {
    const cols = [
      i + 1,
      fmtDate(r.timestamp),
      r.temperature !== null ? Number(r.temperature).toFixed(1) : '',
      alertLevel('temp', r.temperature),
      r.humidity !== null ? Number(r.humidity).toFixed(1) : '',
      alertLevel('hmdt', r.humidity),
      r.gas !== null ? Number(r.gas).toFixed(1) : '',
      alertLevel('gaz', r.gas),
      device.MAC,
    ];
    rows.push(cols.map((c) => `"${c}"`).join(sep));
  });

  // ── Summary footer
  rows.push('');
  rows.push(`# ── FIN DU RAPPORT ──`);
  rows.push(`# Fichier généré automatiquement par ISET+ Monitoring Platform`);

  // BOM for proper UTF-8 handling in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const filename = `rapport_${device.MAC}_${new Date().toISOString().slice(0, 10)}.csv`;
  triggerLink(blob, filename);
}

// ── JSON Export ──────────────────────────────────────────────────────────────

/**
 * Generates a structured JSON report with metadata, stats, and readings.
 */
export function exportJSON({ device, readings, stats, timeRange }) {
  const norm = readings.map(normalise);
  const sorted = [...norm].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const report = {
    _meta: {
      title: 'Rapport de données capteur',
      generatedAt: new Date().toISOString(),
      generatedBy: 'ISET+ Monitoring Platform',
      format: 'JSON',
      version: '2.0',
    },
    device: {
      mac: device.MAC,
      name: device.deviceName || null,
      location: device.location || null,
      status: device.status,
    },
    period: {
      range: timeRange,
      from: sorted.length > 0 ? sorted[0].timestamp : null,
      to: sorted.length > 0 ? sorted[sorted.length - 1].timestamp : null,
      recordCount: sorted.length,
    },
    statistics: {
      temperature: computeStats(norm.map((r) => r.temperature)),
      humidity: computeStats(norm.map((r) => r.humidity)),
      gas: computeStats(norm.map((r) => r.gas)),
    },
    readings: sorted.map((r, i) => ({
      index: i + 1,
      timestamp: r.timestamp,
      temperature: r.temperature,
      humidity: r.humidity,
      gas: r.gas,
      alerts: {
        temperature: alertLevel('temp', r.temperature),
        humidity: alertLevel('hmdt', r.humidity),
        gas: alertLevel('gaz', r.gas),
      },
    })),
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const filename = `rapport_${device.MAC}_${new Date().toISOString().slice(0, 10)}.json`;
  triggerLink(blob, filename);
}

// ── HTML/Print Report ────────────────────────────────────────────────────────

/**
 * Opens a print-ready HTML report in a new window (acts as PDF via browser print dialog).
 */
export function exportPDF({ device, readings, stats, timeRange }) {
  const norm = readings.map(normalise);
  const sorted = [...norm].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const tempStats = computeStats(norm.map((r) => r.temperature));
  const hmdtStats = computeStats(norm.map((r) => r.humidity));
  const gazStats = computeStats(norm.map((r) => r.gas));

  const alertBadge = (type, value) => {
    const level = alertLevel(type, value);
    const colors = {
      Critique: 'background:#fef2f2;color:#dc2626;border:1px solid #fecaca',
      Attention: 'background:#fffbeb;color:#d97706;border:1px solid #fde68a',
      Normal: 'background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0',
    };
    return `<span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:500;${colors[level]}">${level}</span>`;
  };

  const periodStart = sorted.length > 0 ? fmtDate(sorted[0].timestamp) : '—';
  const periodEnd = sorted.length > 0 ? fmtDate(sorted[sorted.length - 1].timestamp) : '—';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport — ${device.deviceName || device.MAC}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI','Inter',system-ui,sans-serif; color:#1a1a1a; font-size:12px; line-height:1.5; padding:0; }
    @page { size:A4 landscape; margin:15mm; }
    @media print {
      .no-print { display:none !important; }
      body { padding:0; }
    }

    .header { background:linear-gradient(135deg,#0e7490,#06b6d4); color:white; padding:28px 32px; }
    .header h1 { font-size:22px; font-weight:700; letter-spacing:-0.5px; }
    .header p { font-size:12px; opacity:0.85; margin-top:4px; }
    .header .badge { display:inline-block; background:rgba(255,255,255,0.2); padding:3px 10px; border-radius:9999px; font-size:11px; font-weight:500; margin-top:8px; }

    .content { padding:24px 32px; }

    .meta-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
    .meta-card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; }
    .meta-card .label { font-size:10px; text-transform:uppercase; letter-spacing:0.5px; color:#64748b; font-weight:600; }
    .meta-card .value { font-size:18px; font-weight:700; color:#0f172a; margin-top:4px; }
    .meta-card .sub { font-size:11px; color:#94a3b8; margin-top:2px; }

    .stats-section { margin-bottom:24px; }
    .stats-section h2 { font-size:14px; font-weight:600; color:#334155; margin-bottom:12px; padding-bottom:6px; border-bottom:2px solid #e2e8f0; }
    .stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
    .stat-block { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; }
    .stat-block .title { font-size:12px; font-weight:600; color:#475569; margin-bottom:10px; display:flex; align-items:center; gap:6px; }
    .stat-block .dot { width:8px; height:8px; border-radius:50%; }
    .stat-row { display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #f1f5f9; }
    .stat-row:last-child { border:none; }
    .stat-row .k { color:#64748b; font-size:11px; }
    .stat-row .v { font-weight:600; font-size:11px; color:#0f172a; }

    .table-section { margin-bottom:24px; }
    .table-section h2 { font-size:14px; font-weight:600; color:#334155; margin-bottom:12px; padding-bottom:6px; border-bottom:2px solid #e2e8f0; }
    table { width:100%; border-collapse:separate; border-spacing:0; font-size:11px; }
    thead th { background:#f1f5f9; padding:8px 10px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.4px; color:#475569; font-weight:600; border-bottom:2px solid #e2e8f0; }
    thead th:first-child { border-radius:6px 0 0 0; }
    thead th:last-child { border-radius:0 6px 0 0; }
    tbody td { padding:7px 10px; border-bottom:1px solid #f1f5f9; }
    tbody tr:hover { background:#f8fafc; }
    tbody tr:nth-child(even) { background:#fafbfc; }
    .num { text-align:right; font-variant-numeric:tabular-nums; font-weight:500; }

    .footer { margin-top:32px; padding-top:16px; border-top:2px solid #e2e8f0; display:flex; justify-content:space-between; color:#94a3b8; font-size:10px; }

    .print-bar { background:#f1f5f9; padding:12px 32px; display:flex; align-items:center; justify-content:space-between; }
    .print-btn { background:#0e7490; color:white; border:none; padding:8px 20px; border-radius:6px; font-size:13px; font-weight:500; cursor:pointer; }
    .print-btn:hover { background:#0891b2; }
  </style>
</head>
<body>
  <div class="no-print print-bar">
    <span style="font-size:13px;color:#475569">Aperçu du rapport — Utilisez <b>Ctrl+P</b> ou le bouton pour imprimer / enregistrer en PDF</span>
    <button class="print-btn" onclick="window.print()">🖨️ Imprimer / PDF</button>
  </div>

  <div class="header">
    <h1>Rapport de données capteur</h1>
    <p>${device.deviceName || device.MAC} — ${device.location || 'Emplacement non défini'}</p>
    <div class="badge">Période : ${timeRange}</div>
  </div>

  <div class="content">
    <!-- Meta cards -->
    <div class="meta-grid">
      <div class="meta-card">
        <div class="label">Appareil</div>
        <div class="value" style="font-size:14px">${device.deviceName || '—'}</div>
        <div class="sub">${device.MAC}</div>
      </div>
      <div class="meta-card">
        <div class="label">Enregistrements</div>
        <div class="value">${sorted.length}</div>
        <div class="sub">Points de données</div>
      </div>
      <div class="meta-card">
        <div class="label">Début</div>
        <div class="value" style="font-size:14px">${periodStart}</div>
        <div class="sub">Premier enregistrement</div>
      </div>
      <div class="meta-card">
        <div class="label">Fin</div>
        <div class="value" style="font-size:14px">${periodEnd}</div>
        <div class="sub">Dernier enregistrement</div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="stats-section">
      <h2>Résumé statistique</h2>
      <div class="stats-grid">
        <div class="stat-block">
          <div class="title"><span class="dot" style="background:#ef4444"></span> Température (°C)</div>
          <div class="stat-row"><span class="k">Minimum</span><span class="v">${tempStats.min}</span></div>
          <div class="stat-row"><span class="k">Maximum</span><span class="v">${tempStats.max}</span></div>
          <div class="stat-row"><span class="k">Moyenne</span><span class="v">${tempStats.avg}</span></div>
          <div class="stat-row"><span class="k">Échantillons</span><span class="v">${tempStats.count}</span></div>
        </div>
        <div class="stat-block">
          <div class="title"><span class="dot" style="background:#3b82f6"></span> Humidité (%)</div>
          <div class="stat-row"><span class="k">Minimum</span><span class="v">${hmdtStats.min}</span></div>
          <div class="stat-row"><span class="k">Maximum</span><span class="v">${hmdtStats.max}</span></div>
          <div class="stat-row"><span class="k">Moyenne</span><span class="v">${hmdtStats.avg}</span></div>
          <div class="stat-row"><span class="k">Échantillons</span><span class="v">${hmdtStats.count}</span></div>
        </div>
        <div class="stat-block">
          <div class="title"><span class="dot" style="background:#f59e0b"></span> Gaz (ppm)</div>
          <div class="stat-row"><span class="k">Minimum</span><span class="v">${gazStats.min}</span></div>
          <div class="stat-row"><span class="k">Maximum</span><span class="v">${gazStats.max}</span></div>
          <div class="stat-row"><span class="k">Moyenne</span><span class="v">${gazStats.avg}</span></div>
          <div class="stat-row"><span class="k">Échantillons</span><span class="v">${gazStats.count}</span></div>
        </div>
      </div>
    </div>

    <!-- Data table -->
    <div class="table-section">
      <h2>Relevés détaillés (${sorted.length} enregistrements)</h2>
      <table>
        <thead>
          <tr>
            <th style="width:40px">N°</th>
            <th>Date & Heure</th>
            <th class="num">Temp. (°C)</th>
            <th>État</th>
            <th class="num">Humid. (%)</th>
            <th>État</th>
            <th class="num">Gaz (ppm)</th>
            <th>État</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map((r, i) => `
          <tr>
            <td style="color:#94a3b8">${i + 1}</td>
            <td>${fmtDate(r.timestamp)}</td>
            <td class="num">${r.temperature !== null ? Number(r.temperature).toFixed(1) : '—'}</td>
            <td>${alertBadge('temp', r.temperature)}</td>
            <td class="num">${r.humidity !== null ? Number(r.humidity).toFixed(1) : '—'}</td>
            <td>${alertBadge('hmdt', r.humidity)}</td>
            <td class="num">${r.gas !== null ? Number(r.gas).toFixed(1) : '—'}</td>
            <td>${alertBadge('gaz', r.gas)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="footer">
      <span>ISET+ Monitoring Platform — Rapport automatique</span>
      <span>Généré le ${fmtDate(new Date())} — ${sorted.length} enregistrements</span>
    </div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

// ── Excel-compatible XML Export ──────────────────────────────────────────────

/**
 * Exports an Excel-compatible XML spreadsheet (.xls) that opens natively in Excel
 * with sheets, formatting, and colors.
 */
export function exportExcel({ device, readings, stats, timeRange }) {
  const norm = readings.map(normalise);
  const sorted = [...norm].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const tempStats = computeStats(norm.map((r) => r.temperature));
  const hmdtStats = computeStats(norm.map((r) => r.humidity));
  const gazStats = computeStats(norm.map((r) => r.gas));

  const periodStart = sorted.length > 0 ? fmtDate(sorted[0].timestamp) : '—';
  const periodEnd = sorted.length > 0 ? fmtDate(sorted[sorted.length - 1].timestamp) : '—';

  const escXml = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="header"><Font ss:Bold="1" ss:Size="11" ss:Color="#FFFFFF"/><Interior ss:Color="#0E7490" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center"/></Style>
  <Style ss:ID="meta"><Font ss:Bold="1" ss:Size="10"/><Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/></Style>
  <Style ss:ID="metaVal"><Font ss:Size="10"/></Style>
  <Style ss:ID="statHeader"><Font ss:Bold="1" ss:Size="10" ss:Color="#FFFFFF"/><Interior ss:Color="#334155" ss:Pattern="Solid"/></Style>
  <Style ss:ID="normal"><Font ss:Size="9"/></Style>
  <Style ss:ID="num"><Font ss:Size="9"/><NumberFormat ss:Format="0.0"/><Alignment ss:Horizontal="Right"/></Style>
  <Style ss:ID="alertOk"><Font ss:Size="9" ss:Color="#16A34A"/><Interior ss:Color="#F0FDF4" ss:Pattern="Solid"/></Style>
  <Style ss:ID="alertWarn"><Font ss:Size="9" ss:Color="#D97706"/><Interior ss:Color="#FFFBEB" ss:Pattern="Solid"/></Style>
  <Style ss:ID="alertCrit"><Font ss:Size="9" ss:Color="#DC2626"/><Interior ss:Color="#FEF2F2" ss:Pattern="Solid"/></Style>
  <Style ss:ID="title"><Font ss:Bold="1" ss:Size="14" ss:Color="#0E7490"/></Style>
 </Styles>

 <!-- Résumé Sheet -->
 <Worksheet ss:Name="Résumé">
  <Table>
   <Column ss:Width="180"/><Column ss:Width="250"/>
   <Row><Cell ss:StyleID="title"><Data ss:Type="String">Rapport de données capteur</Data></Cell></Row>
   <Row/>
   <Row><Cell ss:StyleID="meta"><Data ss:Type="String">Appareil</Data></Cell><Cell ss:StyleID="metaVal"><Data ss:Type="String">${escXml(device.deviceName || '—')}</Data></Cell></Row>
   <Row><Cell ss:StyleID="meta"><Data ss:Type="String">Adresse MAC</Data></Cell><Cell ss:StyleID="metaVal"><Data ss:Type="String">${escXml(device.MAC)}</Data></Cell></Row>
   <Row><Cell ss:StyleID="meta"><Data ss:Type="String">Emplacement</Data></Cell><Cell ss:StyleID="metaVal"><Data ss:Type="String">${escXml(device.location || '—')}</Data></Cell></Row>
   <Row><Cell ss:StyleID="meta"><Data ss:Type="String">Période</Data></Cell><Cell ss:StyleID="metaVal"><Data ss:Type="String">${escXml(timeRange)}</Data></Cell></Row>
   <Row><Cell ss:StyleID="meta"><Data ss:Type="String">Début</Data></Cell><Cell ss:StyleID="metaVal"><Data ss:Type="String">${escXml(periodStart)}</Data></Cell></Row>
   <Row><Cell ss:StyleID="meta"><Data ss:Type="String">Fin</Data></Cell><Cell ss:StyleID="metaVal"><Data ss:Type="String">${escXml(periodEnd)}</Data></Cell></Row>
   <Row><Cell ss:StyleID="meta"><Data ss:Type="String">Total enregistrements</Data></Cell><Cell ss:StyleID="metaVal"><Data ss:Type="Number">${sorted.length}</Data></Cell></Row>
   <Row><Cell ss:StyleID="meta"><Data ss:Type="String">Généré le</Data></Cell><Cell ss:StyleID="metaVal"><Data ss:Type="String">${escXml(fmtDate(new Date()))}</Data></Cell></Row>
   <Row/>
   <Row><Cell ss:StyleID="statHeader"><Data ss:Type="String">Capteur</Data></Cell><Cell ss:StyleID="statHeader"><Data ss:Type="String">Min</Data></Cell><Cell ss:StyleID="statHeader"><Data ss:Type="String">Max</Data></Cell><Cell ss:StyleID="statHeader"><Data ss:Type="String">Moyenne</Data></Cell></Row>
   <Row><Cell ss:StyleID="normal"><Data ss:Type="String">Température (°C)</Data></Cell><Cell ss:StyleID="num"><Data ss:Type="Number">${tempStats.min}</Data></Cell><Cell ss:StyleID="num"><Data ss:Type="Number">${tempStats.max}</Data></Cell><Cell ss:StyleID="num"><Data ss:Type="Number">${tempStats.avg}</Data></Cell></Row>
   <Row><Cell ss:StyleID="normal"><Data ss:Type="String">Humidité (%)</Data></Cell><Cell ss:StyleID="num"><Data ss:Type="Number">${hmdtStats.min}</Data></Cell><Cell ss:StyleID="num"><Data ss:Type="Number">${hmdtStats.max}</Data></Cell><Cell ss:StyleID="num"><Data ss:Type="Number">${hmdtStats.avg}</Data></Cell></Row>
   <Row><Cell ss:StyleID="normal"><Data ss:Type="String">Gaz (ppm)</Data></Cell><Cell ss:StyleID="num"><Data ss:Type="Number">${gazStats.min}</Data></Cell><Cell ss:StyleID="num"><Data ss:Type="Number">${gazStats.max}</Data></Cell><Cell ss:StyleID="num"><Data ss:Type="Number">${gazStats.avg}</Data></Cell></Row>
  </Table>
 </Worksheet>

 <!-- Données Sheet -->
 <Worksheet ss:Name="Données">
  <Table>
   <Column ss:Width="40"/><Column ss:Width="160"/><Column ss:Width="90"/><Column ss:Width="70"/><Column ss:Width="90"/><Column ss:Width="70"/><Column ss:Width="90"/><Column ss:Width="70"/>
   <Row>
    <Cell ss:StyleID="header"><Data ss:Type="String">N°</Data></Cell>
    <Cell ss:StyleID="header"><Data ss:Type="String">Date &amp; Heure</Data></Cell>
    <Cell ss:StyleID="header"><Data ss:Type="String">Temp. (°C)</Data></Cell>
    <Cell ss:StyleID="header"><Data ss:Type="String">État Temp.</Data></Cell>
    <Cell ss:StyleID="header"><Data ss:Type="String">Humid. (%)</Data></Cell>
    <Cell ss:StyleID="header"><Data ss:Type="String">État Humid.</Data></Cell>
    <Cell ss:StyleID="header"><Data ss:Type="String">Gaz (ppm)</Data></Cell>
    <Cell ss:StyleID="header"><Data ss:Type="String">État Gaz</Data></Cell>
   </Row>
   ${sorted.map((r, i) => {
     const tLvl = alertLevel('temp', r.temperature);
     const hLvl = alertLevel('hmdt', r.humidity);
     const gLvl = alertLevel('gaz', r.gas);
     const styleMap = { Normal: 'alertOk', Attention: 'alertWarn', Critique: 'alertCrit' };
     return `<Row>
    <Cell ss:StyleID="normal"><Data ss:Type="Number">${i + 1}</Data></Cell>
    <Cell ss:StyleID="normal"><Data ss:Type="String">${escXml(fmtDate(r.timestamp))}</Data></Cell>
    <Cell ss:StyleID="num"><Data ss:Type="Number">${r.temperature !== null ? Number(r.temperature).toFixed(1) : ''}</Data></Cell>
    <Cell ss:StyleID="${styleMap[tLvl]}"><Data ss:Type="String">${tLvl}</Data></Cell>
    <Cell ss:StyleID="num"><Data ss:Type="Number">${r.humidity !== null ? Number(r.humidity).toFixed(1) : ''}</Data></Cell>
    <Cell ss:StyleID="${styleMap[hLvl]}"><Data ss:Type="String">${hLvl}</Data></Cell>
    <Cell ss:StyleID="num"><Data ss:Type="Number">${r.gas !== null ? Number(r.gas).toFixed(1) : ''}</Data></Cell>
    <Cell ss:StyleID="${styleMap[gLvl]}"><Data ss:Type="String">${gLvl}</Data></Cell>
   </Row>`;
   }).join('\n')}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const filename = `rapport_${device.MAC}_${new Date().toISOString().slice(0, 10)}.xls`;
  triggerLink(blob, filename);
}
