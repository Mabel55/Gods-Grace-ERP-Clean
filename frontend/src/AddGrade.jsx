import { useState, useEffect } from 'react';

export default function AddGrade() {
  const [status, setStatus] = useState('');

  // States to hold the dropdown lists from the database
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  const [formData, setFormData] = useState({
    student_id: "",
    class_id: "",
    subject: "",
    term: "1st", // Changed default to 1st term
    academic_session: "2025/2026",
    ca_score: "",
    exam_score: ""
  });

  // Fetch Students AND Classes when the component loads
  useEffect(() => {
    // Fetch Students
    const fetchStudents = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const response = await fetch(`${API_BASE_URL}/students/`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setStudents(data);
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
      }
    };

    // Fetch Classes
    const fetchClasses = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const response = await fetch(`${API_BASE_URL}/classes/`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setClasses(data);
        }
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      }
    };

    fetchStudents();
    fetchClasses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Safeguards to ensure dropdowns are actually selected!
    if (!formData.student_id) {
      setStatus('❌ Please select a student first.');
      return;
    }
    if (!formData.class_id) {
      setStatus('❌ Please select a class first.');
      return;
    }

    setStatus('Submitting...');

    const ca = parseFloat(formData.ca_score) || 0;
    const exam = parseFloat(formData.exam_score) || 0;
    const total = ca + exam;

    let gradeLetter = "F";
    if (total >= 70) gradeLetter = "A";
    else if (total >= 60) gradeLetter = "B";
    else if (total >= 50) gradeLetter = "C";
    else if (total >= 40) gradeLetter = "D";

    const payload = {
      ...formData,
      ca_score: ca,
      exam_score: exam,
      total_score: total,
      grade_letter: gradeLetter
    };

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_BASE_URL}/grades/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus("✅ Grade added successfully!");
        // Clear only the subject and scores for the next entry
        setFormData({ ...formData, subject: "", ca_score: "", exam_score: "" });

        // Auto-refresh the dashboard
        setTimeout(() => { window.location.reload(); }, 1000);
      } else {
        const errorData = await response.json();
        setStatus(`❌ Error: ${errorData.detail}`);
      }
    } catch (error) {
      setStatus("❌ Connection error. Is the backend running?");
    }
  };

  return (
    <div className="max-w-5xl mx-auto mb-8 p-6 bg-white border-2 border-indigo-100 rounded-xl shadow-sm">
      <h2 className="text-xl font-bold text-indigo-900 mb-4">Teacher Dashboard: Enter Grades</h2>

      {/* Changed grid-cols-5 to grid-cols-6 to fit the new dropdown */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4">

        {/* Student Selector Dropdown */}
        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-gray-700">Student</label>
          <select
            required
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          >
            <option value="" disabled>Select Student</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.first_name} {student.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Class Selector Dropdown */}
        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-gray-700">Class</label>
          <select
            required
            name="class_id"
            value={formData.class_id}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          >
            <option value="" disabled>Select Class</option>
            {classes.map(schoolClass => (
              <option key={schoolClass.id} value={schoolClass.id}>
                {schoolClass.name}
              </option>
            ))}
          </select>
        </div>

        {/* NEW: Term Selector Dropdown */}
        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-gray-700">Term</label>
          <select
            required
            name="term"
            value={formData.term}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          >
            <option value="1st">1st</option>
            <option value="2nd">2nd</option>
            <option value="3rd">3rd</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Subject</label>
          <input required type="text" name="subject" value={formData.subject} onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g. Science" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">CA Score</label>
          <input required type="number" name="ca_score" value={formData.ca_score} onChange={handleChange} max="40"
            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Max 40" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Exam Score</label>
          <input required type="number" name="exam_score" value={formData.exam_score} onChange={handleChange} max="60"
            className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Max 60" />
        </div>

        {/* Changed col-span-5 to col-span-6 so it spans the entire new width */}
        <div className="md:col-span-6 flex items-center justify-between mt-2">
          <span className="text-sm font-medium text-gray-600">{status}</span>
          <button type="submit" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-semibold text-white font-bold py-2 px-6 rounded hover:bg-indigo-700 transition">
            Submit Grade
          </button>
        </div>
      </form>
    </div>
  );
}