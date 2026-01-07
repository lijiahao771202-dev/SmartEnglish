import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Collocation {
    phrase: string;
    translation: string;
}

interface CollocationRibbonProps {
    collocations: Collocation[];
}

export const CollocationRibbon: React.FC<CollocationRibbonProps> = ({ collocations }) => {
    if (!collocations || collocations.length === 0) return null;

    return (
        <div className="py-2">
            <div className="flex items-center gap-2 mb-3 text-purple-600 dark:text-purple-400 ml-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Collocations</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                {collocations.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex-shrink-0 flex flex-col gap-1.5 p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 shadow-sm min-w-[160px]"
                    >
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100 font-mono">
                            {item.phrase}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {item.translation}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
