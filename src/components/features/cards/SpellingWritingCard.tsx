"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, CheckCircle, XCircle, Volume2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpellingWritingCardData } from "@/lib/ai/card-types";
import { GlassCard } from "./base/GlassCard";
import { useChatStore } from "@/lib/store/chat-store";

interface SpellingWritingCardProps {
    data: SpellingWritingCardData;
    onNext?: () => void;
}

export function SpellingWritingCard({ data, onNext }: SpellingWritingCardProps) {
    // Step 1: 拼写
    const [spellingInput, setSpellingInput] = useState("");
    const [spellingSubmitted, setSpellingSubmitted] = useState(false);
    const [spellingCorrect, setSpellingCorrect] = useState(false);

    // Step 2: 仿写
    const [writingInput, setWritingInput] = useState("");
    const [writingSubmitted, setWritingSubmitted] = useState(false);
    const [aiFeedback, setAiFeedback] = useState("");
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

    // 当前步骤
    const [currentStep, setCurrentStep] = useState<'spelling' | 'writing'>('spelling');

    // 播放单词发音
    const playWord = () => {
        const utterance = new SpeechSynthesisUtterance(data.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    };

    // 提交拼写
    const handleSpellingSubmit = () => {
        if (!spellingInput.trim()) return;

        const isCorrect = spellingInput.trim().toLowerCase() === data.word.toLowerCase();
        setSpellingCorrect(isCorrect);
        setSpellingSubmitted(true);

        if (isCorrect) {
            // 延迟进入下一步
            setTimeout(() => {
                setCurrentStep('writing');
            }, 1000);
        }
    };

    // 重试拼写
    const retrySpelling = () => {
        setSpellingInput("");
        setSpellingSubmitted(false);
        setSpellingCorrect(false);
    };

    // 提交仿写
    const handleWritingSubmit = async () => {
        if (!writingInput.trim()) return;

        setWritingSubmitted(true);
        setIsLoadingFeedback(true);

        try {
            // 调用 AI 进行评价
            const { callSimpleChat } = await import("@/lib/ai/deepseek");

            const prompt = `
学生用单词 "${data.word}" 写了这个句子: "${writingInput}"
目标单词释义: ${data.definition}
参考例句: ${data.exampleSentence}

请简短评价 (2-3句话):
1. 语法是否正确
2. 单词使用是否恰当
3. 一个改进建议

用中文回复，语气鼓励。
            `.trim();

            const response = await callSimpleChat("你是一位温和的英语老师", prompt);
            setAiFeedback(response);
        } catch (error) {
            console.error("AI feedback error:", error);
            setAiFeedback("造句不错！继续加油！🎉");
        } finally {
            setIsLoadingFeedback(false);
        }
    };

    // 判断是否完成
    const isCompleted = spellingCorrect && writingSubmitted && !isLoadingFeedback;

    return (
        <GlassCard className="overflow-hidden">
            <div className="space-y-5">
                {/* 标题 */}
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10">
                        <PenTool size={20} className="text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-semibold">拼写与仿写</h3>

                    {/* 步骤指示器 */}
                    <div className="ml-auto flex items-center gap-1">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            currentStep === 'spelling' ? "bg-indigo-500" : spellingCorrect ? "bg-green-500" : "bg-gray-300"
                        )} />
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            currentStep === 'writing' ? "bg-indigo-500" : writingSubmitted ? "bg-green-500" : "bg-gray-300"
                        )} />
                    </div>
                </div>

                {/* Step 1: 拼写 */}
                <AnimatePresence mode="wait">
                    {currentStep === 'spelling' && (
                        <motion.div
                            key="spelling"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Step 1: 听音拼写
                                </p>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={playWord}
                                        className="p-3 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                                    >
                                        <Volume2 size={20} />
                                    </button>
                                    <div>
                                        <p className="font-mono text-lg text-muted-foreground">
                                            {data.hint}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {data.definition}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={spellingInput}
                                    onChange={(e) => setSpellingInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSpellingSubmit()}
                                    disabled={spellingSubmitted}
                                    placeholder="输入单词拼写..."
                                    className={cn(
                                        "flex-1 px-4 py-3 rounded-xl border-2 outline-none transition-all",
                                        spellingSubmitted
                                            ? spellingCorrect
                                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                                : "border-red-500 bg-red-50 dark:bg-red-900/20"
                                            : "border-gray-200 dark:border-gray-700 focus:border-indigo-500"
                                    )}
                                />
                                {spellingSubmitted && (
                                    spellingCorrect ? (
                                        <div className="p-3 rounded-xl bg-green-500 text-white">
                                            <CheckCircle size={24} />
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded-xl bg-red-500 text-white">
                                            <XCircle size={24} />
                                        </div>
                                    )
                                )}
                            </div>

                            {spellingSubmitted && !spellingCorrect && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                >
                                    <p className="text-sm">
                                        正确答案: <span className="font-bold text-red-600">{data.word}</span>
                                    </p>
                                    <button
                                        onClick={retrySpelling}
                                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                                    >
                                        再试一次
                                    </button>
                                </motion.div>
                            )}

                            {!spellingSubmitted && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSpellingSubmit}
                                    disabled={!spellingInput.trim()}
                                    className={cn(
                                        "w-full py-3 rounded-xl font-medium transition-all",
                                        spellingInput.trim()
                                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                                            : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                                    )}
                                >
                                    检查拼写
                                </motion.button>
                            )}
                        </motion.div>
                    )}

                    {/* Step 2: 仿写 */}
                    {currentStep === 'writing' && (
                        <motion.div
                            key="writing"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Step 2: 仿写造句
                                </p>
                                <p className="text-sm">
                                    请用 <span className="font-bold text-purple-600">{data.word}</span> 造一个句子
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    参考: {data.exampleSentence}
                                </p>
                            </div>

                            <textarea
                                value={writingInput}
                                onChange={(e) => setWritingInput(e.target.value)}
                                disabled={writingSubmitted}
                                placeholder={`用 ${data.word} 造一个句子...`}
                                className="w-full h-24 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 outline-none resize-none transition-all disabled:opacity-60"
                            />

                            {/* AI 反馈 */}
                            {writingSubmitted && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800"
                                >
                                    <div className="flex items-start gap-2">
                                        <span className="text-xl">👩‍🏫</span>
                                        <div className="flex-1">
                                            {isLoadingFeedback ? (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Loader2 size={16} className="animate-spin" />
                                                    正在批改...
                                                </div>
                                            ) : (
                                                <p className="text-sm text-foreground whitespace-pre-wrap">
                                                    {aiFeedback}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* 操作按钮 */}
                            {!writingSubmitted ? (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleWritingSubmit}
                                    disabled={!writingInput.trim()}
                                    className={cn(
                                        "w-full py-3 rounded-xl font-medium transition-all",
                                        writingInput.trim()
                                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                            : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                                    )}
                                >
                                    提交造句
                                </motion.button>
                            ) : isCompleted && onNext && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onNext}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={18} />
                                    全部完成！进入下一个单词
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GlassCard>
    );
}
