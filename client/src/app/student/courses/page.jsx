"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import { Search, Filter, BookOpen, Clock, Star } from 'lucide-react';

export default function CourseDiscovery() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    

    const fetchCourses = async () => {
        try {
            // আমাদের ব্যাকএন্ড API কল করছি
            const response = await api.get('/student/courses');
            if (response.data.success) {
                setCourses(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCourses();
    }, []);

    // ফিল্টার লজিক
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // ডাইনামিক ক্যাটাগরি লিস্ট বের করা
    const categories = ['All', ...new Set(courses.map(c => c.category))];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            
            {/* 🌟 Header Section */}
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Explore <span className="text-sky-500">Courses</span>
                </h1>
                <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                    Discover new skills, master your craft, and level up your knowledge with our interactive learning paths.
                </p>
            </div>

            {/* 🌟 Search & Filter Section */}
            <GlassCard className="mb-10 p-4 dark:bg-gray-800/60">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    
                    {/* Search Bar */}
                    <div className="relative w-full md:w-1/2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                    selectedCategory === category
                                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </GlassCard>

            {/* 🌟 Course Grid */}
            {filteredCourses.length === 0 ? (
                <div className="text-center py-20">
                    <BookOpen className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">No courses found</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
                </div>
            ) : (
                <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                >
                    {filteredCourses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800/80 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                        >
                            {/* Course Thumbnail (Placeholder or Real) */}
                            <div className="h-48 bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-900/40 dark:to-indigo-900/40 relative">
                                {course.thumbnail_url ? (
                                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <BookOpen className="h-16 w-16 text-sky-400/50 dark:text-sky-500/30" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-sky-700 dark:text-sky-400 shadow-sm">
                                    {course.difficulty || 'All Levels'}
                                </div>
                            </div>

                            {/* Course Info */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="text-xs font-semibold tracking-wide uppercase text-sky-500 dark:text-sky-400 mb-2">
                                    {course.category}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
                                    {course.description || "No description available for this course."}
                                </p>
                                
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <Star className="h-4 w-4 text-amber-400 mr-1 fill-current" />
                                        <span>4.8</span>
                                    </div>
                                    <div className="font-bold text-gray-900 dark:text-white">
                                        {course.price > 0 ? `$${course.price}` : 'Free'}
                                    </div>
                                </div>

                                <Link href={`/student/courses/${course.id}`} className="mt-6 w-full">
                                    <button className="w-full py-2.5 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 font-semibold rounded-xl hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white transition-colors">
                                        View Details
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}