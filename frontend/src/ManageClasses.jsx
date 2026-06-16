import React, { useState, useEffect } from 'react';

export default function ManageClasses() {
  const [className, setClassName] = useState('');
  const [classes, setClasses] = useState([]);
  const [status, setStatus] = useState('');

  // 1. Fetch existing classes to display on the screen
  const fetchClasses = async () => {
    try {
      const response = await fetch("http://localhost:8000/classes/");
      const data = await response.json();
      if (Array.isArray(data)) {
        setClasses(data);
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // 2. Handle form submission to create a new class
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Creating class...');

    const payload = {
      name: className,
      class_teacher_id: null // Temporarily null until teacher accounts are wired up
    };

    try {
      const response = await fetch("http://localhost:8000/classes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus(`✅ Class "${className}" created successfully!`);
        setClassName('');
        fetchClasses(); // Refresh the list immediately
        
        // Soft reload after 1.5 seconds so other dropdown components see the new class
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const errorData = await response.json();
        setStatus(`❌ Error: ${errorData.detail || "Could not create class"}`);
      }
    } catch (error) {
      setStatus("❌ Server connection lost.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Left Box: Create Class Form */}
      <div className="p-6 bg-white border-2 border-purple-100 rounded-xl shadow-sm md:col-span-1">
        <h2 className="text-lg font-bold text-purple-800 mb-3">Add New Class</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Class Name</label>
            <input 
              required 
              type="text" 
              value={className} 
              onChange={(e) => setClassName(e.target.value)} 
              className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none text-sm" 
              placeholder="e.g. Basic 1, KG 2" 
            />
          </div>
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition text-sm">
            Create Class
          </button>
          {status && <p className="text-xs font-medium text-gray-600 mt-2 bg-gray-50 p-2 rounded border">{status}</p>}
        </form>
      </div>

      {/* Right Box: Current Active Classes List */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm md:col-span-2">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Active Classes</h2>
        {classes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {classes.map((cls) => (
              <span key={cls.id} className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm">
                🏫 {cls.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No classes registered yet. Create one on the left!</p>
        )}
      </div>

    </div>
  );
}