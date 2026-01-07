"use client";

import React, { useState, useMemo } from "react";
import { useChatStore } from "@/lib/store/chat-store";
import { VOCABULARY_DATABASE } from "@/lib/data/vocabulary-cards";
import { getAllIELTSWords } from "@/lib/data/ielts-data";
import { cn } from "@/lib/utils";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    CheckCircle,
    MoreHorizontal,
    Trophy,
    BookOpen,
    GraduationCap
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [displayCount, setDisplayCount] = useState(50); // Lazy loading initial count

    const learnedWords = useChatStore((state) => state.learnedWords);
    const switchWord = useChatStore((state) => state.switchWord);
    const toggleLearnedWord = useChatStore((state) => state.toggleLearnedWord);
    const currentWordId = useChatStore((state) => state.currentWordId);

    // Mock User Data
    const user = {
        name: "Alex Chen",
        level: "Level 4",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        studyTrack: "IELTS Mastery"
    };

    const streak = 12;

    // Combine Core words with IELTS 7000
    const allWordIds = useMemo(() => {
        const coreWords = VOCABULARY_DATABASE.map(w => w.word);
        const ieltsWords = getAllIELTSWords();
        // Remove duplicates if any
        return Array.from(new Set([...coreWords, ...ieltsWords]));
    }, []);

    // Filtered words based on search
    const filteredWords = useMemo(() => {
        if (!searchQuery) return allWordIds;
        const query = searchQuery.toLowerCase();
        return allWordIds.filter(word => word.toLowerCase().includes(query));
    }, [allWordIds, searchQuery]);

    // Words to display (lazy loaded)
    const displayedWords = useMemo(() => {
        return filteredWords.slice(0, displayCount);
    }, [filteredWords, displayCount]);

    return (
        <motion.div
            initial={{ width: 280 }}
            animate={{ width: isCollapsed ? 80 : 280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
                "h-screen relative flex flex-col border-r border-white/20 shadow-xl z-20",
                "bg-slate-900/95 backdrop-blur-xl text-slate-100"
            )}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-8 bg-slate-800 border border-slate-700 rounded-full p-1 text-slate-400 hover:text-white transition-colors z-30"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Profile Section */}
            <div className={cn("p-6 flex items-center gap-4 border-b border-white/5", isCollapsed && "justify-center p-4")}>
                <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                            <img
                                src={user.avatar}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                </div>

                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 min-w-0"
                    >
                        <h3 className="font-semibold text-base truncate">{user.name}</h3>
                        <p className="text-xs text-slate-400 truncate">{user.studyTrack} • {user.level}</p>
                    </motion.div>
                )}
            </div>

            {/* Stats / Search Section */}
            {!isCollapsed ? (
                <div className="p-4 space-y-4">
                    {/* Search Bar */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search words..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all placeholder:text-slate-600"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
                            <span className="text-2xl font-bold bg-gradient-to-br from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                                {learnedWords.length}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Mastered</span>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5">
                            <span className="text-2xl font-bold bg-gradient-to-br from-amber-400 to-orange-400 bg-clip-text text-transparent">
                                {streak}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Streak</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-4 flex flex-col gap-4 items-center">
                    <button
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        title="Search"
                    >
                        <Search size={18} />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-violet-400" title="Milestones">
                        <Trophy size={18} />
                    </div>
                </div>
            )}

            {/* Syllabus List Header */}
            {!isCollapsed && (
                <div className="px-6 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between items-center opacity-60">
                    <span>{searchQuery ? `Search Results (${filteredWords.length})` : "IELTS 7000 Syllabus"}</span>
                    <BookOpen size={12} />
                </div>
            )}

            {/* Syllabus List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide space-y-1 mt-1">
                {displayedWords.map((wordId) => {
                    const isSelected = currentWordId === wordId;
                    const isMastered = learnedWords.includes(wordId);

                    return (
                        <div
                            key={wordId}
                            onClick={() => switchWord(wordId)}
                            className={cn(
                                "group flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer border",
                                isSelected
                                    ? "bg-white/10 border-white/20 shadow-lg shadow-violet-500/10"
                                    : "hover:bg-white/5 border-transparent hover:border-white/5",
                                isCollapsed && "justify-center p-2",
                                isMastered && !isSelected && "bg-emerald-500/5 border-emerald-500/10"
                            )}
                        >
                            {!isCollapsed ? (
                                <>
                                    <div className={cn(
                                        "w-1 h-5 rounded-full transition-colors",
                                        isMastered ? "bg-emerald-400" : isSelected ? "bg-violet-400" : "bg-slate-700 group-hover:bg-slate-500"
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <span className={cn(
                                                "font-medium truncate",
                                                isSelected ? "text-white" : "text-slate-400 group-hover:text-slate-200",
                                                isMastered && "text-emerald-400/80"
                                            )}>
                                                {wordId}
                                            </span>

                                            <div className="flex items-center gap-2">
                                                {isMastered && <CheckCircle size={10} className="text-emerald-500" />}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleLearnedWord(wordId);
                                                    }}
                                                    className={cn(
                                                        "p-1.5 rounded-lg transition-all",
                                                        isMastered
                                                            ? "text-emerald-400 bg-emerald-500/10 opacity-100"
                                                            : "text-slate-600 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100"
                                                    )}
                                                    title={isMastered ? "Mark as unlearned" : "Mark as mastered"}
                                                >
                                                    <GraduationCap size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    isMastered ? "bg-emerald-400" : isSelected ? "bg-violet-400" : "bg-slate-700"
                                )} title={wordId} />
                            )}
                        </div>
                    );
                })}

                {filteredWords.length > displayCount && !isCollapsed && (
                    <button
                        onClick={() => setDisplayCount(prev => prev + 50)}
                        className="w-full py-3 mt-2 text-xs text-slate-500 hover:text-violet-400 transition-colors bg-white/5 rounded-xl border border-dashed border-white/10"
                    >
                        Load more words...
                    </button>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5">
                <button
                    className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors",
                        isCollapsed && "justify-center"
                    )}
                    title="Settings"
                >
                    <MoreHorizontal size={20} />
                    {!isCollapsed && <span className="text-sm font-medium">More Options</span>}
                </button>
            </div>
        </motion.div>
    );
}
