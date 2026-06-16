import React, { useState, useRef } from 'react';
import { Upload, Download, CreditCard } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function IDCardGenerator() {
    const cardRef = useRef(null);
    const [downloading, setDownloading] = useState(false);
    const [studentData, setStudentData] = useState({
        name: 'Arua Mabel Chinasa',
        adminNo: 'GGIS/2026/001',
        className: 'Basic 5',
        bloodGroup: 'O+',
        photoUrl: null
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setStudentData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setStudentData(prev => ({ ...prev, photoUrl: imageUrl }));
        }
    };

    const downloadIDCard = async () => {
        if (!cardRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true });
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `${studentData.name.replace(/\s+/g, '_')}_ID_Card.png`;
            link.click();
        } catch (error) {
            console.error("Failed to generate ID Card", error);
            alert("Failed to download ID card. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full mb-6">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 flex items-center gap-2">
                <CreditCard size={18} className="text-indigo-600" />
                Student ID Card Generator
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* LEFT COLUMN: Input Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Student Name</label>
                        <input type="text" name="name" value={studentData.name} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500" placeholder="e.g. John Doe" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Admission No.</label>
                            <input type="text" name="adminNo" value={studentData.adminNo} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Class</label>
                            <input type="text" name="className" value={studentData.className} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Blood Group</label>
                        <select name="bloodGroup" value={studentData.bloodGroup} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500">
                            <option value="A+">A+</option><option value="A-">A-</option>
                            <option value="B+">B+</option><option value="B-">B-</option>
                            <option value="O+">O+</option><option value="O-">O-</option>
                            <option value="AB+">AB+</option><option value="AB-">AB-</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Student Passport</label>
                        <label className="flex items-center justify-center w-full px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                            <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                                <Upload size={16} /> Select Photo
                            </div>
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                    </div>
                </div>

                {/* RIGHT COLUMN: Live ID Card Preview */}
                <div className="flex flex-col items-center justify-center bg-slate-50 p-6 rounded-xl border border-slate-100">

                    {/* The Actual ID Card Element */}
                    <div ref={cardRef} className="w-[240px] h-[380px] bg-white rounded-xl shadow-lg overflow-hidden flex flex-col border border-slate-200 relative">
                        {/* Header / Branding */}
                        <div className="bg-gradient-to-b from-indigo-800 to-indigo-700 p-3 text-center flex flex-col items-center pt-4 pb-8">
                            <div className="w-10 h-10 bg-white rounded-full p-0.5 mb-2 shadow-md flex items-center justify-center overflow-hidden">
                                <img src="http://localhost:8000/static/school_logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none' }} />
                            </div>
                            <h2 className="text-white text-[11px] font-black tracking-tight leading-tight uppercase">God's Grace Int'l School</h2>
                            <p className="text-indigo-200 text-[6px] font-bold tracking-widest uppercase mt-0.5">Action Not Word</p>
                        </div>

                        {/* Profile Photo Area (Overlapping Header) */}
                        <div className="absolute top-[85px] left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full p-1 shadow-md">
                            <div className="w-full h-full rounded-full bg-slate-100 overflow-hidden border-2 border-indigo-100">
                                {studentData.photoUrl ? (
                                    <img src={studentData.photoUrl} alt="Student" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Upload size={24} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Student Details */}
                        <div className="flex-1 mt-16 px-4 flex flex-col items-center text-center">
                            <h1 className="text-sm font-black text-slate-800 uppercase leading-tight mb-1">{studentData.name || 'STUDENT NAME'}</h1>
                            <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-3">{studentData.className || 'CLASS'}</p>

                            <div className="w-full space-y-1.5 text-[9px]">
                                <div className="flex justify-between border-b border-slate-100 pb-0.5">
                                    <span className="font-bold text-slate-400 uppercase">ID No.</span>
                                    <span className="font-black text-slate-700">{studentData.adminNo || '---'}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-0.5">
                                    <span className="font-bold text-slate-400 uppercase">Blood Grp.</span>
                                    <span className="font-black text-slate-700">{studentData.bloodGroup}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Barcode Placeholder */}
                        <div className="bg-slate-50 h-10 flex flex-col items-center justify-center border-t border-slate-100 px-4 py-2">
                            <div className="w-full h-full opacity-40 bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_4px,#000_4px,#000_5px,transparent_5px,transparent_8px)]"></div>
                        </div>
                    </div>

                    <button
                        onClick={downloadIDCard}
                        disabled={downloading}
                        className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {downloading ? 'Processing...' : <><Download size={16} /> Download ID Card</>}
                    </button>
                </div>
            </div>
        </div>
    );
}