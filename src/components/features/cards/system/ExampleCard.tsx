"use client";

import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { useState } from "react";
import { ExampleCardData } from "@/lib/ai/card-types";

interface ExampleCardProps {
    data: ExampleCardData;
    onComplete: () => void;
}

export function ExampleCard({ data, onComplete }: ExampleCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    // TTS 播放例句
    const playAudio = () => {
        if (isPlaying) return;
        setIsPlaying(true);

        const utterance = new SpeechSynthesisUtterance(data.sentence);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        speechSynthesis.speak(utterance);
    };

    // 高亮单词
    const highlightWord = (sentence: string, word: string) => {
        const regex = new RegExp(`(${word})`, 'gi');
        const parts = sentence.split(regex);

        return parts.map((part, i) =>
            part.toLowerCase() === word.toLowerCase()
                ? <span key={i} className="text-amber-400 font-bold">{part}</span>
                : part
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-xl rounded-3xl p-6 border border-white/20"
        >
            {/* 卡片标题 */}
            <div className="text-xs text-amber-300 font-medium mb-4">📝 例句精读</div>

            {/* 单词 */}
            <h2 className="text-xl font-bold text-white mb-4">{data.word}</h2>

            {/* 例句 */}
            <div className="bg-white/10 rounded-2xl p-4 mb-3">
                <p className="text-lg text-white leading-relaxed">
                    {highlightWord(data.sentence || '', data.word)}
                </p>
            </div>

            {/* 翻译 */}
            <div className="bg-white/5 rounded-2xl p-4 mb-4">
                <p className="text-white/70">{data.translation}</p>
            </div>

            {/* 播放按钮 */}
            <button
                onClick={playAudio}
                disabled={isPlaying}
                className="w-full py-3 mb-3 rounded-2xl bg-amber-500/30 hover:bg-amber-500/50 border border-amber-400/30 flex items-center justify-center gap-2 transition-colors"
            >
                <Volume2 className={isPlaying ? "animate-pulse" : ""} size={20} />
                <span className="text-white">{isPlaying ? "播放中..." : "听例句发音"}</span>
            </button>

            {/* 下一步按钮 */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onComplete}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium"
            >
                理解了，继续 →
            </motion.button>
        </motion.div>
    );
}
