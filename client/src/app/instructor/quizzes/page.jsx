"use client";

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import { HelpCircle, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function QuizManagementGateway() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .get('/instructor/courses')
            .then(res => {
                if(res.data.success) setCourses(res.data.data);
            })
            .catch(() => {
                toast.error('Failed to load courses. Please try again.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
                <h1 className="text-3xl font-black dark:text-white flex items-center tracking-tight">
                    <HelpCircle className="mr-3 text-emerald-500" size={32} /> Select Course for Quiz
                </h1>
                <p className="text-gray-500 text-sm mt-1">Choose a course to create its final assessment quiz.</p>
            </div>

            {loading ? <div className="p-10 text-center animate-pulse font-bold text-gray-500">Loading courses...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <GlassCard key={course.id} className="overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col hover:border-emerald-500/50 transition-all">
                            <div className="p-5 flex-1">
                                <p className="text-[10px] text-emerald-500 font-black uppercase mb-1">{course.category}</p>
                                <h3 className="font-bold dark:text-white line-clamp-2">{course.title}</h3>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 border-t border-gray-100 dark:border-gray-800">
                                <Link href={`/instructor/quizzes/${course.id}/quiz`} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white font-bold rounded-lg transition-all">
                                    Manage Quiz Assessment <ArrowRight size={16} />
                                </Link>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
}