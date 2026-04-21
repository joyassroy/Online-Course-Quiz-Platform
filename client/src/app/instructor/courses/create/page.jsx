"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import { 
    BookOpen, DollarSign, List, BarChart, 
    Image as ImageIcon, AlignLeft, Save, ArrowLeft, RefreshCw 
} from 'lucide-react';
import Link from 'next/link';

export default function CreateCourse() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // 🌟 ফর্মের স্টেট
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        difficulty: 'Beginner',
        price: '',
        description: '',
        thumbnail_url: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // API তে ডাটা পাঠানো হচ্ছে
            const response = await api.post('/instructor/courses', formData);
            
            if (response.data.success) {
                alert("✅ Course created successfully! It is now Pending Review by Admin.");
                // ড্যাশবোর্ডে ফেরত পাঠানো
                router.push('/instructor/dashboard');
            }
        } catch (error) {
            alert(error.response?.data?.message || "❌ Failed to create course.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <Link href="/instructor/dashboard" className="text-gray-500 hover:text-sky-500 flex items-center text-sm font-bold mb-2 transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-black dark:text-white flex items-center tracking-tight">
                        <BookOpen className="mr-3 text-sky-500" size={32} /> Create New Course
                    </h1>
                </div>
            </div>

            {/* Form */}
            <GlassCard className="p-6 md:p-8 border-none shadow-xl bg-white/50 dark:bg-gray-900/50">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Course Title */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center">
                                <BookOpen size={14} className="mr-1" /> Course Title <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input 
                                type="text" name="title" required placeholder="e.g. Advanced Next.js & React"
                                value={formData.title} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 dark:text-white transition-all font-bold"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center">
                                <List size={14} className="mr-1" /> Category <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input 
                                type="text" name="category" required placeholder="e.g. Web Development"
                                value={formData.category} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 dark:text-white transition-all"
                            />
                        </div>

                        {/* Difficulty */}
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center">
                                <BarChart size={14} className="mr-1" /> Difficulty <span className="text-red-500 ml-1">*</span>
                            </label>
                            <select 
                                name="difficulty" value={formData.difficulty} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 dark:text-white transition-all font-bold cursor-pointer"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center">
                                <DollarSign size={14} className="mr-1" /> Price (USD) <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input 
                                type="number" name="price" required min="0" step="0.01" placeholder="0.00"
                                value={formData.price} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all font-bold text-emerald-600 dark:text-emerald-400"
                            />
                        </div>

                        {/* Thumbnail URL */}
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center">
                                <ImageIcon size={14} className="mr-1" /> Thumbnail Image URL
                            </label>
                            <input 
                                type="url" name="thumbnail_url" placeholder="https://example.com/image.jpg"
                                value={formData.thumbnail_url} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 dark:text-white transition-all"
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center">
                                <AlignLeft size={14} className="mr-1" /> Course Description
                            </label>
                            <textarea 
                                name="description" rows="5" placeholder="What will the students learn in this course?"
                                value={formData.description} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 dark:text-white transition-all resize-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                        <button 
                            type="submit" disabled={loading}
                            className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-xl shadow-lg shadow-sky-500/30 transition-all flex items-center disabled:opacity-50"
                        >
                            {loading ? <RefreshCw className="animate-spin mr-2" size={20} /> : <Save className="mr-2" size={20} />}
                            {loading ? 'Submitting...' : 'Create Course'}
                        </button>
                    </div>

                </form>
            </GlassCard>
        </div>
    );
}