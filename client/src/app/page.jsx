"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-slate-50 dark:bg-gray-950 transition-colors duration-300">
            
            {/* 🌟 Hero Content */}
            <main className="z-10 max-w-4xl w-full text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                        Study<span className="text-sky-500">Anime</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 font-medium max-w-2xl mx-auto">
                        Elevate your learning experience. Dive into interactive courses and challenge yourself with our automated quiz battles.
                    </p>
                </motion.div>

                {/* 🌟 Feature Card (Glassmorphism) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <GlassCard className="flex flex-col items-center text-center dark:bg-gray-800/40">
                        <div className="w-12 h-12 bg-sky-200/50 dark:bg-sky-900/50 rounded-full flex items-center justify-center mb-4 text-2xl">
                            🎓
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Interactive Courses</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Track your progress and master new skills through structured video lessons.
                        </p>
                    </GlassCard>

                    <GlassCard className="flex flex-col items-center text-center dark:bg-gray-800/40">
                        <div className="w-12 h-12 bg-pink-200/50 dark:bg-pink-900/50 rounded-full flex items-center justify-center mb-4 text-2xl">
                            ⚔️
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Quiz Battles</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Participate in auto-graded quizzes and secure your spot on the leaderboard.
                        </p>
                    </GlassCard>
                </div>

                {/* 🌟 Call to Action Buttons */}
                <motion.div 
                    className="flex flex-wrap items-center justify-center gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <Link href="/login">
                        <GlassButton className="bg-sky-500/20 text-sky-900 dark:text-sky-300 border-sky-300/50 py-3 px-10 text-lg">
                            Get Started
                        </GlassButton>
                    </Link>
                    
                    <Link href="/register">
                        <button className="px-8 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                            Create Account
                        </button>
                    </Link>
                </motion.div>
            </main>

            {/* 🌟 Decorative Elements (Anime Vibes) */}
            <div className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-300/20 dark:bg-blue-600/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-amber-200/20 dark:bg-purple-600/20 rounded-full blur-3xl"></div>
        </div>
    );
}