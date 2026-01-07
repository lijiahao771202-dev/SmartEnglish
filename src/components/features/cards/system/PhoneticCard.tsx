"use client";

import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { useState } from "react";
import { PhoneticCardData } from "@/lib/ai/card-types";

interface PhoneticCardProps {
    data: PhoneticCardData;
    onComplete: () => void;
}

export function PhoneticCard({ data, onComplete }: PhoneticCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasPlayed, setHasPlayed] = useState(false);

    // TTS 播放发音
    const playAudio = () => {
        if (isPlaying) return;
        setIsPlaying(true);

        const utterance = new SpeechSynthesisUtterance(data.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.onend = () => {
            setIsPlaying(false);
            setHasPlayed(true);
        };
        utterance.onerror = () => {
            setIsPlaying(false);
            setHasPlayed(true);
        };
        speechSynthesis.speak(utterance);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-violet-500/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-6 border border-white/20"
        >
            {/* 卡片标题 */}
            <div className="text-xs text-violet-300 font-medium mb-4">🔊 发音学习</div>

            {/* 单词展示 */}
            <div className="text-center mb-6">
                <h2 className="text-4xl font-bold text-white mb-2">{data.word}</h2>
                <p className="text-lg text-violet-200 font-mono">{data.phonetic}</p>
            </div>

            {/* 播放按钮 */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={playAudio}
                disabled={isPlaying}
                className="w-full py-4 rounded-2xl bg-violet-500/30 hover:bg-violet-500/50 border border-violet-400/30 flex items-center justify-center gap-3 transition-colors"
            >
                <Volume2 className={isPlaying ? "animate-pulse text-violet-300" : "text-white"} size={24} />
                <span className="text-white font-medium">
                    {isPlaying ? "播放中..." : "点击播放发音"}
                </span>
            </motion.button>

            {/* 下一步按钮 */}
            {hasPlayed && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onComplete}
                    className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium"
                >
                    记住发音了，继续 →
                </motion.button>
            )}
        </motion.div>
    );
}
