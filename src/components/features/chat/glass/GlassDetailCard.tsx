import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Volume2, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface GlassDetailCardProps {
    word: string;
    phonetic: string;
    definition: string;
    englishDefinition?: string;
    sentence?: string; // Example sentence
    sentenceTranslation?: string;
    onPlayAudio?: () => void;
}

export const GlassDetailCard: React.FC<GlassDetailCardProps> = ({
    word,
    phonetic,
    definition,
    englishDefinition,
    sentence,
    sentenceTranslation,
    onPlayAudio
}) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = () => {
        setIsPlaying(true);
        if (onPlayAudio) onPlayAudio();
        // Simulate audio length for visual feedback
        setTimeout(() => setIsPlaying(false), 1500);
    };

    return (
        <GlassCard className="w-full max-w-full md:max-w-md p-6 my-4 mx-auto" variant='default'>
            {/* Header: Word & Audio */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                        {word}
                    </h2>
                    <p className="text-sm font-medium text-gray-500/80 font-mono tracking-wide">
                        {phonetic}
                    </p>
                </div>

                <button
                    onClick={handlePlay}
                    className={cn(
                        "p-3 rounded-full transition-all duration-300",
                        "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
                        isPlaying && "animate-pulse ring-2 ring-indigo-500/30 bg-indigo-500/20"
                    )}
                >
                    <Volume2 className={cn("w-6 h-6", isPlaying && "animate-bounce")} />
                </button>
            </div>

            {/* Definition Section */}
            <div className="space-y-4">
                <div className="relative pl-4 border-l-2 border-indigo-500/30">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
                        {definition}
                    </h3>
                    {englishDefinition && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            "{englishDefinition}"
                        </p>
                    )}
                </div>

                {/* Example Capsule */}
                {(sentence) && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 p-4 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-black/5 dark:border-white/5 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-indigo-500 uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" />
                            Example
                        </div>
                        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed font-serif">
                            "{sentence}"
                        </p>
                        {sentenceTranslation && (
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500 border-t border-dashed border-gray-200 dark:border-gray-700 pt-2">
                                {sentenceTranslation}
                            </p>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Footer / Brand Touch */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none -z-10" />
        </GlassCard>
    );
};
