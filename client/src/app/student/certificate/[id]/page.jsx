"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import { Award, Download, Share2, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CertificateView() {
    const { id: courseId } = useParams();
    const router = useRouter();
    const [certData, setCertData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertData = async () => {
            try {
                // তোমার ব্যাকএন্ডের সার্টিফিকেট ডাটা এপিআই
                const response = await api.get(`/student/certificate/${courseId}`);
                if (response.data.success) {
                    setCertData(response.data.data);
                }
            } catch (err) {
                console.error("Certificate error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCertData();
    }, [courseId]);

    const handlePrint = () => {
        window.print(); // সিম্পল ব্রাউজার প্রিন্ট দিয়ে PDF সেভ করার অপশন
    };

    if (loading) return <div className="flex justify-center items-center h-screen animate-pulse dark:text-white">Validating achievement...</div>;
    if (!certData) return <div className="text-center py-20">Certificate not found. Complete the course first!</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 py-12 px-4 print:p-0 print:bg-white">
            
            {/* 🌟 Controls (Hide on Print) */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <Link href="/student/dashboard">
                    <button className="flex items-center text-sm font-bold text-gray-500 hover:text-sky-500 transition-colors">
                        <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
                    </button>
                </Link>
                <div className="flex gap-4">
                    <button 
                        onClick={handlePrint}
                        className="flex items-center px-6 py-2.5 bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all"
                    >
                        <Download size={18} className="mr-2" /> Download PDF
                    </button>
                </div>
            </div>

            {/* 📜 The Certificate Design */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border-[12px] border-double border-sky-500/30 p-1 md:p-2 shadow-2xl relative overflow-hidden"
            >
                {/* Anime Background Patterns */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                <div className="border border-gray-100 dark:border-gray-800 p-8 md:p-16 text-center relative z-10">
                    
                    {/* Header */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <Award size={80} className="text-sky-500 mb-2" />
                            <div className="absolute inset-0 animate-ping opacity-20 bg-sky-500 rounded-full"></div>
                        </div>
                    </div>

                    <h1 className="text-xs font-black tracking-[0.3em] uppercase text-sky-600 dark:text-sky-400 mb-4">
                        Certificate of Completion
                    </h1>
                    
                    <p className="text-gray-500 dark:text-gray-400 font-serif italic mb-8">
                        This is to certify that
                    </p>

                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">
                        {certData.student_name}
                    </h2>

                    <p className="max-w-xl mx-auto text-gray-600 dark:text-gray-400 leading-relaxed mb-10">
                        has successfully completed the requirements for the course <br />
                        <span className="font-bold text-gray-900 dark:text-white text-xl underline decoration-sky-500/30">
                            {certData.course_title}
                        </span> <br />
                        on <span className="font-bold">{new Date(certData.completion_date).toLocaleDateString()}</span> with a performance score of <span className="text-sky-500 font-bold">{certData.score}%</span>.
                    </p>

                    {/* Signatures */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 items-end">
                        <div className="space-y-2">
                            <div className="border-b-2 border-gray-200 dark:border-gray-700 w-48 mx-auto py-2">
                                <span className="font-serif italic text-gray-400">StudyAnime Team</span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Authorized Platform</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <ShieldCheck size={48} className="text-emerald-500 mb-2 opacity-50" />
                            <p className="text-[8px] font-mono text-gray-400 break-all uppercase">
                                Verified ID: {certData.certificate_hash || 'ST-CERT-882190'}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Print Styles (Tailwind doesn't handle all print CSS well) */}
            <style jsx global>{`
                @media print {
                    body { background: white !important; }
                    nav { display: none !important; }
                    .print\:hidden { display: none !important; }
                }
            `}</style>
        </div>
    );
}