"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import { Users, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

export default function CourseStudents() {
    const { id } = useParams();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, [id]);

    const fetchStudents = async () => {
        try {
            const response = await api.get(`/instructor/courses/${id}/students`);
            if (response.data.success) {
                setStudents(response.data.data);
            }
        } catch (error) {
            console.error("Fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
            <Link href="/instructor/courses" className="text-gray-500 hover:text-sky-500 flex items-center text-sm font-bold transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Back to Courses
            </Link>

            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
                <h1 className="text-3xl font-black dark:text-white flex items-center">
                    <Users className="mr-3 text-indigo-500" size={32} /> Enrolled Students
                </h1>
                <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold">
                    Total: {students.length}
                </span>
            </div>

            <GlassCard className="overflow-hidden border-none shadow-xl bg-white/50 dark:bg-gray-900/50">
                <table className="w-full text-left">
                    <thead className="bg-gray-100/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                        <tr>
                            <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Student Name</th>
                            <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Email</th>
                            <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Enrolled Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                        {loading ? (
                            <tr><td colSpan="3" className="p-10 text-center animate-pulse">Loading Students...</td></tr>
                        ) : students.length === 0 ? (
                            <tr><td colSpan="3" className="p-10 text-center text-gray-500">No students enrolled yet.</td></tr>
                        ) : (
                            students.map(student => (
                                <tr key={student.id} className="hover:bg-white dark:hover:bg-gray-800/50 transition-all">
                                    <td className="p-4 font-bold dark:text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs">
                                            {student.full_name.charAt(0)}
                                        </div>
                                        {student.full_name}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500 flex items-center">
                                        <Mail size={14} className="mr-2 opacity-50" /> {student.email}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(student.enrolled_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </GlassCard>
        </div>
    );
}