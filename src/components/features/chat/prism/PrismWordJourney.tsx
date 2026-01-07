import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Sparkles, Trophy } from 'lucide-react';
import { PrismContainer } from '@/components/ui/prism-container';
import { PhoneticOrb } from './PhoneticOrb';
import { MeaningCluster } from './MeaningCluster';
import { CollocationRibbon } from './CollocationRibbon';
import { cn } from '@/lib/utils';

export type JourneyPhase = 'impression' | 'investigation' | 'integration';

interface PrismWordJourneyProps {
    word: string;
    phonetic: string;
    definition: string;
    englishDefinition?: string;
    supplement?: string;
    examples?: { sentence: string; translation: string }[];
    collocations?: { phrase: string; translation: string }[];
}

export const PrismWordJourney: React.FC<PrismWordJourneyProps> = ({
    word,
    phonetic,
    definition,
    englishDefinition,
    supplement,
    examples,
    collocations
}) => {
    const [phase, setPhase] = useState<JourneyPhase>('impression');

    const phases: { id: JourneyPhase; label: string; icon: any }[] = [
        { id: 'impression', label: 'Impression', icon: Sparkles },
        { id: 'investigation', label: 'Investigation', icon: BookOpen },
        { id: 'integration', label: 'Integration', icon: Trophy },
    ];

    const currentPhaseIdx = phases.findIndex(p => p.id === phase);

    const nextPhase = () => {
        if (currentPhaseIdx < phases.length - 1) {
            setPhase(phases[currentPhaseIdx + 1].id);
        }
    };

    return (
        <PrismContainer
            className="w-full max-w-full md:max-w-xl my-6 mx-auto overflow-visible"
            glowColor={phase === 'impression' ? 'indigo' : phase === 'investigation' ? 'emerald' : 'rose'}
        >
            {/* Step Indicator */}
            <div className="flex justify-between items-center mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-white/10 -translate-y-1/2 -z-10" />
                {phases.map((p, idx) => {
                    const Icon = p.icon;
                    const isActive = idx <= currentPhaseIdx;
                    return (
                        <div key={p.id} className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
                                isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                            )}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest",
                                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"
                            )}>
                                {p.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="min-h-[300px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                    {phase === 'impression' && (
                        <motion.div
                            key="impression"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <PhoneticOrb word={word} phonetic={phonetic} />

                            {/* High Impact Example (Phase A: Feel the context) */}
                            {examples && examples.length > 0 && (
                                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 italic font-serif text-center">
                                    "{examples[0].sentence}"
                                </div>
                            )}
                        </motion.div>
                    )}

                    {phase === 'investigation' && (
                        <motion.div
                            key="investigation"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <MeaningCluster
                                definition={definition}
                                englishDefinition={englishDefinition}
                                supplement={supplement}
                            />
                            <CollocationRibbon collocations={collocations || []} />
                        </motion.div>
                    )}

                    {phase === 'integration' && (
                        <motion.div
                            key="integration"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col items-center justify-center h-full text-center py-10"
                        >
                            <div className="mb-6 h-20 w-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                                <Trophy className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Ready to Master?</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs">
                                You&apos;ve explored the soul of &quot;{word}&quot;. Let&apos;s jump into a real conversation to lock it in.
                            </p>
                            <button className="px-8 py-3 rounded-full bg-indigo-600 text-white font-bold shadow-lg hover:shadow-indigo-500/40 transition-all active:scale-95">
                                Start Roleplay
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Action */}
                {phase !== 'integration' && (
                    <div className="mt-10 flex justify-end">
                        <button
                            onClick={nextPhase}
                            className="flex items-center gap-2 px-6 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold hover:scale-105 transition-all shadow-xl"
                        >
                            Continue <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </PrismContainer>
    );
};
