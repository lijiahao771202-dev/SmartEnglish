import { Skill, SkillContext } from '../types';

export const VisualAidSkill: Skill = {
    name: "show_visual_aid",
    description: "展示单词的思维导图、结构图或视觉联想。帮助学生通过视觉结构记忆。",
    parameters: {
        type: "object",
        properties: {
            description: { type: "string", description: "脑图结构的文字描述（如：中心是serendipity，分支有含义、用法...）" },
            imageUrl: { type: "string", description: "Optional image URL" }
        },
        required: ["description"]
    },
    execute: async (args, context) => {
        const { getState } = context;
        const word = getState().getCurrentWord();
        if (!word) return;

        // Fallback to Markdown Text since we don't have a specific VisualWidget yet.
        // This prevents the "Empty Bubble" issue.

        const content = `### 🧠 Visual Structure: ${word.word}\n\n${args.description}\n\n(Imagine this structure in your mind!)`;

        await new Promise(r => setTimeout(r, 400));

        getState().addMessage({
            role: 'assistant',
            content: content
        });
    }
};
