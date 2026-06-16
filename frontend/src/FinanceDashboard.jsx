import React, { useState, useEffect } from 'react';
import { Plus, List, Printer, Wallet, TrendingUp } from 'lucide-react';

export default function FinanceDashboard() {
  const [payments, setPayments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    payment_status: 'Complete',
    term: '2nd',
    session: '2025/2026',
    receipt_no: `RCP-${Math.floor(Math.random() * 10000)}`
  });

  const loadPayments = async () => {
    try {
      const res = await fetch("http://localhost:8000/payments");
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error("Error loading payments:", err);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // FIX: Convert strings to strict numbers so FastAPI doesn't throw a 422 Error!
    const payload = {
      ...formData,
      student_id: parseInt(formData.student_id, 10),
      amount: parseFloat(formData.amount)
    };

    try {
      const response = await fetch("http://localhost:8000/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await loadPayments();
        setFormData({
          ...formData,
          receipt_no: `RCP-${Math.floor(Math.random() * 10000)}`,
          student_id: '',
          amount: ''
        });
      } else {
        alert("Error saving payment. Check if the Student ID exists in the database.");
      }
    } catch (error) {
      alert("Could not connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = (payment) => {
    setSelectedReceipt(payment);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const totalRevenue = (payments || []).reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto mb-10">

      <div className="flex items-center gap-3 mb-8 print:hidden">
        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
          <Wallet className="text-emerald-600" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Finance & Fees</h1>
          <p className="text-sm font-bold text-slate-500">Live transaction registry and fee collection.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
              <h3 className="text-3xl font-black text-slate-800">₦{totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
              <TrendingUp className="text-emerald-500" size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 text-slate-700">
              <Plus size={18} className="text-emerald-600" /> Record Payment
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                {/* Changed to expect a database ID number instead of a string */}
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Student Database ID</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:border-emerald-500"
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (₦)</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:border-emerald-500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Save Payment'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
            <h2 className="text-sm font-black uppercase tracking-wider mb-6 flex items-center gap-2 text-slate-700">
              <List size={18} className="text-indigo-600" /> Transaction Ledger
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 border-y border-slate-200">
                    <th className="p-4 font-bold">Receipt No.</th>
                    <th className="p-4 font-bold">Student DB ID</th>
                    <th className="p-4 font-bold text-right">Amount</th>
                    <th className="p-4 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(payments || []).length === 0 ? (
                    <tr><td colSpan="4" className="p-6 text-center text-sm font-medium text-slate-400 italic">No transactions recorded yet.</td></tr>
                  ) : (
                    payments.map((p, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-600 text-sm">{p.receipt_no}</td>
                        <td className="p-4 font-bold text-slate-800">{p.student_id}</td>
                        <td className="p-4 font-black text-emerald-600 text-right">₦{parseFloat(p.amount).toLocaleString()}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handlePrint(p)}
                            className="inline-flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md font-bold hover:bg-indigo-100 transition-colors"
                          >
                            <Printer size={14} /> Print
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedReceipt && (
        <div className="hidden print:block max-w-md mx-auto p-8 border-2 border-slate-800 rounded-xl bg-white text-slate-900 mt-10">

          <div className="text-center mb-8 border-b-2 border-slate-800 pb-6">
            <h1 className="text-2xl font-black uppercase tracking-tight">God's Grace Int'l</h1>
            <p className="text-sm font-bold uppercase tracking-widest mt-1">Official Payment Receipt</p>
          </div>

          <div className="space-y-4 mb-8 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-500 uppercase">Receipt No:</span>
              <span className="font-mono font-black">{selectedReceipt.receipt_no}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-500 uppercase">Date:</span>
              <span className="font-bold">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-500 uppercase">Student DB ID:</span>
              <span className="font-black uppercase">{selectedReceipt.student_id}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-500 uppercase">Academic Session:</span>
              <span className="font-bold">{selectedReceipt.session} - {selectedReceipt.term} Term</span>
            </div>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg flex justify-between items-center mb-12">
            <span className="font-black uppercase tracking-wider text-slate-600">Amount Paid</span>
            <span className="text-2xl font-black">₦{parseFloat(selectedReceipt.amount).toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-end mt-16 pt-8">
            <div className="text-center">
              <div className="px-6 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-black uppercase tracking-widest text-sm rounded-md transform -rotate-12 inline-block">
                PAID IN FULL
              </div>
            </div>
            <div className="text-center w-32">
              <div className="border-b-2 border-slate-800 mb-2 w-full"></div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">Bursar Signature</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}