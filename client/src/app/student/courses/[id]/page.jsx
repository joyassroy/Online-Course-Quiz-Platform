"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { BookOpen, Clock, Star, PlayCircle, Lock, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseDetail() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]); // 🌟 রিয়েল লেসন স্টেট
    const [isEnrolled, setIsEnrolled] = useState(false); // 🌟 এনরোলমেন্ট চেক
    const [loading, setLoading] = useState(true);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (courseId) {
            fetchCourseAndLessons();
        }
    }, [courseId]);

    const fetchCourseAndLessons = async () => {
        try {
            setLoading(true);
            // ১. কোর্স ডিটেইলস এবং এনরোলমেন্ট স্ট্যাটাস আনা
            const courseRes = await api.get(`/student/courses/${courseId}`);
            if (courseRes.data.success) {
                setCourse(courseRes.data.data);
                setIsEnrolled(courseRes.data.isEnrolled); // ব্যাকএন্ড থেকে এই ফ্ল্যাগটি পাঠাতে হবে
            }

            // ২. লেসন লিস্ট আনা
            const lessonRes = await api.get(`/student/courses/${courseId}/lessons`);
            if (lessonRes.data.success) {
                setLessons(lessonRes.data.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load course details.");
        } finally {
            setLoading(false);
        }
    };

    const handleEnrollment = async () => {
        setEnrollLoading(true);
        try {
            const response = await api.post('/student/enroll', { course_id: course.id });
            
            if (response.data.success) {
                // কোর্স ফ্রি হলে সরাসরি সাকসেস এনিমেশন দেখাবে
                if (course.price === 0 || course.price === "0" || !course.price) {
                    setIsSuccess(true);
                    setIsEnrolled(true); // লোকালি স্টেট আপডেট করে লেসন আনলক করা
                    setTimeout(() => router.push('/student/dashboard'), 2500);
                } else {
                    toast.success("Enrollment requested! Wait for Admin approval.");
                    router.push('/student/dashboard');
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Enrollment failed.");
        } finally {
            setEnrollLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh]">
                <Loader2 className="animate-spin text-sky-500 mb-4" size={40} />
                <p className="text-gray-500 font-bold animate-pulse tracking-widest">LOADING COURSE...</p>
            </div>
        );
    }

    if (!course) return <div className="text-center py-20 text-gray-500">Course not found.</div>;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
            
            {/* 🌟 Success Animation Overlay */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                        <motion.div initial={{ scale: 0.5, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-3xl flex flex-col items-center shadow-2xl text-center max-w-sm w-full">
                            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle size={56} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Success!</h2>
                            <p className="text-gray-600 dark:text-gray-300">You are now enrolled in <br/> <span className="font-bold text-sky-500">{course.title}</span></p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-300 ${isSuccess ? 'blur-sm grayscale-[30%]' : ''}`}>
                
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-gray-800/60 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700/50">
                        <div className="text-sm font-bold tracking-wide uppercase text-sky-500 mb-2">{course.category}</div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">{course.title}</h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">{course.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-6">
                            <div className="flex items-center"><Star className="h-5 w-5 text-amber-400 mr-2 fill-current" /> <span className="font-bold">4.8 Rating</span></div>
                            <div className="flex items-center"><Clock className="h-5 w-5 mr-2 text-sky-500" /> <span>{lessons.length} Lessons</span></div>
                        </div>
                    </div>

                    {/* 📚 Dynamic Lesson List */}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Course Curriculum</h3>
                        <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                            {lessons.length > 0 ? lessons.map((lesson, idx) => {
                                // 🌟 Lock Logic: এনরোলড থাকলে সব আনলক, নাহলে শুধু প্রিভিউ লেসন আনলক
                                const isLocked = !isEnrolled && !lesson.is_preview;

                                return (
                                    <div 
                                        key={lesson.id} 
                                        className={`p-5 flex items-center justify-between border-b last:border-0 border-gray-100 dark:border-gray-700/50 transition-colors ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-gray-700/30 cursor-pointer'}`}
                                        onClick={() => !isLocked && router.push(`/student/courses/${courseId}/lessons/${lesson.id}`)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-2 rounded-full ${isLocked ? 'bg-gray-100 text-gray-400' : 'bg-sky-100 text-sky-600'}`}>
                                                {isLocked ? <Lock size={20} /> : <PlayCircle size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{lesson.title}</p>
                                                <p className="text-xs text-gray-500">{lesson.duration || "10 mins"}</p>
                                            </div>
                                        </div>
                                        {lesson.is_preview && !isEnrolled && (
                                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase">Free Preview</span>
                                        )}
                                        {isEnrolled && <CheckCircle size={18} className="text-emerald-500" />}
                                    </div>
                                );
                            }) : (
                                <div className="p-10 text-center text-gray-400 font-medium">No lessons available for this course yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column (Enrollment Card) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <GlassCard className="p-1 dark:bg-gray-800/80">
                            <div className="bg-white dark:bg-gray-900 rounded-xl p-6">
                                <div className="h-48 rounded-lg bg-slate-100 mb-6 overflow-hidden">
                                    {course.thumbnail_url ? (
                                        <img src={course.thumbnail_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-12 w-12 text-sky-200" /></div>
                                    )}
                                </div>
                                <div className="text-3xl font-black text-gray-900 dark:text-white mb-6 text-center">
                                    {course.price > 0 ? `$${course.price}` : 'Free'}
                                </div>

                                {isEnrolled ? (
                                    <GlassButton onClick={() => router.push('/student/dashboard')} className="w-full py-4 bg-emerald-500 text-white">Go to Dashboard</GlassButton>
                                ) : (
                                    <GlassButton onClick={handleEnrollment} disabled={enrollLoading} className="w-full py-4 bg-sky-500 text-white">
                                        {enrollLoading ? <Loader2 className="animate-spin mr-2" /> : 'Enroll Now'}
                                    </GlassButton>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    );
}