/**
 * 系统卡片生成器
 * 根据单词数据生成 7 张卡片（含仿写卡）
 */

import { WordLearningData } from '@/lib/data/vocabulary-cards';
import {
    CardData,
    SystemCardType,
    CARD_SEQUENCE,
    PhoneticCardData,
    DefinitionCardData,
    ExampleCardData,
    MemoryHookCardData,
    CollocationCardData,
    SpellingCardData,
    WritingCardData
} from '@/lib/ai/card-types';

/**
 * 根据单词数据生成指定类型的卡片
 */
export function generateCard(word: WordLearningData, type: SystemCardType): CardData | null {
    switch (type) {
        case 'phonetic':
            return {
                type: 'phonetic',
                word: word.word,
                phonetic: word.detail?.phonetic || ''
            } as PhoneticCardData;

        case 'definition':
            return {
                type: 'definition',
                word: word.word,
                definition: word.detail?.definition || '',
                definitionEn: word.detail?.definitionEn
            } as DefinitionCardData;

        case 'example':
            if (!word.detail?.exampleSentence) return null;
            return {
                type: 'example',
                word: word.word,
                sentence: word.detail.exampleSentence,
                translation: word.detail.exampleTranslation || ''
            } as ExampleCardData;

        case 'memory_hook':
            if (!word.detail?.aiSupplement) return null;
            return {
                type: 'memory_hook',
                word: word.word,
                content: word.detail.aiSupplement
            } as MemoryHookCardData;

        case 'collocation':
            if (!word.collocations || word.collocations.length === 0) return null;
            return {
                type: 'collocation',
                word: word.word,
                collocations: word.collocations
            } as CollocationCardData;

        case 'spelling':
            return {
                type: 'spelling',
                word: word.word,
                hint: word.detail?.definition || ''
            } as SpellingCardData;

        case 'writing':
            return {
                type: 'writing',
                word: word.word,
                prompt: `请用 "${word.word}" 造一个句子`,
                exampleSentence: word.detail?.exampleSentence || '',
                definition: word.detail?.definition || ''
            } as WritingCardData;

        default:
            return null;
    }
}


/**
 * 生成单词的所有可用卡片
 */
export function generateAllCards(word: WordLearningData): CardData[] {
    const cards: CardData[] = [];

    for (const type of CARD_SEQUENCE) {
        const card = generateCard(word, type);
        if (card) {
            cards.push(card);
        }
    }

    return cards;
}

/**
 * 获取单词的第一张卡片
 */
export function getFirstCard(word: WordLearningData): CardData | null {
    for (const type of CARD_SEQUENCE) {
        const card = generateCard(word, type);
        if (card) {
            return card;
        }
    }
    return null;
}

/**
 * 获取下一张卡片
 */
export function getNextCard(word: WordLearningData, currentType: SystemCardType): CardData | null {
    const currentIndex = CARD_SEQUENCE.indexOf(currentType);

    for (let i = currentIndex + 1; i < CARD_SEQUENCE.length; i++) {
        const card = generateCard(word, CARD_SEQUENCE[i]);
        if (card) {
            return card;
        }
    }

    return null; // 没有下一张卡片了
}
