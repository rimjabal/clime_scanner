import React from 'react';
import { Activity, CheckCircle, Database } from 'lucide-react';

export default function KPIDashboard({ data }) {
  // 1. Calculate how many scans happened today
  const today = new Date().toLocaleDateString('en-US');
  const scansToday = data.filter(item => {
    const scanDate = new Date(item.timestamp || item.Timestamp).toLocaleDateString('en-US');
    return scanDate === today;
  }).length;

  // 2. Calculate how many unique AC units (rooms) were scanned in total (no duplicates)
  const uniqueACs = new Set(data.map(item => item.room || item.Room)).size;

  // 3. Get the last scan performed
  // Sort them by time (newest to oldest)
  const sortedData = [...data].sort((a, b) => new Date(b.timestamp || b.Timestamp) - new Date(a.timestamp || a.Timestamp));
  
  let lastScanText = "No scans yet";
  if (sortedData.length > 0) {
    const latest = sortedData[0];
    const room = latest.room || latest.Room;
    const time = new Date(latest.timestamp || latest.Timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    lastScanText = `${room} (${time})`;
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      {/* Card 1 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">Total Scans Today</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{scansToday}</h3>
        </div>
        <Activity className="text-blue-500 w-12 h-12 bg-blue-50 p-2.5 rounded-full" />
      </div>

      {/* Card 2 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">Unique AC Units Scanned</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{uniqueACs}</h3>
        </div>
        <Database className="text-green-500 w-12 h-12 bg-green-50 p-2.5 rounded-full" />
      </div>

      {/* Card 3 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">Last Scan</p>
          <h3 className="text-lg font-bold text-gray-800 mt-1 truncate max-w-[150px]">{lastScanText}</h3>
        </div>
        <CheckCircle className="text-purple-500 w-12 h-12 bg-purple-50 p-2.5 rounded-full" />
      </div>
    </div>
  );
}