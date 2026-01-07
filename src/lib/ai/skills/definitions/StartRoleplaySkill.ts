import { Skill, SkillContext } from '../types';
import { CardData } from '@/lib/ai/card-types';

export const StartRoleplaySkill: Skill = {
    name: "start_roleplay",
    description: "开始情景模拟挑战。当学生掌握了单词含义，想尝试在实际对话中使用时调用。",
    parameters: {
        type: "object",
        properties: {
            scenario: { type: "string", description: "场景描述" },
            aiRole: { type: "string", description: "AI 扮演的角色" },
            userRole: { type: "string", description: "用户扮演的角色" },
            objective: { type: "string", description: "任务目标" }
        },
        required: ["scenario", "aiRole", "userRole", "objective"]
    },
    execute: async (args, context) => {
        const { getState } = context;
        const word = getState().getCurrentWord();
        if (!word) return;

        const roleplayData = {
            type: 'roleplay' as const,
            word: word.word,
            scenario: args.scenario,
            aiRole: args.aiRole,
            userRole: args.userRole,
            objective: args.objective
        };

        await new Promise(r => setTimeout(r, 300));
        getState().addMessage({
            role: 'assistant',
            content: '',
            type: 'card',
            cardData: roleplayData as unknown as CardData
        });
    }
};
