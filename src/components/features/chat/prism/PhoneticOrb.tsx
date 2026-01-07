import React, { useState } from 'react';
import { Volume2, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PhoneticOrbProps {
    word: string;
    phonetic: string;
    onPlay?: () => void;
}

export const PhoneticOrb: React.FC<PhoneticOrbProps> = ({
    word,
    phonetic,
    onPlay
}) => {
    const [isActive, setIsActive] = useState(false);

    const handlePlay = () => {
        setIsActive(true);
        if (onPlay) onPlay();
        // Native TTS Fallback if no custom audio provided
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.onend = () => setIsActive(false);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="flex flex-col items-center gap-4 py-4">
            {/* The Main Orb */}
            <motion.button
                onClick={handlePlay}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20"
            >
                {/* Visual Audio Waves (Animated) */}
                <AnimatePresence>
                    {isActive && (
                        <>
                            {[1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0.8, opacity: 0.5 }}
                                    animate={{ scale: 1.8, opacity: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: i * 0.4,
                                        ease: "easeOut"
                                    }}
                                    className="absolute inset-0 rounded-full border-2 border-indigo-400/30"
                                />
                            ))}
                        </>
                    )}
                </AnimatePresence>

                <div className="relative z-10 text-white">
                    <Volume2 className={cn("h-10 w-10 transition-transform duration-300", isActive && "scale-110")} />
                </div>
            </motion.button>

            {/* Word & IPA Labels */}
            <div className="text-center">
                <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                    {word}
                </h2>
                <p className="mt-1 text-lg font-medium text-indigo-500/80 font-mono tracking-widest">
                    {phonetic}
                </p>
            </div>
        </div>
    );
};
