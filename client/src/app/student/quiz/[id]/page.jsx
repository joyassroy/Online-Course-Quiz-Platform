"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';
import GlassCard from '@/components/ui/GlassCard';
import { Clock, ChevronRight, AlertCircle, Trophy, Home } from 'lucide-react';

export default function QuizEngine() {
    const { id: courseId } = useParams();
    const router = useRouter();

    // 🌟 States
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🌟 Fetch Quiz Data from Backend
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await api.get(`/student/quiz/${courseId}`);
                if (response.data.success) {
                    const quizData = response.data.data;
                    setQuiz(quizData);
                    setQuestions(quizData.questions);
                    setTimeLeft(quizData.time_limit * 60); // Minutes to seconds [cite: 81]
                }
            } catch (error) {
                console.error("Error loading quiz:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [courseId]);

    // 🌟 Auto-Submit Function 
    const submitQuiz = useCallback(async () => {
        if (isFinished) return;
        setIsFinished(true);
        try {
            const response = await api.post(`/student/quiz/submit`, {
                course_id: courseId,
                answers: selectedAnswers
            });
            if (response.data.success) {
                setResult(response.data.data); // Result: Score, Pass/Fail 
            }
        } catch (error) {
            console.error("Submission failed:", error);
        }
    }, [courseId, selectedAnswers, isFinished]);

    // 🌟 Countdown Timer Logic 
    useEffect(() => {
        if (timeLeft === null || isFinished) return;
        if (timeLeft === 0) {
            submitQuiz();
            return;
        }
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isFinished, submitQuiz]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) return <div className="flex justify-center items-center h-screen dark:text-white">Loading Quest...</div>;
    if (!quiz) return <div className="text-center py-20">Quiz not found for this course.</div>;

    // 🏆 Result Screen View 
    if (result) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4 text-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <GlassCard className="p-10">
                        <Trophy size={80} className={`mx-auto mb-6 ${result.passed ? 'text-amber-500' : 'text-gray-400'}`} />
                        <h2 className="text-4xl font-black mb-2 dark:text-white">
                            {result.passed ? "Congratulations!" : "Keep Trying!"}
                        </h2>
                        <p className="text-gray-500 mb-8">You scored {result.score}% in {quiz.title}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-2xl">
                                <p className="text-xs font-bold text-sky-600 uppercase">Correct Answers</p>
                                <p className="text-2xl font-black dark:text-white">{result.correct_count}</p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl">
                                <p className="text-xs font-bold text-purple-600 uppercase">Status</p>
                                <p className={`text-2xl font-black ${result.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {result.passed ? "PASSED" : "FAILED"}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {result.passed && (
                                <button className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30">
                                    Download Certificate
                                </button>
                            )}
                            <button onClick={() => router.push('/student/dashboard')} className="flex items-center justify-center text-gray-500 hover:text-sky-500 font-bold py-2 transition-colors">
                                <Home size={18} className="mr-2" /> Back to Dashboard
                            </button>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        );
    }

    // 📝 Quiz Question View 
    const currentQuestion = questions[currentIdx];

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 flex flex-col min-h-screen">
            {/* Header: Progress & Timer  */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-xl font-bold dark:text-white line-clamp-1">{quiz.title}</h1>
                    <p className="text-sm text-gray-500">Question {currentIdx + 1} of {questions.length}</p>
                </div>
                <div className={`flex items-center px-4 py-2 rounded-xl border font-mono font-bold ${timeLeft < 60 ? 'bg-red-50 text-red-500 border-red-200 animate-pulse' : 'bg-sky-50 text-sky-600 border-sky-100'}`}>
                    <Clock size={18} className="mr-2" /> {formatTime(timeLeft)}
                </div>
            </div>

            {/* Question Card  */}
            <AnimatePresence mode="wait">
                <motion.div key={currentIdx} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                    <GlassCard className="p-8 dark:bg-gray-800/40">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                            {currentQuestion?.question_text}
                        </h2>

                        <div className="grid grid-cols-1 gap-4">
                            {['option_a', 'option_b', 'option_c', 'option_d'].map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: opt })}
                                    className={`p-5 rounded-2xl text-left border-2 transition-all font-medium flex justify-between items-center ${
                                        selectedAnswers[currentQuestion.id] === opt
                                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                                        : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {currentQuestion[opt]}
                                    {selectedAnswers[currentQuestion.id] === opt && <div className="w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>}
                                </button>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>
            </AnimatePresence>

            {/* Footer Navigation */}
            <div className="mt-auto pt-8 flex justify-between items-center">
                <p className="text-sm text-gray-400 font-medium flex items-center">
                    <AlertCircle size={14} className="mr-1" /> Quiz auto-submits when time expires.
                </p>
                {currentIdx < questions.length - 1 ? (
                    <button 
                        onClick={() => setCurrentIdx(i => i + 1)}
                        className="flex items-center px-8 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold rounded-2xl hover:scale-105 transition-transform"
                    >
                        Next <ChevronRight size={20} className="ml-1" />
                    </button>
                ) : (
                    <button 
                        onClick={submitQuiz}
                        className="px-10 py-3 bg-sky-500 text-white font-black rounded-2xl shadow-lg shadow-sky-500/30 hover:bg-sky-600"
                    >
                        Finish Quiz
                    </button>
                )}
            </div>
        </div>
    );
}