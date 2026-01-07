"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, TrendingUp, BookOpen, Clock } from "lucide-react";
import { useChatStore } from "@/lib/store/chat-store";
import { scheduler } from "@/lib/algorithms/scheduler";

export function DailyDashboard({ onStart }: { onStart: () => void }) {
    const wordProgress = useChatStore(s => s.wordProgress);
    const learnedWords = useChatStore(s => s.learnedWords);
    const [stats, setStats] = useState({ totalLearned: 0, dueToday: 0, masteredCount: 0 });

    useEffect(() => {
        // Hydration safe stat calculation
        setStats(scheduler.getStats(wordProgress));
    }, [wordProgress]);

    // Circle config
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    // Mock daily goals: 5 new words, 10 reviews
    const goalNew = 5;
    const goalReview = 10;

    // Calculate progress (mock logic for "today's new words", need to track daily added count eventually)
    // For now, let's assume dueToday is the review progress waiting to be cleared
    const percentReview = Math.min(1, stats.dueToday / goalReview); // This logic is inverted (items LEFT vs items DONE). 
    // Optimization: Apple Rings show "Done". So we need "Today's Review Done".
    // For MVP, let's just show "Due" count as a visual number, and Ring represents "Readiness".
    // Let's simple it: The ring fills up as you COMPLETE reviews.
    // For now, let's just make it static "Ready to start" visual.

    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-slate-950 text-white relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 text-center mb-12"
            >
                <h1 className="text-4xl font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent mb-2">
                    Good Morning, Alex
                </h1>
                <p className="text-slate-400">Your mind is ready to flow.</p>
            </motion.div>

            {/* Rings Container */}
            <div className="relative w-64 h-64 mb-16 flex items-center justify-center">
                {/* Outer Ring: Reviews (Blue) */}
                <svg className="absolute w-full h-full rotate-[-90deg]">
                    <circle cx="50%" cy="50%" r="45%" stroke="#1e293b" strokeWidth="12" fill="none" />
                    <motion.circle
                        cx="50%" cy="50%" r="45%" stroke="#3b82f6" strokeWidth="12" fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * 0.3} // 70% full mock
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 0.7 }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                    />
                </svg>

                {/* Inner Ring: New Words (Green) */}
                <svg className="absolute w-3/4 h-3/4 rotate-[-90deg]">
                    <circle cx="50%" cy="50%" r="45%" stroke="#1e293b" strokeWidth="12" fill="none" />
                    <motion.circle
                        cx="50%" cy="50%" r="45%" stroke="#10b981" strokeWidth="12" fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * 0.6} // 40% full mock
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 0.4 }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                    />
                </svg>

                {/* Center Stats */}
                <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-white">{stats.dueToday}</span>
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Due Reviews</span>
                </div>
            </div>

            {/* Start Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStart}
                className="group relative px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] transition-all flex items-center gap-3"
            >
                <div className="bg-slate-900 rounded-full p-1 group-hover:bg-blue-600 transition-colors">
                    <Play className="w-4 h-4 text-white" fill="currentColor" />
                </div>
                Start Daily Mix
            </motion.button>

            {/* Grid Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 w-full max-w-2xl px-4">
                <StatCard icon={BookOpen} label="Learned Words" value={stats.totalLearned} color="text-emerald-400" />
                <StatCard icon={TrendingUp} label="Retention" value="94%" color="text-blue-400" />
                <StatCard icon={Clock} label="Time Spent" value="12m" color="text-purple-400" />
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="flex flex-col items-center p-4 rounded-xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <span className="text-xl font-bold text-white">{value}</span>
            <span className="text-xs text-slate-500">{label}</span>
        </div>
    );
}
