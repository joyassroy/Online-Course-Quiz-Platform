"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import { User, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role_id: 3// ডিফল্ট রোল স্টুডেন্ট
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // ব্যাকএন্ড এপিআই-তে ডাটা পুশ করা
            const response = await api.post('/auth/register', formData);
            
            if (response.data.success) {
                // সাকসেস হলে ওয়েটিং পেজে পাঠিয়ে দেওয়া
                router.push('/waiting-approval');
            }
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-gray-950">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                <GlassCard className="p-8 border-t-4 border-t-sky-500 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black dark:text-white mb-2">Join the <span className="text-sky-500">Quest</span></h1>
                        <p className="text-gray-500 text-sm font-medium">Create your account to start learning.</p>
                    </div>

                    {error && <div className="mb-4 p-3 bg-red-100 text-red-600 text-xs font-bold rounded-lg">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="text" placeholder="Full Name" required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all dark:text-white"
                                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="email" placeholder="Email Address" required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all dark:text-white"
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="password" placeholder="Password" required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all dark:text-white"
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-xl shadow-lg shadow-sky-500/30 transition-all flex justify-center items-center group"
                        >
                            {loading ? "PROCESSING..." : "REGISTER NOW"}
                            {!loading && <UserPlus size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-gray-500">Already have an account?</span>
                        <Link href="/login" className="ml-2 text-sky-500 font-bold hover:underline">Login</Link>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}