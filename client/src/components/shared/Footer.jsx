"use client";

import Link from 'next/link';
import { BookOpen, GraduationCap } from 'lucide-react';

// সোশ্যাল আইকনগুলোর জন্য সিম্পল SVG কম্পোনেন্ট
const SocialIcons = {
    Github: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
    ),
    Linkedin: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
    ),
    X: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16H20L8.267 4z"/><path d="M4 20l6.768-6.768m2.46-2.46L20 4"/></svg>
    ),
    Mail: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
    )
};

export default function Footer() {
    return (
        <footer className="relative mt-20 border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1 space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-sky-500 p-1.5 rounded-lg">
                                <GraduationCap className="text-white" size={24} />
                            </div>
                            <span className="text-2xl font-black tracking-tighter dark:text-white">
                                OC<span className="text-sky-500">QP</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
                            Empowering learners worldwide with expert-led courses and interactive quizzes.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-gray-900 dark:text-white font-bold mb-6">Platform</h4>
                        <ul className="space-y-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
                            <li><Link href="/student/courses" className="hover:text-sky-500 transition-colors">Explore Courses</Link></li>
                            <li><Link href="/student/dashboard" className="hover:text-sky-500 transition-colors">Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-gray-900 dark:text-white font-bold mb-6">Resources</h4>
                        <ul className="space-y-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
                            <li><Link href="#" className="hover:text-sky-500 transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-sky-500 transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Social Section */}
                    <div className="space-y-6">
                        <h4 className="text-gray-900 dark:text-white font-bold mb-2">Connect With Us</h4>
                        <div className="flex gap-4">
                            <a href="https://github.com/joyassroy" target="_blank" className="p-2 bg-gray-50 dark:bg-gray-900 rounded-xl hover:text-sky-500 transition-all border border-transparent hover:border-sky-500/20"><SocialIcons.Github /></a>
                            <a href="#" className="p-2 bg-gray-50 dark:bg-gray-900 rounded-xl hover:text-sky-500 transition-all border border-transparent hover:border-sky-500/20"><SocialIcons.Linkedin /></a>
                            <a href="#" className="p-2 bg-gray-50 dark:bg-gray-900 rounded-xl hover:text-sky-500 transition-all border border-transparent hover:border-sky-500/20"><SocialIcons.X /></a>
                            <a href="#" className="p-2 bg-gray-50 dark:bg-gray-900 rounded-xl hover:text-sky-500 transition-all border border-transparent hover:border-sky-500/20"><SocialIcons.Mail /></a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <p>© {new Date().getFullYear()} OCQP Platform. All rights reserved.</p>
                    <p>Designed with ❤️ by Joyassroy</p>
                </div>
            </div>
        </footer>
    );
}