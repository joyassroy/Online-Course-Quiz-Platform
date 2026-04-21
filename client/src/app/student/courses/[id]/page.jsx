"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { BookOpen, Clock, Star, PlayCircle, Lock, CheckCircle } from 'lucide-react';

export default function CourseDetail() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false); // 🌟 নতুন সাকসেস স্টেট

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        try {
            const response = await api.get('/student/courses');
            if (response.data.success) {
                const foundCourse = response.data.data.find(c => c.id.toString() === courseId);
                setCourse(foundCourse);
            }
        } catch (error) {
            console.error("Error fetching course details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnrollment = async () => {
    setEnrollLoading(true);
    try {
        const response = await api.post('/student/enroll', { course_id: course.id });
        
        if (response.data.success) {
            setEnrollLoading(false);
            
            // 🌟 আর্কিটেক্ট লজিক: কোর্সটি ফ্রি নাকি পেইড?
            if (course.price === 0 || course.price === "0" || !course.price) {
                // Free Course: Direct Access 
                setIsSuccess(true);
                setTimeout(() => router.push('/student/dashboard'), 2000);
            } else {
                // Paid Course: Wait for Admin Approval 
                alert("Enrollment requested! Since this is a paid course, please wait for Admin approval.");
                router.push('/student/dashboard');
            }
        }
    } catch (error) {
        alert(error.response?.data?.message || "Already enrolled or error occurred.");
        setEnrollLoading(false);
    }
};

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    if (!course) {
        return <div className="text-center py-20 text-gray-500 dark:text-gray-400">Course not found.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
            
            {/* 🌟 Success Animation Overlay */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
                            className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-3xl flex flex-col items-center shadow-2xl text-center max-w-sm w-full border border-gray-100 dark:border-gray-700"
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                                className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-inner"
                            >
                                <CheckCircle size={56} strokeWidth={2.5} />
                            </motion.div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Awesome!</h2>
                            <p className="text-gray-600 dark:text-gray-300 font-medium">
                                You have successfully enrolled in <br/>
                                <span className="text-sky-500 dark:text-sky-400">{course.title}</span>
                            </p>
                            <div className="mt-8 flex space-x-2">
                                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🌟 Main Content (Blur effect applied when success modal is open) */}
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-300 ${isSuccess ? 'blur-sm grayscale-[30%]' : ''}`}>
                
                {/* Left Column: Course Info & Lesson List */}
                <div className="lg:col-span-2 space-y-8">
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800/60 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700/50"
                    >
                        <div className="text-sm font-bold tracking-wide uppercase text-sky-500 mb-4">
                            {course.category}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                            {course.title}
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                            {course.description || "Dive deep into this comprehensive course and master the skills required for modern development."}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-6">
                            <div className="flex items-center">
                                <Star className="h-5 w-5 text-amber-400 mr-2 fill-current" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">4.8 (120 Ratings)</span>
                            </div>
                            <div className="flex items-center">
                                <Clock className="h-5 w-5 mr-2 text-sky-500" />
                                <span>Self-paced</span>
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2 text-emerald-500" />
                                <span>Certificate of Completion</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Course Curriculum</h3>
                        <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden shadow-sm">
                            {[1, 2, 3, 4].map((lesson, idx) => (
                                <div key={idx} className={`p-5 flex items-center justify-between ${idx !== 0 ? 'border-t border-gray-100 dark:border-gray-700/50' : ''} hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors`}>
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-sky-100 dark:bg-sky-900/30 p-2 rounded-full text-sky-600 dark:text-sky-400">
                                            <PlayCircle size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Lesson {lesson}: Introduction Module</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">15 mins video</p>
                                        </div>
                                    </div>
                                    <div>
                                        {idx === 0 ? (
                                            <span className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full">
                                                Preview
                                            </span>
                                        ) : (
                                            <Lock size={18} className="text-gray-400 dark:text-gray-500" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Enrollment Card */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <GlassCard className="p-1 dark:bg-gray-800/80">
                            <div className="bg-white dark:bg-gray-900 rounded-xl p-6">
                                <div className="h-48 rounded-lg bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-900/40 dark:to-indigo-900/40 flex items-center justify-center mb-6">
                                    {course.thumbnail_url ? (
                                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <BookOpen className="h-16 w-16 text-sky-400/50 dark:text-sky-500/30" />
                                    )}
                                </div>

                                <div className="text-3xl font-black text-gray-900 dark:text-white mb-6 text-center">
                                    {course.price > 0 ? `$${course.price}` : 'Free'}
                                </div>

                                <GlassButton 
                                    onClick={handleEnrollment}
                                    disabled={enrollLoading || isSuccess}
                                    className={`w-full py-4 text-lg bg-sky-500 text-white border-sky-400 hover:border-sky-300 shadow-lg shadow-sky-500/30 flex justify-center items-center ${(enrollLoading || isSuccess) ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {enrollLoading ? (
                                        <span className="flex items-center"><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div> Enrolling...</span>
                                    ) : (
                                        'Enroll Now'
                                    )}
                                </GlassButton>

                                <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                    Full lifetime access • Access on mobile and TV
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>

            </div>
        </div>
    );
}