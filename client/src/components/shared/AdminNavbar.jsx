"use client";

import { Menu } from 'lucide-react';

export default function AdminNavbar({ toggleSidebar }) {
    return (
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4 flex items-center sticky top-0 z-10">
            <button 
                onClick={toggleSidebar} 
                className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 border border-gray-200 dark:border-gray-700 transition-colors"
            >
                <Menu size={20} />
            </button>
            <h2 className="ml-4 text-lg font-bold text-gray-800 dark:text-white">
                Admin Control Panel
            </h2>
        </div>
    );
}