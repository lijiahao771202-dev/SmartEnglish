import ieltsVocabRaw from './ielts_vocab.json';
import { WordLearningData } from './vocabulary-cards';

export interface RawIELTSWord {
    name: string;
    ukphone: string;
    trans: string;
}

const ieltsVocab = ieltsVocabRaw as RawIELTSWord[];

/**
 * 将原始 XDF 格式转换为应用的 WordLearningData 格式
 */
export function transformIELTSWord(raw: RawIELTSWord): WordLearningData {
    // 简单的文本解析
    const transParts = raw.trans.split('【');
    const meaning = transParts[0].trim();

    let memoryHook = "";
    let phrases: string[] = [];

    transParts.slice(1).forEach(part => {
        if (part.startsWith('记忆】')) {
            memoryHook = part.replace('记忆】', '').trim();
        } else if (part.startsWith('搭配】')) {
            phrases = [part.replace('搭配】', '').trim()];
        }
    });

    return {
        word: raw.name,
        detail: {
            type: 'detail',
            word: raw.name,
            phonetic: raw.ukphone,
            definition: meaning,
            exampleSentence: phrases[0] || `I need to ${raw.name} this task.`,
            exampleTranslation: phrases[0] ? "参考搭配" : "我需要完成这个任务。",
            aiSupplement: memoryHook || (phrases.length > 0 ? `搭配：${phrases.join('; ')}` : "这个单词是雅思核心词汇，建议重点掌握其用法。")
        },
        quiz: {
            type: 'quiz',
            word: raw.name,
            question: `"${raw.name}" 的正确中文含义是？`,
            options: [
                { id: "a", text: meaning, label: meaning, isCorrect: true },
                { id: "b", text: "错误选项 A", label: "错误选项 A", isCorrect: false },
                { id: "c", text: "错误选项 B", label: "错误选项 B", isCorrect: false },
                { id: "d", text: "错误选项 C", label: "错误选项 C", isCorrect: false }
            ],
            explanation: `正确答案是：${meaning}。`
        },
        speaking: {
            type: 'speaking',
            word: raw.name,
            sentence: phrases[0] || `The word "${raw.name}" is commonly used in academic contexts.`,
            sentenceTranslation: phrases[0] ? "常见短语搭配" : `"${raw.name}" 这个词在学术语境中非常常用。`,
            highlightWord: raw.name
        },
        spellingWriting: {
            type: 'spelling_writing',
            word: raw.name,
            hint: raw.name.split('').map((c, i) => i % 2 === 0 ? c : '_').join(''),
            definition: meaning,
            exampleSentence: phrases[0] || `It is important to understand the concept of ${raw.name}.`
        },
        collocations: phrases.map(p => ({
            phrase: p.split(' (')[0] || p, // Simple split if there's parens
            translation: "常用搭配"
        }))
    };
}

export const IELTS_DATABASE = ieltsVocab.reduce((acc, curr) => {
    acc[curr.name.toLowerCase()] = curr;
    return acc;
}, {} as Record<string, RawIELTSWord>);

export function getIELTSWord(word: string): WordLearningData | null {
    const raw = IELTS_DATABASE[word.toLowerCase()];
    if (!raw) return null;
    return transformIELTSWord(raw);
}

export function getAllIELTSWords(): string[] {
    return ieltsVocab.map(w => w.name);
}
