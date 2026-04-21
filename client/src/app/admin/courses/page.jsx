"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import { 
    BookOpen, Search, CheckCircle, XCircle, 
    EyeOff, Trash2, RefreshCw, PlayCircle, UploadCloud 
} from 'lucide-react';

export default function CourseOversight() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/courses');
            if (response.data.success) {
                setCourses(response.data.data);
            }
        } catch (error) {
            console.error("Fetch courses error:", error);
        } finally {
            setLoading(false);
        }
    };

    // 🌟 Status Update Logic (Approve, Reject, Unpublish, Republish)
    const updateCourseStatus = async (id, newStatus) => {
        if (!confirm(`Are you sure you want to change course status to '${newStatus}'?`)) return;
        try {
            const response = await api.put(`/admin/courses/${id}/status`, { status: newStatus });
            if (response.data.success) {
                setCourses(courses.map(c => c.id === id ? { ...c, status: newStatus } : c));
                alert(`✅ Course moved to ${newStatus}`);
            }
        } catch (error) {
            alert("❌ Failed to update status.");
        }
    };

    // 🌟 Delete Course Logic
    const deleteCourse = async (id) => {
        if (!confirm("⚠️ WARNING: Are you sure you want to completely DELETE this course? This action cannot be undone!")) return;
        try {
            const response = await api.delete(`/admin/courses/${id}`);
            if (response.data.success) {
                setCourses(courses.filter(c => c.id !== id));
                alert("🗑️ Course deleted successfully.");
            }
        } catch (error) {
            alert("❌ Failed to delete course. It might have connected lessons or enrollments.");
        }
    };

    // 🌟 Filter Logic
    const filteredCourses = courses.filter(c => {
        const matchesSearch = (c.title || '').toLowerCase().includes(search.toLowerCase()) || 
                              (c.instructor_name || '').toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header & Filters */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black dark:text-white flex items-center tracking-tight">
                        <BookOpen className="mr-3 text-sky-500" size={32} /> Course Oversight
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Approve, reject, or unpublish courses submitted by instructors.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input 
                            type="text" placeholder="Search by title or instructor..."
                            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 w-full md:w-64 text-sm transition-all"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select 
                        className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 outline-none cursor-pointer"
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending Review">Pending Review</option>
                        <option value="Published">Published</option>
                        <option value="Draft">Draft (Rejected/Unpublished)</option>
                    </select>
                </div>
            </div>

            {/* Course Table */}
            <GlassCard className="overflow-hidden border-none shadow-xl bg-white/50 dark:bg-gray-900/50">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-gray-100/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Course Info</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Instructor</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Details</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-10 text-center animate-pulse text-gray-500 font-bold">Loading Courses...</td></tr>
                            ) : filteredCourses.length === 0 ? (
                                <tr><td colSpan="5" className="p-10 text-center text-gray-500 italic">No courses found.</td></tr>
                            ) : (
                                filteredCourses.map(course => (
                                    <tr key={course.id} className="hover:bg-white dark:hover:bg-gray-800/50 transition-all">
                                        <td className="p-4">
                                            <p className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{course.title}</p>
                                            <p className="text-xs text-sky-500 font-bold mt-1 uppercase tracking-wider">{course.category}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-sm text-gray-700 dark:text-gray-300">{course.instructor_name}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-xs font-bold text-gray-500">Price: <span className="text-emerald-500">${course.price}</span></p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{course.difficulty}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                course.status === 'Published' ? 'bg-emerald-100 text-emerald-600' : 
                                                course.status === 'Pending Review' ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                            }`}>
                                                {course.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                
                                                {/* 🟢 Pending Review Actions (Approve/Reject) */}
                                                {course.status === 'Pending Review' && (
                                                    <>
                                                        <button onClick={() => updateCourseStatus(course.id, 'Published')} className="p-2 bg-emerald-50 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all" title="Approve & Publish">
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button onClick={() => updateCourseStatus(course.id, 'Draft')} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all" title="Reject (Send to Draft)">
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}

                                                {/* 🟠 Published Actions (Unpublish) */}
                                                {course.status === 'Published' && (
                                                    <button onClick={() => updateCourseStatus(course.id, 'Draft')} className="p-2 bg-orange-50 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition-all" title="Unpublish (Move to Draft)">
                                                        <EyeOff size={16} />
                                                    </button>
                                                )}

                                                {/* 🔵 Draft Actions (Publish Again) - 🌟 NEW ADDITION */}
                                                {course.status === 'Draft' && (
                                                    <button onClick={() => updateCourseStatus(course.id, 'Published')} className="p-2 bg-sky-50 text-sky-500 rounded-lg hover:bg-sky-500 hover:text-white transition-all" title="Publish Course">
                                                        <UploadCloud size={16} />
                                                    </button>
                                                )}

                                                {/* 🔴 Delete Action (Available everywhere) */}
                                                <button onClick={() => deleteCourse(course.id)} className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-500 hover:text-white transition-all ml-2" title="Delete Course">
                                                    <Trash2 size={16} />
                                                </button>

                                            </div>
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