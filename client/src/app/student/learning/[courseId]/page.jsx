"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import GlassCard from '@/components/ui/GlassCard';
import { 
    PlayCircle, CheckCircle, Circle, ArrowLeft, 
    FileText, Award, Loader2, ChevronRight, Video, 
    Menu, X, ArrowRight 
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function LearningArea() {
    const { courseId } = useParams();
    const router = useRouter();
    
    const [loading, setLoading] = useState(true);
    const [lessons, setLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [completing, setCompleting] = useState(false);
    
    // Mobile curriculum sidebar toggle
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        fetchCourseContent();
    }, [courseId]);

    const fetchCourseContent = async () => {
        try {
            // Backend theke lesson list anchi
            const res = await api.get(`/student/courses/${courseId}/lessons`);
            if (res.data.success) {
                const fetchedLessons = res.data.data.lessons;
                setLessons(fetchedLessons);
                setProgressPercentage(Number(res.data.data.progress) || 0);
                
                // Prothom uncompleted lesson ta auto-select korchi
                const nextLesson = fetchedLessons.find(l => !l.is_completed) || fetchedLessons[0];
                setCurrentLesson(nextLesson);
            }
        } catch (error) {
            toast.error("Failed to load curriculum. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // 🌟 Mark Complete & Confetti Magic
    const handleCompleteLesson = async () => {
        if (!currentLesson) return;
        setCompleting(true);
        const toastId = toast.loading("Saving progress...");

        try {
            const res = await api.post('/student/lesson/complete', { 
                course_id: courseId, 
                lesson_id: currentLesson.id 
            });

            if (res.data.success) {
                toast.success("Lesson Completed! 🎉", { id: toastId });
                
                // 🎊 Confetti Animation
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#0EA5E9', '#38BDF8', '#818CF8'] // Sky and Indigo theme
                });

                // Update local state smoothly
                const updatedLessons = lessons.map(l => 
                    l.id === currentLesson.id ? { ...l, is_completed: true } : l
                );
                setLessons(updatedLessons);
                setProgressPercentage(parseFloat(res.data.current_progress));

                // Move to next uncompleted lesson automatically
                const currentIndex = updatedLessons.findIndex(l => l.id === currentLesson.id);
                if (currentIndex + 1 < updatedLessons.length) {
                    setCurrentLesson(updatedLessons[currentIndex + 1]);
                }
            }
        } catch (error) {
            toast.error("Could not save progress.", { id: toastId });
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[80vh]">
                <Loader2 className="animate-spin text-sky-500 mb-4" size={40} />
                <p className="text-gray-500 font-bold animate-pulse">Setting up your classroom...</p>
            </div>
        );
    }

    // Helper to format YouTube link for embed
    const getEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
        if (url.includes("youtu.be/")) return url.replace("youtu.be/", "youtube.com/embed/");
        return url;
    };

    return (
        <div className="max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8 h-[calc(100vh-80px)] flex flex-col relative">
            
            {/* 🌟 Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <Link href="/student/dashboard" className="text-gray-500 hover:text-sky-500 flex items-center text-sm font-bold transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
                </Link>
                
                <div className="flex items-center gap-4 bg-white dark:bg-gray-900 px-5 py-2.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-800 w-full md:w-auto">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest hidden sm:block">Progress</span>
                    <div className="flex-1 md:w-48 bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-1000 ease-out" 
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <span className="font-black text-sky-500 text-sm">{progressPercentage}%</span>
                </div>
            </div>

            {/* 🌟 Main Layout (Split View) */}
            <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0 relative">
                
                {/* 📺 Left Side: Content Player */}
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-0 lg:pr-2 custom-scrollbar pb-20 lg:pb-0">
                    
                    {/* Mobile Curriculum Toggle Button */}
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden w-full flex items-center justify-between p-4 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-xl font-bold mb-4 border border-sky-100 dark:border-sky-800/50"
                    >
                        <span className="flex items-center"><PlayCircle size={18} className="mr-2" /> View Curriculum List</span>
                        <ChevronRight size={18} />
                    </button>

                    {currentLesson ? (
                        <div className="space-y-6">
                            
                            {/* Video Player Box */}
                            <GlassCard className="w-full aspect-video bg-black rounded-[2rem] overflow-hidden flex items-center justify-center relative shadow-2xl border-none">
                                {currentLesson.video_url ? (
                                    <iframe 
                                        className="w-full h-full border-0"
                                        src={getEmbedUrl(currentLesson.video_url)} 
                                        title="Lesson Video"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <div className="text-center text-gray-400 flex flex-col items-center">
                                        <Video size={56} className="mb-4 opacity-50 text-gray-500" />
                                        <p className="font-bold text-lg text-white">Video not available.</p>
                                        <p className="text-sm">Please review the lesson materials below.</p>
                                    </div>
                                )}
                            </GlassCard>

                            {/* Action Bar (Title + Button) */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-black dark:text-white leading-tight mb-2">{currentLesson.title}</h1>
                                    {currentLesson.resource_file_url && (
                                        <a href={currentLesson.resource_file_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-sky-500 hover:text-sky-600 font-bold bg-sky-50 dark:bg-sky-900/20 px-4 py-1.5 rounded-lg transition-all">
                                            <FileText size={16} className="mr-2" /> Download Attached Resource
                                        </a>
                                    )}
                                </div>
                                
                                <button 
                                    onClick={handleCompleteLesson}
                                    disabled={currentLesson.is_completed || completing}
                                    className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black flex items-center justify-center transition-all ${
                                        currentLesson.is_completed 
                                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 cursor-not-allowed' 
                                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                    }`}
                                >
                                    {completing ? <Loader2 size={20} className="animate-spin mr-2" /> : <CheckCircle size={20} className="mr-2" />}
                                    {currentLesson.is_completed ? 'Completed' : 'Mark as Complete'}
                                </button>
                            </div>

                            {/* Text Description */}
                            {currentLesson.content && (
                                <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 prose dark:prose-invert max-w-none">
                                    <h3 className="font-bold border-b border-gray-100 dark:border-gray-800 pb-4 mb-6 text-xl">Lesson Overview</h3>
                                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {currentLesson.content}
                                    </p>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 font-bold">Select a lesson to start learning.</div>
                    )}
                </div>

                {/* 📑 Right Side: Curriculum Sidebar (Desktop) */}
                <div className="hidden lg:flex w-96 flex-col bg-white dark:bg-gray-900 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden shrink-0">
                    <CurriculumList 
                        lessons={lessons} 
                        currentLesson={currentLesson} 
                        setCurrentLesson={setCurrentLesson} 
                        progressPercentage={progressPercentage} 
                        courseId={courseId} 
                    />
                </div>

                {/* 📱 Mobile Curriculum Drawer */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setIsSidebarOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                            />
                            <motion.div 
                                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
                                className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col lg:hidden border-l border-gray-100 dark:border-gray-800"
                            >
                                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                                    <h2 className="font-black text-lg dark:text-white flex items-center">
                                        <PlayCircle className="mr-2 text-sky-500" /> Curriculum
                                    </h2>
                                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                     <CurriculumList 
                                        lessons={lessons} 
                                        currentLesson={currentLesson} 
                                        setCurrentLesson={(l) => { setCurrentLesson(l); setIsSidebarOpen(false); }} 
                                        progressPercentage={progressPercentage} 
                                        courseId={courseId} 
                                    />
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}

// 📦 Reusable component for the curriculum list (Used in Desktop & Mobile sidebar)
function CurriculumList({ lessons, currentLesson, setCurrentLesson, progressPercentage, courseId }) {
    return (
        <div className="flex flex-col h-full w-full">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hidden lg:block">
                <h2 className="font-black text-lg dark:text-white flex items-center">
                    <PlayCircle className="mr-2 text-sky-500" /> Course Content
                </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {lessons.map((lesson, idx) => {
                    const isCurrent = currentLesson?.id === lesson.id;
                    return (
                        <button
                            key={lesson.id}
                            onClick={() => setCurrentLesson(lesson)}
                            className={`w-full text-left p-4 rounded-xl flex items-start gap-3 transition-all border ${
                                isCurrent 
                                    ? 'bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800 shadow-sm' 
                                    : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                        >
                            <div className="mt-1 shrink-0">
                                {lesson.is_completed ? (
                                    <CheckCircle size={18} className="text-emerald-500" />
                                ) : (
                                    <Circle size={18} className="text-gray-300 dark:text-gray-600" />
                                )}
                            </div>
                            <div className="flex-1 pr-2">
                                <p className={`font-bold text-sm leading-snug ${isCurrent ? 'text-sky-700 dark:text-sky-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {idx + 1}. {lesson.title}
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {lesson.video_url && <span className="flex items-center"><Video size={10} className="mr-1"/> Video</span>}
                                    {lesson.resource_file_url && <span className="flex items-center text-sky-500"><FileText size={10} className="mr-1"/> Note</span>}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
            
            {/* 🏆 Final Quiz Access */}
            {progressPercentage >= 100 && (
                <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                    <div className="text-center mb-3">
                        <Award className="mx-auto text-emerald-500 mb-1" size={24} />
                        <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Course Completed!</p>
                    </div>
                    <Link href={`/student/quiz/${courseId}`}>
                        <button className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center">
                            Take Final Exam <ArrowRight size={16} className="ml-2" />
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}