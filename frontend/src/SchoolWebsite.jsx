import React from 'react';
import { ChevronRight, BookOpen, Users, Trophy, Phone, Mail, MapPin, CheckCircle, GraduationCap } from 'lucide-react';

export default function SchoolWebsite() {
    return (
        <div className="bg-white min-h-screen font-sans overflow-x-hidden">

            {/* --- HERO SECTION --- */}
            <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white pt-24 pb-32 px-6 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-20 w-80 h-80 bg-purple-400 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-6xl mx-auto relative z-10 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <div className="inline-block px-4 py-1.5 bg-indigo-800/50 border border-indigo-400/30 rounded-full text-indigo-200 text-xs font-black uppercase tracking-widest mb-2 backdrop-blur-sm">
                            Admissions Open for 2026/2027
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                            Empowering Minds,<br /> <span className="text-yellow-400">Shaping the Future.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-indigo-100 font-medium leading-relaxed max-w-2xl">
                            Welcome to God's Grace Int'l School. We provide a world-class education rooted in excellence, innovation, and character development.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                            <button className="w-full sm:w-auto px-8 py-4 bg-yellow-400 text-indigo-900 font-black uppercase tracking-wider rounded-xl hover:bg-yellow-300 transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                                Apply Now <ChevronRight size={20} />
                            </button>
                            <button className="w-full sm:w-auto px-8 py-4 bg-indigo-800 text-white border border-indigo-600 font-black uppercase tracking-wider rounded-xl hover:bg-indigo-700 transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                                Take a Tour
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 hidden md:block">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 to-indigo-500 rounded-3xl transform rotate-3 scale-105 opacity-50 blur-lg"></div>
                            <div className="relative bg-white p-2 rounded-3xl shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="Happy Students"
                                    className="rounded-2xl w-full h-auto object-cover aspect-video"
                                />
                            </div>
                            {/* Floating Badge */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce-slow">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                    <Trophy size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Recognized for</p>
                                    <p className="text-sm font-black text-slate-800">Academic Excellence</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- STATS SECTION --- */}
            <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20 mb-20">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <div className="flex flex-col items-center justify-center p-4">
                        <Users size={32} className="text-indigo-500 mb-3" />
                        <h3 className="text-4xl font-black text-slate-800 mb-1">500+</h3>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Enrolled Students</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4">
                        <BookOpen size={32} className="text-indigo-500 mb-3" />
                        <h3 className="text-4xl font-black text-slate-800 mb-1">100%</h3>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pass Rate</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4">
                        <GraduationCap size={32} className="text-indigo-500 mb-3" />
                        <h3 className="text-4xl font-black text-slate-800 mb-1">50+</h3>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Expert Teachers</p>
                    </div>
                </div>
            </div>

            {/* --- WHY CHOOSE US --- */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tight mb-4">Why Choose God's Grace?</h2>
                    <div className="w-24 h-1.5 bg-yellow-400 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        { title: "Modern Facilities", desc: "State-of-the-art laboratories, ICT centers, and an expansive E-Library for all students." },
                        { title: "AI-Powered Learning", desc: "We utilize advanced AI ERP systems for mock exams, custom practice modes, and personalized learning." },
                        { title: "Moral Standards", desc: "Action Not Word. We instill strong moral values, discipline, and leadership skills in our pupils." }
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:shadow-lg transition-shadow">
                            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                                <CheckCircle size={28} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-3">{feature.title}</h3>
                            <p className="text-slate-600 font-medium leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- FOOTER / CONTACT --- */}
            <div className="bg-slate-900 text-slate-300 py-16 px-6 mt-12 border-t-4 border-yellow-400">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-3">
                            <GraduationCap className="text-yellow-400" />
                            God's Grace Int'l School
                        </h2>
                        <p className="font-medium leading-relaxed max-w-sm mb-6">
                            Motto: Action Not Word. Providing the best foundation for your child's educational journey through technology and dedication.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 border-b border-slate-700 pb-2">Quick Links</h3>
                        <ul className="space-y-3 font-medium">
                            <li><a href="#" className="hover:text-yellow-400 transition-colors">Admissions Portal</a></li>
                            <li><a href="#" className="hover:text-yellow-400 transition-colors">Student Login</a></li>
                            <li><a href="#" className="hover:text-yellow-400 transition-colors">Staff Login</a></li>
                            <li><a href="#" className="hover:text-yellow-400 transition-colors">E-Library</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 border-b border-slate-700 pb-2">Contact Us</h3>
                        <ul className="space-y-4 font-medium">
                            <li className="flex items-start gap-3"><MapPin size={20} className="text-yellow-400 shrink-0" /> Ikorodu, Lagos, Nigeria</li>
                            <li className="flex items-center gap-3"><Phone size={20} className="text-yellow-400 shrink-0" /> +234 (0) 800 000 0000</li>
                            <li className="flex items-center gap-3"><Mail size={20} className="text-yellow-400 shrink-0" /> info@godsgrace.edu.ng</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-sm font-medium">
                    &copy; {new Date().getFullYear()} God's Grace Int'l School. Powered by Modern School ERP.
                </div>
            </div>

        </div>
    );
}