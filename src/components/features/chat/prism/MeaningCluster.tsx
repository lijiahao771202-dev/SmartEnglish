import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BookOpen, HelpCircle } from 'lucide-react';

interface MeaningClusterProps {
    definition: string;
    englishDefinition?: string;
    supplement?: string;
}

export const MeaningCluster: React.FC<MeaningClusterProps> = ({
    definition,
    englishDefinition,
    supplement
}) => {
    return (
        <div className="space-y-6">
            {/* Core Definition Bubble */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-2xl bg-indigo-500/5 dark:bg-white/5 p-5 border border-indigo-500/10"
            >
                <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Core Meaning</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                    {definition}
                </h3>
                {englishDefinition && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic font-serif">
                        "{englishDefinition}"
                    </p>
                )}
            </motion.div>

            {/* AI Supplement / Memory Hook */}
            {supplement && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-4 items-start"
                >
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <HelpCircle className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-amber-600/80 dark:text-amber-400/80 uppercase tracking-wider mb-1">
                            Memory Hook
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {supplement}
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
