"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSystemCardStore } from "@/lib/store/system-card-store";
import { useChatStore, Message } from "@/lib/store/chat-store";
import { CardData, getCardTypeName, SystemCardType } from "@/lib/ai/card-types";
import { CardContext } from "@/lib/ai/prompts";
import type { DeepSeekMessage } from "@/lib/ai/deepseek";

// 情景化教学 System Prompt
const CONTEXTUAL_TEACHING_PROMPT = `你是 Crystal，一位热情、专业的英语老师。你的教学风格：

## 核心原则
1. **情景化教学** - 不要只是解释单词，要用真实场景让学生"身临其境"
2. **故事驱动** - 用小故事、对话片段、生活场景帮助记忆
3. **互动引导** - 像朋友聊天一样自然，偶尔抛出问题让学生思考
4. **文化渗透** - 分享相关的文化背景、习语、常见误区

## 回复风格
- 用 2-4 句话，不要太长也不要太短
- 语气亲切自然，像朋友在聊天
- 偶尔用 emoji 增加亲和力 😊
- 可以模拟一个小对话或场景

## 禁止事项
⚠️ 不要重复卡片上已有的内容
⚠️ 不要说"这个词很重要"这种废话
⚠️ 不要问"你明白了吗"这种无意义的问题
`;

/**
 * 系统卡片控制器
 * 情景化教学增强版
 */
export function SystemCardController() {
    const currentWordId = useChatStore((state) => state.currentWordId);
    const messages = useChatStore((state) => state.messages);
    const addMessage = useChatStore((state) => state.addMessage);
    const updateLastMessage = useChatStore((state) => state.updateLastMessage);
    const setTyping = useChatStore((state) => state.setTyping);
    const toggleLearnedWord = useChatStore((state) => state.toggleLearnedWord);  // 标记单词为已学习

    const { currentWord, startWord, setCallbacks } = useSystemCardStore();

    // 流式消息内容
    const streamingContentRef = useRef("");

    // 将消息转换为 DeepSeek 格式（最近 6 条）
    const getConversationHistory = useCallback((): DeepSeekMessage[] => {
        const recentMessages = messages.slice(-6);
        return recentMessages.map((msg: Message) => {
            if (msg.type === 'card' && msg.cardData) {
                const cardName = getCardTypeName(msg.cardData.type as SystemCardType);
                return {
                    role: 'assistant' as const,
                    content: `[展示了 "${msg.cardData.word}" 的${cardName}]`
                };
            }
            return {
                role: msg.role as 'user' | 'assistant',
                content: msg.content || ''
            };
        });
    }, [messages]);

    // 添加卡片消息
    const addCardMessage = useCallback((cardData: CardData) => {
        addMessage({
            role: 'assistant',
            content: '',
            type: 'card',
            cardData: cardData
        });
    }, [addMessage]);

    // 添加文本消息
    const addTextMessage = useCallback((content: string) => {
        addMessage({
            role: 'assistant',
            content: content
        });
    }, [addMessage]);

    // 生成情景化教学 prompt
    const generateTeachingPrompt = useCallback((
        cardType: string,
        context: CardContext
    ): string => {
        const { word, phonetic, definition, definitionEn, sentence, translation, memoryHook, collocations } = context;

        // 完整的单词上下文
        const wordContext = `
[当前单词信息]
- 单词: ${word}
- 音标: ${phonetic || '无'}
- 中文释义: ${definition || '无'}
- 英文释义: ${definitionEn || '无'}
- 例句: "${sentence || '无'}"
- 例句翻译: ${translation || '无'}
- 助记方法: ${memoryHook || '无'}
- 常用搭配: ${collocations || '无'}
`;

        // 根据卡片类型生成不同的教学指令
        switch (cardType) {
            case 'phonetic':
                return `${wordContext}
[教学任务: 发音卡]
学生正在看 "${word}" 的发音卡。请帮助他们：
1. 分享一个发音技巧或易错点
2. 可以编一个谐音记忆法
3. 或者用一个生动的比喻帮助记忆发音

示例风格：
"abandon 的发音像'额班等'，想象你额头冒汗在班级门口等人，等烦了就想'放弃'了 😅"`;

            case 'definition':
                return `${wordContext}
[教学任务: 释义卡]
学生正在看 "${word}" 的释义。请帮助他们深入理解：
1. 分享这个词的词源故事（如果有趣的话）
2. 或者用一个生活场景解释这个词的"感觉"
3. 可以对比中英文表达的差异

示例风格：
"serendipity 这个词来自一个波斯童话《三位塞伦迪普王子》，王子们总是意外发现宝藏 ✨ 就像你随便翻书发现了改变人生的一句话~"`;

            case 'example':
                return `${wordContext}
[教学任务: 例句卡]
学生看到了例句："${sentence}"。请帮助他们：
1. 模拟一个真实对话场景用到这个词
2. 或者讲一个小故事包含这个词
3. 可以给出另一个实用的例句

示例风格：
"想象你在咖啡店遇到老朋友：
A: Hey! What a serendipity running into you here!
B: I know right? I was just thinking about you!
这就是 serendipity 的感觉～意外的惊喜相遇 ☕"`;

            case 'memory_hook':
                return `${wordContext}
[教学任务: 助记卡]
学生已经看到助记方法：${memoryHook || '无'}。请补充：
1. 另一个不同角度的记忆技巧
2. 可以是词根拆解、联想画面、故事串联
3. 让记忆更立体

示例风格：
"还有个方法～想象 abandon = a + band + on，一个乐队（band）在台上（on），突然主唱说'我不玩了'就走了，乐队被抛弃了 🎸"`;

            case 'collocation':
                return `${wordContext}
[教学任务: 搭配卡]
学生在学习 "${word}" 的常用搭配。请帮助他们：
1. 用这些搭配模拟一个对话或场景
2. 讲讲在什么场景最常用
3. 可以提醒常见的搭配错误

示例风格：
"make a decision 在工作场景超常用：
老板: We need to make a decision by Friday.
你: I'll gather more data so we can make an informed decision.
注意不要说 do a decision 哦，这是常见错误 ❌"`;

            case 'spelling':
                return `${wordContext}
[教学任务: 拼写卡]
学生正在挑战 "${word}" 的拼写。请：
1. 给一个巧妙的拼写记忆口诀
2. 或者指出容易拼错的地方
3. 给予鼓励

示例风格：
"拼写小技巧：serendipity 可以拆成 seren-dip-ity，想象你在 serene（宁静的）湖边 dip（蘸）手指，意外发现湖里有金子～ity 是名词后缀。加油！💪"`;

            default:
                return `${wordContext}
[教学任务]
请用 2-4 句话帮助学生更好地理解和记忆 "${word}"。`;
        }
    }, []);

    // 流式 AI 响应 - 情景化教学版
    const streamAIResponse = useCallback(async (
        cardType: string,
        _description: string,
        context: CardContext
    ) => {
        streamingContentRef.current = "";
        setTyping(true);

        try {
            const { callAgent } = await import('@/lib/ai/deepseek');

            // 构建情景化教学 prompt
            const teachingPrompt = generateTeachingPrompt(cardType, context);

            // 获取对话历史
            const conversationHistory = getConversationHistory();

            // 使用专用的教学流式响应（不使用 tools）
            const { callTeachingStream } = await import('@/lib/ai/deepseek');

            await callTeachingStream(
                CONTEXTUAL_TEACHING_PROMPT,
                [
                    ...conversationHistory,
                    { role: 'user' as const, content: teachingPrompt }
                ],
                (token: string) => {
                    streamingContentRef.current += token;
                    updateLastMessage(() => streamingContentRef.current);
                }
            );

        } catch (error) {
            console.error('[AI Teaching] Error:', error);
            updateLastMessage(() => "（AI 教学加载失败）");
        } finally {
            setTyping(false);
        }
    }, [setTyping, updateLastMessage, getConversationHistory, generateTeachingPrompt]);

    // 设置回调
    useEffect(() => {
        setCallbacks(addCardMessage, addTextMessage, streamAIResponse, toggleLearnedWord);
    }, [addCardMessage, addTextMessage, streamAIResponse, toggleLearnedWord, setCallbacks]);

    // 当单词切换时，询问用户是否开始
    useEffect(() => {
        if (currentWordId && (!currentWord || currentWord.word !== currentWordId)) {
            // 不自动开始，而是发送询问
            addTextMessage(`准备好学习 **${currentWordId}** 了吗？点击下方按钮开始沉浸式学习之旅 🚀`);
        }
    }, [currentWordId, currentWord, addTextMessage]);

    // 监听用户消息，如果包含"开始学习"，则开始流程
    useEffect(() => {
        if (messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'user' && currentWordId) {
            const content = lastMessage.content.toLowerCase();
            if (content.includes('开始学习') || content.includes('start learning') || content.includes('准备好了')) {
                // 如果当前没有在学习该单词，或者还没开始
                if (!currentWord || currentWord.word !== currentWordId) {
                    startWord(currentWordId);
                }
            }
        }
    }, [messages, currentWord, currentWordId, startWord]);

    // 不渲染任何 UI
    return null;
}
