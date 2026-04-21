"use client";
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import { 
    PlayCircle, PlusCircle, ArrowUp, ArrowDown, 
    Trash2, Save, Unlock, Lock, FileText, ArrowLeft, X
} from 'lucide-react';
import Link from 'next/link';

export default function ManageLessons() {
    const { id: courseId } = useParams();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', video_url: '', resource_file_url: '', is_free_preview: false });

    useEffect(() => {
        fetchLessons();
    }, [courseId]);

    const fetchLessons = async () => {
        try {
            const response = await api.get(`/instructor/courses/${courseId}/lessons`);
            setLessons(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // 🌟 Handle Up/Down Reordering Locally
    const moveLesson = (index, direction) => {
        if ((direction === -1 && index === 0) || (direction === 1 && index === lessons.length - 1)) return;

        const newLessons = [...lessons];
        // Swap items
        const temp = newLessons[index];
        newLessons[index] = newLessons[index + direction];
        newLessons[index + direction] = temp;

        // Update sequence_order visually
        const updatedOrder = newLessons.map((l, idx) => ({ ...l, sequence_order: idx + 1 }));
        setLessons(updatedOrder);
    };

    // 🌟 Save New Order to Database
    const saveOrder = async () => {
        const toastId = toast.loading('Saving Lesson Order settings...');
        try {
            const orderedLessons = lessons.map(l => ({ id: l.id, sequence_order: l.sequence_order }));
            await api.put(`/instructor/courses/${courseId}/lessons/reorder`, { orderedLessons });

            toast.success('Lesson order saved!', { id: toastId });
        } catch (error) {
            toast.error('Failed to save order.', { id: toastId });
        }
    };

    // 🌟 Add New Lesson
    const handleAddLesson = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Adding lesson...');
        try {
            await api.post(`/instructor/courses/${courseId}/lessons`, formData);
            toast.success('Lesson added!', { id: toastId });
            setIsModalOpen(false);
            setFormData({ title: '', content: '', video_url: '', resource_file_url: '', is_free_preview: false });
            fetchLessons(); // Reload lessons
        } catch (error) {
            toast.error('Failed to add lesson.', { id: toastId });
        }
    };

    // 🌟 Delete Lesson
    const handleDelete = async (lessonId) => {
        if (!confirm("Are you sure you want to delete this lesson?")) return;
        try {
            await api.delete(`/instructor/courses/${courseId}/lessons/${lessonId}`);
            setLessons(lessons.filter(l => l.id !== lessonId));
        } catch (error) {
            toast.error('Failed to delete lesson.');
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
            <Link href="/instructor/courses" className="text-gray-500 hover:text-sky-500 flex items-center text-sm font-bold transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Back to Courses
            </Link>

            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
                <h1 className="text-3xl font-black dark:text-white flex items-center">
                    <PlayCircle className="mr-3 text-sky-500" size={32} /> Curriculum Management
                </h1>
                <div className="flex gap-3">
                    <button onClick={saveOrder} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-all flex items-center shadow-lg shadow-emerald-500/30">
                        <Save size={18} className="mr-2" /> Save Sequence
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg transition-all flex items-center shadow-lg shadow-sky-500/30">
                        <PlusCircle size={18} className="mr-2" /> Add Lesson
                    </button>
                </div>
            </div>

            {/* Lessons List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center p-10 font-bold text-gray-500 animate-pulse">Loading curriculum...</div>
                ) : lessons.length === 0 ? (
                    <div className="text-center p-10 text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">No lessons added yet. Click 'Add Lesson' to start.</div>
                ) : (
                    lessons.map((lesson, index) => (
                        <GlassCard key={lesson.id} className="p-4 flex items-center justify-between border-none shadow-md bg-white dark:bg-gray-800/50 hover:border-sky-500/50 transition-all">
                            <div className="flex items-center gap-4">
                                {/* Up/Down Controls */}
                                <div className="flex flex-col items-center gap-1 bg-gray-50 dark:bg-gray-900 p-1 rounded-lg">
                                    <button onClick={() => moveLesson(index, -1)} disabled={index === 0} className="text-gray-400 hover:text-sky-500 disabled:opacity-20"><ArrowUp size={16} /></button>
                                    <span className="text-xs font-black text-gray-500">{index + 1}</span>
                                    <button onClick={() => moveLesson(index, 1)} disabled={index === lessons.length - 1} className="text-gray-400 hover:text-sky-500 disabled:opacity-20"><ArrowDown size={16} /></button>
                                </div>
                                
                                <div>
                                    <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                        {lesson.title}
                                        {lesson.is_free_preview ? <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider flex items-center"><Unlock size={10} className="mr-1" /> Free Preview</span> : <span className="bg-gray-200 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider flex items-center"><Lock size={10} className="mr-1" /> Locked</span>}
                                    </h3>
                                    <div className="flex gap-4 mt-1 text-xs font-bold text-gray-400">
                                        {lesson.video_url && <span className="flex items-center"><PlayCircle size={12} className="mr-1 text-sky-500" /> Video</span>}
                                        {lesson.resource_file_url && <span className="flex items-center"><FileText size={12} className="mr-1 text-amber-500" /> Resource Attached</span>}
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => handleDelete(lesson.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                                <Trash2 size={18} />
                            </button>
                        </GlassCard>
                    ))
                )}
            </div>

            {/* 🌟 Add Lesson Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <h2 className="text-xl font-black dark:text-white">Add New Lesson</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleAddLesson} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase mb-1">Lesson Title</label>
                                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-sky-500" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">Video URL (Optional)</label>
                                    <input type="url" value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})} placeholder="YouTube / Vimeo link" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-sky-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">Resource URL (Optional)</label>
                                    <input type="url" value={formData.resource_file_url} onChange={e => setFormData({...formData, resource_file_url: e.target.value})} placeholder="PDF / Drive link" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-sky-500" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase mb-1">Content / Description</label>
                                <textarea rows="3" required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Write lesson details or markdown..." className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"></textarea>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-max">
                                <input type="checkbox" checked={formData.is_free_preview} onChange={e => setFormData({...formData, is_free_preview: e.target.checked})} className="w-5 h-5 accent-sky-500" />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Set as Free Preview</span>
                            </label>

                            <button type="submit" className="w-full py-3 mt-4 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-xl transition-all">
                                Save Lesson
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}