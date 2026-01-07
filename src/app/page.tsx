"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/features/sidebar/Sidebar";
import { ChatInterface } from "@/components/features/chat/ChatInterface";
import { DailyDashboard } from "@/components/features/dashboard/DailyDashboard";
import { useChatStore } from "@/lib/store/chat-store";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
    const dailySessionActive = useChatStore(s => s.dailySessionActive);
    const startDailySession = useChatStore(s => s.startDailySession);

    // Handle start session click
    const handleStart = async () => {
        startDailySession();
    };

    return (
        <main className="flex h-screen w-full bg-slate-950 overflow-hidden relative">
            <AnimatePresence mode="wait">
                {!dailySessionActive ? (
                    <motion.div
                        key="dashboard"
                        className="w-full h-full z-10"
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        transition={{ duration: 0.5 }}
                    >
                        <DailyDashboard onStart={handleStart} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="session"
                        className="flex w-full h-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Sidebar />
                        <ChatInterface />
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
