"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import { HelpCircle, Save, PlusCircle, Trash2, ArrowLeft, Users, Settings, ListChecks } from 'lucide-react';
import Link from 'next/link';

export default function ManageQuiz() {
    const { id: courseId } = useParams();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('settings'); // settings, questions, attempts
    
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [attempts, setAttempts] = useState([]);

    // Forms
    const [quizForm, setQuizForm] = useState({ title: 'Final Assessment', time_limit_minutes: 30, pass_percentage: 60, max_attempts: 3 });
    const [qForm, setQForm] = useState({ question_text: '', option_1: '', option_2: '', option_3: '', option_4: '', correct_option: 1 });

    const fetchAttempts = async (quizId) => {
        const res = await api.get(`/instructor/quizzes/${quizId}/attempts`);
        if (res.data.success) setAttempts(res.data.data);
    };

    const fetchQuizData = async () => {
        try {
            const res = await api.get(`/instructor/courses/${courseId}/quiz`);
            if (res.data.data) {
                setQuiz(res.data.data);
                setQuizForm({
                    title: res.data.data.title, time_limit_minutes: res.data.data.time_limit_minutes, 
                    pass_percentage: res.data.data.pass_percentage, max_attempts: res.data.data.max_attempts
                });
                setQuestions(res.data.data.questions || []);
                fetchAttempts(res.data.data.id);
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchQuizData();
    }, [courseId]);

    // 🌟 Save Quiz
    const handleSaveQuiz = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/instructor/courses/${courseId}/quiz`, quizForm);
            toast.success("Quiz Settings Saved!");
            fetchQuizData(); // Reload
        } catch (error) { toast.error("Failed to save."); }
    };

    // 🌟 Add Question
    const handleAddQuestion = async (e) => {
        e.preventDefault();
        if (!quiz) return toast.error("Please save Quiz Settings first!");
        try {
            await api.post(`/instructor/quizzes/${quiz.id}/questions`, qForm);
            toast.success("Question Added!");
            setQForm({ question_text: '', option_1: '', option_2: '', option_3: '', option_4: '', correct_option: 1 });
            fetchQuizData();
        } catch (error) { toast.error("Failed to add question."); }
    };

    // 🌟 Delete Question
    const handleDeleteQuestion = async (qId) => {
        if (!confirm("Delete this question?")) return;
        await api.delete(`/instructor/questions/${qId}`);
        fetchQuizData();
    };

    if (loading) return <div className="p-10 text-center animate-pulse font-bold text-emerald-500">Loading Quiz Builder...</div>;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
            <Link href="/instructor/quizzes" className="text-gray-500 hover:text-emerald-500 flex items-center text-sm font-bold transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Back to Course List
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
                <h1 className="text-3xl font-black dark:text-white flex items-center">
                    <HelpCircle className="mr-3 text-emerald-500" size={32} /> Quiz Builder
                </h1>
                
                {/* 🌟 TABS */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <button onClick={() => setActiveTab('settings')} className={`flex items-center px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'settings' ? 'bg-white dark:bg-gray-700 shadow text-emerald-500' : 'text-gray-500'}`}><Settings size={16} className="mr-2"/> Settings</button>
                    <button onClick={() => setActiveTab('questions')} disabled={!quiz} className={`flex items-center px-4 py-2 text-sm font-bold rounded-lg transition-all ${!quiz ? 'opacity-50 cursor-not-allowed' : activeTab === 'questions' ? 'bg-white dark:bg-gray-700 shadow text-emerald-500' : 'text-gray-500'}`}><ListChecks size={16} className="mr-2"/> Questions ({questions.length})</button>
                    <button onClick={() => setActiveTab('attempts')} disabled={!quiz} className={`flex items-center px-4 py-2 text-sm font-bold rounded-lg transition-all ${!quiz ? 'opacity-50 cursor-not-allowed' : activeTab === 'attempts' ? 'bg-white dark:bg-gray-700 shadow text-emerald-500' : 'text-gray-500'}`}><Users size={16} className="mr-2"/> Results</button>
                </div>
            </div>

            {/* ================= TAB: SETTINGS ================= */}
            {activeTab === 'settings' && (
                <GlassCard className="p-6 border-none shadow-xl bg-white/50 dark:bg-gray-900/50">
                    <form onSubmit={handleSaveQuiz} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase mb-2">Quiz Title</label>
                            <input type="text" required value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase mb-2">Time Limit (Min)</label>
                                <input type="number" required value={quizForm.time_limit_minutes} onChange={e => setQuizForm({...quizForm, time_limit_minutes: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase mb-2">Pass %</label>
                                <input type="number" required value={quizForm.pass_percentage} onChange={e => setQuizForm({...quizForm, pass_percentage: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase mb-2">Max Attempts</label>
                                <input type="number" required value={quizForm.max_attempts} onChange={e => setQuizForm({...quizForm, max_attempts: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                            </div>
                        </div>
                        <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-all flex items-center justify-center">
                            <Save size={20} className="mr-2" /> {quiz ? 'Update Quiz Settings' : 'Create Quiz'}
                        </button>
                    </form>
                </GlassCard>
            )}

            {/* ================= TAB: QUESTIONS ================= */}
            {activeTab === 'questions' && quiz && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Question Form */}
                    <GlassCard className="p-6 border-none shadow-xl bg-white/50 dark:bg-gray-900/50 lg:col-span-1 h-max sticky top-6">
                        <h3 className="font-black dark:text-white mb-4 flex items-center"><PlusCircle size={18} className="mr-2 text-emerald-500"/> Add MCQ</h3>
                        <form onSubmit={handleAddQuestion} className="space-y-4">
                            <textarea required placeholder="Write your question here..." value={qForm.question_text} onChange={e => setQForm({...qForm, question_text: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" rows="3"></textarea>
                            
                            {[1,2,3,4].map(num => (
                                <div key={num} className="flex items-center gap-2">
                                    <input type="radio" name="correct" checked={qForm.correct_option == num} onChange={() => setQForm({...qForm, correct_option: num})} className="w-4 h-4 accent-emerald-500" title="Mark as correct answer" />
                                    <input type="text" required placeholder={`Option ${num}`} value={qForm[`option_${num}`]} onChange={e => setQForm({...qForm, [`option_${num}`]: e.target.value})} className={`w-full px-3 py-2 text-sm rounded-lg outline-none border transition-all ${qForm.correct_option == num ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20' : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`} />
                                </div>
                            ))}
                            <button type="submit" className="w-full py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-all">Save Question</button>
                        </form>
                    </GlassCard>

                    {/* Question List */}
                    <div className="lg:col-span-2 space-y-4">
                        {questions.length === 0 ? <div className="p-10 text-center bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500">No questions added yet.</div> : 
                        questions.map((q, idx) => (
                            <GlassCard key={q.id} className="p-5 border-none shadow-md bg-white dark:bg-gray-800 flex justify-between gap-4">
                                <div>
                                    <h4 className="font-bold dark:text-white mb-3"><span className="text-emerald-500">Q{idx+1}.</span> {q.question_text}</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div className={`p-2 rounded ${q.correct_option === 1 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 font-bold' : 'bg-gray-50 dark:bg-gray-900'}`}>A. {q.option_1}</div>
                                        <div className={`p-2 rounded ${q.correct_option === 2 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 font-bold' : 'bg-gray-50 dark:bg-gray-900'}`}>B. {q.option_2}</div>
                                        <div className={`p-2 rounded ${q.correct_option === 3 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 font-bold' : 'bg-gray-50 dark:bg-gray-900'}`}>C. {q.option_3}</div>
                                        <div className={`p-2 rounded ${q.correct_option === 4 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 font-bold' : 'bg-gray-50 dark:bg-gray-900'}`}>D. {q.option_4}</div>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-400 hover:text-red-600 transition-all self-start"><Trash2 size={18}/></button>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            )}

            {/* ================= TAB: ATTEMPTS ================= */}
            {activeTab === 'attempts' && quiz && (
                <GlassCard className="overflow-hidden border-none shadow-xl bg-white/50 dark:bg-gray-900/50">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase">Student</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase">Date</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase">Score</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {attempts.length === 0 ? <tr><td colSpan="4" className="p-8 text-center text-gray-500">No attempts yet.</td></tr> : 
                            attempts.map(atm => (
                                <tr key={atm.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="p-4 font-bold dark:text-white">{atm.full_name}<br/><span className="text-xs font-normal text-gray-500">{atm.email}</span></td>
                                    <td className="p-4 text-sm text-gray-500">{new Date(atm.attempt_date).toLocaleString()}</td>
                                    <td className="p-4 font-black">{atm.score}%</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${atm.is_passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            {atm.is_passed ? 'Passed' : 'Failed'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </GlassCard>
            )}
        </div>
    );
}