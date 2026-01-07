import { Skill, SkillContext } from '../types';
import { CardData } from '@/lib/ai/card-types';

export const EtymologySkill: Skill = {
    name: "show_etymology",
    description: "展示单词的词源故事。当学生想深入了解单词来源、历史背景时调用。",
    parameters: {
        type: "object",
        properties: {
            root: { type: "string", description: "词根 (如 Serendip)" },
            meaning: { type: "string", description: "词根本义 (如 unexpected good luck)" },
            history: { type: "string", description: "详细的历史故事和演变过程" },
            related_words: { type: "array", items: { type: "string" }, description: "3-5个同源词或关联词" }
        },
        required: ["root", "meaning", "history", "related_words"]
    },
    execute: async (args, context) => {
        const { getState } = context;
        const word = getState().getCurrentWord();
        if (!word) return;

        const etymologyData = {
            type: 'etymology' as const,
            word: word.word,
            root: args.root,
            meaning: args.meaning,
            history: args.history,
            related_words: args.related_words
        };

        // Delay for better UX
        await new Promise(r => setTimeout(r, 400));
        getState().addMessage({
            role: 'assistant',
            content: '',
            type: 'card',
            cardData: etymologyData as unknown as CardData
        });
    }
};
