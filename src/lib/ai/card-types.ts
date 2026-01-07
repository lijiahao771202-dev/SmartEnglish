// 新卡片类型定义 - 4 种核心卡片
export type CardType =
    | 'detail'      // 详情卡
    | 'quiz'        // 四选一测验
    | 'speaking'    // 发音跟读
    | 'spelling_writing';  // 拼写与仿写

export interface BaseCardData {
    type: CardType;
    word: string;
    title?: string;
}

// ===== 1. DetailCard 详情卡 =====
export interface DetailCardData extends BaseCardData {
    type: 'detail';
    word: string;
    phonetic: string;
    definition: string;           // 中文释义
    definitionEn?: string;        // 英文释义
    exampleSentence: string;      // 例句
    exampleTranslation: string;   // 例句翻译
    aiSupplement?: string;        // AI 补充内容 (词源/联想/文化)
}

// ===== 2. QuizCard 四选一测验 =====
export interface QuizCardData extends BaseCardData {
    type: 'quiz';
    question: string;
    options: {
        id: string;
        label: string;
        isCorrect: boolean;
    }[];
    explanation: string;  // 答案解释
}

// ===== 3. SpeakingCard 发音跟读 =====
export interface SpeakingCardData extends BaseCardData {
    type: 'speaking';
    sentence: string;            // 要跟读的例句
    sentenceTranslation: string; // 例句翻译
    highlightWord: string;       // 高亮显示的目标单词
}

// ===== 4. SpellingWritingCard 拼写与仿写 =====
export interface SpellingWritingCardData extends BaseCardData {
    type: 'spelling_writing';
    hint: string;               // 拼写提示 (如 s_r_n_i_i_y)
    definition: string;         // 释义提示
    exampleSentence: string;    // 参考例句 (用于仿写)
}

// 联合类型
export type CardData =
    | DetailCardData
    | QuizCardData
    | SpeakingCardData
    | SpellingWritingCardData;
