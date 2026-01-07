"use client";

import { motion } from "framer-motion";
import type { Message } from "@/lib/store/chat-store";
import { useChatStore } from "@/lib/store/chat-store";
import { User, Volume2, Loader2, StopCircle } from "lucide-react";
import { MarkdownRenderer } from "./markdown/MarkdownRenderer";
import { SystemCardRenderer } from "../cards/SystemCardRenderer";
import { useSystemCardStore } from "@/lib/store/system-card-store";
import { useState, useRef, useEffect } from "react";

interface MessageBubbleProps {
    message: Message;
    isLastMessage?: boolean;  // 是否是最后一条消息
}

// 根据 AI 消息内容生成相关快捷回复
function generateContextualReplies(content: string): { text: string; emoji: string }[] {
    const replies: { text: string; emoji: string }[] = [];

    // 基础回复
    if (content.includes('发音') || content.includes('读') || content.includes('音标')) {
        replies.push({ text: '再读一遍', emoji: '🔊' });
    }

    if (content.includes('词源') || content.includes('来自') || content.includes('故事')) {
        replies.push({ text: '讲更多故事', emoji: '📖' });
    }

    if (content.includes('场景') || content.includes('对话') || content.includes('例如')) {
        replies.push({ text: '再来个场景', emoji: '🎬' });
    }

    if (content.includes('记忆') || content.includes('联想') || content.includes('技巧')) {
        replies.push({ text: '其他记忆法', emoji: '💡' });
    }

    if (content.includes('搭配') || content.includes('短语')) {
        replies.push({ text: '更多搭配', emoji: '🔗' });
    }

    // 🚀 如果是开始学习的引导
    if (content.includes('准备好学习') || content.includes('沉浸式学习')) {
        return [{ text: '🚀 开始学习', emoji: '' }];
    }

    // 通用回复（如果没有检测到特定内容）
    if (replies.length === 0) {
        replies.push({ text: '讲讲词源', emoji: '📚' });
        replies.push({ text: '来个场景', emoji: '🎬' });
    }

    // 始终添加"继续"
    replies.push({ text: '继续学习', emoji: '➡️' });

    return replies.slice(0, 3);  // 最多 3 个
}

export function MessageBubble({ message, isLastMessage = false }: MessageBubbleProps) {
    const isUser = message.role === "user";
    const advanceCard = useSystemCardStore((state) => state.advanceCard);
    const sendMessage = useChatStore((state) => state.sendMessage);
    const isTyping = useChatStore((state) => state.isTyping);

    // TTS State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingTTS, setIsLoadingTTS] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // 🌟 自动播放逻辑 (Auto-play)
    // 条件：是最后一条 + 是 AI 消息 + 有内容 + 没在输入 + 没播放过
    const hasAutoPlayedRef = useRef(false);

    // 如果消息 ID 变了，重置播放状态（处理相同组件复用情况）
    useEffect(() => {
        hasAutoPlayedRef.current = false;
    }, [message.id]);

    useEffect(() => {
        if (
            isLastMessage &&           // 必须是最后一条
            !isUser &&                 // 必须是 AI
            message.content &&         // 必须有内容
            message.content.length > 0 &&
            !isTyping &&               // 必须生成完毕
            !hasAutoPlayedRef.current && // 没播放过
            !isPlaying &&              // 没在播放
            !isLoadingTTS              // 没在加载
        ) {
            console.log('[AutoPlay] Triggering TTS for message:', message.id);
            hasAutoPlayedRef.current = true;
            playTTS();
        }
    }, [isLastMessage, isUser, message.content, isTyping, isPlaying, isLoadingTTS]);

    const playTTS = async () => {
        if (isPlaying) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setIsPlaying(false);
            return;
        }

        if (!message.content) return;

        setIsLoadingTTS(true);
        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: message.content })
            });

            if (!response.ok) throw new Error('TTS failed');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            if (audioRef.current) {
                audioRef.current.pause();
            }

            const audio = new Audio(url);
            audioRef.current = audio;

            audio.onended = () => setIsPlaying(false);
            audio.onerror = () => {
                setIsPlaying(false);
                setIsLoadingTTS(false);
            };

            await audio.play();
            setIsPlaying(true);
        } catch (error) {
            console.error('TTS Playback Error:', error);
        } finally {
            setIsLoadingTTS(false);
        }
    };

    // 处理快捷回复点击
    const handleQuickReply = (text: string) => {
        sendMessage(text);
    };

    // 如果是用户消息
    if (isUser) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex w-full items-end gap-3 mb-4 justify-end"
            >
                <div className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-sm">
                    <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white shadow-md">
                    <User size={18} />
                </div>
            </motion.div>
        );
    }

    // 生成快捷回复（仅对最后一条 AI 消息且有内容时）
    const quickReplies = isLastMessage && message.content && !isTyping
        ? generateContextualReplies(message.content)
        : [];

    // 如果是 AI 消息
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex w-full items-start gap-3 mb-4 justify-start"
        >
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg shadow-md">
                👩‍🏫
            </div>
            <div className="max-w-[85%]">
                {/* 文本内容 */}
                {message.content && (
                    <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-white/20 text-foreground rounded-bl-sm mb-2 relative group">
                        <MarkdownRenderer content={message.content} />

                        {/* TTS Play Button */}
                        {!isTyping && (
                            <button
                                onClick={playTTS}
                                disabled={isLoadingTTS}
                                className="absolute -right-8 top-1 p-1.5 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title={isPlaying ? "停止朗读" : "朗读消息"}
                            >
                                {isLoadingTTS ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : isPlaying ? (
                                    <StopCircle size={16} className="text-blue-500" />
                                ) : (
                                    <Volume2 size={16} />
                                )}
                            </button>
                        )}

                        {/* 内联快捷回复 */}
                        {quickReplies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200/50 dark:border-white/10">
                                {quickReplies.map((reply, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickReply(reply.text)}
                                        className="px-3 py-1.5 text-xs rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400 transition-all hover:scale-105"
                                    >
                                        {reply.emoji} {reply.text}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 系统卡片 */}
                {message.type === 'card' && message.cardData && (
                    <SystemCardRenderer
                        cardData={message.cardData}
                        onComplete={advanceCard}
                    />
                )}
            </div>
        </motion.div>
    );
}
