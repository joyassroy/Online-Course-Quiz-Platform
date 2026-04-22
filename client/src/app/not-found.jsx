"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPinOff, ArrowLeft, Loader2, Home } from 'lucide-react';

export default function NotFound() {
    const [dashboardPath, setDashboardPath] = useState('/'); 
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        // 🌟 Role-Based Redirection Logic
        try {
            const userString = localStorage.getItem('user'); 
            
            if (userString) {
                const user = JSON.parse(userString);
                
                // Map roles to their respective dashboard paths
                if (user.role === 'admin') {
                    setDashboardPath('/admin/dashboard');
                } else if (user.role === 'instructor') {
                    setDashboardPath('/instructor/dashboard');
                } else if (user.role === 'student') {
                    setDashboardPath('/student/dashboard');
                }
            }
        } catch (error) {
            console.error("404 Auth Check Error:", error);
            setDashboardPath('/'); 
        } finally {
            setCheckingAuth(false);
        }
    }, []);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1, 
            transition: { staggerChildren: 0.2, delayChildren: 0.3 } 
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
    };

    const floatAnimation = {
        y: ["0%", "-10%", "0%"],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    };

    return (
        <motion.div 
            className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-950 px-4 text-center overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* 🎨 Background Glow */}
            <motion.div 
                className="absolute w-[500px] h-[500px] bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-3xl -z-10"
                animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
                transition={{ duration: 10, repeat: Infinity }}
            />

            {/* 📢 404 Heading */}
            <motion.h1 
                className="text-9xl md:text-[12rem] font-black tracking-tighter text-gray-900 dark:text-white mb-2 relative"
                variants={itemVariants}
            >
                4
                <motion.span 
                    className="inline-block text-sky-500"
                    animate={floatAnimation}
                >
                    0
                </motion.span>
                4
            </motion.h1>

            {/* 📍 Animated Icon */}
            <motion.div 
                className="bg-sky-100 dark:bg-sky-900/30 p-6 rounded-full text-sky-600 dark:text-sky-400 mb-8 border-4 border-white dark:border-gray-900 shadow-xl"
                variants={itemVariants}
                animate={floatAnimation}
            >
                <MapPinOff size={64} strokeWidth={1.5} />
            </motion.div>

            {/* 📝 Messaging */}
            <motion.h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight" variants={itemVariants}>
                Oops! Are you lost?
            </motion.h2>
            <motion.p className="text-gray-600 dark:text-gray-400 max-w-md font-medium mb-10" variants={itemVariants}>
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </motion.p>

            {/* 🔘 Dynamic Action Button */}
            <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {checkingAuth ? (
                    <div className="flex items-center gap-3 px-8 py-4 bg-gray-200 dark:bg-gray-800 rounded-full text-gray-500 font-bold">
                        <Loader2 className="animate-spin" size={20} /> Checking Access...
                    </div>
                ) : (
                    <Link href={dashboardPath} className="relative group overflow-hidden px-10 py-5 bg-sky-500 text-white font-black rounded-full flex items-center gap-3 shadow-2xl shadow-sky-500/30 text-lg transition-all hover:bg-sky-600">
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        
                        {dashboardPath === '/' ? (
                            <Home size={22} className="group-hover:-translate-x-1 transition-transform" />
                        ) : (
                            <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
                        )}
                        Back to My Dashboard
                    </Link>
                )}
            </motion.div>

            {/* 🏠 Simple Home Link */}
            <motion.div className="mt-6" variants={itemVariants}>
                <Link href="/" className="text-sm font-bold text-gray-400 hover:text-sky-500 uppercase tracking-widest">
                    Or return to Homepage
                </Link>
            </motion.div>
        </motion.div>
    );
}