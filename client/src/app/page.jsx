"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Sword, ArrowRight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';

export default function LandingPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    return (
        <div className="relative min-h-[calc(100vh-80px)] flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 font-sans text-slate-900 dark:text-slate-50">
            
            {/* 🌟 Animated Background Blobs */}
            <div className="absolute top-0 -left-40 w-96 h-96 bg-sky-300/30 dark:bg-sky-600/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-40 w-96 h-96 bg-purple-300/30 dark:bg-purple-600/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-300/30 dark:bg-pink-600/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-4000"></div>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full max-w-5xl mx-auto text-center py-20">
                
                <motion.div
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100/80 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-700 dark:text-sky-300 text-sm font-bold mb-8 shadow-sm">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                        </span>
                        Next-Gen Learning Platform
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-8xl font-black mb-6 tracking-tight leading-[1.1]">
                        Level Up Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500">
                            Knowledge Base
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 font-medium max-w-2xl mx-auto leading-relaxed">
                        Elevate your learning experience. Dive into interactive courses, challenge yourself with automated quiz battles, and earn your certificates.
                    </p>
                </motion.div>

                {/* 🌟 Call to Action Buttons */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 w-full px-4"
                >
                    {isLoggedIn ? (
                        <Link href="/student/dashboard" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center group">
                                Go to My Dashboard <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    ) : (
                        <Link href="/register" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 dark:bg-sky-500 text-white font-black text-lg hover:bg-slate-800 dark:hover:bg-sky-600 transition-all shadow-xl shadow-slate-900/20 dark:shadow-sky-500/25 flex items-center justify-center group">
                                Start Learning Free <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    )}
                    
                    <Link href="/student/courses" className="w-full sm:w-auto">
                        <GlassButton className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all text-lg shadow-sm">
                            Explore Courses
                        </GlassButton>
                    </Link>
                </motion.div>

                {/* 🌟 Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <GlassCard className="p-8 flex flex-col text-left bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 hover:-translate-y-2 transition-transform duration-300 shadow-sm h-full">
                            <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-sky-500/30">
                                <BookOpen className="text-white" size={28} />
                            </div>
                            <h3 className="text-2xl font-black mb-3">Interactive Curriculum</h3>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                Track your progress and master new skills through structured, high-quality video lessons.
                            </p>
                        </GlassCard>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <GlassCard className="p-8 flex flex-col text-left bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 hover:-translate-y-2 transition-transform duration-300 shadow-sm h-full">
                            <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
                                <Sword className="text-white" size={28} />
                            </div>
                            <h3 className="text-2xl font-black mb-3">Quiz Battles</h3>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                Participate in auto-graded quizzes, earn your certificates, and secure your spot on the leaderboard.
                            </p>
                        </GlassCard>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}