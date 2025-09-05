import React from 'react';
import type { PositionEntry } from '../types';
import { fmtNumber } from '../utils/geolocation';

interface PointsTableProps {
  positions: PositionEntry[];
}

const PointsTable: React.FC<PointsTableProps> = ({ positions }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold text-white">
        Recorded Points ({positions.length})
      </h2>
      <div className="mt-4 max-h-72 overflow-auto rounded-lg border border-gray-700">
        {positions.length > 0 ? (
          <table className="w-full text-sm text-gray-300">
            <thead className="sticky top-0 bg-gray-800 text-left text-gray-400">
              <tr>
                <th className="py-2.5 px-4 font-semibold">#</th>
                <th className="py-2.5 px-4 font-semibold">Latitude</th>
                <th className="py-2.5 px-4 font-semibold">Longitude</th>
                <th className="py-2.5 px-4 font-semibold">Time</th>
                <th className="py-2.5 px-4 font-semibold">Speed (km/h)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {positions.slice().reverse().map((p, i) => (
                <tr key={p.timestamp} className="hover:bg-gray-700/50">
                  <td className="py-2 px-4">{positions.length - i}</td>
                  <td className="py-2 px-4 font-mono">{p.lat.toFixed(6)}</td>
                  <td className="py-2 px-4 font-mono">{p.lon.toFixed(6)}</td>
                  <td className="py-2 px-4">{new Date(p.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2 px-4 font-mono">{fmtNumber((p.speed || 0) * 3.6, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
            <div className="text-center py-12 text-gray-500">
                <p>No points recorded yet.</p>
                <p className="text-xs mt-1">Click "Start Ride" to begin tracking.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default PointsTable;