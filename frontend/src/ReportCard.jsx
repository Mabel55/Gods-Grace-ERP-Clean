import React, { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';

export default function ReportCard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for the dynamic dropdown
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const TERM = "1st";
  const SESSION = "2025/2026";

  // Reusable purple header component
  const SectionHeader = ({ title }) => (
    <div className="bg-[#4a148c] text-white font-bold px-3 py-1.5 text-sm mt-6 mb-2 uppercase tracking-wider">
      {title}
    </div>
  );

  // 1. Fetch all students
  useEffect(() => {
    fetch("http://localhost:8000/students/")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStudents(data);
          if (data.length > 0) setSelectedStudentId(data[0].id);
        }
      })
      .catch(err => console.error("Failed to fetch students:", err));
  }, []);

  // 2. Fetch the report card directly (BYPASSING the broken API client)
  useEffect(() => {
    if (!selectedStudentId) return;

    setLoading(true);
    setError(null);

    // DIRECT FETCH - This fixes the 404 error
    fetch(`http://localhost:8000/report-card/${selectedStudentId}?term=${TERM}&academic_session=${SESSION}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch report card data");
        return res.json();
      })
      .then(data => {
        if (data.error || data.CRASH_REPORT) throw new Error(data.error || data.CRASH_REPORT);
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedStudentId]);

  const handleDeleteGrade = async (gradeId, subject) => {
    if (!window.confirm(`Are you sure you want to delete the grade for ${subject}?`)) return;

    try {
      const response = await fetch(`http://localhost:8000/grades/${gradeId}`, { method: 'DELETE' });
      if (response.ok) {
        setReport(prev => ({
          ...prev,
          grades: prev.grades.filter(g => g.id !== gradeId)
        }));
      } else {
        alert("Failed to delete grade.");
      }
    } catch (error) {
      alert("Could not connect to the server.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-10 p-4 print:p-0 print:m-0">

      {/* CONTROLS */}
      <div className="mb-6 p-5 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-center gap-4 print:hidden">
        <label className="font-black text-gray-800 text-lg">Select Student:</label>
        <select
          className="p-3 border-2 border-[#4a148c]/20 rounded-lg focus:ring-2 focus:ring-[#4a148c] outline-none w-full md:w-80 bg-gray-50 font-medium"
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
        >
          {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
        </select>

        <button
          onClick={() => window.print()}
          className="ml-auto bg-[#4a148c] text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 hover:bg-purple-900 transition shadow-md"
        >
          <Printer size={20} /> Print Result
        </button>
      </div>

      {loading && <div className="text-center p-10 font-bold text-[#4a148c] text-xl animate-pulse">Generating Report...</div>}
      {error && <div className="text-center p-10 text-red-500 font-bold bg-red-50 rounded-xl border border-red-200">Error: {error}</div>}

      {/* REPORT CARD */}
      {!loading && !error && report && (
        <div className="bg-white p-8 md:p-12 shadow-2xl rounded-2xl border border-gray-100 print:shadow-none">

          {/* Header with Logo */}
          <div className="text-center border-b-4 border-[#4a148c] pb-6 mb-8 flex flex-col items-center">
            <img
              src="http://localhost:8000/static/school_logo.png"
              alt="God's Grace Crest"
              className="w-24 h-24 object-contain mb-3"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <h1 className="text-3xl font-black text-[#4a148c] uppercase tracking-widest">God's Grace</h1>
            <h2 className="text-xl font-bold text-gray-800 mt-2">International School Portal</h2>
            <div className="mt-4 bg-gray-100 px-6 py-2 rounded-full font-black text-xs uppercase text-gray-700">
              Official Student Report Card
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm w-full">
              <div className="p-2 bg-gray-50 rounded border"><span className="text-[10px] text-gray-500 block uppercase">Name</span> <strong>{report.student_name}</strong></div>
              <div className="p-2 bg-gray-50 rounded border"><span className="text-[10px] text-gray-500 block uppercase">Matric No</span> <strong>{report.matric_number}</strong></div>
              <div className="p-2 bg-gray-50 rounded border"><span className="text-[10px] text-gray-500 block uppercase">Term</span> <strong>{report.term}</strong></div>
              <div className="p-2 bg-gray-50 rounded border"><span className="text-[10px] text-gray-500 block uppercase">Session</span> <strong>{report.academic_session}</strong></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            {/* Academic Performance Table */}
            <div>
              <SectionHeader title="Academic Performance" />
              <table className="w-full text-left border border-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
                    <th className="p-2.5">Subject</th><th className="p-2.5 text-center">Total</th><th className="p-2.5 text-center">Grade</th><th className="p-2.5 text-center print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {report.grades?.map((g, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-2.5 font-bold">{g.subject}</td>
                      <td className="p-2.5 text-center font-bold">{g.total_score}</td>
                      <td className="p-2.5 text-center font-black text-[#4a148c]">{g.grade_letter}</td>
                      <td className="p-2.5 text-center print:hidden">
                        <button onClick={() => handleDeleteGrade(g.id, g.subject)} className="text-red-500 font-black text-[10px] uppercase underline">Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* ... rest of your layout */}
          </div>
        </div>
      )}
    </div>
  );
}