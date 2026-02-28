// frontend/src/components/common/ExportModal.jsx
// ══════════════════════════════════════════════════════════════════════════════
// Professional export modal — lets users pick format, preview info, and export.
// ══════════════════════════════════════════════════════════════════════════════

import {
  Download,
  File,
  FileSpreadsheet,
  FileText,
  Printer,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { exportCSV, exportExcel, exportJSON, exportPDF } from '../../utils/exportReport';

const FORMATS = [
  {
    id: 'csv',
    label: 'CSV',
    description: 'Fichier texte compatible avec Excel, Google Sheets, et tout logiciel tabulaire',
    icon: FileText,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    fn: exportCSV,
  },
  {
    id: 'excel',
    label: 'Excel (.xls)',
    description: 'Classeur Excel avec feuilles Résumé et Données, mise en forme et couleurs',
    icon: FileSpreadsheet,
    color: 'text-green-600',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    fn: exportExcel,
  },
  {
    id: 'json',
    label: 'JSON',
    description: 'Format structuré pour intégrations API, traitement automatisé ou archivage',
    icon: File,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    fn: exportJSON,
  },
  {
    id: 'pdf',
    label: 'PDF / Imprimer',
    description: 'Rapport visuel prêt à imprimer avec en-tête, statistiques et tableau complet',
    icon: Printer,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    fn: exportPDF,
  },
];

export default function ExportModal({ isOpen, onClose, device, readings, stats, timeRange }) {
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const recordCount = readings?.length ?? 0;
  const period = timeRange || '—';

  const handleExport = async () => {
    const fmt = FORMATS.find((f) => f.id === selectedFormat);
    if (!fmt) return;

    setExporting(true);
    try {
      // Small delay so UI can show spinner
      await new Promise((r) => setTimeout(r, 150));
      fmt.fn({ device, readings, stats, timeRange });
    } finally {
      setExporting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-base-200 border border-base-300 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-300">
          <div>
            <h2 className="text-base font-semibold text-base-content">Exporter les données</h2>
            <p className="text-xs text-base-content/40 mt-0.5">
              {recordCount} enregistrements · Période : {period}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base-content/40 hover:text-base-content hover:bg-base-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Device info summary */}
        <div className="px-6 py-3 bg-base-300/30 border-b border-base-300 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
            <Download className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-base-content truncate">
              {device?.deviceName || device?.MAC}
            </p>
            <p className="text-xs text-base-content/40 font-mono truncate">{device?.MAC}</p>
          </div>
        </div>

        {/* Format selection */}
        <div className="px-6 py-4 space-y-2.5">
          <p className="text-xs font-medium text-base-content/50 uppercase tracking-wide mb-3">
            Format d'export
          </p>

          {FORMATS.map((fmt) => {
            const Icon = fmt.icon;
            const isSelected = selectedFormat === fmt.id;

            return (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all duration-150 text-left ${
                  isSelected
                    ? `${fmt.bg} ${fmt.border}`
                    : 'border-base-300 bg-base-100 hover:border-base-content/20 hover:bg-base-300/30'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg ${fmt.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${fmt.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${isSelected ? 'text-base-content' : 'text-base-content/80'}`}>
                    {fmt.label}
                  </p>
                  <p className="text-xs text-base-content/40 mt-0.5 leading-relaxed">
                    {fmt.description}
                  </p>
                </div>
                {/* Radio indicator */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${
                  isSelected ? `${fmt.border} ${fmt.bg}` : 'border-base-300'
                }`}>
                  {isSelected && (
                    <div className={`w-2.5 h-2.5 rounded-full ${fmt.color.replace('text-', 'bg-')}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-base-300 flex items-center justify-between gap-3">
          <p className="text-[10px] text-base-content/30 leading-relaxed">
            Les rapports incluent métadonnées, résumé statistique et alertes.
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onClose}
              className="btn-ghost-custom text-xs px-4 py-2"
            >
              Annuler
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || recordCount === 0}
              className="btn-primary-custom text-xs px-5 py-2 gap-1.5"
            >
              {exporting ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  Export…
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  Exporter
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
