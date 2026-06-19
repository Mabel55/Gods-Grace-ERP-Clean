import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


export default function QRScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize the scanner UI
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true
    });

    async function onScanSuccess(decodedText) {
      scanner.pause(); // Pause to prevent duplicate scans while fetching
      setLoading(true);
      setErrorMessage(null);
      setScanResult(null);

      try {
        const response = await fetch(`${API_BASE_URL}/attendance/scan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qr_token: decodedText }),
        });

        const data = await response.json();

        if (response.ok) {
          setScanResult(data);
          // Optional: Make the browser announce the name
          const speech = new SpeechSynthesisUtterance(`${data.student_name} Checked In`);
          window.speechSynthesis.speak(speech);
        } else {
          setErrorMessage(data.detail || "Scanning failed");
        }
      } catch (err) {
        setErrorMessage("Network error connecting to server.");
      } finally {
        setLoading(false);
        // Automatically resume scanning after 3 seconds for the next student
        setTimeout(() => {
          scanner.resume();
        }, 3000);
      }
    }

    function onScanFailure(error) {
      // Ignore routine frame errors
    }

    scanner.render(onScanSuccess, onScanFailure);

    // Cleanup when leaving the page
    return () => {
      scanner.clear().catch(e => console.error(e));
    };
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-sm border-2 border-indigo-50 mt-8">
      <h2 className="text-xl font-bold text-indigo-900 text-center mb-2">Live ID Scanner</h2>
      <p className="text-xs text-center text-slate-500 mb-6">Hold student ID card up to the camera</p>

      {/* The Camera Feed Window */}
      <div id="reader" className="overflow-hidden rounded-xl border border-slate-200"></div>

      {/* Feedback Display */}
      <div className="mt-6 min-h-[80px] flex items-center justify-center">
        {loading && <p className="text-indigo-600 font-bold animate-pulse">Verifying ID...</p>}
        
        {scanResult && (
          <div className="w-full bg-green-50 border border-green-200 p-4 rounded-xl text-center">
            <p className="text-sm font-bold text-green-700">✅ Present</p>
            <p className="text-lg font-black text-green-900 mt-1">{scanResult.student_name}</p>
            <p className="text-xs text-green-600 mt-1">{scanResult.matric_number}</p>
          </div>
        )}

        {errorMessage && (
          <div className="w-full bg-red-50 border border-red-200 p-4 rounded-xl text-center">
            <p className="text-sm font-bold text-red-700">❌ Scan Error</p>
            <p className="text-sm font-semibold text-red-900 mt-1">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}