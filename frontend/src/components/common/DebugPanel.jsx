// frontend/src/components/common/DebugPanel.jsx
// Add this component to visually debug WebSocket and real-time data

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDeviceData } from '../../hooks/useDeviceData';
import { useWebSocket } from '../../hooks/useWebSocket';

export default function DebugPanel() {
  const { socket, isConnected } = useWebSocket();
  const { getAllDeviceData } = useDeviceData();
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [sensorDataCount, setSensorDataCount] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const addLog = (message, type = 'info') => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [...prev.slice(-20), { timestamp, message, type }].slice(-20));
    };

    // Monitor all WebSocket events
    const events = [
      'connect',
      'disconnect',
      'connection:success',
      'sensor:data',
      'device:alert',
      'device:status',
      'user:device-assigned',
      'error',
    ];

    const cleanups = events.map(event => {
      return socket.on(event, (data) => {
        addLog(`[${event}] ${JSON.stringify(data)}`, event.includes('error') ? 'error' : 'success');

        if (event === 'sensor:data') {
          setSensorDataCount(prev => prev + 1);
        }
      });
    });

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, [socket]);

  const testBroadcast = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/test-realtime/broadcast-test?MAC=AA:BB:CC:DD:EE:FF');
      const data = await response.json();
      alert(`Test broadcast sent!\nCheck logs below.\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      alert(`Test failed: ${error.message}`);
    }
  };

  const testIngestion = async () => {
    const MAC = 'AA:BB:CC:DD:EE:FF';
    const temp = (Math.random() * 10 + 20).toFixed(1);
    const hmdt = (Math.random() * 20 + 50).toFixed(1);
    const gaz = (Math.random() * 100 + 400).toFixed(1);

    try {
      const response = await fetch(
        `http://localhost:3000/api/sensor-data/ingest?MAC=${MAC}&temp=${temp}&hmdt=${hmdt}&gaz=${gaz}`
      );
      const data = await response.json();
      alert(`Data ingestion test!\nCheck logs below.\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      alert(`Ingestion failed: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setSensorDataCount(0);
  };

  const allData = getAllDeviceData();

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-base-100 shadow-2xl rounded-lg border border-base-300 z-50">
      {/* Header */}
      <div className="bg-primary text-primary-content p-3 rounded-t-lg">
        <h3 className="font-bold text-sm">🔍 Real-Time Debug Panel</h3>
      </div>

      {/* Status */}
      <div className="p-3 space-y-2 text-xs">
        <div className="flex justify-between">
          <span>WebSocket:</span>
          <span className={isConnected ? 'text-success' : 'text-error'}>
            {isConnected ? '✅ Connected' : '❌ Disconnected'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>User ID:</span>
          <span className="text-info">{user?.id || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span>Data Received:</span>
          <span className="text-success font-bold">{sensorDataCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Devices in Memory:</span>
          <span className="text-info">{allData.length}</span>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="p-3 space-y-2">
        <button
          onClick={testBroadcast}
          className="btn btn-sm btn-primary w-full"
        >
          🧪 Test WebSocket Broadcast
        </button>
        <button
          onClick={testIngestion}
          className="btn btn-sm btn-secondary w-full"
        >
          📥 Test Data Ingestion
        </button>
        <button
          onClick={clearLogs}
          className="btn btn-sm btn-ghost w-full"
        >
          🗑️ Clear Logs
        </button>
      </div>

      {/* Device Data Preview */}
      {allData.length > 0 && (
        <div className="p-3 border-t border-base-300">
          <div className="text-xs font-bold mb-2">Latest Device Data:</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {allData.map((data, idx) => (
              <div key={idx} className="text-xs bg-base-200 p-2 rounded">
                <div className="font-mono">{data.MAC}</div>
                <div className="text-gray-500">
                  T:{data.temperature?.toFixed(1)}°C |
                  H:{data.humidity?.toFixed(1)}% |
                  G:{data.gas?.toFixed(1)}ppm
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Log */}
      <div className="p-3 border-t border-base-300">
        <div className="text-xs font-bold mb-2">Event Log (last 20):</div>
        <div className="bg-base-200 rounded p-2 max-h-48 overflow-y-auto font-mono text-xs space-y-1">
          {logs.length === 0 && (
            <div className="text-gray-500">No events yet...</div>
          )}
          {logs.map((log, idx) => (
            <div
              key={idx}
              className={`${log.type === 'error' ? 'text-error' :
                log.type === 'success' ? 'text-success' :
                  'text-base-content'
                }`}
            >
              <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ============================================
// HOW TO USE:

// 1. Save as: frontend/src/components/common/DebugPanel.jsx

// 2. Add to your UserDashboard.jsx or any page:
//    import DebugPanel from '../common/DebugPanel';
//
//    export default function UserDashboard() {
//      return (
//        <>
//          {/* Your existing dashboard code */}
//          <DebugPanel />
//        </>
//      );
//    }

// 3. You'll see a debug panel in bottom-right corner showing:
//    - WebSocket connection status
//    - Number of data packets received
//    - Real-time event logs
//    - Test buttons

// 4. Click "Test WebSocket Broadcast" to verify WebSocket works
// 5. Click "Test Data Ingestion" to simulate sensor data
// 6. Watch the event log to see what's happening in real-time
