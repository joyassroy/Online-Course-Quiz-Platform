"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import {
    Search, BookOpen, User,
    ArrowRight, ShoppingBag, Loader2,
    Filter, X, PlayCircle, ChevronRight,
    Smartphone, CreditCard,Lock, ShieldCheck // New Icons for Payment
} from 'lucide-react';

// --- 💳 bKash Style Payment Modal Component ---
const PaymentModal = ({ isOpen, onClose, onConfirm, course, isProcessing }) => {
    const [pin, setPin] = useState("");
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl border border-pink-100 dark:border-pink-900/20"
            >
                {/* bKash Header */}
                <div className="bg-[#D12053] p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Smartphone size={24} />
                        <h3 className="font-bold text-lg">bKash Payment</h3>
                    </div>
                    <button onClick={onClose} className="hover:rotate-90 transition-transform"><X /></button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-widest">Merchant: OCQP Platform</p>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{course?.title}</h4>
                        <div className="text-3xl font-black text-[#D12053] mt-2">৳ {course?.price}</div>
                    </div>

                    <div className="space-y-4">
                        <input
                            type="password"
                            placeholder="Enter bKash PIN"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#D12053] rounded-2xl outline-none text-center text-xl tracking-[0.5em] font-bold transition-all"
                        />
                        <p className="text-[10px] text-center text-gray-400 uppercase font-bold tracking-widest flex items-center justify-center gap-1">
                            <ShieldCheck size={12} /> Secure Dummy Payment Encrypted
                        </p>
                    </div>

                    <button
                        onClick={() => onConfirm(course.id)}
                        disabled={isProcessing || pin.length < 4}
                        className="w-full py-4 bg-[#D12053] hover:bg-[#b01b46] disabled:bg-gray-300 text-white font-black rounded-2xl shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" /> : <>Confirm Payment <CreditCard size={20} /></>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default function CourseExplorer() {
    const router = useRouter();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrollingId, setEnrollingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [filterCategory, setFilterCategory] = useState('All');
    const [filterDifficulty, setFilterDifficulty] = useState('All');
    const [filterPrice, setFilterPrice] = useState('All');

    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseDetails, setCourseDetails] = useState(null);
    const [fetchingDetails, setFetchingDetails] = useState(false);

    // 🌟 Payment State
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [pendingCourse, setPendingCourse] = useState(null);

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

    const fetchCoursePreview = async (course) => {
        setSelectedCourse(course);
        setFetchingDetails(true);
        try {
            const res = await api.get(`/student/courses/${course.id}/lessons`);
            if (res.data.success) {
                setCourseDetails(res.data.data);
            }
        } catch (error) {
            setCourseDetails({ lessons: [] });
        } finally {
            setFetchingDetails(false);
        }
    };

    // 🌟 Logic to decide: Direct Enroll or Payment
    const initiateEnrollment = (course) => {
        if (course.price > 0) {
            setPendingCourse(course);
            setIsPaymentOpen(true);
        } else {
            handleEnroll(course.id);
        }
    };

    const handleEnroll = async (courseId) => {
        setIsPaymentOpen(false); // Close modal if it was open
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

            {/* Payment Modal Integration */}
            <PaymentModal
                isOpen={isPaymentOpen}
                course={pendingCourse}
                onClose={() => setIsPaymentOpen(false)}
                onConfirm={handleEnroll}
                isProcessing={enrollingId === pendingCourse?.id}
            />

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
            </div>

            {/* 🛠️ Filters Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2 text-sky-500 font-bold px-2">
                    <Filter size={18} /> <span className="text-sm">Filters:</span>
                </div>

                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm font-semibold focus:ring-2 focus:ring-sky-500 transition-all">
                    <option value="All">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>

                <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)} className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all">
                    <option value="All">All Prices</option>
                    <option value="Free">Free</option>
                    <option value="Paid">Paid</option>
                </select>

                <button onClick={() => { setFilterCategory('All'); setFilterDifficulty('All'); setFilterPrice('All'); setSearchTerm('') }} className="ml-auto text-xs font-bold text-gray-400 hover:text-sky-500 uppercase tracking-widest">
                    Reset All
                </button>
            </div>

            {/* 📚 Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course, idx) => (
                    <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                        <GlassCard
                            className="relative flex flex-col h-full overflow-hidden hover:translate-y-[-8px] transition-all duration-500 border-none bg-white dark:bg-gray-900 shadow-sm hover:shadow-2xl group cursor-pointer"
                            onClick={() => router.push(`/student/courses/${course.id}`)}
                        >
                            {/* Course Thumbnail */}
                            <div className="h-48 relative overflow-hidden">
                                {course.thumbnail_url ? (
                                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                                        <BookOpen size={48} />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-sky-600 shadow-sm">
                                    {course.category}
                                </div>

                                {/* Quick Preview Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fetchCoursePreview(course);
                                    }}
                                    className="absolute top-4 right-4 p-2 bg-sky-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <Search size={16} />
                                </button>
                            </div>

                            {/* Course Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-black dark:text-white mb-2 leading-tight group-hover:text-sky-500 transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-gray-500 text-xs font-bold mb-4 flex items-center capitalize">
                                    <User size={14} className="mr-1.5" /> {course.instructor_name}
                                </p>

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

            {/* 🌟 Sidebar Preview Section */}
            <AnimatePresence>
                {selectedCourse && (
                    <>
                        {/* 🌑 Backdrop: Clicking this will close the sidebar */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedCourse(null)} // 🌟 Easy close on click outside
                            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm cursor-zoom-out"
                        />

                        {/* 📄 Sidebar Content */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 z-[70] w-full max-w-2xl bg-white dark:bg-gray-950 h-full shadow-2xl overflow-y-auto flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-20 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500">
                                        <BookOpen size={20} />
                                    </div>
                                    <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">Quick Preview</h2>
                                </div>

                                {/* ❌ Enhanced Close Button */}
                                <button
                                    onClick={() => setSelectedCourse(null)}
                                    className="group flex items-center gap-2 p-2 pr-4 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all text-gray-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest"
                                >
                                    <div className="p-1.5 bg-gray-100 dark:bg-gray-800 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 rounded-full transition-colors">
                                        <X size={18} />
                                    </div>
                                    Close
                                </button>
                            </div>

                            {/* Content Body */}
                            <div className="p-8 space-y-8 flex-1">
                                <div>
                                    <h1 className="text-4xl font-black dark:text-white mb-4 leading-tight">{selectedCourse.title}</h1>
                                    <div className="flex flex-wrap gap-4 items-center">
                                        <span className="px-4 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 rounded-xl text-sm font-black uppercase">{selectedCourse.category}</span>
                                        <span className="text-gray-400 font-bold text-sm flex items-center"><User size={16} className="mr-2" /> {selectedCourse.instructor_name}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-lg font-black dark:text-white flex items-center justify-between">
                                        <span>Curriculum Preview</span>
                                        {fetchingDetails && <Loader2 size={16} className="animate-spin text-sky-500" />}
                                    </h4>

                                    <div className="space-y-3">
                                        {courseDetails?.lessons?.length > 0 ? (
                                            courseDetails.lessons.map((lesson, i) => (
                                                <div key={lesson.id} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-transparent hover:border-sky-500/20 transition-all hover:translate-x-1 duration-300">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm font-black text-sky-500 border border-gray-100 dark:border-gray-700">{i + 1}</div>
                                                        <p className="font-bold text-gray-800 dark:text-gray-200">{lesson.title}</p>
                                                    </div>
                                                    <PlayCircle size={20} className="text-gray-300" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                                                <Lock size={32} className="text-gray-300 mb-2" />
                                                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Enroll to see full curriculum</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Action */}
                            <div className="p-8 border-t border-gray-100 dark:border-gray-800 sticky bottom-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md pb-8 flex gap-4">
                                <button
                                    onClick={() => router.push(`/student/courses/${selectedCourse.id}`)}
                                    className="flex-1 py-5 border-2 border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white font-black rounded-[1.5rem] hover:bg-gray-50 dark:hover:bg-gray-900 transition-all flex items-center justify-center gap-2 group"
                                >
                                    Details <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => initiateEnrollment(selectedCourse)}
                                    disabled={enrollingId === selectedCourse.id}
                                    className="flex-[2] py-5 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-[1.5rem] flex items-center justify-center transition-all shadow-xl shadow-sky-500/30 active:scale-95"
                                >
                                    {enrollingId === selectedCourse.id ? <Loader2 className="animate-spin" /> : <><ShoppingBag size={22} className="mr-2" /> Enroll Now</>}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}