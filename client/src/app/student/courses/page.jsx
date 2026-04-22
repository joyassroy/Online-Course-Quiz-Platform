"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import { 
    Search, BookOpen, Star, User, 
    ArrowRight, ShoppingBag, Loader2, 
    Filter, X, PlayCircle, Clock, ChevronRight 
} from 'lucide-react';

export default function CourseExplorer() {
    const router = useRouter();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrollingId, setEnrollingId] = useState(null); 
    const [searchTerm, setSearchTerm] = useState('');
    
    // 🌟 Filter States
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterDifficulty, setFilterDifficulty] = useState('All');
    const [filterPrice, setFilterPrice] = useState('All');
    
    // 🌟 Detail Preview States
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseDetails, setCourseDetails] = useState(null);
    const [fetchingDetails, setFetchingDetails] = useState(false);

    useEffect(() => {
        fetchAvailableCourses();
    }, []);

    const fetchAvailableCourses = async () => {
        try {
            const res = await api.get('/student/courses');
            if (res.data.success) {
                setCourses(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to load course catalog.");
        } finally {
            setLoading(false);
        }
    };

    // 🌟 Fetch Course Details & Lessons
    const fetchCoursePreview = async (course) => {
        setSelectedCourse(course);
        setFetchingDetails(true);
        try {
            // ইনস্ট্রাক্টরের এন্ডপয়েন্ট বা স্টুডেন্ট এন্ডপয়েন্ট থেকে লেসন লিস্ট আনা
            const res = await api.get(`/student/courses/${course.id}/lessons`);
            if (res.data.success) {
                setCourseDetails(res.data.data);
            }
        } catch (error) {
            console.error("Preview error:", error);
            // যদি এনরোল করা না থাকে, তবে হয়তো লেসন লিস্ট আসবে না, সেটা হ্যান্ডেল করা
            setCourseDetails({ lessons: [] }); 
        } finally {
            setFetchingDetails(false);
        }
    };

    const handleEnroll = async (courseId) => {
        setEnrollingId(courseId);
        const toastId = toast.loading("Processing your enrollment...");
        try {
            const res = await api.post('/student/enroll', { course_id: courseId });
            if (res.data.success) {
                toast.success("Successfully Enrolled! 🎉", { id: toastId });
                router.push('/student/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not enroll.", { id: toastId });
        } finally {
            setEnrollingId(null);
        }
    };

    // 🌟 Multi-Level Filtering Logic
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             course.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || course.category === filterCategory;
        const matchesDifficulty = filterDifficulty === 'All' || course.difficulty === filterDifficulty;
        const matchesPrice = filterPrice === 'All' || 
                            (filterPrice === 'Free' ? course.price == 0 : course.price > 0);
        
        return matchesSearch && matchesCategory && matchesDifficulty && matchesPrice;
    });

    const categories = ['All', ...new Set(courses.map(c => c.category))];

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[80vh]">
                <Loader2 className="animate-spin text-sky-500 mb-4" size={40} />
                <p className="text-gray-500 font-bold animate-pulse tracking-widest">SYNCING CATALOG...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            
            {/* 🔍 Hero & Search Section */}
            <div className="relative bg-gradient-to-r from-sky-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-14 overflow-hidden shadow-2xl shadow-sky-500/20">
                <div className="relative z-10 space-y-6">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none mb-4">
                            Master New <span className="text-sky-300 underline decoration-sky-400/30">Skills</span>
                        </h1>
                        <p className="text-sky-100/80 text-lg font-medium">Browse our expert-led courses and start your transformation today.</p>
                    </div>
                    
                    <div className="relative max-w-xl">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                        <input 
                            type="text" 
                            placeholder="Search by title, keyword..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-white/95 backdrop-blur-md text-gray-900 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-sky-400/40 shadow-2xl font-bold transition-all text-lg"
                        />
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            </div>

            {/* 🛠️ Filters Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2 text-sky-500 font-bold px-2">
                    <Filter size={18} /> <span className="text-sm">Filters:</span>
                </div>
                
                {/* Category Filter */}
                <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all"
                >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                {/* Difficulty Filter */}
                <select 
                    value={filterDifficulty} 
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm font-semibold focus:ring-2 focus:ring-sky-500 transition-all"
                >
                    <option value="All">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>

                {/* Price Filter */}
                <select 
                    value={filterPrice} 
                    onChange={(e) => setFilterPrice(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all"
                >
                    <option value="All">All Prices</option>
                    <option value="Free">Free</option>
                    <option value="Paid">Paid</option>
                </select>

                <button 
                    onClick={() => {setFilterCategory('All'); setFilterDifficulty('All'); setFilterPrice('All'); setSearchTerm('')}}
                    className="ml-auto text-xs font-bold text-gray-400 hover:text-sky-500 uppercase tracking-widest"
                >
                    Reset All
                </button>
            </div>

            {/* 📚 Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course, idx) => (
                    <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                        <GlassCard className="flex flex-col h-full overflow-hidden hover:translate-y-[-8px] transition-all duration-500 border-none bg-white dark:bg-gray-900 shadow-sm hover:shadow-2xl group cursor-pointer" onClick={() => fetchCoursePreview(course)}>
                            
                            <div className="h-48 relative overflow-hidden">
                                {course.thumbnail_url ? (
                                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300"><BookOpen size={48} /></div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-sky-600 shadow-sm">
                                    {course.category}
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-black dark:text-white mb-2 leading-tight group-hover:text-sky-500 transition-colors">{course.title}</h3>
                                <p className="text-gray-500 text-xs font-bold mb-4 flex items-center capitalize"><User size={14} className="mr-1.5" /> {course.instructor_name}</p>

                                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50 dark:border-gray-800">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{course.difficulty}</span>
                                    </div>
                                    <div className="text-2xl font-black text-sky-600">
                                        {course.price > 0 ? `$${course.price}` : 'FREE'}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* 🌟 Course Details Sidebar / Modal Preview */}
            <AnimatePresence>
                {selectedCourse && (
                    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            className="w-full max-w-2xl bg-white dark:bg-gray-950 h-full shadow-2xl overflow-y-auto"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-10 flex justify-between items-center">
                                <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">Course Preview</h2>
                                <button onClick={() => setSelectedCourse(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all text-gray-500"><X /></button>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Header Info */}
                                <div>
                                    <h1 className="text-4xl font-black dark:text-white mb-4 leading-tight">{selectedCourse.title}</h1>
                                    <div className="flex flex-wrap gap-4 items-center">
                                        <span className="px-4 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 rounded-xl text-sm font-black uppercase">{selectedCourse.category}</span>
                                        <span className="text-gray-400 font-bold text-sm flex items-center"><User size={16} className="mr-2" /> {selectedCourse.instructor_name}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-lg font-black dark:text-white flex items-center"><BookOpen className="mr-2 text-sky-500" size={20} /> About this course</h4>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                        {selectedCourse.description || "This course is designed to take you from fundamentals to advanced concepts. Master the curriculum and earn your certification."}
                                    </p>
                                </div>

                                {/* Lesson List Preview */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-black dark:text-white flex items-center justify-between">
                                        <span>Curriculum</span>
                                        {fetchingDetails && <Loader2 size={16} className="animate-spin text-sky-500" />}
                                    </h4>
                                    
                                    <div className="space-y-3">
                                        {courseDetails?.lessons && courseDetails.lessons.length > 0 ? (
                                            courseDetails.lessons.map((lesson, i) => (
                                                <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-transparent hover:border-sky-500/30 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-xs font-black text-sky-500 border border-gray-100 dark:border-gray-700">{i + 1}</div>
                                                        <p className="font-bold text-gray-800 dark:text-gray-200">{lesson.title}</p>
                                                    </div>
                                                    <PlayCircle size={18} className="text-gray-300 group-hover:text-sky-500 transition-colors" />
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm italic py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl text-center">Enroll to unlock and view full curriculum.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Action */}
                                <div className="pt-8 border-t border-gray-100 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-950 pb-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</span>
                                            <span className="text-3xl font-black text-emerald-500">{selectedCourse.price > 0 ? `$${selectedCourse.price}` : 'FREE'}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Level</span>
                                            <span className="block font-black text-gray-800 dark:text-white">{selectedCourse.difficulty}</span>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleEnroll(selectedCourse.id)}
                                        disabled={enrollingId === selectedCourse.id}
                                        className="w-full py-5 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-[1.5rem] flex items-center justify-center transition-all shadow-xl shadow-sky-500/30 text-lg group"
                                    >
                                        {enrollingId === selectedCourse.id ? (
                                            <Loader2 size={24} className="animate-spin" />
                                        ) : (
                                            <><ShoppingBag size={22} className="mr-2" /> Start My Journey Now <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}