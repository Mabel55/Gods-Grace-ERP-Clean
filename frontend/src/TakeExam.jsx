import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Award, ArrowLeft, BookOpen } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


export default function TakeExam({ 
  examId, 
  questions, 
  onFinish, 
  studentId = "STU-001",      // Defaults provided for safety/local fallback
  currentTerm = "1st Term", 
  currentSession = "2025/2026" 
}) {
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [examResult, setExamResult] = useState(null); // Tracks the grading response

  const handleSubmit = async () => {
    setLoading(true);
    
    // --- DYNAMIC PAYLOAD SYNCHRONIZATION ---
    const payload = {
      student_id: studentId,
      term: currentTerm,
      academic_session: currentSession,
      answers: answers
    };

    try {
      const res = await fetch(`${API_BASE_URL}/exams/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();

      if (!res.ok) {
        console.error("Backend Error Data:", result);
        alert("Backend rejected the submission.");
        return;
      }

      // Save valid data to local state to trigger the score metrics screen
      setExamResult(result);
      
    } catch (err) {
      console.error("Network Error:", err);
      alert("Error submitting exam.");
    } finally {
      setLoading(false);
    }
  };

  // --- FRONTEND RESULT METRICS RENDERER ---
  if (examResult) {
    const isPassed = examResult.percentage >= 50;

    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden mt-8 animate-in fade-in zoom-in-95 duration-200">
        <div className={`p-8 text-center text-white bg-gradient-to-br ${isPassed ? 'from-green-600 to-emerald-700' : 'from-amber-500 to-orange-600'}`}>
          <div className="inline-flex p-4 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
            {isPassed ? <Award size={40} /> : <AlertTriangle size={40} />}
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight">
            {isPassed ? "Exam Completed!" : "Keep Practicing!"}
          </h3>
          <p className="text-white/80 text-sm font-semibold mt-1">Your performance review is ready</p>
        </div>

        <div className="p-8 text-center space-y-6 bg-white">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Final Score</span>
            <div className="text-5xl font-black text-indigo-950 font-extrabold tracking-tight">
              {examResult.score} <span className="text-2xl text-slate-400 font-medium">/ {examResult.total}</span>
            </div>
          </div>

          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className={`text-xs font-black uppercase inline-block py-1 px-2.5 rounded-full ${isPassed ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {examResult.percentage}% Score
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 font-medium">Passing Line: 50%</span>
              </div>
            </div>
            <div className="overflow-hidden h-3 text-xs flex rounded-full bg-slate-100">
              <div 
                style={{ width: `${examResult.percentage}%` }} 
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${isPassed ? 'bg-green-500' : 'bg-amber-500'}`}
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border rounded-xl text-left text-xs text-slate-600 space-y-2">
            <div className="flex justify-between font-medium">
              <span>Status:</span>
              <span className={`font-bold ${isPassed ? 'text-green-600' : 'text-amber-600'}`}>{isPassed ? 'PASSED' : 'REMEDIAL REQUIRED'}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Report Card Synced:</span>
              <span className="text-indigo-600 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Automatic</span>
            </div>
          </div>

          <button 
            onClick={onFinish}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-sm"
          >
            <ArrowLeft size={16} /> Return to Exam Hub
          </button>
        </div>
      </div>
    );
  }

  // --- CORE EXAM INTERFACE ---
  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-sm border">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b">
        <BookOpen className="text-indigo-600" size={24} />
        <h2 className="text-2xl font-black text-indigo-950 font-extrabold">Exam Mode</h2>
      </div>
      
      {/* 1. Render Objective Questions */}
      {questions.objective && questions.objective.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold text-base uppercase tracking-wider mb-4 text-indigo-700">Section A: Objective</h3>
          {questions.objective.map((q, i) => (
            <div key={i} className="mb-6 p-5 border border-slate-200 rounded-xl bg-slate-50/50">
              <p className="font-bold text-indigo-950 font-extrabold mb-4 leading-snug">{i + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <label key={oi} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-indigo-50/30 transition-colors">
                    <input 
                      type="radio" name={`q-${i}`} value={opt} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      onChange={(e) => setAnswers({...answers, [i]: e.target.value})}
                    />
                    <span className="text-sm font-medium text-indigo-950 font-extrabold">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Render Theory Questions */}
      {questions.theory && questions.theory.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold text-base uppercase tracking-wider mb-4 text-indigo-700">Section B: Theory</h3>
          {questions.theory.map((q, i) => (
            <div key={i} className="mb-6 p-5 border border-slate-200 rounded-xl bg-slate-50/50">
              <p className="font-bold text-indigo-950 font-extrabold mb-3 leading-snug">{i + 1}. {q.question}</p>
              <textarea 
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-shadow" 
                rows="4" 
                placeholder="Type your structured answer here clear and detailed..."
                onChange={(e) => setAnswers({...answers, [`theory-${i}`]: e.target.value})}
              />
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={handleSubmit} 
        disabled={loading}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-semibold text-white py-4 rounded-xl font-bold hover:bg-green-700 disabled:bg-green-400 transition shadow-sm flex items-center justify-center gap-2"
      >
        {loading ? "Processing Answers..." : "Complete & Submit Exam"}
      </button>
    </div>
  );
}