import { Skill, SkillContext } from '../types';
import { CardData } from '@/lib/ai/card-types';

export const GenerateExampleSkill: Skill = {
    name: "generate_example",
    description: "生成一个新的例句并展示。用于给学生展示单词的不同用法场景。",
    parameters: {
        type: "object",
        properties: {
            sentence: { type: "string", description: "包含目标单词的英文例句" },
            translation: { type: "string", description: "例句的中文翻译" }
        },
        required: ["sentence", "translation"]
    },
    execute: async (args, context) => {
        const { getState } = context;
        const word = getState().getCurrentWord();
        if (!word) return;

        const exampleCardData = {
            type: 'example_sentence' as const,
            word: word.word,
            sentence: args.sentence,
            translation: args.translation
        };

        await new Promise(r => setTimeout(r, 300));
        getState().addMessage({
            role: 'assistant',
            content: '',
            type: 'card',
            cardData: exampleCardData as unknown as CardData
        });
    }
};
