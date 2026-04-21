"use client"; // যেহেতু আমরা এনিমেশন আর স্টেট ব্যবহার করবো

import { useState } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '@/components/shared/AdminSidebar';
import AdminNavbar from '@/components/shared/AdminNavbar';

export default function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen flex">
            {/* 🌟 এনিমেটেড গ্লাস সাইডবার */}
            <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* মেইন কন্টেন্ট এরিয়া */}
            <div className="flex-1 flex flex-col">
                <AdminNavbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <motion.main
                    className="flex-1 p-8"
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