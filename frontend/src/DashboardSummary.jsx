import React, { useState, useEffect } from 'react';
// NEW: Import Lucide Icons
import { Users, Library, CheckSquare } from 'lucide-react';

export default function DashboardSummary() {
  const [stats, setStats] = useState({
    total_students: 0,
    total_classes: 0,
    attendance_today: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:8000/dashboard/summary/");
        const data = await response.json();
        if (!data.error) {
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse bg-slate-200 h-24 rounded-2xl mb-6"></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      
      {/* Stat Card 1 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
          <Users size={24} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
          <p className="text-2xl font-black text-slate-800">{stats.total_students}</p>
        </div>
      </div>

      {/* Stat Card 2 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
          <Library size={24} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Classes</p>
          <p className="text-2xl font-black text-slate-800">{stats.total_classes}</p>
        </div>
      </div>

      {/* Stat Card 3 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
          <CheckSquare size={24} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Today's Attendance</p>
          <p className="text-2xl font-black text-slate-800">{stats.attendance_today}</p>
        </div>
      </div>

    </div>
  );
}