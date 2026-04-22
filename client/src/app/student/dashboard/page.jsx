"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import { 
    PlayCircle, Trophy, Award, Clock, ArrowRight, 
    CheckCircle, Layout, Star, Loader2, BookOpen 
} from 'lucide-react';

export default function StudentDashboard() {
    const [profileData, setProfileData] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // 🌟 তোমার বানানো দুটো API একসাথে কল করছি
            const [profileRes, coursesRes] = await Promise.all([
                api.get('/student/profile'),
                api.get('/student/my-courses')
            ]);

            if (profileRes.data.success) {
                setProfileData(profileRes.data.data);
            }
            if (coursesRes.data.success) {
                setCourses(coursesRes.data.data);
            }
        } catch (error) {
            console.error("Dashboard Fetch Error:", error);
            toast.error("Failed to load dashboard data. Please refresh.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[80vh]">
                <Loader2 className="animate-spin text-sky-500 mb-4" size={40} />
                <p className="text-gray-500 font-bold animate-pulse">Loading Your Academy...</p>
            </div>
        );
    }

    // 🌟 ডাটা ফিল্টারিং লজিক
    const runningCourses = courses.filter(c => Number(c.progress_percentage) < 100);
    const completedCourses = courses.filter(c => Number(c.progress_percentage) === 100);
    const lastViewed = runningCourses[0]; // Quick Resume এর জন্য
    
    // প্রোফাইল স্ট্যাটস
    const stats = profileData?.statistics || { total_enrolled: 0, quizzes_passed: 0, average_score: 0 };
    const recentQuizzes = profileData?.recent_activity || [];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* 🌟 Welcome & Quick Resume Header */}
            <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
                <div className="flex-1 space-y-2">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        Welcome back, <span className="text-sky-500">{profileData?.profile?.full_name?.split(' ')[0]}!</span> 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Ready to continue your learning journey? Here is your progress.
                    </p>
                </div>
                
                {lastViewed && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="w-full lg:w-96"
                    >
                        <GlassCard className="bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 p-5 shadow-lg shadow-sky-500/10">
                            <p className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-2 flex items-center">
                                <Clock size={12} className="mr-1" /> Quick Resume
                            </p>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 line-clamp-1">{lastViewed.title}</h3>
                            <Link href={`/student/learning/${lastViewed.id}`}>
                                <button className="w-full py-2.5 bg-sky-500 text-white text-sm font-black rounded-xl shadow-md hover:bg-sky-600 transition-all flex items-center justify-center group">
                                    Jump Back In <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </GlassCard>
                    </motion.div>
                )}
            </div>

            {/* 📊 Summary Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Courses', val: runningCourses.length, icon: PlayCircle, color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-500/10' },
                    { label: 'Total Enrolled', val: stats.total_enrolled, icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-500/10' },
                    { label: 'Quizzes Passed', val: stats.quizzes_passed, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/10' },
                    { label: 'Avg. Score', val: `${Number(stats.average_score || 0).toFixed(1)}%`, icon: Star, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/10' }
                ].map((stat, i) => (
                    <GlassCard key={i} className="flex items-center p-5 border-none shadow-md bg-white/60 dark:bg-gray-900/50 hover:-translate-y-1 transition-transform">
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} mr-4`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider">{stat.label}</p>
                            <h4 className="text-2xl font-black dark:text-white mt-1">{stat.val}</h4>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* 🏃‍♂️ Currently Learning */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center">
                        <PlayCircle className="mr-3 text-sky-500" /> Currently Learning
                    </h2>
                    <Link href="/student/courses" className="text-sm font-bold text-sky-500 hover:text-sky-600 flex items-center">
                        Browse More <ArrowRight size={14} className="ml-1" />
                    </Link>
                </div>

                {runningCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {runningCourses.map((course, idx) => (
                            <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                                <GlassCard className="p-6 group hover:border-sky-400/50 transition-all bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl">
                                    <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-2">{course.category}</p>
                                    <h3 className="text-lg font-bold dark:text-white line-clamp-1 mb-4">{course.title}</h3>
                                    
                                    <div className="flex justify-between text-xs font-black text-gray-500 mb-2">
                                        <span>Progress</span>
                                        <span className="text-sky-500">{Number(course.progress_percentage).toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden mb-6">
                                        <motion.div 
                                            initial={{ width: 0 }} animate={{ width: `${course.progress_percentage}%` }} 
                                            className="h-full bg-gradient-to-r from-sky-400 to-sky-600"
                                        />
                                    </div>

                                    <Link href={`/student/learning/${course.id}`}>
                                        <button className="w-full py-2.5 bg-gray-50 hover:bg-sky-50 dark:bg-gray-800 dark:hover:bg-sky-900/30 text-sky-600 font-bold rounded-xl transition-all text-sm flex justify-center items-center">
                                            Continue Lesson <PlayCircle size={16} className="ml-2" />
                                        </button>
                                    </Link>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl text-center flex flex-col items-center">
                        <BookOpen size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
                        <h3 className="text-xl font-bold dark:text-white mb-2">No Active Courses</h3>
                        <p className="text-gray-500 font-medium mb-6">You haven't started any courses yet.</p>
                        <Link href="/student/courses" className="px-6 py-3 bg-sky-500 text-white font-bold rounded-xl shadow-lg hover:bg-sky-600 transition-all">Explore Courses</Link>
                    </div>
                )}
            </section>

            {/* 🏆 Completed & Quizzes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Certificates / Completed */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center">
                        <Award className="mr-3 text-emerald-500" /> Completed Courses
                    </h2>
                    {completedCourses.length > 0 ? (
                        <div className="space-y-4">
                            {completedCourses.map(course => (
                                <GlassCard key={course.id} className="p-5 border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400 rounded-xl mr-4 shrink-0">
                                            <CheckCircle size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest">{course.category}</p>
                                            <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1 text-sm md:text-base">{course.title}</h4>
                                        </div>
                                    </div>
                                    <Link href="/student/certificate" className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-all text-center whitespace-nowrap">
                                        View Certificate
                                    </Link>
                                </GlassCard>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-center text-gray-500 text-sm font-medium">
                            Complete a course to unlock your certificates.
                        </div>
                    )}
                </div>

                {/* Recent Quizzes */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center">
                        <Layout className="mr-3 text-amber-500" /> Recent Quiz Activity
                    </h2>
                    <div className="space-y-4">
                        {recentQuizzes.length > 0 ? recentQuizzes.map((quiz, idx) => (
                            <GlassCard key={idx} className="p-5 flex items-center justify-between bg-white dark:bg-gray-900 hover:shadow-md transition-all">
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{quiz.quiz_name}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-1 flex items-center">
                                        <Clock size={12} className="mr-1" /> {new Date(quiz.attempt_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xl font-black ${quiz.is_passed ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {Number(quiz.score).toFixed(0)}%
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${quiz.is_passed ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {quiz.is_passed ? 'Passed' : 'Failed'}
                                    </span>
                                </div>
                            </GlassCard>
                        )) : (
                            <div className="p-10 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-center text-gray-500 text-sm font-medium">
                                No quiz history available yet.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}