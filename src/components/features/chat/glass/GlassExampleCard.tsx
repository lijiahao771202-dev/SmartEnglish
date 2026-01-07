"use client";

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Volume2, Mic, CheckCircle, Sparkles, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ExampleItem {
    sentence: string;
    translation: string;
    audioUrl?: string; // Optional custom audio
}

interface GlassExampleCardProps {
    word: string;
    examples: ExampleItem[];
}

export const GlassExampleCard: React.FC<GlassExampleCardProps> = ({
    word,
    examples
}) => {
    // State to track which sentence is being played or recorded
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);
    const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
    const [recordingFeedback, setRecordingFeedback] = useState<{ [key: number]: 'success' | 'fail' | null }>({});


    const handlePlay = (index: number, text: string) => {
        setPlayingIndex(index);

        // Mock Audio Playback (using SpeechSynthesis for now)
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;

        utterance.onend = () => setPlayingIndex(null);
        speechSynthesis.speak(utterance);
    };

    const handleRecord = (index: number) => {
        if (recordingIndex === index) {
            // Stop recording logic (Mock)
            setRecordingIndex(null);

            // Randomly succeed or fail for demo
            const isSuccess = Math.random() > 0.3;
            setRecordingFeedback(prev => ({ ...prev, [index]: isSuccess ? 'success' : 'fail' }));
        } else {
            // Start recording
            setRecordingIndex(index);
            setRecordingFeedback(prev => ({ ...prev, [index]: null })); // Reset feedback
            // Auto stop after 3s for demo
            setTimeout(() => {
                setRecordingIndex(null);
                setRecordingFeedback(prev => ({ ...prev, [index]: 'success' }));
            }, 3000);
        }
    };

    return (
        <GlassCard className="w-full max-w-full md:max-w-md p-6 my-4 mx-auto overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">例句精讲</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Examples for "{word}"</p>
                </div>
            </div>

            <div className="space-y-4">
                {examples.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-white/20 hover:border-orange-500/30 transition-colors group"
                    >
                        <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed font-medium mb-1">
                            {item.sentence}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {item.translation}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handlePlay(index, item.sentence)}
                                className={cn(
                                    "p-2 rounded-full transition-all flex items-center justify-center",
                                    playingIndex === index
                                        ? "bg-orange-500 text-white animate-pulse"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600"
                                )}
                            >
                                <Volume2 size={18} className={cn(playingIndex === index && "animate-bounce")} />
                            </button>

                            <button
                                onClick={() => handleRecord(index)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                                    recordingIndex === index
                                        ? "bg-red-500 text-white animate-pulse"
                                        : recordingFeedback[index] === 'success'
                                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"

                                )}
                            >
                                <Mic size={16} />
                                {recordingIndex === index ? "Recording..." : recordingFeedback[index] === 'success' ? "Good job!" : "Shadowing"}
                            </button>

                            {/* Feedback Icon */}
                            {recordingFeedback[index] === 'success' && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-green-500">
                                    <CheckCircle size={20} />
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </GlassCard>
    );
};
