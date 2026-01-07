import { Persona, Scenario } from './types';

// 【已废弃】旧版 prompt 构造函数 - 保留用于向后兼容，但不再推荐使用
export function constructSystemPrompt(scenario: Scenario, persona: Persona): string {
  return `你现在是 ${persona.name}，${persona.roleDescription}。
  
  核心规则：
  1. 🚫 你不生成任何卡片，卡片由系统自动生成
  2. 🗣️ 你只负责用文字讲解和回答问题
  3. 🎯 回复简短友好，中文为主
  `;
}

// 【已废弃】旧版评论性引导语
export const COMMENTARY_PROMPTS = {
  detail: (word: string, def: string) => `这是单词 "${word}" (${def})。请补充一些有趣的知识。`,
  quiz: (word: string, _options: string) => `学生正在对 "${word}" 进行测试。`,
  speaking: (word: string) => `学生正在练习 "${word}"。`,
  spelling_writing: (word: string) => `学生正在拼写 "${word}"。`
};

// 【已废弃】旧版扩展引导语
export const EXPANSION_PROMPTS = {
  detail: (word: string) => `补充 "${word}" 的知识。`,
  quiz: (word: string) => `关于 "${word}" 的测验。`,
  speaking: (word: string) => `练习 "${word}"。`,
  spelling_writing: (word: string) => `拼写 "${word}"。`
};


// 🌟 新系统卡片扩展提示 (每张卡片完成后 AI 自动补充)
// 注意：这些函数现在接受单词和卡片内容作为上下文
export const CARD_EXPANSION_PROMPTS = {
  phonetic: (word: string, phonetic?: string) =>
    `学生刚听完 "${word}" [音标: ${phonetic || 'N/A'}] 的发音。
用一句话补充这个词的发音特点或记忆技巧。不要问问题，直接分享。`,

  definition: (word: string, definition?: string, definitionEn?: string) =>
    `学生刚看完 "${word}" 的释义：
中文: ${definition || 'N/A'}
英文: ${definitionEn || 'N/A'}
用一句话补充这个词的词源故事或为什么有这个意思。不要问问题。`,

  example: (word: string, sentence?: string, translation?: string) =>
    `学生刚看完 "${word}" 的例句：
"${sentence || 'N/A'}"
翻译: ${translation || 'N/A'}
用一句话补充这个词在日常对话中的其他用法或给一个真实场景。不要问问题。`,

  memory_hook: (word: string, hook?: string) =>
    `学生刚看完 "${word}" 的助记方法：${hook || 'N/A'}
用一句话再分享一个不同的记忆技巧或联想图像。不要问问题。`,

  collocation: (word: string, collocations?: string) =>
    `学生刚看完 "${word}" 的常用搭配：${collocations || 'N/A'}
用一句话补充这些搭配在哪个场景最常用或模拟一个对话。不要问问题。`,

  spelling: (word: string, definition?: string) =>
    `学生刚完成 "${word}" (释义: ${definition || 'N/A'}) 的拼写挑战！
用一句话总结这个词的学习重点并鼓励学生。不要问问题。`
};

// 生成扩展提示的 helper 函数
export type CardContext = {
  word: string;
  phonetic?: string;
  definition?: string;
  definitionEn?: string;
  sentence?: string;
  translation?: string;
  memoryHook?: string;
  collocations?: string;
};

export function getCardExpansionPrompt(cardType: string, context: CardContext): string {
  switch (cardType) {
    case 'phonetic':
      return CARD_EXPANSION_PROMPTS.phonetic(context.word, context.phonetic);
    case 'definition':
      return CARD_EXPANSION_PROMPTS.definition(context.word, context.definition, context.definitionEn);
    case 'example':
      return CARD_EXPANSION_PROMPTS.example(context.word, context.sentence, context.translation);
    case 'memory_hook':
      return CARD_EXPANSION_PROMPTS.memory_hook(context.word, context.memoryHook);
    case 'collocation':
      return CARD_EXPANSION_PROMPTS.collocation(context.word, context.collocations);
    case 'spelling':
      return CARD_EXPANSION_PROMPTS.spelling(context.word, context.definition);
    default:
      return `学生刚完成 "${context.word}" 的学习。用一句话补充一个有趣的知识。`;
  }
}

// Legacy helpers kept for compatibility if needed
export const SYSTEM_PROMPT = `Legacy System Prompt (Unused)`;
export function generateVocabularyPrompt(word: string) {
  return `Define ${word}`;
}
