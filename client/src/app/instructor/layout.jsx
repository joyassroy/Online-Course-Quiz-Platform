"use client";

import { useState } from 'react';
import InstructorSidebar from '@/components/shared/InstructorSidebar'; 
import { motion } from 'framer-motion';

export default function InstructorLayout({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-500 pt-16 pb-20 md:pb-0">
            
            {/* 🌟 Sidebar Component */}
            <InstructorSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* 💻 Desktop Main Content Area (Hidden on Mobile) */}
            <motion.main 
                initial={false}
                animate={{ 
                    marginLeft: isCollapsed ? "80px" : "260px",
                    width: `calc(100% - ${isCollapsed ? "80px" : "260px"})`
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="hidden md:block flex-1 p-4 md:p-8 overflow-x-hidden" 
            >
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </motion.main>

            {/* 📱 Mobile Main Content Area (Visible ONLY on Mobile) */}
            {/* 🌟 এখানে কোনো marginLeft নেই, তাই পুরো স্ক্রিন জুড়েই কন্টেন্ট দেখাবে */}
            <main className="md:hidden flex-1 p-4 w-full overflow-x-hidden">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
            
        </div>
    );
}