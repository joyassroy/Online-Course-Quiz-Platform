"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';
import toast from 'react-hot-toast'; // 🌟 Toast ইমপোর্ট করা হলো
import GlassCard from '@/components/ui/GlassCard';
import { 
    BookOpen, Search, CheckCircle, XCircle, 
    EyeOff, Trash2, UploadCloud, AlertTriangle
} from 'lucide-react';

export default function CourseOversight() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // 🌟 Custom Confirmation Modal State
    const [confirmDialog, setConfirmDialog] = useState({ 
        isOpen: false, 
        title: '', 
        message: '', 
        action: null, 
        confirmText: 'Confirm', 
        colorClass: 'bg-sky-500 hover:bg-sky-600',
        iconColor: 'text-sky-500 bg-sky-100 dark:bg-sky-500/20'
    });

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
            toast.error("Failed to fetch courses."); // 🌟 Toast Error
            console.error("Fetch courses error:", error);
        } finally {
            setLoading(false);
        }
    };

    // 🌟 Actual Status Update Function
    const executeStatusUpdate = async (id, newStatus) => {
        const toastId = toast.loading(`Moving course to ${newStatus}...`);
        try {
            const response = await api.put(`/admin/courses/${id}/status`, { status: newStatus });
            if (response.data.success) {
                setCourses(courses.map(c => c.id === id ? { ...c, status: newStatus } : c));
                toast.success(`Course successfully moved to ${newStatus}`, { id: toastId });
            }
        } catch (error) {
            toast.error("Failed to update status.", { id: toastId });
        } finally {
            setConfirmDialog({ ...confirmDialog, isOpen: false }); // Close modal
        }
    };

    // 🌟 Actual Delete Function
    const executeDeleteCourse = async (id) => {
        const toastId = toast.loading("Deleting course...");
        try {
            const response = await api.delete(`/admin/courses/${id}`);
            if (response.data.success) {
                setCourses(courses.filter(c => c.id !== id));
                toast.success("Course deleted successfully.", { id: toastId });
            }
        } catch (error) {
            toast.error("Failed to delete. It might have connected lessons.", { id: toastId });
        } finally {
            setConfirmDialog({ ...confirmDialog, isOpen: false }); // Close modal
        }
    };

    // 🌟 Trigger Confirmation Modal for Status Update
    const handleStatusUpdateClick = (id, newStatus, courseTitle) => {
        let title, confirmText, colorClass, iconColor;

        if (newStatus === 'Published') {
            title = 'Publish Course?'; confirmText = 'Yes, Publish'; 
            colorClass = 'bg-emerald-500 hover:bg-emerald-600'; iconColor = 'text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20';
        } else if (newStatus === 'Draft') {
            title = 'Reject/Unpublish Course?'; confirmText = 'Yes, Move to Draft'; 
            colorClass = 'bg-orange-500 hover:bg-orange-600'; iconColor = 'text-orange-500 bg-orange-100 dark:bg-orange-500/20';
        }

        setConfirmDialog({
            isOpen: true, title,
            message: `Are you sure you want to change the status of "${courseTitle}" to ${newStatus}?`,
            action: () => executeStatusUpdate(id, newStatus),
            confirmText, colorClass, iconColor
        });
    };

    // 🌟 Trigger Confirmation Modal for Deletion
    const handleDeleteClick = (id, courseTitle) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Course Permanently?',
            message: `WARNING: Are you sure you want to completely DELETE "${courseTitle}"? This action cannot be undone and will remove all associated content!`,
            action: () => executeDeleteCourse(id),
            confirmText: 'Yes, Delete Permanently',
            colorClass: 'bg-red-500 hover:bg-red-600',
            iconColor: 'text-red-500 bg-red-100 dark:bg-red-500/20'
        });
    };

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
                    <h1 className="text-2xl md:text-3xl font-black dark:text-white flex items-center tracking-tight">
                        <BookOpen className="mr-3 text-sky-500 shrink-0" size={32} /> Course Oversight
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Approve, reject, or unpublish courses submitted by instructors.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full xl:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" placeholder="Search by title..."
                            className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-sky-500 w-full md:w-64 text-sm transition-all"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select 
                        className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 outline-none cursor-pointer"
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
                
                {/* 📱 Mobile View (Card Layout) */}
                <div className="md:hidden flex flex-col p-4 gap-4">
                    {loading ? (
                        <div className="text-center p-8 text-sky-500 font-bold animate-pulse">Loading Courses...</div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="text-center p-8 text-gray-500 italic border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">No courses found.</div>
                    ) : (
                        filteredCourses.map(course => (
                            <div key={course.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm relative">
                                <div className="mb-3 pr-20">
                                    <p className="font-bold text-gray-900 dark:text-white text-base leading-snug">{course.title}</p>
                                    <p className="text-xs text-sky-500 font-bold mt-1 uppercase tracking-wider">{course.category}</p>
                                    <p className="font-medium text-xs text-gray-500 mt-1">By {course.instructor_name}</p>
                                </div>
                                
                                <span className={`absolute top-4 right-4 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                    course.status === 'Published' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                                    course.status === 'Pending Review' ? 'bg-amber-100 text-amber-600 animate-pulse dark:bg-amber-500/20 dark:text-amber-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                }`}>
                                    {course.status}
                                </span>

                                <div className="flex justify-between items-center text-sm border-t border-gray-50 dark:border-gray-700 pt-3">
                                    <div>
                                        <span className="font-black text-emerald-500 text-sm">${course.price}</span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest ml-2">{course.difficulty}</span>
                                    </div>
                                    
                                    {/* Action Buttons for Mobile */}
                                    <div className="flex gap-1.5">
                                        {course.status === 'Pending Review' && (
                                            <>
                                                <button onClick={() => handleStatusUpdateClick(course.id, 'Published', course.title)} className="p-1.5 bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-md hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle size={16} /></button>
                                                <button onClick={() => handleStatusUpdateClick(course.id, 'Draft', course.title)} className="p-1.5 bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 rounded-md hover:bg-red-500 hover:text-white transition-all"><XCircle size={16} /></button>
                                            </>
                                        )}
                                        {course.status === 'Published' && (
                                            <button onClick={() => handleStatusUpdateClick(course.id, 'Draft', course.title)} className="p-1.5 bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400 rounded-md hover:bg-orange-500 hover:text-white transition-all"><EyeOff size={16} /></button>
                                        )}
                                        {course.status === 'Draft' && (
                                            <button onClick={() => handleStatusUpdateClick(course.id, 'Published', course.title)} className="p-1.5 bg-sky-50 text-sky-500 dark:bg-sky-500/10 dark:text-sky-400 rounded-md hover:bg-sky-500 hover:text-white transition-all"><UploadCloud size={16} /></button>
                                        )}
                                        <button onClick={() => handleDeleteClick(course.id, course.title)} className="p-1.5 bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 rounded-md hover:bg-red-500 hover:text-white transition-all ml-1"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 💻 Desktop View (Table) */}
                <div className="hidden md:block overflow-x-auto min-h-[400px]">
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
                                <tr><td colSpan="5" className="p-10 text-center animate-pulse text-sky-500 font-bold">Loading Courses...</td></tr>
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
                                                course.status === 'Published' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                                                course.status === 'Pending Review' ? 'bg-amber-100 text-amber-600 animate-pulse dark:bg-amber-500/20 dark:text-amber-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                            }`}>
                                                {course.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                {course.status === 'Pending Review' && (
                                                    <>
                                                        <button onClick={() => handleStatusUpdateClick(course.id, 'Published', course.title)} className="p-2 bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all" title="Approve & Publish"><CheckCircle size={16} /></button>
                                                        <button onClick={() => handleStatusUpdateClick(course.id, 'Draft', course.title)} className="p-2 bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all" title="Reject (Send to Draft)"><XCircle size={16} /></button>
                                                    </>
                                                )}
                                                {course.status === 'Published' && (
                                                    <button onClick={() => handleStatusUpdateClick(course.id, 'Draft', course.title)} className="p-2 bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400 rounded-lg hover:bg-orange-500 hover:text-white transition-all" title="Unpublish (Move to Draft)"><EyeOff size={16} /></button>
                                                )}
                                                {course.status === 'Draft' && (
                                                    <button onClick={() => handleStatusUpdateClick(course.id, 'Published', course.title)} className="p-2 bg-sky-50 text-sky-500 dark:bg-sky-500/10 dark:text-sky-400 rounded-lg hover:bg-sky-500 hover:text-white transition-all" title="Publish Course"><UploadCloud size={16} /></button>
                                                )}
                                                <button onClick={() => handleDeleteClick(course.id, course.title)} className="p-2 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded-lg hover:bg-red-500 hover:text-white transition-all ml-2" title="Delete Course"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* 🌟 Gorgeous Confirmation Modal */}
            <AnimatePresence>
                {confirmDialog.isOpen && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 md:p-8 text-center border border-gray-200 dark:border-gray-800"
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmDialog.iconColor}`}>
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{confirmDialog.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed line-clamp-3">
                                {confirmDialog.message}
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={confirmDialog.action} className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-colors ${confirmDialog.colorClass}`}>
                                    {confirmDialog.confirmText}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}