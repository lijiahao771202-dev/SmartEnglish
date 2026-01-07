"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { DefinitionCardData } from "@/lib/ai/card-types";

interface DefinitionCardProps {
    data: DefinitionCardData;
    onComplete: () => void;
}

export function DefinitionCard({ data, onComplete }: DefinitionCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-xl rounded-3xl p-6 border border-white/20"
        >
            {/* 卡片标题 */}
            <div className="text-xs text-blue-300 font-medium mb-4">📖 释义理解</div>

            {/* 单词 */}
            <h2 className="text-2xl font-bold text-white mb-4">{data.word}</h2>

            {/* 中文释义 */}
            <div className="bg-white/10 rounded-2xl p-4 mb-3">
                <div className="text-xs text-blue-300 mb-1">中文释义</div>
                <p className="text-lg text-white font-medium">{data.definition}</p>
            </div>

            {/* 英文释义 */}
            {data.definitionEn && (
                <div className="bg-white/5 rounded-2xl p-4 mb-4">
                    <div className="text-xs text-blue-300 mb-1">English Definition</div>
                    <p className="text-white/80 italic">{data.definitionEn}</p>
                </div>
            )}

            {/* 下一步按钮 */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onComplete}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium flex items-center justify-center gap-2"
            >
                <BookOpen size={18} />
                我懂了，继续 →
            </motion.button>
        </motion.div>
    );
}
