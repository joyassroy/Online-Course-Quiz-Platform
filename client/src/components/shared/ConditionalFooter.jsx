"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
    const [isVisible, setIsVisible] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        // ১. লোকাল স্টোরেজ থেকে ইউজার ডাটা চেক করা
        const userData = localStorage.getItem('user'); 
        
        if (userData) {
            try {
                const user = JSON.parse(userData);
                const role = user.role_name;

                // 🚫 কন্ডিশন: যদি এডমিন বা ইনস্ট্রাক্টর হয়, তবে ফুটার লুকানো হবে
                if (role === 'Admin' || role === 'Instructor') {
                    setIsVisible(false);
                } else {
                    // স্টুডেন্ট বা অন্য কারো জন্য ফুটার থাকবে
                    setIsVisible(true);
                }
            } catch (error) {
                // এরর হলে সেফটি হিসেবে ফুটার দেখাবো
                setIsVisible(true);
            }
        } else {
            // কেউ লগইন না থাকলেও (Guest) ফুটার দেখাবে
            setIsVisible(true);
        }
    }, [pathname]); // পাথ চেঞ্জ হলেই চেক করবে

    // কন্ডিশন অনুযায়ী ফুটার রেন্ডার করা
    if (!isVisible) return null;

    return <Footer />;
}