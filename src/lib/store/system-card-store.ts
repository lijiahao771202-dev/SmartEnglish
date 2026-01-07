/**
 * 系统卡片状态管理
 * 卡片作为消息添加到聊天流中
 * 【核心改动】每张卡片出现时，AI 立即开始讲解（不用等交互）
 * 用户完成交互后，显示下一张卡片 + AI 继续讲解
 */

import { create } from 'zustand';
import { CardData, SystemCardType, CARD_SEQUENCE, getCardTypeName } from '@/lib/ai/card-types';
import { WordLearningData, getWordData } from '@/lib/data/vocabulary-cards';
import { generateCard } from '@/lib/learning/system-card-generator';
import { CardContext } from '@/lib/ai/prompts';

// 回调类型
type AddCardMessageFn = (cardData: CardData) => void;
type AddTextMessageFn = (content: string) => void;
type StreamAIResponseFn = (
    cardType: string,
    description: string,
    context: CardContext
) => Promise<void>;
type MarkWordAsLearnedFn = (wordId: string) => void;

interface SystemCardState {
    // 当前单词
    currentWord: WordLearningData | null;

    // 当前卡片索引
    currentCardIndex: number;

    // 已完成的卡片类型
    completedCards: Set<SystemCardType>;

    // 是否完成所有卡片
    isCompleted: boolean;

    // 外部回调
    addCardMessage: AddCardMessageFn | null;
    addTextMessage: AddTextMessageFn | null;
    streamAIResponse: StreamAIResponseFn | null;
    markWordAsLearned: MarkWordAsLearnedFn | null;  // 标记单词为已学习

    // Actions
    startWord: (wordId: string) => void;
    advanceCard: () => void;  // 改为同步，不再触发 AI
    reset: () => void;

    // 设置回调
    setCallbacks: (
        addCard: AddCardMessageFn,
        addText: AddTextMessageFn,
        streamAI: StreamAIResponseFn,
        markLearned: MarkWordAsLearnedFn
    ) => void;
}

// 生成卡片讲解描述（卡片出现时用）
function generateCardDescription(cardType: SystemCardType, word: string): string {
    const cardName = getCardTypeName(cardType);

    switch (cardType) {
        case 'phonetic':
            return `现在展示 "${word}" 的发音卡。请帮学生理解这个词的发音特点，分享发音技巧或有趣的记忆方法。`;
        case 'definition':
            return `现在展示 "${word}" 的释义卡。请帮学生深入理解这个词的含义，可以分享词源、文化背景或使用场景。`;
        case 'example':
            return `现在展示 "${word}" 的例句卡。请帮学生理解这个句子的用法，可以补充其他场景的用法或类似表达。`;
        case 'memory_hook':
            return `现在展示 "${word}" 的助记卡。请帮学生加强记忆，可以分享更多记忆技巧或联想方法。`;
        case 'collocation':
            return `现在展示 "${word}" 的搭配卡。请帮学生掌握常用搭配，可以模拟一个对话场景或分享使用技巧。`;
        case 'spelling':
            return `现在展示 "${word}" 的拼写卡。请给学生一些拼写提示或鼓励，帮助他们完成挑战。`;
        default:
            return `现在展示 "${word}" 的${cardName}。请帮学生理解这个内容。`;
    }
}

export const useSystemCardStore = create<SystemCardState>((set, get) => ({
    currentWord: null,
    currentCardIndex: 0,
    completedCards: new Set(),
    isCompleted: false,
    addCardMessage: null,
    addTextMessage: null,
    streamAIResponse: null,
    markWordAsLearned: null,

    setCallbacks: (addCard, addText, streamAI, markLearned) => {
        set({
            addCardMessage: addCard,
            addTextMessage: addText,
            streamAIResponse: streamAI,
            markWordAsLearned: markLearned
        });
    },

    startWord: (wordId: string) => {
        const word = getWordData(wordId);
        if (!word) {
            console.warn(`[SystemCard] Word not found: ${wordId}`);
            return;
        }

        const { addCardMessage, addTextMessage, streamAIResponse } = get();

        // 重置状态
        set({
            currentWord: word,
            currentCardIndex: 0,
            completedCards: new Set(),
            isCompleted: false
        });

        // 生成第一张卡片
        const firstCardType = CARD_SEQUENCE[0];
        const firstCard = generateCard(word, firstCardType);

        if (firstCard && addCardMessage) {
            // 1. 添加卡片到聊天流
            addCardMessage(firstCard);

            // 2. 构建上下文
            const context: CardContext = {
                word: word.word,
                phonetic: word.detail?.phonetic,
                definition: word.detail?.definition,
                definitionEn: word.detail?.definitionEn,
                sentence: word.detail?.exampleSentence,
                translation: word.detail?.exampleTranslation,
                memoryHook: word.detail?.aiSupplement,
                collocations: (word.detail as { collocations?: { phrase: string; translation: string }[] })
                    ?.collocations?.map((c: { phrase: string; translation: string }) => `${c.phrase} (${c.translation})`).join(', ')
            };

            // 3. 【核心】卡片出现后立即触发 AI 讲解
            const description = generateCardDescription(firstCardType, word.word);
            addTextMessage?.('');  // 添加空消息用于流式填充
            streamAIResponse?.(firstCardType, description, context);
        }

        console.log(`[SystemCard] Started word: ${wordId}, first card + AI explanation`);
    },

    advanceCard: () => {
        const {
            currentWord,
            currentCardIndex,
            completedCards,
            addCardMessage,
            addTextMessage,
            streamAIResponse
        } = get();

        if (!currentWord) return;

        // 获取当前卡片类型
        const currentCardType = CARD_SEQUENCE[currentCardIndex];

        // 标记当前卡片为完成
        const newCompleted = new Set(completedCards);
        newCompleted.add(currentCardType);

        // 寻找下一张可用卡片
        let nextCard: CardData | null = null;
        let nextIndex = currentCardIndex + 1;

        for (let i = nextIndex; i < CARD_SEQUENCE.length; i++) {
            const card = generateCard(currentWord, CARD_SEQUENCE[i]);
            if (card) {
                nextCard = card;
                nextIndex = i;
                break;
            }
        }

        if (nextCard) {
            // 更新状态
            set({
                currentCardIndex: nextIndex,
                completedCards: newCompleted
            });

            // 1. 添加下一张卡片到聊天流
            addCardMessage?.(nextCard);

            // 2. 构建上下文
            const context: CardContext = {
                word: currentWord.word,
                phonetic: currentWord.detail?.phonetic,
                definition: currentWord.detail?.definition,
                definitionEn: currentWord.detail?.definitionEn,
                sentence: currentWord.detail?.exampleSentence,
                translation: currentWord.detail?.exampleTranslation,
                memoryHook: currentWord.detail?.aiSupplement,
                collocations: (currentWord.detail as { collocations?: { phrase: string; translation: string }[] })
                    ?.collocations?.map((c: { phrase: string; translation: string }) => `${c.phrase} (${c.translation})`).join(', ')
            };

            // 3. 【核心】卡片出现后立即触发 AI 讲解
            const nextCardType = CARD_SEQUENCE[nextIndex];
            const description = generateCardDescription(nextCardType, currentWord.word);
            addTextMessage?.('');
            streamAIResponse?.(nextCardType, description, context);

            console.log(`[SystemCard] Advanced to: ${nextCard.type}`);
        } else {
            // 所有卡片完成
            const { markWordAsLearned } = get();

            set({
                completedCards: newCompleted,
                isCompleted: true
            });

            // 🌟 标记单词为已学习
            if (markWordAsLearned) {
                markWordAsLearned(currentWord.word);
            }

            // 添加完成消息
            addTextMessage?.(`🎉 太棒了！你已完成 **${currentWord.word}** 的全部学习！可以问我任何问题，或者继续学习下一个单词～`);

            console.log(`[SystemCard] All cards completed for: ${currentWord.word}, marked as learned`);
        }
    },

    reset: () => {
        set({
            currentWord: null,
            currentCardIndex: 0,
            completedCards: new Set(),
            isCompleted: false
        });
    }
}));
