"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import { 
    BookOpen, CheckCircle, XCircle, Eye, 
    Trash2, AlertCircle, Search, Filter 
} from 'lucide-react';

export default function CourseOversight() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            // ব্যাকএন্ড থেকে সব কোর্স নিয়ে আসা
            const response = await api.get('/admin/courses');
            if (response.data.success) {
                setCourses(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCourseStatus = async (courseId, status) => {
        if (!confirm(`Are you sure you want to ${status} this course?`)) return;
        
        try {
            const response = await api.patch(`/admin/courses/${courseId}/status`, { status });
            if (response.data.success) {
                setCourses(courses.map(c => c.id === courseId ? { ...c, status } : c));
            }
        } catch (error) {
            alert("Action failed. Check API connectivity.");
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             course.instructor_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'All' || course.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (loading) return <div className="p-10 text-center dark:text-white animate-pulse">Scanning Academic Catalog...</div>;

    return (
        <div className="p-6 space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-black dark:text-white flex items-center">
                    <BookOpen className="mr-2 text-sky-500" /> Course Oversight
                </h1>
                
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input 
                            type="text" placeholder="Search courses or instructors..." 
                            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500 w-full md:w-64 transition-all"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select 
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 outline-none"
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending Approval</option>
                        <option value="Active">Published</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Courses Table */}
            <GlassCard className="overflow-hidden border-none shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course Title</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Instructor</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            <AnimatePresence>
                                {filteredCourses.map((course) => (
                                    <motion.tr 
                                        key={course.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="hover:bg-sky-50/30 dark:hover:bg-sky-900/10 transition-colors"
                                    >
                                        <td className="p-4">
                                            <p className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{course.title}</p>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{course.instructor_name}</td>
                                        <td className="p-4">
                                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">
                                                {course.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-black dark:text-white">
                                            {course.price > 0 ? `$${course.price}` : 'Free'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                course.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                                                course.status === 'Pending' ? 'bg-amber-100 text-amber-600 animate-pulse' :
                                                'bg-red-100 text-red-600'
                                            }`}>
                                                {course.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {course.status === 'Pending' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleCourseStatus(course.id, 'Active')}
                                                            className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleCourseStatus(course.id, 'Rejected')}
                                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                )}
                                                <button className="p-2 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-all">
                                                    <Eye size={18} />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-red-500 transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}