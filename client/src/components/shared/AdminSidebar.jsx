"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, BookOpen, CheckSquare,ShieldCheck } from 'lucide-react';

export default function AdminSidebar({ isOpen }) {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Users', icon: Users, path: '/admin/users' },
        { name: 'Courses', icon: BookOpen, path: '/admin/courses' },
        { name: 'Roles & Permissions', icon: ShieldCheck, path: '/admin/roles' },
        
    ];

    return (
        <motion.aside
            initial={false}
            animate={{ width: isOpen ? 256 : 80 }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-200 dark:border-gray-800 min-h-[calc(100vh-64px)] flex flex-col overflow-hidden"
        >
            <div className="flex-1 py-6 flex flex-col gap-2 px-3">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                        <Link key={item.name} href={item.path}>
                            <div className={`flex items-center px-3 py-3 rounded-xl cursor-pointer transition-all ${
                                isActive 
                                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-sky-50 dark:hover:bg-gray-800 hover:text-sky-600 dark:hover:text-sky-400'
                            }`}>
                                <Icon size={22} className="min-w-[22px]" />
                                <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                                    {item.name}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </motion.aside>
    );
}