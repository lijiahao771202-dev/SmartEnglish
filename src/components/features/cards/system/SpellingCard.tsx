"use client";

import { motion } from "framer-motion";
import { Check, X, Pencil } from "lucide-react";
import { useState } from "react";
import { SpellingCardData } from "@/lib/ai/card-types";

interface SpellingCardProps {
    data: SpellingCardData;
    onComplete: () => void;
}

export function SpellingCard({ data, onComplete }: SpellingCardProps) {
    const [input, setInput] = useState("");
    const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

    const checkSpelling = () => {
        if (input.toLowerCase().trim() === data.word.toLowerCase()) {
            setStatus("correct");
        } else {
            setStatus("wrong");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            checkSpelling();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 backdrop-blur-xl rounded-3xl p-6 border border-white/20"
        >
            {/* 卡片标题 */}
            <div className="text-xs text-emerald-300 font-medium mb-4">✍️ 拼写挑战</div>

            {/* 提示 */}
            <div className="bg-white/10 rounded-2xl p-4 mb-4">
                <div className="text-xs text-emerald-300 mb-1">根据释义拼写单词</div>
                <p className="text-lg text-white font-medium">{data.hint}</p>
            </div>

            {/* 输入框 */}
            <div className="relative mb-4">
                <Pencil className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setStatus("idle");
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="请输入单词..."
                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white text-lg placeholder:text-white/40 outline-none focus:ring-2 focus:ring-emerald-500/50"
                    disabled={status === "correct"}
                />
            </div>

            {/* 状态反馈 */}
            {status === "wrong" && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-red-400 mb-4"
                >
                    <X size={18} />
                    <span>再试一次！正确答案是: {data.word}</span>
                </motion.div>
            )}

            {status === "correct" && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-emerald-400 mb-4"
                >
                    <Check size={18} />
                    <span>太棒了！拼写正确！</span>
                </motion.div>
            )}

            {/* 按钮 */}
            {status !== "correct" ? (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={checkSpelling}
                    className="w-full py-3 rounded-2xl bg-emerald-500/30 hover:bg-emerald-500/50 border border-emerald-400/30 text-white font-medium"
                >
                    检查拼写
                </motion.button>
            ) : (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onComplete}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium"
                >
                    🎉 完成学习！
                </motion.button>
            )}
        </motion.div>
    );
}
