"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
    Moon, Sun, UserCircle, LogOut, LayoutDashboard,
    BookOpen, Home, Menu, X
} from 'lucide-react';
import { getCurrentUser, logout } from '@/utils/auth';

export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // 🌟 মোবাইলের মেনুর জন্য
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const currentUser = getCurrentUser();
        setUser(currentUser);
    }, [pathname]);

    const handleLogout = () => {
        logout();
        setUser(null);
        setIsProfileOpen(false);
        setIsMenuOpen(false);
        router.push('/login');
    };

    const studentLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'My Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { name: 'Browse Courses', path: '/student/courses', icon: BookOpen },
    ];

    if (!mounted) {
        return <div className="h-16 border-b bg-white dark:bg-gray-950"></div>;
    }

    return (
        <nav className="fixed w-full z-[100] top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* 🌟 Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                                Study<span className="text-sky-500 underline decoration-sky-500/30">Anime</span>
                            </span>
                        </Link>
                    </div>

                    {/* 🌟 Desktop Links (For Student) - Hidden on Mobile */}
                    {user && user.role_name === 'Student' && (
                        <div className="hidden md:flex items-center space-x-6">
                            {studentLinks.map((link) => (
                                <Link key={link.path} href={link.path}>
                                    <span className={`text-sm font-bold transition-colors cursor-pointer flex items-center ${pathname === link.path ? 'text-sky-500' : 'text-gray-600 dark:text-gray-300 hover:text-sky-500'
                                        }`}>
                                        <link.icon size={16} className="mr-1.5" />
                                        {link.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* 🌟 Right Side (Theme Toggle + Profile + Mobile Toggle) */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {user ? (
                            <div className="relative flex items-center gap-2">
                                {/* Profile Button */}
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center p-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:border-sky-300 transition-all"
                                >
                                    <UserCircle size={24} className="text-sky-500" />
                                </button>

                                {/* 🌟 Hamburger Button (Only visible on Mobile) */}
                                {user.role_name === 'Student' && (
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                    >
                                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                    </button>
                                )}

                                {/* Profile Dropdown */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl shadow-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden ring-1 ring-black/5">
                                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                                            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">Signed in as</p>
                                            <p className="text-sm font-black text-gray-900 dark:text-white truncate">{user.full_name}</p>
                                        </div>
                                        <div className="p-2">
                                            {/* 🌟 Dynamic Dashboard Routing Based on Role */}
                                            <Link
                                                href={
                                                    user.role_name === 'Admin' ? '/admin/dashboard' :
                                                        user.role_name === 'Instructor' ? '/instructor/dashboard' :
                                                            '/student/dashboard'
                                                }
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <div className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg cursor-pointer">
                                                    <LayoutDashboard size={16} className="mr-3 text-sky-500" /> Dashboard
                                                </div>
                                            </Link>
                                            <button onClick={handleLogout} className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer mt-1">
                                                <LogOut size={16} className="mr-3" /> Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link href="/login" className="text-sm font-bold text-gray-600 dark:text-gray-400 px-3 py-2 hover:text-sky-500 transition-colors">Login</Link>
                                <Link href="/register" className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-sky-500/20 whitespace-nowrap">Sign Up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 📱 Mobile Menu Panel (Shows when Hamburger is clicked) */}
            {isMenuOpen && user && user.role_name === 'Student' && (
                <div className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 px-4 py-4 space-y-2 shadow-2xl">
                    {studentLinks.map((link) => (
                        <Link
                            key={link.path}
                            href={link.path}
                            onClick={() => setIsMenuOpen(false)} // 🌟 লিংক ক্লিক করলে মেনু অটোমেটিক বন্ধ হয়ে যাবে
                        >
                            <span className={`flex items-center px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${pathname === link.path
                                    ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-500 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-sky-500'
                                }`}>
                                <link.icon size={18} className="mr-3" />
                                {link.name}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}