"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import GlassCard from '@/components/ui/GlassCard';
import { Clock, ArrowRight, ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TakeQuiz() {
    const { courseId } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [quizData, setQuizData] = useState(null);
    const [questions, setQuestions] = useState([]);
    
    // Quiz State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]); // [{ question_id: 1, selected_option: 2 }]
    const [timeLeft, setTimeLeft] = useState(null); // null means not loaded yet
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null); // After submission

    const timerRef = useRef(null);

    useEffect(() => {
        fetchQuiz();
        return () => clearInterval(timerRef.current); // Cleanup on unmount
    }, [courseId]);

    const fetchQuiz = async () => {
        try {
            const res = await api.get(`/student/quiz/${courseId}`);
            if (res.data.success) {
                setQuizData(res.data.data.quiz);
                setQuestions(res.data.data.questions);
                
                // 🌟 Timer Fix: Set time limit from backend (minutes to seconds)
                const totalSeconds = parseInt(res.data.data.quiz.time_limit_minutes) * 60;
                setTimeLeft(totalSeconds);
            }
        } catch (error) {
            toast.error("Failed to load quiz.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // 🌟 Timer Logic
    useEffect(() => {
        if (timeLeft !== null && timeLeft > 0 && !result && !isSubmitting) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleSubmitQuiz(); // Auto submit when time is up
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [timeLeft, result, isSubmitting]);

    // Timer Formatting (Safe from NaN)
    const formatTime = (seconds) => {
        if (seconds === null || isNaN(seconds)) return "00:00";
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // 🌟 Handle Option Selection
    const handleSelectOption = (questionId, optionNumber) => {
        setAnswers((prev) => {
            const existing = prev.find(a => a.question_id === questionId);
            if (existing) {
                return prev.map(a => a.question_id === questionId ? { ...a, selected_option: optionNumber } : a);
            }
            return [...prev, { question_id: questionId, selected_option: optionNumber }];
        });
    };

    
    // 🌟 Submit Quiz & Auto Generate Certificate
    const handleSubmitQuiz = async () => {
        if (isSubmitting || result) return;
        setIsSubmitting(true);
        clearInterval(timerRef.current);
        
        const toastId = toast.loading("Submitting your answers...");

        try {
            const payload = {
                quiz_id: quizData.id,
                answers: answers
            };

            const res = await api.post('/student/quiz/submit', payload);

            if (res.data.success) {
                toast.success("Quiz submitted successfully!", { id: toastId });
                setResult(res.data.results);

                // 🎊 যদি পাস করে, তাহলে শুধু কনফেটি অ্যানিমেশন হবে
                // (সার্টিফিকেট ব্যাকএন্ড নিজেই বানিয়ে ডাটাবেসে সেভ করে নিয়েছে!)
                if (res.data.results.is_passed) {
                    confetti({ 
                        particleCount: 200, 
                        spread: 90, 
                        origin: { y: 0.5 }, 
                        colors: ['#10B981', '#38BDF8'] 
                    });
                }
            }
        } catch (error) {
            toast.error("Submission failed. Try again.", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[80vh]">
                <Loader2 className="animate-spin text-sky-500 mb-4" size={40} />
                <p className="text-gray-500 font-bold animate-pulse">Loading Assessment...</p>
            </div>
        );
    }

    if (!quizData || questions.length === 0) {
        return (
            <div className="text-center py-20">
                <AlertCircle size={48} className="mx-auto text-gray-500 mb-4" />
                <h2 className="text-2xl font-bold dark:text-white">Quiz Unavailable</h2>
                <Link href="/student/dashboard" className="text-sky-500 hover:underline mt-4 inline-block">Return to Dashboard</Link>
            </div>
        );
    }

    // ================= RESULT SCREEN =================
    if (result) {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
                <GlassCard className="p-8 md:p-12 text-center shadow-2xl bg-white dark:bg-gray-900 border-none">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 shadow-lg shadow-black/5">
                        {result.is_passed ? (
                            <CheckCircle size={56} className="text-emerald-500" />
                        ) : (
                            <AlertCircle size={56} className="text-red-500" />
                        )}
                    </div>
                    
                    <h1 className="text-4xl font-black dark:text-white mb-2">
                        {result.is_passed ? "Congratulations!" : "Keep Trying!"}
                    </h1>
                    <p className="text-gray-500 font-medium mb-8">
                        You scored <span className={`font-black ${result.is_passed ? 'text-emerald-500' : 'text-red-500'}`}>{result.score_percentage}%</span>. 
                        The passing score is {quizData.pass_percentage}%.
                    </p>

                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
                            <p className="text-xs font-bold text-gray-500 uppercase">Correct</p>
                            <p className="text-2xl font-black text-emerald-500">{result.correct_answers} / {result.total_questions}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
                            <p className="text-xs font-bold text-gray-500 uppercase">Status</p>
                            <p className={`text-2xl font-black ${result.is_passed ? 'text-emerald-500' : 'text-red-500'}`}>
                                {result.is_passed ? "PASSED" : "FAILED"}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Link href="/student/dashboard">
                            <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl transition-all">
                                Go to Dashboard
                            </button>
                        </Link>
                        {result.is_passed && (
                            <Link href="/student/certificate">
                                <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center">
                                    Claim Certificate <ArrowRight size={18} className="ml-2" />
                                </button>
                            </Link>
                        )}
                    </div>
                </GlassCard>
            </div>
        );
    }

    // ================= QUIZ SCREEN =================
    const currentQuestion = questions[currentIndex];
    
    // 🌟 Blank Options Fix: Mapping database fields directly to an array
    const currentOptions = [
        { id: 1, text: currentQuestion.option_1 },
        { id: 2, text: currentQuestion.option_2 },
        { id: 3, text: currentQuestion.option_3 },
        { id: 4, text: currentQuestion.option_4 }
    ];

    const currentAnswer = answers.find(a => a.question_id === currentQuestion.id)?.selected_option;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* Header: Progress & Timer */}
            <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div>
                    <p className="text-sm font-bold text-gray-500">
                        Question <span className="text-sky-500">{currentIndex + 1}</span> of {questions.length}
                    </p>
                </div>
                
                <div className={`flex items-center px-4 py-2 rounded-xl font-black text-sm tracking-widest border ${
                    timeLeft < 60 ? 'bg-red-50 text-red-500 border-red-200 animate-pulse' : 'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-900/20 dark:border-sky-800/50'
                }`}>
                    <Clock size={16} className="mr-2" /> {formatTime(timeLeft)}
                </div>
            </div>

            {/* Question Card */}
            <GlassCard className="p-6 md:p-10 shadow-xl bg-white dark:bg-gray-900 border-none relative overflow-hidden">
                <h2 className="text-2xl md:text-3xl font-black dark:text-white mb-8 leading-snug">
                    {currentQuestion.question_text}
                </h2>

                <div className="space-y-4">
                    {currentOptions.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                            className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center group ${
                                currentAnswer === opt.id 
                                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' 
                                    : 'border-gray-200 dark:border-gray-700 hover:border-sky-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                        >
                            <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center shrink-0 ${
                                currentAnswer === opt.id ? 'border-sky-500' : 'border-gray-300 dark:border-gray-600 group-hover:border-sky-300'
                            }`}>
                                {currentAnswer === opt.id && <div className="w-2.5 h-2.5 bg-sky-500 rounded-full" />}
                            </div>
                            {/* 🌟 This is where the text renders */}
                            <span className={`text-base font-medium ${currentAnswer === opt.id ? 'text-sky-900 dark:text-sky-100 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                                {opt.text}
                            </span>
                        </button>
                    ))}
                </div>
            </GlassCard>

            {/* Navigation Footer */}
            <div className="flex justify-between items-center">
                <button 
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="px-6 py-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-bold rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 disabled:opacity-50 flex items-center hover:bg-gray-50 transition-all"
                >
                    <ArrowLeft size={18} className="mr-2" /> Previous
                </button>

                {currentIndex === questions.length - 1 ? (
                    <button 
                        onClick={handleSubmitQuiz}
                        disabled={isSubmitting || answers.length < questions.length}
                        className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-xl shadow-lg shadow-sky-500/30 transition-all disabled:opacity-50 flex items-center"
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin mr-2" /> : <CheckCircle size={18} className="mr-2" />}
                        Submit Quiz
                    </button>
                ) : (
                    <button 
                        onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                        className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center"
                    >
                        Next <ArrowRight size={18} className="ml-2" />
                    </button>
                )}
            </div>
        </div>
    );
}