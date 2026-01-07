"use client";

import React, { useState } from "react";
import { useChatStore } from "@/lib/store/chat-store";
import { VOCABULARY_DATABASE } from "@/lib/data/vocabulary-cards";
import { cn } from "@/lib/utils";
import {
    ChevronLeft,
    ChevronRight,
    User,
    Trophy,
    Flame,
    CheckCircle,
    ListChecks,
    MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const learnedWords = useChatStore((state) => state.learnedWords);
    const switchWord = useChatStore((state) => state.switchWord);
    const currentWordId = useChatStore((state) => state.currentWordId);

    // Mock User Data (Replace with real auth later)
    const user = {
        name: "Alex Chen",
        level: "Level 4",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", // Placeholder
        studyTrack: "Academic English"
    };

    // Calculate simulated streak (logic placeholder)
    const streak = 12;

    // Helper to get status of a word
    const getWordStatus = (wordName: string) => {
        const isLearned = learnedWords.includes(wordName);
        if (!isLearned) return { label: "Due Now", color: "text-rose-500", bg: "bg-rose-500/10", icon: null };
        return { label: "Mastered", color: "text-emerald-400", bg: "bg-emerald-500/20", icon: CheckCircle };
    };

    // Generate syllabus list
    const syllabus = VOCABULARY_DATABASE.map(word => ({
        ...word,
        status: getWordStatus(word.word)
    }));

    return (
        <motion.div
            initial={{ width: 280 }}
            animate={{ width: isCollapsed ? 80 : 280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
                "h-screen relative flex flex-col border-r border-white/20 shadow-xl z-20",
                "bg-slate-900/95 backdrop-blur-xl text-slate-100" // Dark aesthetic base
            )}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-8 bg-slate-800 border border-slate-700 rounded-full p-1 text-slate-400 hover:text-white transition-colors z-30"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Profile Section */}
            <div className={cn("p-6 flex items-center gap-4 border-b border-white/5", isCollapsed && "justify-center p-4")}>
                <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                </div>

                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 min-w-0"
                    >
                        <h3 className="font-semibold text-base truncate">{user.name}</h3>
                        <p className="text-xs text-slate-400 truncate">{user.studyTrack} • {user.level}</p>
                    </motion.div>
                )}
            </div>

            {/* Stats Grid */}
            {!isCollapsed ? (
                <div className="p-6 grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5">
                        <span className="text-3xl font-bold bg-gradient-to-br from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                            {learnedWords.length}
                        </span>
                        <span className="text-xs text-slate-400 mt-1">Mastered</span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5">
                        <span className="text-3xl font-bold bg-gradient-to-br from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            {streak}
                        </span>
                        <span className="text-xs text-slate-400 mt-1">Day Streak</span>
                    </div>
                </div>
            ) : (
                <div className="p-4 flex flex-col gap-4 items-center">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-violet-400">
                        <Trophy size={18} />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-amber-400">
                        <Flame size={18} />
                    </div>
                </div>
            )}

            {/* Syllabus List Header */}
            <div className={cn("px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center", isCollapsed && "hidden")}>
                <span>Invisible Syllabus (FSRS)</span>
                <ListChecks size={14} />
            </div>

            {/* Syllabus List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide space-y-2 mt-2">
                {syllabus.map((item, idx) => {
                    const isSelected = currentWordId === item.word;
                    const isMastered = learnedWords.includes(item.word);

                    return (
                        <div
                            key={idx}
                            onClick={() => switchWord(item.word)}
                            className={cn(
                                "group flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer border",
                                isSelected
                                    ? "bg-white/10 border-white/20 shadow-lg shadow-violet-500/10"
                                    : "hover:bg-white/5 border-transparent hover:border-white/5",
                                isCollapsed && "justify-center p-2",
                                isMastered && !isSelected && "bg-emerald-500/5 border-emerald-500/20",
                                isMastered && isSelected && "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]"
                            )}
                        >
                            <div className={cn(
                                "w-1 h-8 rounded-full transition-colors font-bold",
                                isMastered
                                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                                    : isSelected ? "bg-violet-400" : "bg-slate-700"
                            )} />

                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className={cn(
                                                "font-medium transition-colors",
                                                isSelected ? "text-white" : "text-slate-300",
                                                isMastered && "text-emerald-100"
                                            )}>{item.word}</span>
                                            {isMastered && <CheckCircle size={12} className="text-emerald-400" />}
                                        </div>
                                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-medium", item.status.color, item.status.bg)}>
                                            {item.status.label}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                                        <span>S: 5.0 D: 6.8</span> {/* Mock FSRS stats */}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer / Settings */}
            <div className="p-4 border-t border-white/5">
                <button className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors",
                    isCollapsed && "justify-center"
                )}>
                    <MoreHorizontal size={20} />
                    {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
                </button>
            </div>

        </motion.div>
    );
}
