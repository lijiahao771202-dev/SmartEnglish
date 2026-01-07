"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Mic, MicOff, CheckCircle, RotateCcw, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpeakingCardData } from "@/lib/ai/card-types";
import { GlassCard } from "./base/GlassCard";

interface SpeakingCardProps {
    data: SpeakingCardData;
    onNext?: () => void;
}

export function SpeakingCard({ data, onNext }: SpeakingCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [hasRecorded, setHasRecorded] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef<any>(null);

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

    // 高亮显示目标单词
    const highlightSentence = () => {
        const regex = new RegExp(`(${data.highlightWord})`, 'gi');
        const parts = data.sentence.split(regex);
        return parts.map((part, i) =>
            part.toLowerCase() === data.highlightWord.toLowerCase() ? (
                <span key={i} className="text-blue-600 dark:text-blue-400 font-bold underline decoration-2 underline-offset-2">
                    {part}
                </span>
            ) : part
        );
    };

    // 开始/停止录音
    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
            return;
        }

        // 使用 Web Speech API 进行语音识别
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("您的浏览器不支持语音识别");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => {
            setIsRecording(false);
            setHasRecorded(true);
        };
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setIsRecording(false);
        };
        recognition.onresult = (event: any) => {
            const result = event.results[0][0].transcript;
            setTranscript(result);

            // 简单评分：计算相似度
            const similarity = calculateSimilarity(result.toLowerCase(), data.sentence.toLowerCase());
            const calculatedScore = Math.round(similarity * 100);
            setScore(calculatedScore);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    // 计算字符串相似度 (Levenshtein distance based)
    const calculateSimilarity = (str1: string, str2: string): number => {
        const words1 = str1.split(/\s+/);
        const words2 = str2.split(/\s+/);
        let matchCount = 0;

        words1.forEach(w1 => {
            if (words2.some(w2 => w2.includes(w1) || w1.includes(w2))) {
                matchCount++;
            }
        });

        return matchCount / Math.max(words1.length, words2.length);
    };

    // 重试
    const handleRetry = () => {
        setScore(null);
        setTranscript("");
        setHasRecorded(false);
    };

    // 判断是否通过 (70分以上)
    const isPassed = score !== null && score >= 70;

    return (
        <GlassCard className="overflow-hidden">
            <div className="space-y-5">
                {/* 标题 */}
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/10">
                        <Mic size={20} className="text-purple-500" />
                    </div>
                    <h3 className="text-lg font-semibold">跟读练习</h3>
                </div>

                {/* 例句展示 */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800/30">
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-lg leading-relaxed">
                            "{highlightSentence()}"
                        </p>
                        <button
                            onClick={playAudio}
                            disabled={isPlaying}
                            className={cn(
                                "p-2 rounded-full hover:bg-purple-500/10 transition-colors flex-shrink-0",
                                isPlaying && "text-purple-500 animate-pulse"
                            )}
                        >
                            <Volume2 size={20} />
                        </button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        {data.sentenceTranslation}
                    </p>
                </div>

                {/* 录音按钮 */}
                <div className="flex justify-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleRecording}
                        disabled={isPassed}
                        className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center transition-all",
                            isRecording
                                ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
                                : isPassed
                                    ? "bg-green-500 text-white"
                                    : "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                        )}
                    >
                        {isPassed ? (
                            <CheckCircle size={32} />
                        ) : isRecording ? (
                            <MicOff size={32} />
                        ) : (
                            <Mic size={32} />
                        )}
                    </motion.button>
                </div>

                {/* 录音提示 */}
                <p className="text-center text-sm text-muted-foreground">
                    {isRecording ? "正在录音... 点击停止" : isPassed ? "发音通过！" : "点击麦克风开始跟读"}
                </p>

                {/* 结果展示 */}
                <AnimatePresence>
                    {hasRecorded && score !== null && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            {/* 评分 */}
                            <div className={cn(
                                "p-4 rounded-xl border text-center",
                                isPassed
                                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                    : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                            )}>
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star
                                            key={i}
                                            size={20}
                                            className={cn(
                                                i <= Math.ceil(score / 20)
                                                    ? "text-amber-400 fill-amber-400"
                                                    : "text-gray-300"
                                            )}
                                        />
                                    ))}
                                </div>
                                <p className="text-2xl font-bold">
                                    {score}<span className="text-lg text-muted-foreground">分</span>
                                </p>
                                {transcript && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        识别: "{transcript}"
                                    </p>
                                )}
                            </div>

                            {/* 操作按钮 */}
                            {!isPassed ? (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleRetry}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={18} />
                                    再试一次
                                </motion.button>
                            ) : onNext && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onNext}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium"
                                >
                                    继续下一步 →
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GlassCard>
    );
}
