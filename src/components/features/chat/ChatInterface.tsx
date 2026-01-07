"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/lib/store/chat-store";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { QuickReplies } from "./QuickReplies";
import { BookOpen, Zap, ZapOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatInterface() {
    const messages = useChatStore((state) => state.messages);
    const isTyping = useChatStore((state) => state.isTyping);
    const quickReplies = useChatStore((state) => state.quickReplies);
    const handleQuickReply = useChatStore((state) => state.handleQuickReply);
    const autoMode = useChatStore((state) => state.autoMode);
    const toggleAutoMode = useChatStore((state) => state.toggleAutoMode);
    const autoContinue = useChatStore((state) => state.autoContinue);
    const handleUserSilence = useChatStore((state) => state.handleUserSilence);
    const currentWordId = useChatStore((state) => state.currentWordId);
    const learnedWords = useChatStore((state) => state.learnedWords);
    const clearData = useChatStore((state) => state.clearData);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 自动滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, quickReplies]);

    // 监测用户空闲（沉默）
    useEffect(() => {
        const resetTimer = () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            if (!isTyping && !autoMode && messages.length > 0) {
                silenceTimerRef.current = setTimeout(() => {
                    handleUserSilence();
                }, 15000);
            }
        };

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keypress', resetTimer);
        window.addEventListener('click', resetTimer);
        window.addEventListener('scroll', resetTimer);
        window.addEventListener('touchstart', resetTimer);

        resetTimer();

        return () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keypress', resetTimer);
            window.removeEventListener('click', resetTimer);
            window.removeEventListener('scroll', resetTimer);
            window.removeEventListener('touchstart', resetTimer);
        };
    }, [isTyping, autoMode, messages.length, handleUserSilence]);

    // 自动模式启动
    useEffect(() => {
        if (autoMode && !isTyping) {
            const timer = setTimeout(() => autoContinue(), 2000);
            return () => clearTimeout(timer);
        }
    }, [autoMode, isTyping, autoContinue]);

    return (
        <div className="flex-1 flex flex-col h-full relative min-w-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
            {/* Minimal Header */}
            <div className="absolute top-0 right-0 left-0 p-4 z-10 flex justify-between items-center pointer-events-none">
                <div className="pointer-events-auto pl-4 md:pl-0">
                    {/* Mobile sidebar toggle placeholder or empty if desktop only handled elsewhere */}
                    {currentWordId && (
                        <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 dark:bg-slate-900/40 dark:border-white/10 shadow-sm">
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{currentWordId}</span>
                            {learnedWords.includes(currentWordId) && (
                                <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">Mastered</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="pointer-events-auto flex items-center gap-2">
                    <button
                        onClick={() => {
                            if (confirm('确定要清除所有学习数据和对话记录吗？此操作无法撤销。')) {
                                clearData();
                            }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all backdrop-blur-md border bg-white/40 border-white/20 text-slate-600 dark:bg-slate-900/40 dark:border-white/10 dark:text-slate-300 hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:hover:text-red-400"
                        title="Reset Data"
                    >
                        <Trash2 size={12} />
                        <span className="hidden sm:inline">Reset</span>
                    </button>

                    <button
                        onClick={toggleAutoMode}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all backdrop-blur-md border",
                            autoMode
                                ? "bg-amber-500/90 border-amber-500/50 text-white shadow-lg shadow-amber-500/20"
                                : "bg-white/40 border-white/20 text-slate-600 dark:bg-slate-900/40 dark:border-white/10 dark:text-slate-300 hover:bg-white/60"
                        )}
                    >
                        {autoMode ? <Zap size={12} /> : <ZapOff size={12} />}
                        {autoMode ? "Auto On" : "Auto Off"}
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
                <div className="max-w-2xl mx-auto flex flex-col min-h-full py-10">
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex gap-1 p-4 animate-pulse text-slate-400">
                            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    )}

                    {/* Quick Replies */}
                    {!isTyping && quickReplies.length > 0 && (
                        <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-4 mt-2">
                            <QuickReplies
                                replies={quickReplies}
                                onSelect={handleQuickReply}
                                disabled={isTyping}
                            />
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Chat Input */}
            <div className="w-full max-w-2xl mx-auto px-4 pb-6">
                <ChatInput />
            </div>
        </div>
    );
}
