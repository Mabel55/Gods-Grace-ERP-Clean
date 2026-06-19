import React, { useState } from 'react';
import { Upload, ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


export default function UploadLogo({ onLogoUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Package the raw binary image as standard Multi-Part Form Data
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/school/upload-logo`, {
        method: "POST",
        body: formData, // Do NOT set Content-Type header manually when using FormData; the browser must calculate the multi-part boundaries
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(true);
        if (onLogoUpdate) onLogoUpdate(data.logo_url); // Notify App.jsx header to refresh immediately
      } else {
        alert("Upload failed. Make sure you are choosing a valid PNG or JPG image.");
      }
    } catch (error) {
      console.error("Upload Connection Error:", error);
      alert("Could not reach backend upload terminal.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
        <ImageIcon size={16} className="text-indigo-600" />
        School Branding Settings
      </h3>
      
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 p-8 rounded-xl bg-slate-50/50 transition-colors relative group">
        {uploading ? (
          <div className="text-center space-y-2 py-4">
            <Loader2 className="animate-spin text-indigo-600 mx-auto" size={32} />
            <p className="text-xs font-bold text-slate-500">Uploading new emblem to Postgres core...</p>
          </div>
        ) : success ? (
          <div className="text-center space-y-2 py-4 text-green-600 animate-in fade-in duration-200">
            <CheckCircle2 className="mx-auto" size={32} />
            <p className="text-xs font-black uppercase tracking-tight">Portal Logo Synced Successfully!</p>
            <p className="text-[11px] text-slate-400 font-medium">Refresh completed across all connected layouts.</p>
          </div>
        ) : (
          <label className="text-center cursor-pointer block w-full h-full">
            <Upload className="mx-auto text-slate-400 group-hover:text-indigo-600 group-hover:scale-105 transition-all mb-3" size={32} />
            <span className="bg-white px-3 py-1.5 border shadow-sm rounded-lg text-xs font-bold text-slate-700 inline-block mb-1 group-hover:border-indigo-300">
              Select Logo Image
            </span>
            <p className="text-[10px] font-medium text-slate-400 mt-1">Accepts high-res PNG or JPG badge designs</p>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}
      </div>
    </div>
  );
}