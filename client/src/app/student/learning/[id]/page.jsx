"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { 
    PlayCircle, CheckCircle, Video, ArrowLeft, Award, BookOpen, FileText, Download, Clock
} from 'lucide-react';
import Link from 'next/link';

export default function LearningArea() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchLearningData = async () => {
            try {
                // ১. কোর্সের বেসিক ডেটা ফেচ করা
                const courseResponse = await api.get('/student/courses');
                if (courseResponse.data.success) {
                    const foundCourse = courseResponse.data.data.find(c => c.id.toString() === courseId);
                    setCourse(foundCourse);
                }
                
                // ২. ব্যাকএন্ড থেকে এই কোর্সের রিয়েল লেসনগুলো আনা
                try {
                    const lessonsResponse = await api.get(`/student/courses/${courseId}/lessons`);
                    if (lessonsResponse.data.success && lessonsResponse.data.data.length > 0) {
                        setLessons(lessonsResponse.data.data);
                        setCurrentLesson(lessonsResponse.data.data[0]);
                    }
                } catch (err) {
                    console.warn("No lessons found or API not ready yet.");
                    setLessons([]);
                }

                // ৩. ইউজারের কমপ্লিট করা লেসন ফেচ করা (যদি API থাকে)
                try {
                    const progressResponse = await api.get(`/student/progress/${courseId}`);
                    if (progressResponse.data.success) {
                        setCompletedLessons(progressResponse.data.data.completed_lesson_ids || []);
                    }
                } catch (err) {
                    console.warn("No progress found.");
                }

            } catch (error) {
                console.error("Error fetching course data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLearningData();
    }, [courseId]);

    const handleMarkAsComplete = async () => {
        setActionLoading(true);
        try {
            const response = await api.post('/student/lesson/complete', { 
                course_id: course.id, 
                lesson_id: currentLesson.id 
            });
            
            if (response.data.success) {
                setCompletedLessons([...completedLessons, currentLesson.id]);
                
                const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
                if (currentIndex < lessons.length - 1) {
                    setCurrentLesson(lessons[currentIndex + 1]);
                }
            }
        } catch (error) {
            console.error("Error marking lesson complete:", error);
            alert("Failed to mark as complete.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[80vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    if (!course) {
        return <div className="text-center py-20 dark:text-white">Course not found or you are not enrolled.</div>;
    }

    const progressPercentage = lessons.length > 0 
        ? Math.round((completedLessons.length / lessons.length) * 100) 
        : 0;

    return (
        <div className="max-w-[1400px] mx-auto py-6 px-4 sm:px-6 lg:px-8 h-[calc(100vh-64px)] flex flex-col">
            
            {/* 🌟 Header Section */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Link href="/student/dashboard">
                        <button className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                            <ArrowLeft size={20} />
                        </button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white line-clamp-1">{course.title}</h1>
                </div>
                
                {lessons.length > 0 && (
                    <div className="hidden md:flex items-center space-x-3 w-64">
                        <span className="text-sm font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                            {progressPercentage}% Complete
                        </span>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-sky-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.5 }}
                            ></motion.div>
                        </div>
                    </div>
                )}
            </div>

            {/* 🌟 Main Content Area */}
            {lessons.length === 0 ? (
                // 🛑 Empty State (No Lessons Found)
                <div className="flex-1 flex items-center justify-center">
                    <GlassCard className="max-w-md w-full text-center p-10 dark:bg-gray-800/60 border-dashed border-2 border-gray-300 dark:border-gray-700">
                        <Clock size={64} className="mx-auto text-sky-400 mb-6 opacity-50" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Materials Coming Soon</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            The instructor is still preparing the content for this course. Please check back later!
                        </p>
                        <Link href="/student/dashboard">
                            <GlassButton className="w-full bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
                                Return to Dashboard
                            </GlassButton>
                        </Link>
                    </GlassCard>
                </div>
            ) : (
                // ✅ Normal Lesson View (If lessons exist)
                <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                    
                    {/* 🎬 Left Side: Lesson Content */}
                    <div className="flex-1 flex flex-col min-h-0 space-y-4 overflow-y-auto hide-scrollbar pb-10">
                        
                        {currentLesson?.video_url ? (
                            <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800 relative">
                                <iframe 
                                    width="100%" height="100%" 
                                    src={currentLesson.video_url} 
                                    title="Course Video" frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                    className="absolute top-0 left-0 w-full h-full"
                                ></iframe>
                            </div>
                        ) : (
                            <div className="w-full aspect-video bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm">
                                <FileText size={64} className="text-sky-300 dark:text-sky-700 mb-4" />
                                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Reading Material</h3>
                                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Please read the content and download attachments below.</p>
                            </div>
                        )}

                        <GlassCard className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 dark:bg-gray-800/60">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    {currentLesson?.title}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                    {currentLesson?.video_url ? <Video size={16} className="mr-2" /> : <FileText size={16} className="mr-2" />}
                                    {currentLesson?.video_url ? 'Video Lesson' : 'Reading Material'}
                                </p>
                            </div>
                            
                            <div className="w-full sm:w-auto">
                                {completedLessons.includes(currentLesson?.id) ? (
                                    <button disabled className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold border border-emerald-200 dark:border-emerald-800">
                                        <CheckCircle size={20} className="mr-2" /> Completed
                                    </button>
                                ) : (
                                    <GlassButton 
                                        onClick={handleMarkAsComplete}
                                        disabled={actionLoading}
                                        className={`w-full sm:w-auto flex items-center justify-center bg-sky-500 text-white border-sky-400 hover:border-sky-300 shadow-lg shadow-sky-500/30 ${actionLoading ? 'opacity-70' : ''}`}
                                    >
                                        {actionLoading ? 'Updating...' : 'Mark as Complete'}
                                    </GlassButton>
                                )}
                            </div>
                        </GlassCard>

                        <div className="bg-white dark:bg-gray-800/40 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Lesson Notes</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {currentLesson?.content || "No description provided for this lesson."}
                            </p>

                            {currentLesson?.attachment_url && (
                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Resources</h4>
                                    <a href={currentLesson.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-sky-50 dark:hover:bg-gray-600 hover:text-sky-600 transition-colors text-sm font-medium">
                                        <Download size={16} className="mr-2" />
                                        Download Attachment
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 📚 Right Side: Lesson Playlist */}
                    <GlassCard className="lg:w-96 flex flex-col p-0 overflow-hidden dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 shadow-sm shrink-0">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                                <BookOpen size={18} className="mr-2 text-sky-500" /> Course Content
                            </h3>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto hide-scrollbar p-2 space-y-2">
                            {lessons.map((lesson, index) => {
                                const isActive = currentLesson?.id === lesson.id;
                                const isCompleted = completedLessons.includes(lesson.id);

                                return (
                                    <div 
                                        key={lesson.id}
                                        onClick={() => setCurrentLesson(lesson)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                                            isActive 
                                            ? 'bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800/50' 
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-1.5 rounded-full ${isCompleted ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30' : isActive ? 'bg-sky-100 text-sky-500 dark:bg-sky-900/30' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}>
                                                {isCompleted ? <CheckCircle size={16} /> : (lesson.video_url ? <PlayCircle size={16} /> : <FileText size={16} />)}
                                            </div>
                                            <div>
                                                <p className={`font-medium text-sm ${isActive ? 'text-sky-700 dark:text-sky-400' : 'text-gray-700 dark:text-gray-300'} line-clamp-1`}>
                                                    {index + 1}. {lesson.title}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {progressPercentage === 100 && (
                            <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-emerald-900/20 dark:to-sky-900/20">
                                <Link href={`/student/quiz/${course.id}`}>
                                    <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 flex justify-center items-center animate-pulse">
                                        <Award size={20} className="mr-2" /> Take Final Quiz
                                    </button>
                                </Link>
                            </div>
                        )}
                    </GlassCard>

                </div>
            )}
        </div>
    );
}