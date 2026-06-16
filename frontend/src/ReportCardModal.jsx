import React, { useState, useEffect } from 'react';
import { X, Printer } from 'lucide-react';

export default function ReportCardModal({ studentId, onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetching with studentId fixes the 404 error!
  useEffect(() => {
    fetch(`http://localhost:8000/report-card/${studentId}?term=1st&academic_session=2025/2026`)
      .then(res => res.json())
      .then(data => {
        if (data.CRASH_REPORT) setError(data.CRASH_REPORT);
        else if (data.error) setError(data.error);
        else setReport(data);
        setLoading(false);
      })
      .catch(err => {
        setError("Network error. Check if backend is running.");
        setLoading(false);
      });
  }, [studentId]);

  // Reusable purple header to match the premium brand
  const SectionHeader = ({ title }) => (
    <div className="bg-[#4a148c] text-white font-bold px-3 py-1.5 text-sm mt-6 mb-2 uppercase tracking-wider">
      {title}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative print:max-h-none print:w-full print:p-0 print:shadow-none">

        {/* Close Button (Hidden on print) */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full print:hidden">
          <X size={24} />
        </button>

        {loading ? <p className="text-center font-bold text-[#4a148c] animate-pulse text-xl py-10">Generating Official Report...</p> :
          error ? <p className="text-red-500 font-bold p-4 bg-red-50 rounded text-center">{error}</p> :
            report ? (
              <div className="text-gray-800">

                {/* Premium Header Section */}
                <div className="text-center border-b-4 border-[#4a148c] pb-6 mb-6 flex flex-col items-center">

                  {/* --- ADDED SCHOOL BADGE HERE --- */}
                  <img
                    src="http://localhost:8000/static/school_logo.png"
                    alt="God's Grace Crest"
                    className="w-20 h-20 object-contain mb-3"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />

                  <h1 className="text-3xl font-black text-[#4a148c] uppercase tracking-widest">God's Grace</h1>
                  <h2 className="text-lg font-bold text-gray-800 mt-1 tracking-wide">International School Portal</h2>
                  <div className="mt-3 inline-block bg-gray-100 px-4 py-1.5 rounded-full">
                    <h3 className="text-xs font-black uppercase text-gray-700">Official Student Report Card</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 text-sm w-full">
                    <div className="p-2 bg-gray-50 rounded border border-gray-200"><span className="text-gray-500 block text-[10px] uppercase font-bold">Name</span> <strong className="text-gray-900">{report.student_name}</strong></div>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200"><span className="text-gray-500 block text-[10px] uppercase font-bold">Matric No</span> <strong className="text-gray-900">{report.matric_number || report.student_id?.substring(0, 8)}</strong></div>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200"><span className="text-gray-500 block text-[10px] uppercase font-bold">Term</span> <strong className="text-gray-900">{report.term}</strong></div>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200"><span className="text-gray-500 block text-[10px] uppercase font-bold">Session</span> <strong className="text-gray-900">{report.academic_session}</strong></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {/* LEFT COLUMN: Academic & Attendance */}
                  <div>
                    <SectionHeader title="Academic Performance" />
                    <table className="w-full text-left border border-gray-200 text-sm">
                      <thead>
                        <tr className="bg-gray-100 text-xs uppercase text-gray-600 border-b border-gray-300">
                          <th className="p-2">Subject</th>
                          <th className="p-2 text-center">Total</th>
                          <th className="p-2 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.grades?.length > 0 ? report.grades.map((g, i) => (
                          <tr key={i} className="border-b border-gray-100 even:bg-purple-50/30">
                            <td className="p-2 font-bold text-gray-800">{g.subject}</td>
                            <td className="p-2 text-center font-bold">{g.total_score}</td>
                            <td className="p-2 text-center font-black text-[#4a148c]">{g.grade_letter}</td>
                          </tr>
                        )) : <tr><td colSpan="3" className="text-center p-4 text-gray-500 italic">No grades found.</td></tr>}
                      </tbody>
                    </table>

                    <SectionHeader title="Attendance Summary" />
                    <table className="w-full border border-gray-200 text-sm">
                      <tbody>
                        <tr className="border-b border-gray-100"><td className="p-2 font-bold text-gray-700 bg-gray-50">Days Present</td><td className="p-2 text-center font-bold text-green-600">2</td></tr>
                        <tr className="border-b border-gray-100"><td className="p-2 font-bold text-gray-700 bg-gray-50">Days Absent</td><td className="p-2 text-center font-bold text-red-500">0</td></tr>
                      </tbody>
                    </table>
                  </div>

                  {/* RIGHT COLUMN: Domains & Summary */}
                  <div>
                    <SectionHeader title="Affective Domain" />
                    <table className="w-full border border-gray-200 text-xs">
                      <thead><tr className="bg-gray-100 uppercase text-gray-600"><th className="p-1.5 text-left">Attributes</th><th className="p-1.5 text-center">Rating</th></tr></thead>
                      <tbody>
                        {['Punctuality', 'Neatness', 'Politeness', 'Self Control', 'Attentiveness'].map((attr, i) => (
                          <tr key={i} className="border-b border-gray-100 even:bg-purple-50/30"><td className="p-1.5 font-medium">{attr}</td><td className="p-1.5 text-center font-bold text-[#4a148c]">5</td></tr>
                        ))}
                      </tbody>
                    </table>

                    <SectionHeader title="Psychomotor Skill" />
                    <table className="w-full border border-gray-200 text-xs">
                      <thead><tr className="bg-gray-100 uppercase text-gray-600"><th className="p-1.5 text-left">Skills</th><th className="p-1.5 text-center">Rating</th></tr></thead>
                      <tbody>
                        {['Games & Sport', 'Handwriting', 'Verbal Fluency', 'Attitude to Work'].map((skill, i) => (
                          <tr key={i} className="border-b border-gray-100 even:bg-purple-50/30"><td className="p-1.5 font-medium">{skill}</td><td className="p-1.5 text-center font-bold text-[#4a148c]">4</td></tr>
                        ))}
                      </tbody>
                    </table>

                    <SectionHeader title="Performance Summary" />
                    <table className="w-full border border-gray-200 text-sm">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="p-2 font-bold text-gray-700 bg-gray-50">Total Marks Obtained</td>
                          <td className="p-2 text-center font-black text-[#4a148c]">
                            {report.grades?.reduce((sum, g) => sum + g.total_score, 0) || 0}
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="p-2 font-bold text-gray-700 bg-gray-50">Average Score</td>
                          <td className="p-2 text-center font-black text-[#4a148c]">
                            {report.grades?.length > 0 ? (report.grades.reduce((sum, g) => sum + g.total_score, 0) / report.grades.length).toFixed(1) : 0}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Section (Remarks & QR) */}
                <div className="mt-8 border-t-2 border-dashed border-gray-300 pt-6 flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex-1 w-full">
                    <SectionHeader title="Form Master's Remark" />
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="italic text-gray-800 text-sm font-medium">
                        {report.ai_comment || "Student has shown remarkable progress this term. Keep up the good work."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg border border-gray-200 shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=GODS_GRACE_VERIFY:${report.matric_number || report.student_id}`}
                      alt="Verification QR"
                      className="w-24 h-24 mb-2"
                    />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Scan to Verify</span>
                  </div>
                </div>

                {/* Print Button (Hidden when printing) */}
                <button
                  onClick={() => window.print()}
                  className="mt-6 w-full bg-[#4a148c] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-purple-900 transition print:hidden shadow-md"
                >
                  <Printer size={18} /> Print Official Result
                </button>

              </div>
            ) : <p className="text-red-500 font-bold text-center">Unknown error occurred.</p>}
      </div>
    </div>
  );
}