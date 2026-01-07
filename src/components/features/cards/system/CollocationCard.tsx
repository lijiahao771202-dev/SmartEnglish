"use client";

import { motion } from "framer-motion";
import { Link2 } from "lucide-react";
import { CollocationCardData } from "@/lib/ai/card-types";

interface CollocationCardProps {
    data: CollocationCardData;
    onComplete: () => void;
}

export function CollocationCard({ data, onComplete }: CollocationCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-cyan-500/20 to-teal-600/20 backdrop-blur-xl rounded-3xl p-6 border border-white/20"
        >
            {/* 卡片标题 */}
            <div className="text-xs text-cyan-300 font-medium mb-4">🔗 搭配运用</div>

            {/* 单词 */}
            <h2 className="text-2xl font-bold text-white mb-4">{data.word}</h2>

            {/* 搭配列表 */}
            <div className="space-y-2 mb-4">
                {data.collocations.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/10 rounded-xl p-3 flex items-center gap-3"
                    >
                        <Link2 className="text-cyan-400 flex-shrink-0" size={16} />
                        <div>
                            <p className="text-white font-medium">{item.phrase}</p>
                            <p className="text-white/60 text-sm">{item.translation}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* 下一步按钮 */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onComplete}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium"
            >
                学会搭配了，继续 →
            </motion.button>
        </motion.div>
    );
}
