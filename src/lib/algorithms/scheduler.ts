import { WordProgress } from "../store/chat-store";
import { VOCABULARY_DATABASE, WordLearningData } from "../data/vocabulary-cards";

/**
 * Daily Session Configuration
 */
const SESSION_CONFIG = {
    max_reviews: 15,
    max_new_words: 5,
    max_total: 20
};

export interface DailyQueueItem {
    word: WordLearningData;
    type: 'review' | 'new';
    reason: string; // "Due today" or "New word"
}

/**
 * Scheduler: Generates the daily learning queue
 */
export const scheduler = {
    generateDailySession: (
        progressMap: Record<string, WordProgress>,
        learnedWords: string[]
    ): DailyQueueItem[] => {
        const queue: DailyQueueItem[] = [];
        const now = Date.now();

        // 1. Find Reviews (Due items)
        // Sort by due date (most overdue first)
        const dueItems = Object.values(progressMap)
            .filter(p => p.due <= now)
            .sort((a, b) => a.due - b.due);

        // Add Reviews (up to cap)
        for (const item of dueItems) {
            if (queue.length >= SESSION_CONFIG.max_reviews) break;

            const wordData = VOCABULARY_DATABASE.find(w => w.word === item.wordId);
            if (wordData) {
                queue.push({
                    word: wordData,
                    type: 'review',
                    reason: item.state === 'relearning' ? 'High Priority Review' : 'Review'
                });
            }
        }

        // 2. Fill with New Words
        // Find words NOT in progressMap
        const newCandidates = VOCABULARY_DATABASE.filter(w => !progressMap[w.word]);

        for (const word of newCandidates) {
            if (queue.length >= SESSION_CONFIG.max_total) break;
            if (queue.filter(q => q.type === 'new').length >= SESSION_CONFIG.max_new_words) break;

            queue.push({
                word: word,
                type: 'new',
                reason: 'New Word'
            });
        }

        return queue;
    },

    getStats: (progressMap: Record<string, WordProgress>) => {
        const values = Object.values(progressMap);
        const now = Date.now();
        return {
            totalLearned: values.length,
            dueToday: values.filter(p => p.due <= now).length,
            masteredCount: values.filter(p => p.state === 'review' && p.stability > 14).length // >2 weeks stability = mastered
        };
    }
};
