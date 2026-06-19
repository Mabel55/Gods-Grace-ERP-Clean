import React, { useState } from 'react';
import { Sparkles, Loader2, FileText, CheckSquare, Eye, EyeOff, Printer, RefreshCw, KeyRound } from 'lucide-react';

export default function AIExamBuilder() {
  const [formData, setFormData] = useState({
    class_name: 'Basic 5',
    topic: '',
    num_questions: 5,
    num_theory: 2
  });

  const [includeMCQ, setIncludeMCQ] = useState(true);
  const [includeTheory, setIncludeTheory] = useState(true);
  const [loading, setLoading] = useState(false);
  const [examData, setExamData] = useState(null);
  const [showAnswers, setShowAnswers] = useState(true);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setExamData(null);
    setShowAnswers(true);

    try {
      const payload = {
        ...formData,
        num_questions: includeMCQ ? parseInt(formData.num_questions) : 0,
        num_theory: includeTheory ? parseInt(formData.num_theory) : 0
      };

      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_BASE_URL}/exams/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setExamData(data);
      } else {
        alert("Failed to generate exam. Please check your inputs.");
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Make sure your FastAPI backend is running!");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.topic && (includeMCQ || includeTheory);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* --- FORM SECTION --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-purple-600">
        <h2 className="text-xl font-bold text-purple-800 flex items-center gap-2 mb-6">
          <Sparkles size={24} className="text-purple-600" />
          AI Exam Generator
        </h2>

        <form onSubmit={handleGenerate} className="flex flex-col md:flex-row items-end gap-4">
          <div className="w-full md:w-1/5">
            <label className="block text-xs font-bold text-slate-500 font-medium mb-1">Class Tier</label>
            <select name="class_name" value={formData.class_name} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white">
              {['Nursery 1', 'Nursery 2', 'KG 1', 'KG 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5'].map(cls => <option key={cls} value={cls}>{cls}</option>)}
            </select>
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 font-medium mb-1">Topic</label>
            <input type="text" name="topic" required value={formData.topic} onChange={handleInputChange} placeholder="e.g., Photosynthesis" className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>

          <div className="w-full md:w-28">
            <label className="flex items-center gap-2 text-xs font-bold text-indigo-950 font-extrabold mb-1 cursor-pointer">
              <input type="checkbox" checked={includeMCQ} onChange={(e) => setIncludeMCQ(e.target.checked)} className="w-4 h-4 text-purple-600 rounded" />
              <CheckSquare size={14} /> MCQ
            </label>
            <input type="number" name="num_questions" min="1" max="20" disabled={!includeMCQ} value={formData.num_questions} onChange={handleInputChange} className={`w-full border rounded-lg p-3 text-sm ${!includeMCQ ? 'bg-slate-100 text-slate-400' : 'bg-white'}`} />
          </div>

          <div className="w-full md:w-28">
            <label className="flex items-center gap-2 text-xs font-bold text-indigo-950 font-extrabold mb-1 cursor-pointer">
              <input type="checkbox" checked={includeTheory} onChange={(e) => setIncludeTheory(e.target.checked)} className="w-4 h-4 text-purple-600 rounded" />
              <FileText size={14} /> Theory
            </label>
            <input type="number" name="num_theory" min="1" max="10" disabled={!includeTheory} value={formData.num_theory} onChange={handleInputChange} className={`w-full border rounded-lg p-3 text-sm ${!includeTheory ? 'bg-slate-100 text-slate-400' : 'bg-white'}`} />
          </div>

          <button type="submit" disabled={loading || !isFormValid} className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-purple-400">
            {loading ? <Loader2 size={20} className="animate-spin" /> : "Generate"}
          </button>
        </form>
      </div>

      {/* --- PREVIEW SECTION --- */}
      {examData && examData.questions_data && (
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 space-y-8 print:border-none print:shadow-none print:p-0">

          <div className="bg-green-50 text-green-700 p-4 rounded-xl font-bold flex items-center gap-2 border border-green-200 print:hidden">
            <CheckSquare size={18} /> Exam Successfully Generated & Saved to Postgres!
          </div>

          <div className="flex justify-between items-center pb-6 border-b border-slate-200">
            <div>
              <h3 className="text-3xl font-black text-indigo-950 font-extrabold uppercase tracking-tight">{examData.topic}</h3>
              <p className="text-sm font-bold text-slate-500 font-medium mt-1">Class Assignment: {examData.class_name}</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className={`px-4 py-2 font-bold rounded-lg text-sm flex items-center gap-2 transition-colors ${showAnswers ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-indigo-950 font-extrabold'}`}
              >
                {showAnswers ? <EyeOff size={16} /> : <Eye size={16} />}
                {showAnswers ? "Hide Answer Keys" : "Show Answer Keys"}
              </button>
              <button onClick={() => window.print()} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold flex items-center gap-2 bg-white hover:bg-slate-50"><Printer size={16} /> Print Paper</button>
              <button onClick={() => setExamData(null)} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg text-sm flex items-center gap-2 hover:bg-slate-800"><RefreshCw size={16} /> New Layout</button>
            </div>
          </div>

          {/* --- SECTION A: OBJECTIVE PREVIEW --- */}
          {examData.questions_data.objective && examData.questions_data.objective.length > 0 && (
            <div className="space-y-6">
              <h4 className="text-sm font-black text-purple-700 uppercase tracking-widest border-b pb-2">Section A: Multiple Choice Questions</h4>
              <div className="space-y-6">
                {examData.questions_data.objective.map((q, i) => (
                  <div key={i} className="space-y-2">
                    <p className="font-bold text-indigo-950 font-extrabold text-base">{i + 1}. {q.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, oi) => {
                        const isCorrect = opt === q.correct_answer;
                        return (
                          <div
                            key={oi}
                            className={`p-3 border rounded-xl text-sm transition-all ${isCorrect && showAnswers
                                ? 'bg-green-50 border-green-300 font-bold text-green-800'
                                : 'bg-slate-50/60 border-slate-200 text-indigo-950 font-extrabold'
                              }`}
                          >
                            <span className="mr-1">{['A.', 'B.', 'C.', 'D.'][oi]}</span> {opt}
                            {isCorrect && showAnswers && <span className="ml-2">✅</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- SECTION B: THEORY PREVIEW --- */}
          {examData.questions_data.theory && examData.questions_data.theory.length > 0 && (
            <div className="space-y-6 pt-6">
              <h4 className="text-sm font-black text-purple-700 uppercase tracking-widest border-b pb-2">Section B: Theory & Structured Essays</h4>
              <div className="space-y-6">
                {examData.questions_data.theory.map((q, i) => (
                  <div key={i} className="p-5 border border-slate-100 bg-slate-50/30 rounded-xl space-y-3">
                    <p className="font-bold text-indigo-950 font-extrabold text-base">{i + 1}. {q.question}</p>

                    {/* Interactive Marking Guide Block */}
                    {showAnswers && q.marking_guide && (
                      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-sm text-indigo-950 font-extrabold animate-in fade-in duration-150">
                        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-amber-800 mb-1.5">
                          <KeyRound size={14} className="text-amber-700" />
                          Evaluation Marking Guide
                        </div>
                        <p className="leading-relaxed text-slate-600 font-medium">{q.marking_guide}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}