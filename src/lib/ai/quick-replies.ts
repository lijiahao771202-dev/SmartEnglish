import { QuickReply } from '@/lib/ai/agent';
import { Message } from '@/lib/store/chat-store';
import { MasteryState } from '@/lib/ai/agent';

/**
 * 上下文感知的快捷回复生成器
 * 根据最后一条消息的内容和类型，生成相关的快捷回复选项
 */
export function generateContextualReplies(
    lastMessage: Message | null,
    mastery: MasteryState,
    currentWord: string
): QuickReply[] {
    console.log('[QuickReplies] Called with:', {
        hasMessage: !!lastMessage,
        role: lastMessage?.role,
        content: lastMessage?.content?.substring(0, 50),
        cardType: lastMessage?.cardData?.type
    });

    if (!lastMessage) {
        return [{ text: "开始学习", emoji: "📚" }];
    }

    const content = lastMessage.content;
    const cardType = lastMessage.cardData?.type;

    // 1. 基于卡片类型生成回复 (优先级最高)
    if (lastMessage.type === 'card' && cardType) {
        console.log('[QuickReplies] Using card-specific replies for:', cardType);
        return getCardSpecificReplies(cardType, currentWord);
    }

    // 2. 检测结尾是否有问句 (优先处理问句)
    if (lastMessage.role === 'assistant' && content) {
        const endingQuestion = detectEndingQuestion(content);
        console.log('[QuickReplies] Ending question detected:', endingQuestion);
        if (endingQuestion) {
            const replies = getQuestionReplies(endingQuestion);
            console.log('[QuickReplies] Question replies:', replies);
            return replies;
        }
    }

    // 3. 尝试从 AI 消息中提取可操作的建议选项
    if (lastMessage.role === 'assistant' && content) {
        const extractedReplies = extractActionableSuggestions(content);
        if (extractedReplies.length > 0) {
            return extractedReplies;
        }
    }

    // 4. 基于消息内容关键词生成回复
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('例句') || lowerContent.includes('example')) {
        return [
            { text: "再来一个", emoji: "🔄" },
            { text: "我来造句", emoji: "✍️" },
            { text: "继续", emoji: "➡️" }
        ];
    }

    if (lowerContent.includes('词源') || lowerContent.includes('etymology')) {
        return [
            { text: "很有趣！", emoji: "🤩" },
            { text: "脑图", emoji: "🧠" },
            { text: "测验一下", emoji: "❓" }
        ];
    }

    // 5. 基于掌握状态生成回复
    if (mastery.quizPassed && mastery.spellingPassed) {
        return [
            { text: "下一个单词", emoji: "➡️" },
            { text: "再巩固一下", emoji: "📝" }
        ];
    }

    // 6. 默认回复
    return [
        { text: "继续", emoji: "➡️" },
        { text: "词源", emoji: "📜" },
        { text: "测验", emoji: "❓" }
    ];
}

/**
 * 检测消息末尾是否有问句
 * 返回问句内容，用于生成针对性回复
 */
function detectEndingQuestion(content: string): string | null {
    // 获取最后几句话
    const sentences = content.split(/[。！\n]/).filter(s => s.trim());
    const lastSentence = sentences[sentences.length - 1]?.trim() || '';

    // 检查是否以问号结尾
    if (lastSentence.includes('?') || lastSentence.includes('？')) {
        return lastSentence;
    }

    return null;
}

/**
 * 从 AI 消息中提取可操作的建议选项
 * 过滤掉词根拆解等非操作类列表
 */
function extractActionableSuggestions(content: string): QuickReply[] {
    const lines = content.split('\n');
    const suggestions: QuickReply[] = [];

    // 可操作关键词 - 如果包含这些词，说明是真正的建议
    const actionKeywords = [
        '例句', '词源', '来源', '对话', '情景', '测验', '练习',
        '试试', '看看', '了解', '学习', '继续', '下一个',
        'example', 'etymology', 'quiz', 'try', 'practice', 'next'
    ];

    // 匹配列表项的正则表达式
    const listPatterns = [
        /^[-–—]\s*(.+?)(?:\?|？)?$/,
        /^[•·]\s*(.+?)(?:\?|？)?$/,
    ];

    for (const line of lines) {
        const trimmedLine = line.trim();

        for (const pattern of listPatterns) {
            const match = trimmedLine.match(pattern);
            if (match && match[1]) {
                const text = match[1].trim();

                // 过滤条件：
                // 1. 长度要在合理范围内 (不是单词拆解)
                // 2. 长度太短的（<4字符）跳过，可能是词根
                // 3. 或者包含可操作关键词
                const hasActionKeyword = actionKeywords.some(kw =>
                    text.toLowerCase().includes(kw.toLowerCase())
                );

                if (text.length >= 4 && (text.length <= 20 || hasActionKeyword)) {
                    if (text.length <= 15) {
                        suggestions.push({
                            text: text,
                            emoji: getEmojiForSuggestion(text)
                        });
                    } else {
                        const shortText = text.substring(0, 10) + "...";
                        suggestions.push({
                            text: shortText,
                            emoji: getEmojiForSuggestion(text)
                        });
                    }
                }
                break;
            }
        }
    }

    return suggestions.slice(0, 4);
}

/**
 * 根据建议内容返回合适的 emoji
 */
function getEmojiForSuggestion(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('例句') || lower.includes('example')) return '📝';
    if (lower.includes('词源') || lower.includes('来源') || lower.includes('origin')) return '📜';
    if (lower.includes('对话') || lower.includes('情景') || lower.includes('roleplay')) return '🎭';
    if (lower.includes('测验') || lower.includes('quiz') || lower.includes('test')) return '❓';
    if (lower.includes('下一个') || lower.includes('next')) return '➡️';
    if (lower.includes('脑图') || lower.includes('visual')) return '🧠';
    if (lower.includes('更多') || lower.includes('more')) return '🔄';
    if (lower.includes('试试') || lower.includes('try')) return '🎯';
    if (lower.includes('看看') || lower.includes('了解')) return '�';
    return '�💡';
}

/**
 * 根据卡片类型生成特定的快捷回复
 */
function getCardSpecificReplies(cardType: string, word: string): QuickReply[] {
    switch (cardType) {
        case 'reading':
            return [
                { text: "记住了", emoji: "👌" },
                { text: "词源是什么", emoji: "📜" },
                { text: "再讲讲", emoji: "🤔" }
            ];
        case 'quiz':
        case 'select_meaning':
            return [
                { text: "答对了！", emoji: "🎉" },
                { text: "不太确定", emoji: "🤔" }
            ];
        case 'fill_blank':
            return [{ text: "提示一下", emoji: "💡" }];
        case 'spelling':
            return [
                { text: "完成了", emoji: "✅" },
                { text: "太难了", emoji: "😅" }
            ];
        case 'etymology':
            return [
                { text: "有意思！", emoji: "🤩" },
                { text: "脑图", emoji: "🧠" },
                { text: "测验一下", emoji: "❓" }
            ];
        case 'visual_aid':
            return [
                { text: "清楚了", emoji: "✅" },
                { text: "测验一下", emoji: "❓" }
            ];
        case 'example_sentence':
            return [
                { text: "懂了", emoji: "👌" },
                { text: "再来一个", emoji: "🔄" },
                { text: "我来造句", emoji: "✍️" }
            ];
        case 'roleplay':
            return [
                { text: "开始", emoji: "🎭" },
                { text: "换个场景", emoji: "🔄" }
            ];
        default:
            return [
                { text: "继续", emoji: "➡️" },
                { text: "测验", emoji: "❓" }
            ];
    }
}

/**
 * 根据问题内容生成回复选项
 */
function getQuestionReplies(question: string): QuickReply[] {
    const lower = question.toLowerCase();

    // 词源相关问题
    if (lower.includes('词源') || lower.includes('来源') || lower.includes('故事')) {
        return [
            { text: "好的，讲讲", emoji: "📜" },
            { text: "先不用", emoji: "➡️" },
            { text: "测验一下", emoji: "❓" }
        ];
    }

    // 例句相关问题
    if (lower.includes('例句') || lower.includes('example')) {
        return [
            { text: "好的", emoji: "👍" },
            { text: "我来造句", emoji: "✍️" }
        ];
    }

    // 记住/懂了类问题
    if (lower.includes('记住') || lower.includes('remember')) {
        return [
            { text: "记住了", emoji: "✅" },
            { text: "再说一遍", emoji: "🔄" }
        ];
    }
    if (lower.includes('懂') || lower.includes('understand') || lower.includes('明白')) {
        return [
            { text: "懂了", emoji: "👌" },
            { text: "不太懂", emoji: "🤔" }
        ];
    }

    // 准备好/试试类问题
    if (lower.includes('试试') || lower.includes('准备') || lower.includes('try')) {
        return [
            { text: "好的", emoji: "👍" },
            { text: "先给个提示", emoji: "💡" }
        ];
    }

    // 想听/想看类问题
    if (lower.includes('想') || lower.includes('要不要') || lower.includes('want')) {
        return [
            { text: "好的", emoji: "👍" },
            { text: "先不用", emoji: "➡️" }
        ];
    }

    // 通用是/否问题
    return [
        { text: "好的", emoji: "👍" },
        { text: "先不用", emoji: "➡️" },
        { text: "测验", emoji: "❓" }
    ];
}
