"use client"; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/utils/auth'; 
import Link from 'next/link';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login(formData.email, formData.password);
            
            if (response.success) {
                // টোকেন বা ইউজার ডেটা থেকে রোল বের করা
                const userRole = response.user.role_name; 
                
                // 🚀 রোল অনুযায়ী আলাদা ড্যাশবোর্ডে পাঠানো
                if (userRole === 'Admin') {
                    router.push('/admin/dashboard');
                } else if (userRole === 'Instructor') {
                    router.push('/instructor/dashboard'); // ইনস্ট্রাক্টরের জন্য
                } else {
                    router.push('/student/dashboard'); // স্টুডেন্টের জন্য
                }
            }
        } catch (err) {
            setError(err.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a] px-4 py-12 transition-colors duration-500">
            {/* Background Blobs for Anime Vibes */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-sky-400/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-400/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-md w-full z-10">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 transition-all">
                    
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            Welcome <span className="text-sky-500">Back</span>
                        </h2>
                        <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">
                            Sign in to continue your learning journey
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-4 rounded-xl text-sm text-center font-bold border border-red-100 dark:border-red-900/30"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Login Form */}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* Email Field */}
                            <div className="relative group">
                                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 text-slate-900 dark:text-white font-bold transition-all placeholder:text-slate-400"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="relative group">
                                <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 text-slate-900 dark:text-white font-bold transition-all placeholder:text-slate-400"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 dark:bg-sky-500 hover:bg-slate-800 dark:hover:bg-sky-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-sky-500/20 flex items-center justify-center group disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin mr-2" size={20} />
                            ) : (
                                <>Sign In <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} /></>
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 text-center space-y-4">
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
                            Don't have an account? 
                            <Link href="/register" className="ml-2 text-sky-500 hover:text-sky-600 underline decoration-sky-500/30 transition-all">
                                Create Account
                            </Link>
                        </p>
                        <Link href="/" className="inline-block text-xs font-black text-slate-400 uppercase tracking-widest hover:text-sky-500 transition-colors">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}