"use client";

import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { MemoryHookCardData } from "@/lib/ai/card-types";

interface MemoryHookCardProps {
    data: MemoryHookCardData;
    onComplete: () => void;
}

export function MemoryHookCard({ data, onComplete }: MemoryHookCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-pink-500/20 to-rose-600/20 backdrop-blur-xl rounded-3xl p-6 border border-white/20"
        >
            {/* 卡片标题 */}
            <div className="text-xs text-pink-300 font-medium mb-4">💡 助记强化</div>

            {/* 单词 */}
            <h2 className="text-2xl font-bold text-white mb-4">{data.word}</h2>

            {/* 助记内容 */}
            <div className="bg-white/10 rounded-2xl p-4 mb-4">
                <div className="flex items-start gap-3">
                    <Lightbulb className="text-pink-400 flex-shrink-0 mt-1" size={20} />
                    <p className="text-white leading-relaxed">{data.content}</p>
                </div>
            </div>

            {/* 下一步按钮 */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onComplete}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium"
            >
                记住了，继续 →
            </motion.button>
        </motion.div>
    );
}
