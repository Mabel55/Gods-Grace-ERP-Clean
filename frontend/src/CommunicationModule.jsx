import React, { useState } from 'react';
import { Mail, MessageSquare, Send, Users, Clock, History, CheckCircle2, AlertCircle } from 'lucide-react';

const MESSAGE_HISTORY = [
    { id: 1, type: 'email', audience: 'All Parents', subject: 'End of Term Newsletter', date: '2026-06-10', status: 'Delivered', count: 412 },
    { id: 2, type: 'sms', audience: 'Basic 5 Parents', subject: 'Excursion Reminder', date: '2026-06-12', status: 'Delivered', count: 35 },
    { id: 3, type: 'email', audience: 'All Staff', subject: 'Emergency Staff Meeting', date: '2026-06-15', status: 'Delivered', count: 48 },
];

export default function CommunicationModule() {
    const [activeTab, setActiveTab] = useState('compose'); // 'compose' or 'history'
    const [messageType, setMessageType] = useState('email'); // 'email' or 'sms'
    const [isSending, setIsSending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        audience: 'all_parents',
        subject: '',
        message: ''
    });

    const handleSend = (e) => {
        e.preventDefault();
        setIsSending(true);

        // Simulate API call to email/SMS provider (like SendGrid or Twilio)
        setTimeout(() => {
            setIsSending(false);
            setShowSuccess(true);
            setFormData({ audience: 'all_parents', subject: '', message: '' });
            setTimeout(() => setShowSuccess(false), 4000);
        }, 1500);
    };

    return (
        <div className="max-w-6xl mx-auto mb-10">

            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                    <Mail className="text-violet-600" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-indigo-950 font-extrabold uppercase tracking-tight">Communication Hub</h1>
                    <p className="text-sm font-bold text-slate-500 font-medium">Send bulk Emails and SMS to parents and staff.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-200 pb-4">
                <button
                    onClick={() => setActiveTab('compose')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-colors ${activeTab === 'compose' ? 'bg-violet-600 text-white shadow-md' : 'bg-white text-slate-500 font-medium border border-slate-200 hover:bg-slate-50'}`}
                >
                    <Send size={16} /> Compose Message
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-black uppercase tracking-wider flex items-center gap-2 transition-colors ${activeTab === 'history' ? 'bg-violet-600 text-white shadow-md' : 'bg-white text-slate-500 font-medium border border-slate-200 hover:bg-slate-50'}`}
                >
                    <History size={16} /> Broadcast History
                </button>
            </div>

            {/* Tab Content: Compose Message */}
            {activeTab === 'compose' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">

                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">

                            {showSuccess && (
                                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                                    <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <h4 className="text-sm font-black text-emerald-800 uppercase tracking-wider">Broadcast Sent</h4>
                                        <p className="text-xs font-bold text-emerald-600 mt-1">Your {messageType.toUpperCase()} has been successfully queued for delivery to {formData.audience.replace('_', ' ')}.</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSend} className="space-y-6">

                                {/* Channel Selector */}
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Delivery Channel</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setMessageType('email')}
                                            className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-colors ${messageType === 'email' ? 'border-violet-500 bg-violet-50 text-violet-800' : 'border-slate-200 text-slate-500 font-medium hover:border-violet-300'}`}
                                        >
                                            <div className={`p-2 rounded-lg ${messageType === 'email' ? 'bg-violet-200 text-violet-700' : 'bg-slate-100 text-slate-400'}`}>
                                                <Mail size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black">Email Blast</p>
                                                <p className="text-[10px] uppercase tracking-wider font-bold opacity-70">Free & Unlimited</p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setMessageType('sms')}
                                            className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-colors ${messageType === 'sms' ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-500 font-medium hover:border-blue-300'}`}
                                        >
                                            <div className={`p-2 rounded-lg ${messageType === 'sms' ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                                                <MessageSquare size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black">SMS Text</p>
                                                <p className="text-[10px] uppercase tracking-wider font-bold opacity-70">Requires Credits</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Audience Selection */}
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Target Audience</label>
                                    <select
                                        value={formData.audience}
                                        onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-indigo-950 font-extrabold focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
                                    >
                                        <option value="all_parents">All Parents & Guardians</option>
                                        <option value="all_staff">All Staff Members</option>
                                        <option value="basic_5_parents">Basic 5 Parents Only</option>
                                        <option value="fee_defaulters">Parents with Outstanding Fees</option>
                                    </select>
                                </div>

                                {/* Subject Line (Email Only) */}
                                {messageType === 'email' && (
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Subject Line</label>
                                        <input
                                            type="text" required
                                            placeholder="e.g., Important update regarding school fees"
                                            value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-indigo-950 font-extrabold focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
                                        />
                                    </div>
                                )}

                                {/* Message Body */}
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">Message Content</label>
                                        {messageType === 'sms' && (
                                            <span className={`text-xs font-bold ${formData.message.length > 160 ? 'text-rose-500' : 'text-slate-400'}`}>
                                                {formData.message.length} / 160 chars
                                            </span>
                                        )}
                                    </div>
                                    <textarea
                                        required rows={messageType === 'email' ? "8" : "4"}
                                        placeholder={messageType === 'email' ? "Type your detailed email newsletter here..." : "Type your short SMS message here..."}
                                        value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all resize-none leading-relaxed"
                                    />
                                    {messageType === 'sms' && formData.message.length > 160 && (
                                        <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} /> Message exceeds 160 characters. It will be sent as 2 SMS credits per person.
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSending || !formData.message.trim()}
                                    className={`w-full py-4 rounded-xl text-sm font-black uppercase tracking-wider text-white shadow-lg flex items-center justify-center gap-2 transition-all ${messageType === 'email' ? 'bg-violet-600 hover:bg-violet-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50`}
                                >
                                    {isSending ? 'Sending Broadcast...' : <><Send size={18} /> Send to {formData.audience.replace('_', ' ').toUpperCase()}</>}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Guidelines / Tips Widget */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-800 p-6 rounded-2xl text-white shadow-md">
                            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 mb-4 text-violet-300">
                                <Users size={18} /> Audience Reach
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                                    <span className="text-sm font-bold text-slate-300">All Parents</span>
                                    <span className="text-lg font-black text-white">412</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                                    <span className="text-sm font-bold text-slate-300">All Staff</span>
                                    <span className="text-lg font-black text-white">48</span>
                                </div>
                                <div className="flex justify-between items-center pb-1">
                                    <span className="text-sm font-bold text-slate-300">Fee Defaulters</span>
                                    <span className="text-lg font-black text-rose-400">124</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100">
                            <h3 className="text-xs font-black uppercase tracking-wider text-violet-800 mb-2">Pro Tips</h3>
                            <ul className="text-sm text-violet-700 space-y-2 font-medium">
                                <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0"></div> Keep SMS messages under 160 characters to save credits.</li>
                                <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0"></div> Emails are delivered instantly and cost nothing.</li>
                                <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0"></div> Double-check your spelling before hitting send; broadcasts cannot be undone.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Content: History */}
            {activeTab === 'history' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <h2 className="text-sm font-black text-indigo-950 font-extrabold uppercase tracking-wider flex items-center gap-2">
                            <History size={18} className="text-violet-600" /> Recent Broadcasts
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-200">
                                    <th className="p-4 font-bold">Type</th>
                                    <th className="p-4 font-bold">Subject / Preview</th>
                                    <th className="p-4 font-bold">Audience</th>
                                    <th className="p-4 font-bold">Date</th>
                                    <th className="p-4 font-bold text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MESSAGE_HISTORY.map((msg) => (
                                    <tr key={msg.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            {msg.type === 'email'
                                                ? <div className="p-2 bg-violet-100 text-violet-600 rounded-lg inline-block"><Mail size={16} /></div>
                                                : <div className="p-2 bg-blue-100 text-blue-600 rounded-lg inline-block"><MessageSquare size={16} /></div>
                                            }
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-indigo-950 font-extrabold">{msg.subject}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Sent to {msg.count} recipients</p>
                                        </td>
                                        <td className="p-4 font-bold text-slate-600 text-sm">{msg.audience}</td>
                                        <td className="p-4 font-bold text-slate-500 font-medium text-sm flex items-center gap-1 mt-2"><Clock size={12} className="text-slate-400" /> {msg.date}</td>
                                        <td className="p-4 text-center">
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                                                <CheckCircle2 size={12} /> {msg.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
}