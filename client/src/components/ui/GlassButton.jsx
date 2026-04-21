"use client";
import { motion } from 'framer-motion';

export default function GlassButton({ children, onClick, className = "" }) {
    return (
        <motion.button
            onClick={onClick}
            // .glass এবং গ্লো ইফেক্ট সরাসরি এখানে
            className={`bg-white/10 backdrop-blur-md border border-white/20 hover:border-sky-300/60 hover:ring-2 hover:ring-sky-200/40 transition-all duration-300 rounded-xl px-6 py-2.5 font-semibold text-sky-800 ${className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
            {children}
        </motion.button>
    );
}