import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface QuizOption {
    id: string;
    label: string;
    isCorrect?: boolean;
}

interface GlassQuizCardProps {
    question: string;
    options: QuizOption[] | string[]; // Support both rich objects and simple strings
    explanation?: string;
}

export const GlassQuizCard: React.FC<GlassQuizCardProps> = ({
    question,
    options,
    explanation
}) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Normalize options to consistent object format
    const normalizedOptions: QuizOption[] = options.map((opt, idx) => {
        if (typeof opt === 'string') {
            return { id: idx.toString(), label: opt };
        }
        return opt;
    });

    const handleSelect = (id: string, isCorrect?: boolean) => {
        if (hasSubmitted) return;
        setSelectedId(id);

        // Auto-submit logic for instant feedback if correctness is known
        if (isCorrect !== undefined) {
            setTimeout(() => setHasSubmitted(true), 400);
        }
    };

    const getOptionState = (opt: QuizOption) => {
        if (!hasSubmitted) return selectedId === opt.id ? 'selected' : 'default';

        if (opt.isCorrect) return 'correct';
        if (selectedId === opt.id && !opt.isCorrect) return 'wrong';
        return 'dimmed';
    };

    return (
        <GlassCard className="w-full max-w-full md:max-w-md p-6 my-4" variant="default">
            <div className="flex items-start gap-3 mb-6">
                <div className="mt-1 p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-snug">
                    {question}
                </h3>
            </div>

            <div className="space-y-3">
                {normalizedOptions.map((opt) => {
                    const state = getOptionState(opt);

                    return (
                        <motion.button
                            key={opt.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(opt.id, opt.isCorrect)}
                            className={cn(
                                "relative w-full text-left p-4 rounded-xl transition-all duration-300 border backdrop-blur-md",
                                // Default State
                                state === 'default' && "bg-white/20 dark:bg-black/20 border-white/10 hover:bg-white/30 hover:border-indigo-500/30",
                                // Selected State
                                state === 'selected' && "bg-indigo-500/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]",
                                // Correct State
                                state === 'correct' && "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300",
                                // Wrong State
                                state === 'wrong' && "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300",
                                // Dimmed State
                                state === 'dimmed' && "opacity-50 grayscale"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span className={cn(
                                    "font-medium",
                                    state === 'selected' && "text-indigo-700 dark:text-indigo-300"
                                )}>
                                    {opt.label}
                                </span>

                                {state === 'correct' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                {state === 'wrong' && <XCircle className="w-5 h-5 text-rose-500" />}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {hasSubmitted && explanation && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-white/10 text-sm text-gray-600 dark:text-gray-400"
                >
                    <span className="font-bold text-indigo-500">Explanation:</span> {explanation}
                </motion.div>
            )}
        </GlassCard>
    );
};
