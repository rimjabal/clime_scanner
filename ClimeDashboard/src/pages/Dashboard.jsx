import React, { useState, useEffect } from 'react';
import KPIDashboard from '../components/KPIDashboard';
import ActivityChart from '../components/ActivityChart';
import { Search, Loader2, Calendar, RotateCcw, Download } from 'lucide-react';

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [donnees, setDonnees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  const fetchScans = async (date = selectedDate) => {
    try {
      let url = 'http://localhost:5017/api/logs';
      if (date) {
        url += `?date=${date}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setDonnees(data);
      }
    } catch (error) {
      console.error("Error connecting to the API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans(selectedDate);
    const interval = setInterval(() => {
      fetchScans(selectedDate);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const filteredData = donnees.filter(item => 
    (item.room || item.Room || '').toLowerCase().includes(search.toLowerCase()) || 
    (item.operatorId || item.OperatorId || '').toLowerCase().includes(search.toLowerCase())
  );

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = ["AC ID (Room)", "Operator", "Date & Time"];
    const csvRows = filteredData.map(row => {
      const room = (row.room || row.Room || '').replace(/"/g, '""');
      const operator = (row.operatorId || row.OperatorId || '').replace(/"/g, '""');
      const timestamp = new Date(row.timestamp || row.Timestamp).toLocaleString('en-US');
      return `"${room}","${operator}","${timestamp}"`;
    });
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Hirschmann_Scans_${selectedDate || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* HEADER WITH LOGO */}
        <div className="mb-8 flex items-center gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          {/* Make sure this image is in your Vite 'public' folder! */}
          <img 
            src="/Logo-STG-Entreprise-et-ecole-2024-10-07T163448.302.png" 
            alt="Hirschmann Automotive" 
            className="h-16 object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-800"> Dashboard</h1>
            <p className="text-gray-500 mt-1">Scan Tracking & AC Units Inventory</p>
          </div>
        </div>
        
        <KPIDashboard data={donnees} />
        <ActivityChart data={donnees} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-bold text-gray-700 text-lg">
              Live Scan History {selectedDate && <span className="text-blue-600 text-sm font-normal">({selectedDate})</span>}
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-gray-200 flex-grow sm:flex-grow-0">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border-none focus:outline-none text-sm text-gray-700 bg-transparent w-full"
                  />
                  {selectedDate && (
                    <button 
                      onClick={() => setSelectedDate('')}
                      className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 px-1.5 py-0.5 rounded transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <button 
                  onClick={exportToCSV}
                  className="flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg border border-emerald-200 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search ID or Operator..." 
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  onChange={(e) => setSearch(e.target.value)} 
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="py-4 px-6 font-semibold">AC ID (Room)</th>
                  <th className="py-4 px-6 font-semibold">Operator</th>
                  <th className="py-4 px-6 font-semibold">Date & Time</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading && donnees.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-gray-500">
                      <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2 text-blue-500" />
                      Fetching data from the server...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((row, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-800">{row.room || row.Room}</td>
                      <td className="py-4 px-6 text-gray-600">{row.operatorId || row.OperatorId}</td>
                      <td className="py-4 px-6 text-gray-500">
                        {new Date(row.timestamp || row.Timestamp).toLocaleString('en-US')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-gray-400">
                      No scans found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FOOTER: Signature & LinkedIn */}
      <footer className="w-full text-center py-6 mt-auto border-t border-gray-200 text-sm text-gray-500">
        <p>Done by <span className="font-semibold text-gray-700">Rim Jabal</span></p>
        <a 
          href="https://www.linkedin.com/in/rim-jabal-109a03250" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors mt-1 inline-block"
        >
          www.linkedin.com/in/rim-jabal-109a03250
        </a>
      </footer>
    </div>
  );
}