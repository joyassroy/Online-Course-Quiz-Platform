"use client";

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import { 
    BookOpen, Users, GraduationCap, LayoutDashboard, 
    CheckCircle, Clock, FileEdit, PlusCircle 
} from 'lucide-react';
import Link from 'next/link';

export default function InstructorDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/instructor/dashboard');
            if (response.data.success) {
                setDashboardData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-[80vh] font-bold text-sky-500 animate-pulse">Loading Creator Studio...</div>;
    }

    const { stats, courses } = dashboardData;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black dark:text-white flex items-center tracking-tight">
                        <LayoutDashboard className="mr-3 text-sky-500" size={32} /> Creator Studio
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your educational content and track student progress.</p>
                </div>
                <Link href="/instructor/courses/create" className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/30 transition-all flex items-center">
                    <PlusCircle className="mr-2" size={20} /> Create New Course
                </Link>
            </div>

            {/* 🌟 3 Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-6 border-l-4 border-l-sky-500 relative overflow-hidden group">
                    <BookOpen className="absolute -bottom-4 -right-4 text-sky-500/10 group-hover:scale-110 transition-transform" size={100} />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Total Courses</p>
                    <h2 className="text-4xl font-black dark:text-white mt-2">{stats.totalCourses}</h2>
                </GlassCard>

                <GlassCard className="p-6 border-l-4 border-l-indigo-500 relative overflow-hidden group">
                    <Users className="absolute -bottom-4 -right-4 text-indigo-500/10 group-hover:scale-110 transition-transform" size={100} />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Total Students</p>
                    <h2 className="text-4xl font-black dark:text-white mt-2">{stats.totalStudents}</h2>
                </GlassCard>

                <GlassCard className="p-6 border-l-4 border-l-emerald-500 relative overflow-hidden group">
                    <GraduationCap className="absolute -bottom-4 -right-4 text-emerald-500/10 group-hover:scale-110 transition-transform" size={100} />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Avg. Quiz Score</p>
                    <h2 className="text-4xl font-black dark:text-white mt-2">{stats.avgQuizScore}%</h2>
                </GlassCard>
            </div>

            {/* 🌟 My Courses Table */}
            <GlassCard className="overflow-hidden border-none shadow-xl bg-white/50 dark:bg-gray-900/50">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                    <h3 className="text-lg font-black dark:text-white flex items-center">
                        <BookOpen className="mr-2 text-sky-500" size={20} /> My Courses Overview
                    </h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-100/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Course Title</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Category</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Price</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                            {courses.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">You haven't created any courses yet.</td></tr>
                            ) : (
                                courses.map(course => (
                                    <tr key={course.id} className="hover:bg-white dark:hover:bg-gray-800/50 transition-all">
                                        <td className="p-4 font-bold dark:text-white">{course.title}</td>
                                        <td className="p-4 text-sm text-gray-500">{course.category}</td>
                                        <td className="p-4 text-sm font-bold text-emerald-500">${course.price}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center w-max ${
                                                course.status === 'Published' ? 'bg-emerald-100 text-emerald-600' : 
                                                course.status === 'Pending Review' ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                            }`}>
                                                {course.status === 'Published' && <CheckCircle size={12} className="mr-1" />}
                                                {course.status === 'Pending Review' && <Clock size={12} className="mr-1" />}
                                                {course.status === 'Draft' && <FileEdit size={12} className="mr-1" />}
                                                {course.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link href={`/instructor/courses/${course.id}/edit`} className="text-sky-500 hover:text-sky-600 font-bold text-sm bg-sky-50 dark:bg-sky-900/20 px-4 py-2 rounded-lg transition-all">
                                                Manage Content
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}