"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import { BookOpen, Save, ArrowLeft, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function EditCourse() {
    const router = useRouter();
    const params = useParams(); // URL থেকে id নেওয়ার জন্য
    const { id } = params;
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '', category: '', difficulty: 'Beginner', price: '', description: '', thumbnail_url: ''
    });

    useEffect(() => {
        fetchCourseData();
    }, [id]);

    const fetchCourseData = async () => {
        try {
            const response = await api.get(`/instructor/courses/${id}`);
            if (response.data.success) {
                setFormData(response.data.data);
            }
        } catch (error) {
            alert("Failed to load course data.");
            router.push('/instructor/courses');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // 🌟 Update Course
    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await api.put(`/instructor/courses/${id}`, formData);
            if (response.data.success) {
                alert("✅ Course details updated!");
                router.push('/instructor/courses');
            }
        } catch (error) {
            alert("❌ Failed to update course.");
        } finally {
            setSaving(false);
        }
    };

    // 🌟 Delete Course
    const handleDelete = async () => {
        if (!confirm("⚠️ DANGER: Are you sure you want to permanently delete this course?")) return;
        try {
            const response = await api.delete(`/instructor/courses/${id}`);
            if (response.data.success) {
                alert("🗑️ Course deleted successfully.");
                router.push('/instructor/courses');
            }
        } catch (error) {
            alert("❌ Failed to delete course. It may have enrolled students.");
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse text-sky-500 font-bold">Loading Course Data...</div>;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            <Link href="/instructor/courses" className="text-gray-500 hover:text-sky-500 flex items-center text-sm font-bold transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Back to Courses
            </Link>
            
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
                <h1 className="text-3xl font-black dark:text-white flex items-center">
                    <BookOpen className="mr-3 text-sky-500" size={32} /> Manage Course
                </h1>
                
                {/* 🔴 Delete Button */}
                <button onClick={handleDelete} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white font-bold rounded-lg transition-all flex items-center">
                    <Trash2 size={16} className="mr-2" /> Delete Course
                </button>
            </div>

            <GlassCard className="p-6 md:p-8 border-none shadow-xl bg-white/50 dark:bg-gray-900/50">
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-gray-500 uppercase mb-2">Course Title</label>
                            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-sky-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase mb-2">Category</label>
                            <input type="text" name="category" required value={formData.category} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-sky-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase mb-2">Price (USD)</label>
                            <input type="number" name="price" required value={formData.price} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-sky-500" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-gray-500 uppercase mb-2">Thumbnail URL</label>
                            <input type="url" name="thumbnail_url" value={formData.thumbnail_url || ''} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-sky-500" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-gray-500 uppercase mb-2">Description</label>
                            <textarea name="description" rows="4" value={formData.description || ''} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"></textarea>
                        </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end">
                        <button type="submit" disabled={saving} className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-xl transition-all flex items-center">
                            {saving ? <RefreshCw className="animate-spin mr-2" size={20} /> : <Save className="mr-2" size={20} />}
                            {saving ? 'Saving...' : 'Update Details'}
                        </button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
}