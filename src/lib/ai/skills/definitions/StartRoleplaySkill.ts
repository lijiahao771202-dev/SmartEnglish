/**
 * StartRoleplaySkill - 情景模拟技能
 * 注意：此技能不生成卡片，仅添加文本说明
 */

import { Skill } from '../types';

export const StartRoleplaySkill: Skill = {
    name: "start_roleplay",
    description: "开始一个情景模拟对话，帮助学生在真实场景中使用所学单词。",
    parameters: {
        type: "object",
        properties: {
            scenario: {
                type: "string",
                description: "情景描述，如：在咖啡店点单"
            },
            role_ai: {
                type: "string",
                description: "AI扮演的角色，如：咖啡店店员"
            },
            role_user: {
                type: "string",
                description: "用户扮演的角色，如：顾客"
            }
        },
        required: ["scenario", "role_ai", "role_user"]
    },
    execute: async (args, context) => {
        const { getState } = context;

        // 不生成卡片，只添加文本说明场景
        getState().addMessage({
            role: 'assistant',
            content: `🎭 **情景模拟开始！**\n\n📍 场景：${args.scenario}\n👤 你扮演：${args.role_user}\n🤖 我扮演：${args.role_ai}\n\n让我们开始吧！`
        });
    }
};
