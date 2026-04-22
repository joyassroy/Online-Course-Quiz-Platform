"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/utils/auth';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, BookOpen, PlayCircle, 
    HelpCircle, LogOut, GraduationCap, 
    ChevronLeft, ChevronRight 
} from 'lucide-react';

export default function InstructorSidebar({ isCollapsed, setIsCollapsed }) {
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { name: 'Dashboard', path: '/instructor/dashboard', icon: LayoutDashboard },
        { name: 'Courses', path: '/instructor/courses', icon: BookOpen },
        { name: 'Lessons', path: '/instructor/lessons', icon: PlayCircle },
        { name: 'Quizzes', path: '/instructor/quizzes', icon: HelpCircle },
    ];

    const handleLogout = () => {
        logout();
        toast.success("Logged out!");
        router.push('/');
    };

    return (
        <motion.aside 
            initial={false}
            animate={{ width: isCollapsed ? "80px" : "260px" }}
            className="fixed left-0 top-0 h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col z-50 transition-all duration-300 shadow-xl"
        >
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 overflow-hidden">
                    <GraduationCap className="text-sky-500 shrink-0" size={32} />
                    {!isCollapsed && (
                        <span className="text-xl font-black dark:text-white whitespace-nowrap">
                            Creator<span className="text-sky-500">Studio</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Toggle Button (Floating) */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-24 w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-sky-600 transition-all z-[60]"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Menu Links */}
            <nav className="flex-1 px-3 py-8 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                        <Link 
                            key={item.path} 
                            href={item.path}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all group relative ${
                                isActive 
                                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' 
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-sky-500'
                            }`}
                        >
                            <Icon size={22} className="shrink-0" />
                            {!isCollapsed && (
                                <span className="whitespace-nowrap transition-opacity duration-300">{item.name}</span>
                            )}
                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group relative"
                >
                    <LogOut size={22} className="shrink-0" />
                    {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
                </button>
            </div>
        </motion.aside>
    );
}