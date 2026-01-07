"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/store/chat-store";
import { useChatStore } from "@/lib/store/chat-store";
import { User } from "lucide-react";

// 新的 4 卡片组件
import { DetailCard } from "../cards/DetailCard";
import { QuizCard } from "../cards/QuizCard";
import { SpeakingCard } from "../cards/SpeakingCard";
import { SpellingWritingCard } from "../cards/SpellingWritingCard";

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === "user";
    const isCard = message.type === "card" && message.cardData;

    // 获取推进到下一步的函数
    const advanceToNextCard = () => {
        useChatStore.getState().advanceToNextCard(true);
    };

    // 渲染卡片
    const renderCard = () => {
        if (!message.cardData) return null;

        switch (message.cardData.type) {
            case "detail":
                return <DetailCard data={message.cardData} onNext={advanceToNextCard} />;
            case "quiz":
                return <QuizCard data={message.cardData} onNext={advanceToNextCard} />;
            case "speaking":
                return <SpeakingCard data={message.cardData} onNext={advanceToNextCard} />;
            case "spelling_writing":
                return <SpellingWritingCard data={message.cardData} onNext={advanceToNextCard} />;
            default:
                return null;
        }
    };

    // ===== 卡片消息 =====
    if (isCard) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full mb-6 flex justify-start gap-3"
            >
                {/* 头像 */}
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg shadow-md mt-1">
                    👩‍🏫
                </div>

                {/* 内容区 */}
                <div className="flex-1 max-w-sm space-y-3">
                    {renderCard()}
                </div>
            </motion.div>
        );
    }

    // ===== 普通文本消息 =====
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
                "flex w-full items-end gap-3 mb-4",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            {!isUser && (
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg shadow-md">
                    👩‍🏫
                </div>
            )}

            <div
                className={cn(
                    "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                    isUser
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-sm"
                        : "bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-white/20 text-foreground rounded-bl-sm"
                )}
            >
                <div className="whitespace-pre-wrap">{message.content}</div>
            </div>

            {isUser && (
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white shadow-md">
                    <User size={18} />
                </div>
            )}
        </motion.div>
    );
}
