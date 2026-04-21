"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    BookOpen, 
    PlayCircle, 
    HelpCircle, 
    LogOut,
    GraduationCap
} from 'lucide-react';

export default function InstructorSidebar() {
    const pathname = usePathname();

    // 🌟 ফিউচার প্ল্যান: এখানে মেনুগুলো Array তে সাজিয়ে দিলাম। 
    // ভবিষ্যতে নতুন পেজ আসলে জাস্ট এই Array তে একটা অবজেক্ট ঢুকিয়ে দেবে!
    const menuItems = [
        { name: 'Dashboard', path: '/instructor/dashboard', icon: LayoutDashboard },
        { name: 'Course Management', path: '/instructor/courses', icon: BookOpen },
        { name: 'Lesson Management', path: '/instructor/lessons', icon: PlayCircle },
        { name: 'Quiz Management', path: '/instructor/quizzes', icon: HelpCircle },
    ];

    return (
        <aside className="w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all">
            
            {/* Logo / Brand Area */}
            <div className="h-20 flex items-center px-8 border-b border-gray-200 dark:border-gray-800">
                <GraduationCap className="text-sky-500 mr-3" size={28} />
                <h2 className="text-xl font-black tracking-tight dark:text-white">
                    Creator<span className="text-sky-500">Studio</span>
                </h2>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                <p className="px-4 text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Main Menu</p>
                
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    // 🌟 Active Route Detection Logic
                    const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);

                    return (
                        <Link 
                            key={item.path} 
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                                isActive 
                                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' 
                                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-sky-500'
                            }`}
                        >
                            <Icon size={20} className={isActive ? 'text-white' : ''} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section (Profile / Logout) */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
}