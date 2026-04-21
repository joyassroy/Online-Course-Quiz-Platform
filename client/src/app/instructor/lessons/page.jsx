"use client";

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import { PlayCircle, BookOpen, Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LessonManagementGateway() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            // আমরা আগের বানানো Course API টাই ব্যবহার করছি ডাটা আনার জন্য
            const response = await api.get('/instructor/courses');
            if (response.data.success) {
                setCourses(response.data.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black dark:text-white flex items-center tracking-tight">
                        <PlayCircle className="mr-3 text-sky-500" size={32} /> Select Course for Lessons
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Choose a course below to add, reorder, or manage its video lessons.</p>
                </div>
            </div>

            {/* Courses Grid */}
            {loading ? (
                <div className="text-center p-10 font-bold text-gray-500 animate-pulse flex flex-col items-center">
                    <Layers size={40} className="mb-4 text-sky-500" />
                    Loading your courses...
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center p-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                    <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold dark:text-white mb-2">No Courses Found</h3>
                    <p className="text-gray-500 mb-6">You need to create a course first before adding lessons.</p>
                    <Link href="/instructor/courses/create" className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-bold transition-all">Create Course</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <GlassCard key={course.id} className="overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col group hover:border-sky-500/50 transition-all">
                            
                            <div className="p-5 flex-1 flex gap-4">
                                {/* Thumbnail */}
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0">
                                    {course.thumbnail_url ? (
                                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300"><BookOpen size={24} /></div>
                                    )}
                                </div>
                                
                                {/* Info */}
                                <div>
                                    <p className="text-[10px] text-sky-500 font-black uppercase tracking-widest mb-1">{course.category}</p>
                                    <h3 className="text-md font-bold dark:text-white line-clamp-2 leading-tight">{course.title}</h3>
                                </div>
                            </div>

                            {/* Action Button - 🌟 ম্যাজিক লিংক */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 border-t border-gray-100 dark:border-gray-800">
                                <Link 
                                    href={`/instructor/lessons/${course.id}/lessons`} 
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-50 hover:bg-sky-500 text-sky-600 hover:text-white font-bold rounded-lg transition-all"
                                >
                                    <Layers size={18} />
                                    Manage Curriculum
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
}