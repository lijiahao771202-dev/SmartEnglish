import { Skill, SkillContext } from '../types';
import { VOCABULARY_DATABASE } from '@/lib/data/vocabulary-cards';

export const NextWordSkill: Skill = {
    name: "next_word",
    description: "学生已掌握当前单词，进入下一个。",
    parameters: {
        type: "object",
        properties: {},
        required: []
    },
    execute: async (args, context) => {
        const { getState, currentWordId } = context;

        const currentIdx = VOCABULARY_DATABASE.findIndex(w => w.word === currentWordId);
        const nextIdx = currentIdx + 1;

        if (nextIdx < VOCABULARY_DATABASE.length) {
            const nextWord = VOCABULARY_DATABASE[nextIdx];
            await new Promise(r => setTimeout(r, 500));
            getState().switchWord(nextWord.word);
        } else {
            getState().addMessage({ role: 'assistant', content: '🎉 恭喜！所有单词都学完啦！' });
        }
    }
};
