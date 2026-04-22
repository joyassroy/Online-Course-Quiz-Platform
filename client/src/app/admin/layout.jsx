"use client"; // যেহেতু আমরা এনিমেশন আর স্টেট ব্যবহার করবো

import { useState } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '@/components/shared/AdminSidebar';
import AdminNavbar from '@/components/shared/AdminNavbar';

export default function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        // 🌟 Magic Fix: flex-col-reverse দিয়ে মোবাইলে সাইডবার নিচে, আর md:flex-row দিয়ে পিসিতে বামে
        <div className="min-h-screen flex flex-col-reverse md:flex-row">
            
            {/* 🌟 এনিমেটেড গ্লাস সাইডবার (তোমার দেওয়া পারফেক্ট লোকেশন) */}
            <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* মেইন কন্টেন্ট এরিয়া */}
            <div className="flex-1 flex flex-col min-w-0">
                <AdminNavbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <motion.main
                    className="flex-1 p-4 md:p-8" // 🌟 মোবাইলে p-4 আর পিসিতে তোমার অরিজিনাল p-8
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {children}
                </motion.main>
            </div>
            
        </div>
    );
}