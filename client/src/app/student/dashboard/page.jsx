"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import { 
    BookOpen, Trophy, PlayCircle, CheckCircle, 
    ArrowRight, Clock, Star, Layout, Award 
} from 'lucide-react';

export default function StudentDashboard() {
    const [courses, setCourses] = useState([]);
    const [recentQuizzes, setRecentQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetching Enrolled Courses & Progress 
                const courseRes = await api.get('/student/my-courses');
                // Fetching Quiz Attempts 
                const quizRes = await api.get('/student/quiz-attempts');

                if (courseRes.data.success) {
                    setCourses(courseRes.data.data || []);
                }
                if (quizRes.data.success) {
                    setRecentQuizzes(quizRes.data.data || []);
                }
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
                setError("Unable to sync your progress. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[80vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-sky-500 mb-4"></div>
                <p className="text-gray-500 animate-pulse font-medium tracking-wide text-sm">LOADING YOUR ACADEMY...</p>
            </div>
        );
    }

    // Filtering Courses [cite: 99, 100]
    const runningCourses = courses.filter(c => (Number(c.progress) || 0) < 100 && c.status === 'Active');
    const completedCourses = courses.filter(c => Number(c.progress) === 100);
    const lastViewed = runningCourses[0]; // Quick Resume Logic 

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* 🌟 Welcome & Quick Resume Header  */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 space-y-2">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Welcome back! Here is a look at your current learning status.
                    </p>
                </div>
                
                {lastViewed && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="w-full lg:w-96"
                    >
                        <GlassCard className="bg-sky-500/10 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 p-4">
                            <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-2 flex items-center">
                                <Clock size={12} className="mr-1" /> Quick Resume
                            </p>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 line-clamp-1">{lastViewed.title}</h3>
                            <Link href={`/student/learning/${lastViewed.id}`}>
                                <button className="w-full py-2 bg-sky-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-sky-500/20 flex items-center justify-center group">
                                    Continue Quest <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </GlassCard>
                    </motion.div>
                )}
            </div>

            {/* 📊 Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Active Courses', val: runningCourses.length, icon: PlayCircle, color: 'text-sky-500', bg: 'bg-sky-500/10' },
                    { label: 'Certificates', val: completedCourses.length, icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Quizzes Taken', val: recentQuizzes.length, icon: Star, color: 'text-amber-500', bg: 'bg-amber-100/30' },
                    { label: 'Avg. Score', val: '85%', icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-100/30' }
                ].map((stat, i) => (
                    <GlassCard key={i} className="flex items-center p-4">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mr-4`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            <h4 className="text-xl font-black dark:text-white">{stat.val}</h4>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* 🏃‍♂️ Running Courses [cite: 87, 99, 100] */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center">
                        <PlayCircle className="mr-2 text-sky-500" /> Currently Learning
                    </h2>
                    <span className="text-xs font-bold text-gray-400">{runningCourses.length} Courses</span>
                </div>

                {runningCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {runningCourses.map((course, idx) => (
                            <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                                <GlassCard className="p-6 group hover:border-sky-400/50 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-bold dark:text-white line-clamp-1">{course.title}</h3>
                                        <div className="text-xs font-black text-sky-500">{course.progress}%</div>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden mb-6">
                                        <motion.div 
                                            initial={{ width: 0 }} animate={{ width: `${course.progress}%` }} 
                                            className="h-full bg-gradient-to-r from-sky-400 to-sky-600"
                                        />
                                    </div>
                                    <Link href={`/student/learning/${course.id}`}>
                                        <button className="flex items-center text-sm font-bold text-sky-600 dark:text-sky-400 hover:underline">
                                            Open Lesson <ArrowRight size={14} className="ml-1" />
                                        </button>
                                    </Link>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl text-center text-gray-400 font-medium">
                        No active quests. Enroll in a course to begin!
                    </div>
                )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 🏆 Completed Courses  */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center">
                        <Award className="mr-2 text-emerald-500" /> Completed
                    </h2>
                    {completedCourses.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {completedCourses.map(course => (
                                <GlassCard key={course.id} className="p-5 border-emerald-500/20 bg-emerald-500/5">
                                    <div className="flex items-center mb-4">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg mr-3">
                                            <CheckCircle size={20} />
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{course.title}</h4>
                                    </div>
                                    <button className="w-full py-2.5 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                                        Download PDF Certificate [cite: 110]
                                    </button>
                                </GlassCard>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic text-sm">Finish a course to unlock certificates.</p>
                    )}
                </div>

                {/* 📝 Quiz History  */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center">
                        <Layout className="mr-2 text-amber-500" /> Recent Quizzes
                    </h2>
                    <div className="space-y-3">
                        {recentQuizzes.length > 0 ? recentQuizzes.map((quiz, idx) => (
                            <GlassCard key={idx} className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{quiz.course_title}</p>
                                    <p className="text-[10px] text-gray-500 font-medium">{new Date(quiz.date).toLocaleDateString()}</p>
                                </div>
                                <div className={`text-sm font-black ${quiz.score >= quiz.pass_mark ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {quiz.score}%
                                </div>
                            </GlassCard>
                        )) : (
                            <div className="text-center py-6 text-gray-400 text-xs italic bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl">
                                No quiz history available. [cite: 105]
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}