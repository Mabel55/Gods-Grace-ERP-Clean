import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


export default function TakeAttendance() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [statusMsg, setStatusMsg] = useState('');

  // Fetch students and classes on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Students
        const stuRes = await fetch(`${API_BASE_URL}/students/`);
        const stuData = await stuRes.json();
        if (Array.isArray(stuData)) {
          setStudents(stuData);
          const initialRecord = {};
          stuData.forEach(s => initialRecord[s.id] = "Present");
          setAttendance(initialRecord);
        }

        // Fetch Classes for the dropdown
        const clsRes = await fetch(`${API_BASE_URL}/classes/`);
        const clsData = await clsRes.json();
        if (Array.isArray(clsData)) setClasses(clsData);

      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const toggleStatus = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === "Present" ? "Absent" : "Present"
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClass) {
        setStatusMsg('❌ Please select a class first.');
        return;
    }

    setStatusMsg('Saving attendance...');
    let successCount = 0;
    let skipCount = 0;

    // Loop through each student and send to YOUR existing endpoint
    for (const student of students) {
      const payload = {
        student_id: student.id,
        class_id: selectedClass, // Your schema requires this!
        date: date,
        status: attendance[student.id]
      };

      try {
        const response = await fetch(`${API_BASE_URL}/attendance/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
            successCount++;
        } else {
            // Your backend correctly returns a 400 if attendance is already recorded today
            skipCount++;
        }
      } catch (error) {
        console.error("Error saving record");
      }
    }

    setStatusMsg(`✅ Done! Saved ${successCount} new records. ${skipCount > 0 ? `(${skipCount} already existed)` : ''}`);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto mb-8 p-6 bg-white border-2 border-teal-100 rounded-xl shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
        <h2 className="text-xl font-bold text-teal-900">Daily Attendance Tracker</h2>
        
        <div className="flex gap-2 w-full md:w-auto">
          {/* NEW: Class Dropdown */}
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-semibold text-teal-800 bg-white flex-1"
          >
            <option value="" disabled>Select Class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>

          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-semibold text-teal-800" 
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {students.map(student => {
            const isPresent = attendance[student.id] === "Present";
            return (
              <div 
                key={student.id} 
                onClick={() => toggleStatus(student.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition flex justify-between items-center ${isPresent ? 'border-teal-500 bg-teal-50 hover:bg-teal-100' : 'border-red-400 bg-red-50 hover:bg-red-100'}`}
              >
                <div>
                  <p className="font-bold text-gray-800">{student.first_name} {student.last_name}</p>
                  <p className="text-xs text-gray-500">{student.matric_number || "No ID"}</p>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${isPresent ? 'bg-teal-500 text-white' : 'bg-red-500 text-white'}`}>
                  {isPresent ? "✓ Present" : "✗ Absent"}
                </span>
              </div>
            );
          })}
        </div>

        {students.length === 0 && <p className="text-center text-gray-500 italic mb-4">No students registered yet.</p>}

        <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
            <span className="text-sm font-medium text-teal-700">{statusMsg}</span>
            <button type="submit" className="w-full md:w-auto bg-teal-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-teal-700 transition shadow-md">
              Save Daily Register
            </button>
        </div>
      </form>
    </div>
  );
}