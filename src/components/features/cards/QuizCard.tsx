"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizCardData } from "@/lib/ai/card-types";
import { GlassCard } from "./base/GlassCard";
import { useChatStore } from "@/lib/store/chat-store";

interface QuizCardProps {
    data: QuizCardData;
    onNext?: () => void;
}

export function QuizCard({ data, onNext }: QuizCardProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const handleSelect = (optionId: string) => {
        if (isSubmitted) return;
        setSelectedId(optionId);
    };

    const handleSubmit = () => {
        if (!selectedId || isSubmitted) return;

        const selected = data.options.find(opt => opt.id === selectedId);
        const correct = selected?.isCorrect || false;

        setIsCorrect(correct);
        setIsSubmitted(true);

        // 记录结果并推进到下一步
        if (correct && onNext) {
            setTimeout(() => {
                onNext();
            }, 1500);
        }
    };

    const handleRetry = () => {
        setSelectedId(null);
        setIsSubmitted(false);
        setIsCorrect(false);
    };

    return (
        <GlassCard className="overflow-hidden">
            <div className="space-y-5">
                {/* 问题标题 */}
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10">
                        <HelpCircle size={20} className="text-amber-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                            {data.question}
                        </h3>
                    </div>
                </div>

                {/* 选项列表 */}
                <div className="space-y-3">
                    {data.options.map((option, index) => {
                        const isSelected = selectedId === option.id;
                        const showResult = isSubmitted;
                        const isOptionCorrect = option.isCorrect;

                        let optionStyle = "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600";
                        if (isSelected && !showResult) {
                            optionStyle = "border-blue-500 bg-blue-50 dark:bg-blue-900/20";
                        }
                        if (showResult && isOptionCorrect) {
                            optionStyle = "border-green-500 bg-green-50 dark:bg-green-900/20";
                        }
                        if (showResult && isSelected && !isOptionCorrect) {
                            optionStyle = "border-red-500 bg-red-50 dark:bg-red-900/20";
                        }

                        return (
                            <motion.button
                                key={option.id}
                                whileHover={!isSubmitted ? { scale: 1.01 } : {}}
                                whileTap={!isSubmitted ? { scale: 0.99 } : {}}
                                onClick={() => handleSelect(option.id || String(index))}
                                disabled={isSubmitted}
                                className={cn(
                                    "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3",
                                    optionStyle,
                                    isSubmitted && "cursor-default"
                                )}
                            >
                                <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-medium">
                                    {String.fromCharCode(65 + index)}
                                </span>
                                <span className="flex-1 font-medium">{option.label}</span>
                                {showResult && isOptionCorrect && (
                                    <CheckCircle size={20} className="text-green-500" />
                                )}
                                {showResult && isSelected && !isOptionCorrect && (
                                    <XCircle size={20} className="text-red-500" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* 结果反馈 */}
                <AnimatePresence>
                    {isSubmitted && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={cn(
                                "p-4 rounded-xl border",
                                isCorrect
                                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                            )}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                {isCorrect ? (
                                    <>
                                        <CheckCircle size={18} className="text-green-500" />
                                        <span className="font-semibold text-green-700 dark:text-green-300">回答正确！</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={18} className="text-red-500" />
                                        <span className="font-semibold text-red-700 dark:text-red-300">回答错误</span>
                                    </>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {data.explanation}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 操作按钮 */}
                {!isSubmitted ? (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={!selectedId}
                        className={cn(
                            "w-full py-3 rounded-xl font-medium transition-all",
                            selectedId
                                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        确认选择
                    </motion.button>
                ) : !isCorrect && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRetry}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium"
                    >
                        再试一次
                    </motion.button>
                )}
            </div>
        </GlassCard>
    );
}
