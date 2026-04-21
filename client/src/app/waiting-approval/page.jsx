"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, ShieldAlert, ArrowLeft, Coffee, Loader2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';

export default function WaitingApproval() {
    const router = useRouter();

    useEffect(() => {
        // 🌟 Auto-Check Logic (Polling)
        const checkStatus = setInterval(async () => {
            try {
                // তোমার প্রোফাইল বা স্ট্যাটাস চেক করার এপিআই
                const response = await api.get('/auth/me'); 
                
                if (response.data.success && response.data.data.status === 'Active') {
                    // যদি অ্যাডমিন অ্যাপ্রুভ করে দেয়, তবে ইন্টারভাল বন্ধ করো এবং ড্যাশবোর্ডে পাঠাও
                    clearInterval(checkStatus);
                    router.push('/student/dashboard');
                }
            } catch (err) {
                console.warn("Status check failed, retrying...");
            }
        }, 5000); // প্রতি ৫ সেকেন্ডে চেক করবে

        return () => clearInterval(checkStatus); // পেজ লিভ করলে ইন্টারভাল বন্ধ হবে
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-gray-950">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <GlassCard className="p-10 text-center border-amber-500/30 shadow-2xl relative overflow-hidden">
                    
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>

                    <div className="relative w-24 h-24 mx-auto mb-8">
                        <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping"></div>
                        <div className="relative bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full w-full h-full flex items-center justify-center border-2 border-amber-500/20 shadow-inner">
                            <Clock size={48} strokeWidth={2.5} />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                        Verification in Progress
                    </h2>
                    
                    <div className="flex items-center justify-center space-x-2 mb-6 text-sky-500 font-bold text-xs uppercase tracking-widest">
                        <Loader2 className="animate-spin" size={14} />
                        <span>Checking for Admin Approval...</span>
                    </div>

                    <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-sm font-medium">
                        Bhai, registration to hoye geche! Ekhon admin approve korle eii page ta auto-refresh hoye tomake dashboard-e niye jabe. Ektu patience rakho.
                    </p>

                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl flex items-start text-left gap-3 mb-8 border border-amber-100 dark:border-amber-800">
                        <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-tight uppercase tracking-wide">
                            Once approved, you will be automatically redirected. Do not close this tab if you want to enter immediately!
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Link href="/login">
                            <button className="w-full py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center group">
                                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
                                Return to Login
                            </button>
                        </Link>
                        
                        <div className="flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                            <Coffee size={12} className="mr-2" /> Live Status Sync Enabled
                        </div>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}