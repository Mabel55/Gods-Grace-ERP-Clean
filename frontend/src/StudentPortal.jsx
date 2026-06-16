import React, { useState } from 'react';
import { UserCircle, FileText, Wallet, CalendarCheck, LogOut, BookOpen, ChevronRight } from 'lucide-react';
import ReportCardModal from './ReportCardModal';

export default function StudentPortal() {
  const [matricNumber, setMatricNumber] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchDashboard = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/student/dashboard/${encodeURIComponent(matricNumber)}`);
      if (!res.ok) throw new Error("Student not found");
      const data = await res.json();
      setDashboard(data);
    } catch (err) {
      alert("Invalid Matric Number or Server Error.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setDashboard(null);
    setMatricNumber('');
  };

  // ==========================================
  // LOGIN VIEW
  // ==========================================
  if (!dashboard) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-[#4a148c] p-8 text-center">
            <h1 className="text-3xl font-black text-white uppercase tracking-widest">God's Grace</h1>
            <h2 className="text-purple-200 text-sm font-bold tracking-widest mt-1">STUDENT PORTAL</h2>
          </div>
          <div className="p-8">
            <p className="text-gray-500 font-medium text-center mb-6">Enter your credentials to access your academic records and fee status.</p>
            <form onSubmit={fetchDashboard}>
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Matriculation Number</label>
                <input 
                  value={matricNumber} 
                  onChange={(e) => setMatricNumber(e.target.value)} 
                  placeholder="e.g. GG/25/001" 
                  className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-[#4a148c] focus:ring-0 outline-none transition" 
                  required
                />
              </div>
              <button disabled={loading} className="w-full bg-[#4a148c] text-white font-bold py-4 rounded-xl hover:bg-purple-900 transition flex justify-center items-center gap-2 shadow-md disabled:opacity-70">
                {loading ? "Authenticating..." : "Access Portal"} <ChevronRight size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD VIEW
  // ==========================================
  
  // Safe Calculations
  const attendancePercent = dashboard.attendance?.total > 0 
    ? Math.round((dashboard.attendance.present / dashboard.attendance.total) * 100) 
    : 0;
  
  const subjectsCount = dashboard.grades ? dashboard.grades.length : 0;
  const balance = dashboard.finance?.balance || 0;

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-[#4a148c]">
              <UserCircle size={40} />
            </div>
            <div>
              <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">Welcome Back</p>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900">{dashboard.student_name || "Student Name"}</h1>
              <p className="text-[#4a148c] font-bold mt-1 text-sm bg-purple-50 inline-block px-3 py-1 rounded-full">
                Matric: {matricNumber}
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 font-bold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 transition">
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Top Metric Cards (Schos Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BookOpen size={20} /></div>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Subjects Taken</p>
            </div>
            <h3 className="text-3xl font-black text-gray-900">{subjectsCount}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CalendarCheck size={20} /></div>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Attendance Rate</p>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-gray-900">{attendancePercent}%</h3>
              <span className="text-sm font-medium text-gray-500">({dashboard.attendance?.present || 0} days)</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Wallet size={20} /></div>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Outstanding Fees</p>
            </div>
            <h3 className={`text-3xl font-black ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₦{balance.toLocaleString()}
            </h3>
            {balance > 0 && <p className="text-xs font-bold text-red-500 mt-2 uppercase">Payment Required</p>}
          </div>
        </div>

        {/* Main Action Area */}
        <div 
          onClick={() => setShowModal(true)}
          className="bg-[#4a148c] group p-8 rounded-2xl shadow-lg cursor-pointer flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-purple-900 transition-colors relative overflow-hidden"
        >
          {/* Decorative background element */}
          <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
            <FileText size={200} />
          </div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="p-5 bg-white/10 text-white rounded-2xl group-hover:scale-110 transition-transform">
              <FileText size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white mb-1">Official Result Portal</h3>
              <p className="text-purple-200 font-medium text-sm md:text-base">Access your termly report cards, AI insights, and academic performance.</p>
            </div>
          </div>
          
          <div className="bg-white text-[#4a148c] font-black px-6 py-3 rounded-xl flex items-center gap-2 relative z-10">
            View Reports <ChevronRight size={18} />
          </div>
        </div>

        {/* Render the Modal if active */}
        {showModal && (
          <ReportCardModal 
            // VERY IMPORTANT: Ensure your backend returns student_id, or fallback to matricNumber
            studentId={dashboard.student_id || dashboard.id || matricNumber} 
            onClose={() => setShowModal(false)} 
          />
        )}
      </div>
    </div>
  );
}