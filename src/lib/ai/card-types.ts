/**
 * 系统驱动卡片类型定义
 * 6 种核心卡片：发音/释义/例句/助记/搭配/拼写
 */

// 卡片类型枚举
export type SystemCardType =
    | 'phonetic'      // 发音卡
    | 'definition'    // 释义卡
    | 'example'       // 例句卡
    | 'memory_hook'   // 助记卡
    | 'collocation'   // 搭配卡
    | 'spelling'      // 拼写卡
    | 'writing';      // 仿写卡

// 卡片序列顺序
export const CARD_SEQUENCE: SystemCardType[] = [
    'phonetic',
    'definition',
    'example',
    'memory_hook',
    'collocation',
    'spelling',
    'writing'  // 仿写卡放在最后
];

// 基础卡片数据
export interface BaseCardData {
    type: SystemCardType;
    word: string;
}

// 发音卡
export interface PhoneticCardData extends BaseCardData {
    type: 'phonetic';
    phonetic: string;
}

// 释义卡
export interface DefinitionCardData extends BaseCardData {
    type: 'definition';
    definition: string;
    definitionEn?: string;
}

// 例句卡
export interface ExampleCardData extends BaseCardData {
    type: 'example';
    sentence?: string;
    translation?: string;
    // 兼容旧数据格式
    examples?: { sentence: string; translation: string }[];
}

// 助记卡
export interface MemoryHookCardData extends BaseCardData {
    type: 'memory_hook';
    content: string;  // 词根/联想/口诀
}

// 搭配卡
export interface CollocationCardData extends BaseCardData {
    type: 'collocation';
    collocations: { phrase: string; translation: string }[];
}

// 拼写卡
export interface SpellingCardData extends BaseCardData {
    type: 'spelling';
    hint: string;  // 中文释义作为提示
}

// 仿写卡
export interface WritingCardData extends BaseCardData {
    type: 'writing';
    prompt: string;      // 仿写提示
    exampleSentence: string;  // 参考例句
    definition: string;  // 单词释义
}

// 联合类型
export type CardData =
    | PhoneticCardData
    | DefinitionCardData
    | ExampleCardData
    | MemoryHookCardData
    | CollocationCardData
    | SpellingCardData
    | WritingCardData;

// 获取下一个卡片类型
export function getNextCardType(current: SystemCardType): SystemCardType | null {
    const index = CARD_SEQUENCE.indexOf(current);
    if (index === -1 || index >= CARD_SEQUENCE.length - 1) {
        return null;
    }
    return CARD_SEQUENCE[index + 1];
}

// 获取卡片显示名称
export function getCardTypeName(type: SystemCardType): string {
    const names: Record<SystemCardType, string> = {
        phonetic: '🔊 发音',
        definition: '📖 释义',
        example: '📝 例句',
        memory_hook: '💡 助记',
        collocation: '🔗 搭配',
        spelling: '✍️ 拼写',
        writing: '📝 仿写'
    };
    return names[type];
}

// ===== 向后兼容类型 (旧组件使用) =====
export interface DetailCardData {
    type: 'detail';
    word: string;
    phonetic: string;
    definition: string;
    definitionEn?: string;
    exampleSentence: string;
    exampleTranslation: string;
    aiSupplement?: string;
}

export interface QuizCardData {
    type: 'quiz';
    word: string;
    question: string;
    options: { text?: string; label: string; id: string; isCorrect: boolean }[];
    explanation: string;
}

export interface SpeakingCardData {
    type: 'speaking';
    word: string;
    sentence: string;
    sentenceTranslation: string;
    highlightWord: string;
}

export interface SpellingWritingCardData {
    type: 'spelling_writing';
    word: string;
    hint: string;
    definition: string;
    exampleSentence: string;
}

export interface SceneCardData {
    type: 'scene';
    location: string;
    role_ai: string;
    role_user: string;
}

export interface JourneyCardData {
    type: 'journey';
    word: string;
    phonetic: string;
    definition: string;
    englishDefinition?: string;
    supplement?: string;
    examples: { sentence: string; translation: string }[];
    collocations: { phrase: string; translation: string }[];
}

// 合并旧类型
export type LegacyCardData =
    | DetailCardData
    | QuizCardData
    | SpeakingCardData
    | SpellingWritingCardData
    | SceneCardData
    | JourneyCardData;
