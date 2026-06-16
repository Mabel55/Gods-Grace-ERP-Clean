import React, { useState } from 'react';
import { GraduationCap, Users, Building2, CalendarDays, PenSquare, FileText, LogOut, Menu, X, Scan, Sparkles, CreditCard, BookOpen, BadgeInfo, Archive, MessageSquare, Globe } from 'lucide-react'; // <-- Added Globe

import ManageClasses from './ManageClasses';
import RegisterStudent from './RegisterStudent';
import TakeAttendance from './TakeAttendance';
import QRScanner from './QRScanner';
import AddGrade from "./AddGrade";
import ReportCard from './ReportCard';
import StudentPortal from "./StudentPortal";
import StudentExamList from './StudentExamList';
import ManageMaterials from './ManageMaterials';
import UploadLogo from './UploadLogo';
import Login from "./Login";
import DashboardSummary from './DashboardSummary';
import ManageStaff from './ManageStaff';
import AIExamBuilder from './AIExamBuilder';
import FinanceDashboard from './FinanceDashboard';
import IDCardGenerator from './IDCardGenerator';
import CBTPracticeMode from './CBTPracticeMode';
import InventoryManagement from './InventoryManagement';
import CommunicationModule from './CommunicationModule';
import SchoolWebsite from './SchoolWebsite'; // <-- Added SchoolWebsite Import

function App() {
  const [activeTab, setActiveTab] = useState('staff');
  const [view, setView] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  // --- LIVE SERVER LOGO BRANDING STATES ---
  const [schoolLogoUrl, setSchoolLogoUrl] = useState("http://localhost:8000/static/school_logo.png");
  const [logoError, setLogoError] = useState(false);

  // Dynamic Academic Session Context States
  const [currentTerm, setCurrentTerm] = useState('1st Term');
  const [currentSession, setCurrentSession] = useState('2025/2026');
  const [currentStudentId, setCurrentStudentId] = useState('STU-001');

  const handleLogout = () => {
    setUser(null);
    setView('overview');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">

      {/* --- HEADER --- */}
      <header className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 shadow-lg px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50">

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="flex items-center gap-3">
          {/* ROUNDED INSTITUTIONAL CREST CONTAINER */}
          <div className="bg-white p-1 rounded-full shadow-md flex items-center justify-center w-12 h-12 md:w-14 md:h-14 overflow-hidden flex-shrink-0 border-2 border-purple-200/40">
            {!logoError ? (
              <img
                src={schoolLogoUrl}
                alt="God's Grace Crest"
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <GraduationCap size={24} className="text-indigo-700" />
            )}
          </div>

          <div className="hidden sm:block">
            <h1 className="text-base md:text-lg font-black text-white tracking-tight leading-none">GOD'S GRACE INT'L SCHOOL</h1>
            <p className="text-[9px] text-purple-200 uppercase tracking-[0.15em] font-bold mt-1">Motto: Action Not Word</p>
          </div>
        </div>

        {/* Context Badge display for development clarity */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-indigo-100 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 font-medium">
          <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold">{currentSession}</span>
          <span>•</span>
          <span>{currentTerm}</span>
        </div>

        <div className="flex bg-black/20 p-1 rounded-xl backdrop-blur-sm border border-white/10">
          <button
            onClick={() => { setActiveTab('staff'); setView('overview'); }}
            className={`px-3 md:px-6 py-2 rounded-lg text-[10px] md:text-sm font-bold transition-all ${activeTab === 'staff' ? 'bg-white text-indigo-700 shadow-xl' : 'text-white hover:bg-white/10'}`}
          >
            Staff
          </button>
          <button
            onClick={() => { setActiveTab('student'); setView('overview'); }}
            className={`px-3 md:px-6 py-2 rounded-lg text-[10px] md:text-sm font-bold transition-all ${activeTab === 'student' ? 'bg-white text-blue-700 shadow-xl' : 'text-white hover:bg-white/10'}`}
          >
            Student
          </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full gap-6 p-4 md:p-6 relative">

        {/* --- STAFF PORTAL ROUTING --- */}
        {activeTab === 'staff' && (
          !user ? (
            <Login onLoginSuccess={(data) => setUser(data)} />
          ) : (
            <>
              {/* SIDEBAR WITH FIXED HEIGHT & SCROLL OVERFLOW FIX */}
              <aside className={`
                ${isSidebarOpen ? 'fixed inset-0 z-40 bg-white p-6 pt-24' : 'hidden'} 
                md:static md:flex md:w-64 flex-col gap-2 max-h-[calc(100vh-115px)] overflow-y-auto pr-2
              `}>
                {isSidebarOpen && <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-6 right-6 text-slate-500 hover:text-slate-800"><X size={24} /></button>}

                {/* BRANDING BADGE EMBEDDED IN SIDEBAR HEADER */}
                <div className="flex items-center gap-2 px-2 mb-2 pb-3 border-b border-slate-100 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-slate-50 border shadow-sm">
                    {!logoError ? (
                      <img src={schoolLogoUrl} alt="School Badge" className="w-full h-full object-contain" />
                    ) : (
                      <GraduationCap size={16} className="text-indigo-600" />
                    )}
                  </div>
                  <span className="font-black text-xs text-slate-700 uppercase tracking-wider">God's Grace Portal</span>
                </div>

                <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex-shrink-0">
                  <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">Logged In As</p>
                  <p className="text-sm font-bold text-indigo-900 truncate">{user.email}</p>
                  <p className="text-xs font-semibold bg-indigo-200 text-indigo-800 px-2 py-1 rounded-md inline-block mt-2">{user.role}</p>
                </div>

                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-2 mt-2 flex-shrink-0">Management</p>

                {/* <-- ADDED PUBLIC WEBSITE NAV BUTTON HERE --> */}
                <NavBtn label="Public Website" active={view === 'website'} onClick={() => { setView('website'); setIsSidebarOpen(false) }} icon={<Globe size={18} />} />

                <NavBtn label="Staff Directory" active={view === 'staff'} onClick={() => { setView('staff'); setIsSidebarOpen(false) }} icon={<Users size={18} />} />
                <NavBtn label="Classes & Students" active={view === 'overview'} onClick={() => { setView('overview'); setIsSidebarOpen(false) }} icon={<Building2 size={18} />} />
                <NavBtn label="Daily Attendance" active={view === 'attendance'} onClick={() => { setView('attendance'); setIsSidebarOpen(false) }} icon={<CalendarDays size={18} />} />
                <NavBtn label="Live Scanner" active={view === 'scanner'} onClick={() => { setView('scanner'); setIsSidebarOpen(false) }} icon={<Scan size={18} />} />
                <NavBtn label="ID Cards" active={view === 'id-cards'} onClick={() => { setView('id-cards'); setIsSidebarOpen(false) }} icon={<BadgeInfo size={18} />} />
                <NavBtn label="Inventory & Assets" active={view === 'inventory'} onClick={() => { setView('inventory'); setIsSidebarOpen(false) }} icon={<Archive size={18} />} />
                <NavBtn label="Communication Hub" active={view === 'communication'} onClick={() => { setView('communication'); setIsSidebarOpen(false) }} icon={<MessageSquare size={18} />} />

                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mt-6 mb-2 flex-shrink-0">Academics</p>
                <NavBtn label="Grade Entry" active={view === 'grades'} onClick={() => { setView('grades'); setIsSidebarOpen(false) }} icon={<PenSquare size={18} />} />
                <NavBtn label="Report Cards" active={view === 'reports'} onClick={() => { setView('reports'); setIsSidebarOpen(false) }} icon={<FileText size={18} />} />
                <NavBtn label="Lesson Repository" active={view === 'materials'} onClick={() => { setView('materials'); setIsSidebarOpen(false) }} icon={<BookOpen size={18} />} />
                <NavBtn label="AI Exam Generator" active={view === 'ai-exam'} onClick={() => { setView('ai-exam'); setIsSidebarOpen(false) }} icon={<Sparkles size={18} />} />

                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mt-6 mb-2 flex-shrink-0">Finance</p>
                <NavBtn label="Finance & Fees" active={view === 'finance'} onClick={() => { setView('finance'); setIsSidebarOpen(false) }} icon={<CreditCard size={18} />} />

                <div className="mt-auto pt-6 border-t border-slate-200 flex-shrink-0">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all group">
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Secure Logout
                  </button>
                </div>
              </aside>

              {/* MAIN CONTENT AREA */}
              <main className="flex-1 w-full overflow-y-auto">
                <div className="space-y-6">
                  {/* <-- ADDED PUBLIC WEBSITE VIEW HERE --> */}
                  {view === 'website' && <SchoolWebsite />}

                  {view === 'staff' && <ManageStaff />}
                  {view === 'overview' && (
                    <>
                      <DashboardSummary />
                      <UploadLogo onLogoUpdate={(newUrl) => { setSchoolLogoUrl(newUrl); setLogoError(false); }} />
                      <ManageClasses />
                      <RegisterStudent />
                    </>
                  )}
                  {view === 'attendance' && <TakeAttendance />}
                  {view === 'scanner' && <QRScanner />}
                  {view === 'id-cards' && <IDCardGenerator />}
                  {view === 'inventory' && <InventoryManagement />}
                  {view === 'communication' && <CommunicationModule />}
                  {view === 'grades' && <AddGrade currentTerm={currentTerm} currentSession={currentSession} />}
                  {view === 'reports' && <ReportCard currentTerm={currentTerm} currentSession={currentSession} />}
                  {view === 'materials' && <ManageMaterials />}
                  {view === 'ai-exam' && <AIExamBuilder />}
                  {view === 'finance' && <FinanceDashboard />}
                </div>
              </main>
            </>
          )
        )}

        {/* --- STUDENT VIEW --- */}
        {activeTab === 'student' && (
          <main className="w-full flex-1">
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={() => setView('overview')}
                className={`px-4 py-2 font-bold rounded-lg ${view === 'overview' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setView('exams')}
                className={`px-4 py-2 font-bold rounded-lg ${view === 'exams' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border'}`}
              >
                My Exams
              </button>
              <button
                onClick={() => setView('practice')}
                className={`px-4 py-2 font-bold rounded-lg flex items-center gap-2 ${view === 'practice' ? 'bg-green-600 text-white' : 'bg-white text-green-700 border border-green-200'}`}
              >
                <Sparkles size={16} /> Practice Mode
              </button>
            </div>

            {view === 'exams' ? (
              <StudentExamList
                className="Basic 5"
                studentId={currentStudentId}
                currentTerm={currentTerm}
                currentSession={currentSession}
              />
            ) : view === 'practice' ? (
              <CBTPracticeMode />
            ) : (
              <StudentPortal studentId={currentStudentId} />
            )}
          </main>
        )}
      </div>
    </div>
  );
}

function NavBtn({ label, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
    >
      <span className={`${active ? 'text-indigo-600' : 'text-slate-400'}`}>
        {icon}
      </span>
      {label}
    </button>
  );
}

export default App;