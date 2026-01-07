"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DetailCardData } from "@/lib/ai/card-types";
import { GlassCard } from "./base/GlassCard";

interface DetailCardProps {
    data: DetailCardData;
    onNext?: () => void;
}

export function DetailCard({ data, onNext }: DetailCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showAiContent, setShowAiContent] = useState(false);

    // TTS 播放发音
    const playAudio = (text: string) => {
        if (isPlaying) return;
        setIsPlaying(true);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        speechSynthesis.speak(utterance);
    };

    return (
        <GlassCard className="overflow-hidden">
            <div className="space-y-5">
                {/* 单词标题区 */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {data.word}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground font-mono">
                                {data.phonetic}
                            </span>
                            <button
                                onClick={() => playAudio(data.word)}
                                disabled={isPlaying}
                                className={cn(
                                    "p-1.5 rounded-full hover:bg-blue-500/10 transition-colors",
                                    isPlaying && "text-blue-500 animate-pulse"
                                )}
                            >
                                <Volume2 size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="p-2 rounded-xl bg-blue-500/10">
                        <BookOpen size={20} className="text-blue-500" />
                    </div>
                </div>

                {/* 释义区 */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30">
                    <p className="text-lg font-medium text-foreground">
                        {data.definition}
                    </p>
                    {data.definitionEn && (
                        <p className="text-sm text-muted-foreground mt-1 italic">
                            {data.definitionEn}
                        </p>
                    )}
                </div>

                {/* 例句区 */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>📝 例句</span>
                        <button
                            onClick={() => playAudio(data.exampleSentence)}
                            disabled={isPlaying}
                            className="text-xs text-blue-500 hover:text-blue-600"
                        >
                            🔊 播放
                        </button>
                    </div>
                    <div className="pl-3 border-l-2 border-blue-500/30">
                        <p className="text-foreground leading-relaxed">
                            "{data.exampleSentence}"
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {data.exampleTranslation}
                        </p>
                    </div>
                </div>

                {/* AI 补充区 (可展开) */}
                {data.aiSupplement && (
                    <motion.div
                        initial={false}
                        animate={{ height: showAiContent ? "auto" : 48 }}
                        className="overflow-hidden"
                    >
                        <button
                            onClick={() => setShowAiContent(!showAiContent)}
                            className="w-full flex items-center gap-2 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 text-left"
                        >
                            <Sparkles size={16} className="text-purple-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                {showAiContent ? "收起AI补充" : "查看AI补充 (词源/联想)"}
                            </span>
                        </button>
                        {showAiContent && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-2 p-3 text-sm text-muted-foreground leading-relaxed"
                            >
                                {data.aiSupplement}
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* 下一步按钮 */}
                {onNext && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onNext}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                    >
                        我记住了
                        <ArrowRight size={18} />
                    </motion.button>
                )}
            </div>
        </GlassCard>
    );
}
