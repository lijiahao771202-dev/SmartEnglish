"use client";

import { useState } from "react";
import { Send, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/lib/store/chat-store";

export function ChatInput() {
    const [input, setInput] = useState("");
    const isTyping = useChatStore((state) => state.isTyping);
    const sendMessage = useChatStore((state) => state.sendMessage);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userContent = input.trim();
        setInput(""); // 立即清空输入框

        // 调用 store 的 sendMessage 方法
        await sendMessage(userContent);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-2 bg-gradient-to-t from-background via-background to-transparent z-50">
            <form
                onSubmit={handleSubmit}
                className="glass p-2 pl-4 rounded-2xl flex items-center gap-2 w-full max-w-md mx-auto transition-all duration-300 focus-within:ring-2 ring-blue-500/30 shadow-lg"
            >
                <button
                    type="button"
                    className="p-2 rounded-full bg-black/5 dark:bg-white/10 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                >
                    <Mic size={18} className="opacity-70" />
                </button>

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="有问题？随时问我..."
                    disabled={isTyping}
                    className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-muted-foreground/50 h-10 disabled:opacity-50"
                />

                <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className={cn(
                        "p-2.5 rounded-full transition-all duration-300 transform",
                        input.trim() && !isTyping
                            ? "bg-blue-500 text-white rotate-0 opacity-100 hover:bg-blue-600 active:scale-95"
                            : "bg-transparent text-muted-foreground rotate-90 opacity-50 cursor-not-allowed"
                    )}
                >
                    <Send size={18} fill={input.trim() ? "currentColor" : "none"} />
                </button>
            </form>
        </div>
    );
}
