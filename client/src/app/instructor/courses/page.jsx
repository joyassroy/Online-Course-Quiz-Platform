"use client";

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import {
    BookOpen, PlusCircle, FileEdit, Trash2,
    Send, Users, CheckCircle, Clock
} from 'lucide-react';
import Link from 'next/link';

export default function InstructorCourseManagement() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/instructor/courses');
            if (response.data.success) {
                setCourses(response.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // 🌟 Submit for Admin Review
    const handleSubmitForReview = async (id) => {
        if (!confirm("Submit this course for Admin review? Once submitted, you must wait for approval.")) return;
        try {
            const response = await api.put(`/instructor/courses/${id}/submit`);
            if (response.data.success) {
                setCourses(courses.map(c => c.id === id ? { ...c, status: 'Pending Review' } : c));
                alert("✅ Course submitted for review!");
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to submit course.");
        }
    };

    // 🌟 Delete Course
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this course? This action is permanent!")) return;
        try {
            const response = await api.delete(`/instructor/courses/${id}`);
            if (response.data.success) {
                setCourses(courses.filter(c => c.id !== id));
                alert("🗑️ Course deleted.");
            }
        } catch (error) {
            alert("❌ Failed to delete course. It might have enrolled students.");
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black dark:text-white flex items-center tracking-tight">
                        <BookOpen className="mr-3 text-sky-500" size={32} /> Course Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Create, edit, and manage your courses.</p>
                </div>
                <Link href="/instructor/courses/create" className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/30 transition-all flex items-center">
                    <PlusCircle className="mr-2" size={20} /> Create New Course
                </Link>
            </div>

            {/* Courses Grid */}
            {loading ? (
                <div className="text-center p-10 font-bold text-gray-500 animate-pulse">Loading Courses...</div>
            ) : courses.length === 0 ? (
                <div className="text-center p-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                    <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold dark:text-white mb-2">No Courses Yet</h3>
                    <p className="text-gray-500 mb-6">Start building your first course to share your knowledge.</p>
                    <Link href="/instructor/courses/create" className="px-6 py-2 bg-sky-500 text-white rounded-lg font-bold">Create Course</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <GlassCard key={course.id} className="overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col group">

                            {/* Course Image & Status */}
                            <div className="h-40 bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                                {course.thumbnail_url ? (
                                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400"><BookOpen size={40} /></div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center ${course.status === 'Published' ? 'bg-emerald-500 text-white' :
                                            course.status === 'Pending Review' ? 'bg-amber-500 text-white' : 'bg-gray-600 text-white'
                                        }`}>
                                        {course.status === 'Published' && <CheckCircle size={14} className="mr-1" />}
                                        {course.status === 'Pending Review' && <Clock size={14} className="mr-1" />}
                                        {course.status === 'Draft' && <FileEdit size={14} className="mr-1" />}
                                        {course.status}
                                    </span>
                                </div>
                            </div>

                            {/* Course Details */}
                            <div className="p-5 flex-1 flex flex-col">
                                <p className="text-xs text-sky-500 font-black uppercase tracking-widest mb-1">{course.category}</p>
                                <h3 className="text-lg font-bold dark:text-white line-clamp-2 mb-2">{course.title}</h3>
                                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/50">
                                    <span className="font-black text-emerald-500">{course.price > 0 ? `$${course.price}` : 'FREE'}</span>
                                    <span className="text-xs font-bold text-gray-500 uppercase">{course.difficulty}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-800 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">

                                {/* Edit / View Lessons Button */}
                                <Link href={`/instructor/courses/${course.id}/edit`} className="p-3 text-center text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all flex items-center justify-center">
                                    <FileEdit size={16} className="mr-2" /> Manage
                                </Link>

                                {/* Contextual Action Button */}
                                {course.status === 'Draft' ? (
                                    <button onClick={() => handleSubmitForReview(course.id)} className="p-3 text-center text-sm font-bold text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all flex items-center justify-center">
                                        <Send size={16} className="mr-2" /> Submit
                                    </button>
                                ) : course.status === 'Published' ? (
                                    <Link href={`/instructor/courses/${course.id}/students`} className="p-3 text-center text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center">
                                        <Users size={16} className="mr-2" /> Students
                                    </Link>
                                ) : (
                                    <button onClick={() => handleDelete(course.id)} className="p-3 text-center text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center">
                                        <Trash2 size={16} className="mr-2" /> Delete
                                    </button>
                                )}
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
}