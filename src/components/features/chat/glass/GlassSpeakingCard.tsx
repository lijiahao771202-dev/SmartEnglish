import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Mic, MicOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GlassSpeakingCardProps {
    sentence: string;
    trans?: string;
    onRecord?: () => void;
}

export const GlassSpeakingCard: React.FC<GlassSpeakingCardProps> = ({
    sentence,
    trans,
    onRecord
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    const toggleRecording = () => {
        if (!isRecording) {
            setIsRecording(true);
            setScore(null);
            if (onRecord) onRecord();

            // Mock recording duration
            setTimeout(() => {
                setIsRecording(false);
                // Mock smart scoring
                setScore(Math.floor(Math.random() * 20) + 80);
            }, 3000);
        } else {
            setIsRecording(false);
        }
    };

    return (
        <GlassCard className="w-full max-w-full md:max-w-md p-8 my-4 text-center flex flex-col items-center justify-center" variant="default">
            <div className="mb-8 space-y-3">
                <h3 className="text-2xl font-serif text-gray-900 dark:text-white leading-relaxed">
                    "{sentence}"
                </h3>
                {trans && (
                    <p className="text-gray-500 font-medium">
                        {trans}
                    </p>
                )}
            </div>

            {/* Mic Button with Ripple Effect */}
            <div className="relative group">
                {isRecording && (
                    <>
                        <motion.div
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 2, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute inset-0 bg-indigo-500 rounded-full z-0"
                        />
                        <motion.div
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                            className="absolute inset-0 bg-purple-500 rounded-full z-0"
                        />
                    </>
                )}

                <button
                    onClick={toggleRecording}
                    className={cn(
                        "relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl",
                        isRecording
                            ? "bg-gradient-to-r from-rose-500 to-pink-600 scale-110"
                            : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 active:scale-95"
                    )}
                >
                    <Mic className="w-8 h-8 text-white" />
                </button>
            </div>

            <div className="h-8 mt-6">
                {isRecording ? (
                    <span className="text-sm font-bold text-rose-500 animate-pulse uppercase tracking-widest">
                        Listening...
                    </span>
                ) : score !== null ? (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
                    >
                        <span className="text-2xl font-black text-emerald-500">{score}</span>
                        <span className="text-xs text-emerald-600 font-bold uppercase">Great!</span>
                    </motion.div>
                ) : (
                    <span className="text-sm text-gray-400">Tap to speak</span>
                )}
            </div>
        </GlassCard>
    );
};
