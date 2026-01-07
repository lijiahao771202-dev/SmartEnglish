import OpenAI from "openai";
import { Scenario, Persona } from "./types";
import { constructSystemPrompt } from "./prompts";
import { CardData } from "./card-types";
import { AGENT_TOOLS, AGENT_SYSTEM_PROMPT, ToolCall, QuickReply } from "./agent";

// 初始化客户端
const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;

export const deepseek = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: apiKey || "sk-placeholder",
    dangerouslyAllowBrowser: true
});

export type DeepSeekMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export interface AIResponse {
    content: string;
    cardData?: CardData;
}

// ===== Agent 响应类型 =====
export interface AgentResponse {
    message: string;
    toolCall?: ToolCall;  // 改为单个工具调用
    quickReplies?: QuickReply[];
}

// ===== AI Agent 调用 (支持 Function Calling & Streaming) =====
export async function callAgent(
    messages: DeepSeekMessage[],
    currentWord: string,
    wordMeaning: string,
    onToken?: (token: string) => void
): Promise<AgentResponse> {

    // Dynamic Context Injection (Lightweight)
    const dynamicContext = `
[Context]
Target Word: "${currentWord}" (${wordMeaning})
`;

    try {
        const stream = await deepseek.chat.completions.create({
            messages: [
                { role: "system", content: AGENT_SYSTEM_PROMPT },
                { role: "system", content: dynamicContext },
                ...messages
            ],
            model: "deepseek-chat",
            // 【重要】不传 tools 参数，完全禁止工具调用
            stream: true
        });

        let fullContent = "";
        let toolCallAccumulator: any = null;

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            if (delta?.content) {
                fullContent += delta.content;
                if (onToken) onToken(delta.content);
            }
            if (delta?.tool_calls) {
                if (!toolCallAccumulator) toolCallAccumulator = [];
                for (const tc of delta.tool_calls) {
                    if (!toolCallAccumulator[tc.index]) {
                        toolCallAccumulator[tc.index] = { ...tc, function: { ...tc.function, arguments: "" } };
                    }
                    if (tc.function?.arguments) {
                        toolCallAccumulator[tc.index].function.arguments += tc.function.arguments;
                    }
                    if (tc.function?.name) {
                        toolCallAccumulator[tc.index].function.name = tc.function.name;
                    }
                }
            }
        }

        // 只取第一个工具调用
        let toolCall: ToolCall | undefined;
        if (toolCallAccumulator && toolCallAccumulator.length > 0) {
            const firstTc = toolCallAccumulator[0];
            try {
                toolCall = {
                    name: firstTc.function.name,
                    arguments: JSON.parse(firstTc.function.arguments || "{}")
                };
            } catch (e) {
                console.warn("Failed to parse tool arguments:", e);
            }
        }

        // 不再在这里生成快捷回复，让 chat-store.ts 使用 generateContextualReplies 统一处理
        return {
            message: fullContent,
            toolCall,
            quickReplies: undefined // 让 chat-store 使用上下文感知生成器
        };

    } catch (error) {
        console.error("Agent Error:", error);
        return {
            message: "抱歉，我遇到了一些问题。请再试一次。",
            quickReplies: [{ text: "重试", emoji: "🔄" }]
        };
    }
}

// 根据工具调用生成合适的快捷回复
function generateQuickReplies(toolCall?: ToolCall): QuickReply[] {
    if (!toolCall) {
        return [
            { text: "继续", emoji: "👍" },
            { text: "考考我", emoji: "❓" },
        ];
    }

    switch (toolCall.name) {
        case "show_card":
            const cardType = toolCall.arguments?.card_type as string;
            if (cardType === "vocabulary") {
                return [
                    { text: "记住了", emoji: "👍" },
                    { text: "有点难", emoji: "😅" },
                ];
            }
            // 交互卡片不需要快捷回复
            return [];

        case "next_word":
            return [
                { text: "开始学习", emoji: "📚" },
            ];
    }

    return [
        { text: "继续", emoji: "👍" },
    ];
}

// ===== 流式生成 (Streaming Generation) =====
export async function generateResponseStreaming(
    messages: DeepSeekMessage[],
    scenario: Scenario,
    persona: Persona,
    onDelta: (delta: string) => void,
    onComplete: (response: AIResponse) => void
): Promise<void> {
    const systemPrompt = constructSystemPrompt(scenario, persona);

    try {
        const stream = await deepseek.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            model: "deepseek-chat",
            stream: true
        });

        let fullContent = "";

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || "";
            fullContent += delta;
            onDelta(delta);
        }

        const { content, cardData } = parseCardFromContent(fullContent);
        onComplete({ content, cardData });

    } catch (error) {
        console.error("DeepSeek Streaming Error:", error);
        onComplete({ content: "连接出错，请检查网络或 API Key。" });
    }
}

// ===== 非流式生成 (Non-Streaming) =====
export async function generateResponse(
    messages: DeepSeekMessage[],
    scenario: Scenario,
    _persona: Persona
): Promise<AIResponse> {
    const systemPrompt = scenario.systemPrompt || constructSystemPrompt(scenario, _persona);

    try {
        const completion = await deepseek.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            model: "deepseek-chat",
        });

        const rawContent = completion.choices[0].message.content || "";
        return parseCardFromContent(rawContent);

    } catch (error) {
        console.error("DeepSeek API Error:", error);
        return {
            content: "我现在无法连接到大脑，请检查 API 连接。",
        };
    }
}

// ===== Helper: 从回复中提取 Card JSON =====
function parseCardFromContent(rawContent: string): AIResponse {
    const jsonMatch = rawContent.match(/```json\s*(\{[\s\S]*?\})\s*```/) || rawContent.match(/\{[\s\S]*\}$/);

    let content = rawContent;
    let cardData: CardData | undefined;

    if (jsonMatch) {
        try {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            const parsed = JSON.parse(jsonStr);

            if (parsed.card) {
                cardData = parsed.card;
                content = rawContent.replace(jsonMatch[0], "").trim();
            }
        } catch (e) {
            console.warn("Failed to parse AI JSON:", e);
        }
    }

    return { content, cardData };
}

// ===== 简单对话调用 (Simple Chat) =====
export async function callSimpleChat(
    systemPrompt: string,
    userMessage: string
): Promise<string> {
    try {
        const completion = await deepseek.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            model: "deepseek-chat",
            temperature: 0.7
        });

        return completion.choices[0].message.content || "";
    } catch (error) {
        console.error("Simple Chat Error:", error);
        return "Thinking error...";
    }
}

// ===== 教学流式响应 (不使用 tools，纯文本输出) =====
export async function callTeachingStream(
    systemPrompt: string,
    messages: DeepSeekMessage[],
    onToken: (token: string) => void
): Promise<string> {
    try {
        const stream = await deepseek.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            model: "deepseek-chat",
            temperature: 0.8,
            stream: true
            // 注意：不使用 tools，确保纯文本输出
        });

        let fullContent = "";

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || "";
            fullContent += delta;
            if (delta) onToken(delta);
        }

        return fullContent;

    } catch (error) {
        console.error("Teaching Stream Error:", error);
        return "（教学内容加载失败）";
    }
}
