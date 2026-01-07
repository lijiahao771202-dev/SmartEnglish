'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/lib/store/chat-store';
import { CardStage, getStageName, getStageProgress } from '@/lib/learning/card-sequencer';

/**
 * 学习进度指示器
 * 显示当前学习阶段和倒计时
 */
export function LearningProgressIndicator() {
    const {
        currentCardStage,
        countdownActive,
        countdownSeconds,
        currentWordId
    } = useChatStore();

    const progress = getStageProgress(currentCardStage);

    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full shadow-sm">
            {/* 进度条 */}
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>

            {/* 阶段标签 */}
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                {getStageName(currentCardStage)}
            </span>

            {/* 倒计时 */}
            <AnimatePresence>
                {countdownActive && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/50 rounded-full"
                    >
                        <span className="text-green-600 dark:text-green-400 text-sm font-bold">
                            {countdownSeconds}s
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * 下一步按钮
 * 显示在卡片下方，用于手动推进或跳过倒计时
 */
export function NextStepButton() {
    const {
        currentCardStage,
        countdownActive,
        cancelCountdown,
        advanceToNextCard,
        switchWord,
        showCardForStage,
        currentWordId
    } = useChatStore();

    const handleNextWord = () => {
        cancelCountdown();
        // 找到下一个单词
        const VOCABULARY_DATABASE = require('@/lib/data/vocabulary-cards').VOCABULARY_DATABASE;
        const currentIdx = VOCABULARY_DATABASE.findIndex((w: any) => w.word === currentWordId);
        if (currentIdx < VOCABULARY_DATABASE.length - 1) {
            switchWord(VOCABULARY_DATABASE[currentIdx + 1].word);
            setTimeout(() => showCardForStage(CardStage.Detail), 300);
        }
    };

    if (currentCardStage as string === 'mastered') {
        return (
            <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNextWord}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
            >
                <span>下一个单词</span>
                {countdownActive && (
                    <span className="text-sm opacity-80">({useChatStore.getState().countdownSeconds}s)</span>
                )}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </motion.button>
        );
    }

    return null;
}
