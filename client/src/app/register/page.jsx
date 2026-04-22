"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import { User, Mail, Lock, UserPlus, ArrowRight, Loader2 } from 'lucide-react';

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role_id: 3 // ডিফল্ট রোল স্টুডেন্ট
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/register', formData);
            if (response.data.success) {
                router.push('/waiting-approval');
            }
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a] px-4 py-12 transition-colors duration-500 relative overflow-hidden">
            
            {/* 🌟 Background Decorative Blobs */}
            <div className="absolute top-0 -left-20 w-80 h-80 bg-sky-400/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 -right-20 w-80 h-80 bg-purple-400/10 rounded-full blur-[100px] pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="w-full max-w-md z-10"
            >
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 transition-all">
                    
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                            Join the <span className="text-sky-500">Quest</span>
                        </h1>
                        <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">
                            Create your account to start learning.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-4 rounded-xl text-sm text-center font-bold border border-red-100 dark:border-red-900/30">
                            {error}
                        </div>
                    )}

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div className="relative group">
                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                                <input 
                                    type="text" placeholder="e.g. Joyassroy Barua" required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 text-slate-900 dark:text-white font-bold transition-all placeholder:text-slate-400"
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="relative group">
                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                                <input 
                                    type="email" placeholder="example@mail.com" required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 text-slate-900 dark:text-white font-bold transition-all placeholder:text-slate-400"
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="relative group">
                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Create Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                                <input 
                                    type="password" placeholder="••••••••" required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 text-slate-900 dark:text-white font-bold transition-all placeholder:text-slate-400"
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Register Button */}
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 dark:bg-sky-500 hover:bg-slate-800 dark:hover:bg-sky-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-sky-500/20 flex justify-center items-center group disabled:opacity-70 mt-4"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin mr-2" size={20} />
                            ) : (
                                <>REGISTER NOW <UserPlus size={20} className="ml-2 group-hover:scale-110 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center space-y-4">
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
                            Already have an account? 
                            <Link href="/login" className="ml-2 text-sky-500 font-black hover:text-sky-600 underline decoration-sky-500/30">
                                Login
                            </Link>
                        </p>
                        <Link href="/" className="inline-block text-xs font-black text-slate-400 uppercase tracking-widest hover:text-sky-500 transition-colors">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}