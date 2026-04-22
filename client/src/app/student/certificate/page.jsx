"use client";

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import GlassCard from '@/components/ui/GlassCard';
import { Award, Download, Share2, Calendar, ShieldCheck, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyCertificates() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCert, setSelectedCert] = useState(null);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const res = await api.get('/student/certificates');
            if (res.data.success) {
                setCertificates(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to load certificates.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewCertificate = (cert) => {
        setSelectedCert(cert);
        // সেলিব্রেশন ইফেক্ট!
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[80vh]">
                <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
                <p className="text-gray-500 font-bold animate-pulse">VERIFYING YOUR ACHIEVEMENTS...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-br from-emerald-500 to-teal-600 p-10 rounded-[2.5rem] shadow-xl shadow-emerald-500/20 text-white relative overflow-hidden">
                <div className="relative z-10 space-y-2 text-center md:text-left">
                    <h1 className="text-4xl font-black tracking-tight flex items-center justify-center md:justify-start">
                        <Award className="mr-3 text-emerald-200" size={40} /> Your Achievements
                    </h1>
                    <p className="text-emerald-50 font-medium">All your hard-earned certificates in one place.</p>
                </div>
                <div className="relative z-10 bg-white/20 backdrop-blur-md p-6 rounded-3xl border border-white/30 text-center">
                    <p className="text-xs font-black uppercase tracking-widest mb-1">Total Earned</p>
                    <p className="text-4xl font-black">{certificates.length}</p>
                </div>
                {/* Decorative background circle */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Certificates Grid */}
            {certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {certificates.map((cert, idx) => (
                        <motion.div 
                            key={cert.certificate_code} 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            transition={{ delay: idx * 0.1 }}
                        >
                            <GlassCard className="p-0 overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all group h-full flex flex-col bg-white dark:bg-gray-900">
                                <div className="h-3 bg-emerald-500 w-full"></div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl">
                                            <Award size={24} />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-800">
                                            {cert.category}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-xl font-black dark:text-white mb-2 leading-tight group-hover:text-emerald-500 transition-colors">
                                        {cert.course_title}
                                    </h3>
                                    
                                    <div className="flex items-center text-xs text-gray-500 font-bold mb-6">
                                        <Calendar size={14} className="mr-1.5" /> Issued: {new Date(cert.issued_at).toLocaleDateString()}
                                    </div>

                                    <div className="mt-auto space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Verify Code</span>
                                            <span className="text-xs font-black text-emerald-600 font-mono tracking-tighter">{cert.certificate_code}</span>
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleViewCertificate(cert)}
                                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-all flex items-center justify-center shadow-lg shadow-emerald-500/20"
                                        >
                                            View Certificate <Search size={16} className="ml-2" />
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center bg-gray-50 dark:bg-gray-900/50 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <ShieldCheck size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-black dark:text-white mb-2">No Certificates Yet</h2>
                    <p className="text-gray-500 font-medium">Complete courses and pass quizzes to earn your credentials!</p>
                </div>
            )}

            {/* 🌟 Certificate View Modal (Premium Scrollable) */}
            <AnimatePresence>
                {selectedCert && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            // 🌟 এখানে max-h-[90vh] এবং flex-col দেওয়া হয়েছে যাতে স্ক্রল কাজ করে
                            className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] flex flex-col relative shadow-2xl overflow-hidden"
                        >
                            
                            {/* 📜 Scrollable Certificate Area */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar bg-gray-50/50 dark:bg-gray-900 print:bg-white print:p-0">
                                <div id="printable-certificate" className="p-8 md:p-14 border-[16px] border-emerald-500/10 max-w-3xl mx-auto rounded-[2rem] relative bg-white shadow-sm print:border-emerald-500/20 print:m-0 print:rounded-none print:shadow-none min-h-[600px] flex flex-col justify-center">
                                    
                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                                        <Award size={400} />
                                    </div>

                                    <div className="relative z-10 text-center space-y-4">
                                        <div className="flex justify-center mb-6">
                                            <div className="p-4 bg-emerald-500 text-white rounded-full shadow-xl shadow-emerald-500/20">
                                                <Award size={56} strokeWidth={1.5} />
                                            </div>
                                        </div>
                                        
                                        <h4 className="text-emerald-500 font-black uppercase tracking-[0.4em] text-xs sm:text-sm">Certificate of Completion</h4>
                                        
                                        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mt-8 mb-2 font-serif italic">
                                            {selectedCert.student_name}
                                        </h1>
                                        
                                        <p className="text-gray-500 font-medium tracking-wide">has successfully completed the course</p>
                                        
                                        <h2 className="text-2xl sm:text-3xl font-black text-gray-800 leading-tight mt-4">
                                            {selectedCert.course_title}
                                        </h2>
                                        
                                        <div className="pt-6">
                                            <p className="text-emerald-600 font-black bg-emerald-50 border border-emerald-100 inline-block px-5 py-1.5 rounded-full text-sm">
                                                Passing Score: {Number(selectedCert.score).toFixed(0)}%
                                            </p>
                                        </div>
                                        
                                        <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center border-t border-gray-100 mt-8">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Date</p>
                                                <p className="font-bold text-gray-800">{new Date(selectedCert.completion_date).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Instructor</p>
                                                <p className="font-bold text-gray-800">{selectedCert.instructor_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Verify ID</p>
                                                <p className="font-black text-emerald-600 font-mono text-sm tracking-tighter">{selectedCert.certificate_code}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 🔘 Sticky Footer Actions (প্রিন্ট করার সময় হাইড হয়ে যাবে) */}
                            <div className="bg-white p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100 shrink-0 print:hidden z-20">
                                <button 
                                    onClick={() => window.print()}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg"
                                >
                                    <Download size={18} /> Download PDF
                                </button>
                                <button 
                                    onClick={() => setSelectedCert(null)}
                                    className="w-full sm:w-auto px-8 py-3 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all"
                                >
                                    Close
                                </button>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}