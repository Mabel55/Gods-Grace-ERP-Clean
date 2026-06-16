import React, { useState } from 'react';
import { UserPlus, Loader2, CheckCircle, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function RegisterStudent() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [recentStudents, setRecentStudents] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');

    try {
      // 1. Send the data to your FastAPI backend
      // Replace this URL with your actual student registration endpoint if it's different
      const response = await fetch("http://localhost:8000/students/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            first_name: formData.first_name,
            last_name: formData.last_name,
            date_of_birth: formData.date_of_birth,
            // You can add class_id here if your form collects it
            class_id: "basic-1-placeholder-id" 
        }),
      });

      if (response.ok) {
        const newStudent = await response.json();
        
        // 2. Add the new student (with their QR Token!) to our visual list
        setRecentStudents([newStudent, ...recentStudents]);
        setSuccessMessage(`${newStudent.first_name} registered successfully!`);
        
        // Clear the form
        setFormData({ first_name: '', last_name: '', date_of_birth: '' });
      } else {
        alert("Failed to register student. Check backend terminal.");
      }
    } catch (error) {
      console.error("Network Error:", error);
      
      // FOR TESTING UI ONLY: If your backend isn't perfectly hooked up yet, 
      // this creates a fake student so you can test the scanner right now.
      const mockStudent = {
          id: Math.random().toString(),
          first_name: formData.first_name,
          last_name: formData.last_name,
          matric_number: `GG-${Math.floor(Math.random() * 10000)}`,
          qr_token: `test-token-${Date.now()}` // Fake secure token
      };
      setRecentStudents([mockStudent, ...recentStudents]);
      setFormData({ first_name: '', last_name: '', date_of_birth: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* --- REGISTRATION FORM --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-green-500">
        <h2 className="text-xl font-bold text-green-800 flex items-center gap-2 mb-6">
          <UserPlus size={24} />
          Admin Dashboard: Register New Student
        </h2>
        
        <form onSubmit={handleRegister} className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 mb-1">First Name</label>
            <input 
              type="text" 
              name="first_name"
              required
              value={formData.first_name}
              onChange={handleInputChange}
              placeholder="e.g. David" 
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" 
            />
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 mb-1">Last Name</label>
            <input 
              type="text" 
              name="last_name"
              required
              value={formData.last_name}
              onChange={handleInputChange}
              placeholder="e.g. Ojo" 
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" 
            />
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 mb-1">Date of Birth</label>
            <input 
              type="date" 
              name="date_of_birth"
              required
              value={formData.date_of_birth}
              onChange={handleInputChange}
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-green-400"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : "Register"}
          </button>
        </form>

        {successMessage && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 text-sm font-semibold">
            <CheckCircle size={18} /> {successMessage}
          </div>
        )}
      </div>

      {/* --- RECENTLY REGISTERED (THE ID CARDS) --- */}
      {recentStudents.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <QrCode className="text-indigo-600" size={20} />
            Recently Generated ID Cards
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentStudents.map((student) => (
              <div key={student.id} className="border-2 border-indigo-50 bg-slate-50 p-4 rounded-xl flex gap-4 items-center">
                
                {/* The Magic QR Code */}
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm shrink-0">
                  <QRCodeSVG 
                    value={student.qr_token} 
                    size={80} 
                    level={"H"} 
                    includeMargin={false} 
                  />
                </div>
                
                <div>
                  <p className="font-bold text-slate-800 leading-tight">{student.first_name} {student.last_name}</p>
                  <p className="text-xs font-semibold text-indigo-600 mt-1">{student.matric_number || "Pending ID"}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Ready for Print/Scan</p>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}