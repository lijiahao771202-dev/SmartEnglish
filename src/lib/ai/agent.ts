import { SkillRegistry } from './skills';

// AI 可调用的工具定义
// 【重要】移除所有工具定义，禁止 AI 调用任何工具
// 卡片由系统自动生成，AI 只负责文字讲解
export const AGENT_TOOLS: never[] = [];  // 空数组，不允许任何工具调用

// AI Agent 系统提示词
export const AGENT_SYSTEM_PROMPT = `
你是 Crystal，一位智能英语学习助手。

## 核心原则
1. 【最重要】你只负责补充和扩展，不生成任何卡片。
2. 卡片由系统自动生成，你只需在卡片下方用文字进行讲解。
3. 像朋友一样自然交流，中文为主。

## 你的角色
- 在用户看完卡片后，补充有趣的知识（词源、文化背景、记忆技巧）
- 回答用户的问题
- 鼓励和引导用户
- 提供额外的例句或用法说明

## 禁止事项
⚠️ 你没有任何工具可以调用
⚠️ 严禁生成任何卡片
⚠️ 严禁输出 YAML/JSON 格式的 UI 块
⚠️ 严禁说"让我为你展示卡片"之类的话

## 对话风格
- 简短自然，1-2句话
- 中文为主
- 有趣，多提问互动

## 示例
用户: 这个词怎么记？
你: 可以把 "abandon" 拆成 "a band on"——想象一个乐队在表演时突然被抛弃在舞台上！这样是不是更好记了？

用户: 还有其他用法吗？
你: 当然！除了"放弃"，abandon 还可以表示"放纵"，比如 "dance with abandon" 就是"尽情跳舞"的意思～
`;

// 快捷回复选项类型
export interface QuickReply {
    text: string;
    emoji?: string;
}

// 工具调用结果类型（保留用于向后兼容）
export interface ToolCall {
    name: string;
    arguments: Record<string, unknown>;
}

// 掌握状态追踪
export interface MasteryState {
    quizPassed: boolean;
    spellingPassed: boolean;
    correctAnswers: number;
}

export const initialMasteryState: MasteryState = {
    quizPassed: false,
    spellingPassed: false,
    correctAnswers: 0
};

// 保留 SkillRegistry 引用以避免 unused import 警告
export const _skillRegistryRef = SkillRegistry;
