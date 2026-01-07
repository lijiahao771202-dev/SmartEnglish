import { Skill, SkillContext } from '../types';
import { CardData } from '@/lib/ai/card-types';

export const VisualAidSkill: Skill = {
    name: "show_visual_aid",
    description: "展示单词的思维导图、结构图或视觉联想。帮助学生通过视觉结构记忆。",
    parameters: {
        type: "object",
        properties: {
            description: { type: "string", description: "脑图结构的文字描述（如：中心是serendipity，分支有含义、用法...）" },
            imageUrl: { type: "string", description: "可选的图片URL，暂时留空" }
        },
        required: ["description"]
    },
    execute: async (args, context) => {
        const { getState } = context;
        const word = getState().getCurrentWord();
        if (!word) return;

        const visualData = {
            type: 'visual_aid' as const,
            word: word.word,
            description: args.description,
            imageUrl: args.imageUrl
        };

        // Delay for better UX
        await new Promise(r => setTimeout(r, 400));
        getState().addMessage({
            role: 'assistant',
            content: '',
            type: 'card',
            cardData: visualData as unknown as CardData
        });
    }
};
