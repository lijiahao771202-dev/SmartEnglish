import { Skill, SkillContext } from '../types';
import { CardData } from '@/lib/ai/card-types';

export const ShowCardSkill: Skill = {
    name: "show_card",
    description: "展示一个学习卡片。系统已有预设内容，AI 只需要选择类型。",
    parameters: {
        type: "object",
        properties: {
            card_type: {
                type: "string",
                enum: [
                    "detail",
                    "quiz",
                    "speaking",
                    "spelling_writing"
                ],
                description: "卡片类型: detail(详情卡), quiz(测验), speaking(跟读), spelling_writing(拼写仿写)"
            }
        },
        required: ["card_type"]
    },
    execute: async (args, context) => {
        const { getState, currentWordId } = context;
        const state = getState();
        const word = state.getCurrentWord();
        if (!word) return;

        let cardData: CardData | null = null;
        switch (args.card_type) {
            case "detail": cardData = word.detail; break;
            case "quiz": cardData = word.quiz; break;
            case "speaking": cardData = word.speaking; break;
            case "spelling_writing": cardData = word.spellingWriting; break;
        }

        if (cardData) {
            // 获取当前会话消息并检查重复
            const messages = state.messages || [];
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && lastMsg.type === 'card' && lastMsg.cardData?.type === cardData.type) {
                console.log("Blocking duplicate card:", args.card_type);
                return;
            }

            await new Promise(r => setTimeout(r, 300));
            state.addMessage({
                role: 'assistant',
                content: '',
                type: 'card',
                cardData
            });
        }
    }
};
