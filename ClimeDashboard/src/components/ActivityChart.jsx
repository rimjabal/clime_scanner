import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ActivityChart({ data }) {
  // Nsaybo jdwel khawi dyal simana
  const weeklyData = [
    { name: 'Sun', scans: 0 },
    { name: 'Mon', scans: 0 },
    { name: 'Tue', scans: 0 },
    { name: 'Wed', scans: 0 },
    { name: 'Thu', scans: 0 },
    { name: 'Fri', scans: 0 },
    { name: 'Sat', scans: 0 },
  ];

  // N3mro l'jdwel b les données dbs7
  data.forEach(item => {
    const date = new Date(item.timestamp || item.Timestamp);
    const dayIndex = date.getDay(); // 0 hiya Sunday, 1 hiya Monday...
    weeklyData[dayIndex].scans += 1;
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 mb-8">
      <h3 className="font-bold text-gray-700 mb-6 text-lg">Scan Activity (Weekly)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Bar dataKey="scans" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}