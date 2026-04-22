"use client";

import { useState } from 'react';
import InstructorSidebar from '@/components/shared/InstructorSidebar'; // পাথ ঠিক করে নিও
import { motion } from 'framer-motion';

export default function InstructorLayout({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-500">
            
            {/* Sidebar Component */}
            <InstructorSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* Main Content Area */}
            <motion.main 
                initial={false}
                animate={{ 
                    marginLeft: isCollapsed ? "80px" : "260px",
                    width: `calc(100% - ${isCollapsed ? "80px" : "260px"})`
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex-1 min-h-screen p-6 md:p-10"
            >
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </motion.main>
        </div>
    );
}