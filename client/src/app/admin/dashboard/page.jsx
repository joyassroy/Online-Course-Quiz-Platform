"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import { 
    Users, BookOpen, CreditCard, Layout, 
    Bell, UserPlus, FileUp, ArrowRight, Activity 
} from 'lucide-react';

export default function AdminDashboard() {
    const [data, setData] = useState({
        stats: { totalUsers: 0, totalCourses: 0, totalEnrollments: 0, totalQuizzes: 0 },
        pendingCount: 0,
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 🌟 আমাদের বানানো রিয়েল এপিআই কল করা হচ্ছে (একসাথে)
                const [usersRes, coursesRes] = await Promise.all([
                    api.get('/admin/users').catch(() => ({ data: { success: false, data: [] } })),
                    api.get('/admin/courses').catch(() => ({ data: { success: false, data: [] } }))
                ]);

                const users = usersRes.data?.success ? usersRes.data.data : [];
                const courses = coursesRes.data?.success ? coursesRes.data.data : [];

                // 📊 ডেটা ক্যালকুলেশন
                const pendingUsersCount = users.filter(u => u.status === 'Pending').length;
                const pendingCoursesCount = courses.filter(c => c.status === 'Pending').length;

                // 📝 রিসেন্ট অ্যাক্টিভিটি (সর্বশেষ ৫ জন ইউজার)
                const recentLogs = users
                    .slice(-5) // শেষের ৫টা নিচ্ছি
                    .reverse() // নতুনটা আগে দেখানোর জন্য
                    .map(u => ({
                        type: 'User Registration',
                        message: 'New student joined the platform',
                        user_name: u.full_name,
                        created_at: u.created_at || new Date().toISOString()
                    }));

                // 🌟 স্টেটে রিয়েল ডেটা সেট করা
                setData({
                    stats: {
                        totalUsers: users.length,
                        totalCourses: courses.length,
                        totalEnrollments: 0, // (এটার এপিআই বানালে পরে যোগ করবো)
                        totalQuizzes: 0, // (এটার এপিআই বানালে পরে যোগ করবো)
                    },
                    pendingCount: pendingUsersCount + pendingCoursesCount,
                    recentActivity: recentLogs
                });

            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mb-4"></div>
            <p className="text-gray-500 animate-pulse text-sm font-bold uppercase tracking-widest">Loading Analytics...</p>
        </div>
    );

    const statsCards = [
        { label: 'Total Users', value: data.stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
        { label: 'Total Courses', value: data.stats.totalCourses, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10' },
        { label: 'Total Enrollments', value: data.stats.totalEnrollments, icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
        { label: 'Quiz Attempts', value: data.stats.totalQuizzes, icon: Layout, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
    ];

    return (
        <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
            
            {/* 🌟 1. Summary Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((card, idx) => (
                    <motion.div 
                        key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                    >
                        <GlassCard className="p-6 border-none shadow-sm flex items-center justify-between hover:scale-[1.02] transition-transform">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{card.label}</p>
                                <h3 className="text-3xl font-black dark:text-white">{card.value}</h3>
                            </div>
                            <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
                                <card.icon size={28} />
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* 🌟 2. Pending Approvals Highlight (Quick Access) */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="relative group"
            >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-[1.3rem] blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <GlassCard className="relative p-1 bg-white dark:bg-gray-950">
                    <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full animate-pulse">
                                <Bell size={24} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black dark:text-white">Pending Approvals</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    You have <span className="text-amber-500 font-bold underline decoration-amber-500/30 underline-offset-4">{data.pendingCount}</span> requests waiting for your verification.
                                </p>
                            </div>
                        </div>
                        <Link href="/admin/users?status=Pending">
                            <button className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center group">
                                Review Approvals <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </GlassCard>
            </motion.div>

            {/* 🌟 3. Recent Activity Log */}
            <div className="grid grid-cols-1 gap-8">
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <h3 className="text-xl font-black dark:text-white flex items-center">
                            <Activity className="mr-2 text-sky-500" /> Recent Activity Log
                        </h3>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Latest Updates</span>
                    </div>

                    <div className="space-y-4">
                        {data.recentActivity.length > 0 ? data.recentActivity.map((activity, idx) => (
                            <div 
                                key={idx} 
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-sky-300/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                                        <UserPlus size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                            {activity.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                            <span className="text-sky-500">@{activity.user_name}</span>
                                            <span>•</span>
                                            <span>{new Date(activity.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 sm:mt-0">
                                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-500 text-white">
                                        Registration
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20">
                                <p className="text-gray-400 italic text-sm">No recent activity detected in the system.</p>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}