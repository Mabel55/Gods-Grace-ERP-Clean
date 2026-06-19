import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, ChevronRight } from 'lucide-react';

import TakeExam from './TakeExam'; // The component from our previous step

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


export default function StudentExamList({ className }) {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    // Connects to your GET /exams/class/{class_name} endpoint
    fetch(`${API_BASE_URL}/exams/class/${className}`)
      .then(res => res.json())
      .then(data => setExams(data))
      .catch(err => console.error("Could not fetch exams", err));
  }, [className]);

  if (selectedExam) {
    return <TakeExam examId={selectedExam.id} questions={selectedExam.questions} onFinish={() => setSelectedExam(null)} />;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-black text-slate-800 mb-6">Available Exams for {className}</h2>
      
      {exams.length === 0 ? (
        <p className="text-slate-500 font-bold">No exams available for this class yet.</p>
      ) : (
        <div className="space-y-4">
          {exams.map(exam => (
            <div key={exam.id} className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  <BookOpen />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{exam.topic}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase">Class: {exam.class_name}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedExam(exam)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2"
              >
                Start Exam <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}