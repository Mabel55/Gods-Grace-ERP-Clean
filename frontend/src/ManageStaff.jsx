import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


export default function ManageStaff() {
  const [staffList, setStaffList] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TEACHER'); // Default to teacher
  const [statusMsg, setStatusMsg] = useState('');

  const fetchStaff = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/staff/`);
      const data = await response.json();
      if (Array.isArray(data)) setStaffList(data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatusMsg('Registering...');

    try {
      // We reuse your setup-admin endpoint!
      const response = await fetch(`${API_BASE_URL}/setup-admin/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok && !data.error) {
        setStatusMsg(`✅ ${role} account created successfully!`);
        setEmail('');
        setPassword('');
        fetchStaff(); // Refresh the list automatically
        setTimeout(() => setStatusMsg(''), 4000);
      } else {
        setStatusMsg(`❌ ${data.error || data.detail || "Failed to create account"}`);
      }
    } catch (error) {
      setStatusMsg("❌ Server connection lost.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Registration Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-indigo-900 mb-4 border-b pb-2">Register New Staff Member</h2>
        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 font-medium mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500" 
              placeholder="teacher@godsgrace.edu.ng"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 font-medium mb-1">Temporary Password</label>
            <input 
              type="password" 
              required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500" 
              placeholder="••••••••"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 font-medium mb-1">Account Role</label>
            <select 
              value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white"
            >
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-semibold text-white font-bold py-2 px-4 rounded-lg shadow transition">
              Create Account
            </button>
          </div>
        </form>
        {statusMsg && <p className="mt-3 text-sm font-semibold text-indigo-600">{statusMsg}</p>}
      </div>

      {/* Staff Directory List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-indigo-900 mb-4 border-b pb-2">Staff Directory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((staff, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border border-slate-100 bg-slate-50 rounded-xl hover:shadow-md transition">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-indigo-400 shadow-inner">
                {staff.email.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-indigo-950 font-extrabold truncate">{staff.email}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${staff.role === 'ADMIN' ? 'bg-purple-200 text-purple-800' : 'bg-emerald-200 text-emerald-800'}`}>
                  {staff.role}
                </span>
              </div>
            </div>
          ))}
          {staffList.length === 0 && <p className="text-sm text-slate-500 font-medium italic">No staff found.</p>}
        </div>
      </div>

    </div>
  );
}