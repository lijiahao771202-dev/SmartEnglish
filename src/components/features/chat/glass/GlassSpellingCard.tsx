"use client";

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { PenTool, CheckCircle, XCircle, Volume2, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
interface GlassSpellingCardProps {
    word: string;
    hint: string;
    definition: string;
    exampleSentence: string;
    type?: string; // Optional type to swallow the prop passed from parent
    onNext?: () => void;
}

export const GlassSpellingCard: React.FC<GlassSpellingCardProps> = ({
    word,
    hint,
    definition,
    exampleSentence,
    onNext
}) => {
    // Step 1: Spelling
    const [spellingInput, setSpellingInput] = useState("");
    const [spellingSubmitted, setSpellingSubmitted] = useState(false);
    const [spellingCorrect, setSpellingCorrect] = useState(false);

    // Step 2: Writing
    const [writingInput, setWritingInput] = useState("");
    const [writingSubmitted, setWritingSubmitted] = useState(false);
    const [aiFeedback, setAiFeedback] = useState("");
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

    // Current Step
    const [currentStep, setCurrentStep] = useState<'spelling' | 'writing'>('spelling');

    const playWord = () => {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    };

    const handleSpellingSubmit = () => {
        if (!spellingInput.trim()) return;

        const isCorrect = spellingInput.trim().toLowerCase() === word.toLowerCase();
        setSpellingCorrect(isCorrect);
        setSpellingSubmitted(true);

        if (isCorrect) {
            setTimeout(() => {
                setCurrentStep('writing');
            }, 1000);
        }
    };

    const retrySpelling = () => {
        setSpellingInput("");
        setSpellingSubmitted(false);
        setSpellingCorrect(false);
    };

    const handleWritingSubmit = async () => {
        if (!writingInput.trim()) return;

        setWritingSubmitted(true);
        setIsLoadingFeedback(true);

        try {
            // Import AI logic dynamically or use a simple feedback mock for UI stability first
            // To ensure reliability in this 'Glass' version, we keep it simple or reuse the deepseek import if confirmed working.
            // For now, I will use a simulated feedback to ensure UI works, then we can wire deepseek if needed.
            // Actually, the user wants "AI Grading". Let's try to import deepseek.

            const { callSimpleChat } = await import("@/lib/ai/deepseek");
            const prompt = `
            Student wrote this sentence for word "${word}": "${writingInput}"
            Definition: ${definition}
            Example: ${exampleSentence}
            
            Briefly evaluate (in Chinese, encouraging tone):
            1. Grammar
            2. Word usage
            3. One improvement tip
            `;

            const response = await callSimpleChat("Helpful Teacher", prompt);
            setAiFeedback(response);
        } catch (error) {
            console.error("AI feedback error:", error);
            setAiFeedback("造句不错！继续加油！Great job using the word in context. 🎉");
        } finally {
            setIsLoadingFeedback(false);
        }
    };

    const isCompleted = spellingCorrect && writingSubmitted && !isLoadingFeedback;

    return (
        <GlassCard className="w-full max-w-full md:max-w-md p-6 my-4 mx-auto overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <PenTool size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">拼写练习</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Spelling & Writing</p>
                </div>

                {/* Progress Dots */}
                <div className="ml-auto flex gap-1.5">
                    <div className={cn("w-2 h-2 rounded-full transition-colors", currentStep === 'spelling' ? "bg-indigo-500" : spellingCorrect ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700")} />
                    <div className={cn("w-2 h-2 rounded-full transition-colors", currentStep === 'writing' ? "bg-indigo-500" : writingSubmitted ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700")} />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {currentStep === 'spelling' && (
                    <motion.div
                        key="spelling"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-4"
                    >
                        {/* Audio & Hint */}
                        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 flex items-center gap-4">
                            <button
                                onClick={playWord}
                                className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 hover:scale-105 transition-transform"
                            >
                                <Volume2 size={20} />
                            </button>
                            <div>
                                <p className="font-mono text-xl tracking-widest text-indigo-900 dark:text-indigo-200 font-bold opacity-80">
                                    {hint}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {definition}
                                </p>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="relative">
                            <input
                                type="text"
                                value={spellingInput}
                                onChange={(e) => setSpellingInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSpellingSubmit()}
                                disabled={spellingSubmitted}
                                placeholder="Type the word..."
                                className={cn(
                                    "w-full px-4 py-4 rounded-xl border-2 outline-none transition-all font-medium text-lg",
                                    spellingSubmitted
                                        ? spellingCorrect
                                            ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700"
                                            : "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700"
                                        : "border-gray-100 dark:border-gray-800 bg-white dark:bg-black/20 focus:border-indigo-500"
                                )}
                            />
                            {spellingSubmitted && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {spellingCorrect ? (
                                        <CheckCircle className="text-green-500" size={24} />
                                    ) : (
                                        <XCircle className="text-red-500" size={24} />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Wrong Answer Feedback */}
                        {spellingSubmitted && !spellingCorrect && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-between items-center px-2"
                            >
                                <span className="text-sm text-red-500 font-medium">Correct: {word}</span>
                                <button onClick={retrySpelling} className="text-sm text-gray-500 underline decoration-dotted hover:text-gray-800">
                                    Try Again
                                </button>
                            </motion.div>
                        )}

                        {!spellingSubmitted && (
                            <button
                                onClick={handleSpellingSubmit}
                                disabled={!spellingInput.trim()}
                                className="w-full py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Check Spelling
                            </button>
                        )}
                    </motion.div>
                )}

                {currentStep === 'writing' && (
                    <motion.div
                        key="writing"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        {/* Writing Prompt */}
                        <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30">
                            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-purple-600 uppercase tracking-wider">
                                <Sparkles size={12} />
                                Challenge
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Use <span className="font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/50 px-1 py-0.5 rounded">{word}</span> in a sentence.
                            </p>
                        </div>

                        <textarea
                            value={writingInput}
                            onChange={(e) => setWritingInput(e.target.value)}
                            disabled={writingSubmitted}
                            placeholder="Write your sentence here..."
                            className="w-full h-32 px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-black/20 focus:border-purple-500 outline-none resize-none transition-all p-4 text-base"
                        />

                        {writingSubmitted && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800/30"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-full bg-white dark:bg-white/10 shadow-sm">
                                        👩‍🏫
                                    </div>
                                    <div className="flex-1">
                                        {isLoadingFeedback ? (
                                            <div className="flex items-center gap-2 text-purple-600 text-sm h-6">
                                                <Loader2 size={14} className="animate-spin" />
                                                Reviewing...
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                                                {aiFeedback}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {!writingSubmitted ? (
                            <button
                                onClick={handleWritingSubmit}
                                disabled={!writingInput.trim()}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/20 transition-all transform hover:scale-[1.02]"
                            >
                                Submit Sentence
                            </button>
                        ) : isCompleted && onNext && (
                            <button
                                onClick={onNext}
                                className="w-full py-3.5 rounded-xl bg-green-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                            >
                                <CheckCircle size={18} />
                                Complete
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
};
