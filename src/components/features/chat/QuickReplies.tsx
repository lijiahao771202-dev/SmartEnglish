"use client";

import { motion } from "framer-motion";
import { QuickReply } from "@/lib/ai/agent";

interface QuickRepliesProps {
    replies: QuickReply[];
    onSelect: (reply: QuickReply) => void;
    disabled?: boolean;
}

export function QuickReplies({ replies, onSelect, disabled }: QuickRepliesProps) {
    if (!replies || replies.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 justify-center py-3"
        >
            {replies.map((reply, index) => (
                <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onSelect(reply)}
                    disabled={disabled}
                    className="px-4 py-2.5 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500/30 hover:text-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm"
                >
                    {reply.emoji && <span className="mr-1.5">{reply.emoji}</span>}
                    {reply.text}
                </motion.button>
            ))}
        </motion.div>
    );
}
