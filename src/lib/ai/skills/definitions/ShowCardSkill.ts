/**
 * ShowCardSkill - 已废弃
 * 系统现在使用自动卡片生成，不再需要 AI 调用此技能
 */

import { Skill } from '../types';

export const ShowCardSkill: Skill = {
    name: "show_card",
    description: "【已废弃】卡片现由系统自动生成，请勿调用此工具。",
    parameters: {
        type: "object",
        properties: {
            card_type: {
                type: "string",
                description: "已废弃 - 请勿使用"
            }
        },
        required: []
    },
    execute: async (_args, context) => {
        // 返回提示信息，告知 AI 不应使用此工具
        context.getState().addMessage({
            role: 'assistant',
            content: '（卡片由系统自动生成，无需手动调用）'
        });
    }
};
