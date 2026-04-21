"use client";
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = "" }) {
    return (
        <motion.div
            // .glass এর বদলে সরাসরি ক্লাসগুলো দিয়ে দিলাম
            className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}