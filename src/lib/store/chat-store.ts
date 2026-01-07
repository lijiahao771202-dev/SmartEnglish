import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CardData } from '@/lib/ai/card-types';
import { VOCABULARY_DATABASE, WordLearningData, getWordData } from '@/lib/data/vocabulary-cards';
import { QuickReply, MasteryState, initialMasteryState } from '@/lib/ai/agent';
import { DeepSeekMessage } from '@/lib/ai/deepseek';
import { fsrs, CardState, Rating } from '@/lib/algorithms/fsrs';
import { CardStage, getNextCardStage, getCardTypeForStage, getCompletionComment } from '@/lib/learning/card-sequencer';
import { COMMENTARY_PROMPTS, EXPANSION_PROMPTS, generateVocabularyPrompt, constructSystemPrompt, SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { SkillRegistry } from '@/lib/ai/skills';
import { type SkillContext } from '@/lib/ai/skills/types';
import { generateContextualReplies } from '@/lib/ai/quick-replies';
import type { Persona } from '@/lib/ai/types';

// Crystal AI 教师角色定义
const CRYSTAL_PERSONA: Persona = {
    name: 'Crystal',
    avatar: '👩‍🏫',
    roleDescription: 'A friendly, professional English teacher who helps students learn vocabulary.'
};

// ===== FSRS 核心数据结构 =====
export interface WordProgress extends CardState {
    wordId: string;
}

// ===== 类型定义 =====
export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    type?: 'text' | 'card';
    cardData?: CardData;
    isStreaming?: boolean; // Add streaming flag logic if needed, or just rely on content updates
}

// ===== Learning Phases =====
export enum LearningPhase {
    Reading = 0,
    Example = 1,
    Speaking = 2,
    Quiz = 3,
    Spelling = 4,
    Writing = 5,
    Completed = 6
}

export interface WordSession {
    messages: Message[];
    conversationHistory: DeepSeekMessage[];
    mastery: MasteryState;
    learningPhase: LearningPhase; // MindFlow 2.0: 6-step cycle
}

export interface AgentState {
    // 全局状态
    isTyping: boolean;
    quickReplies: QuickReply[];
    autoMode: boolean; // AI 自动继续模式

    // 多单词会话状态
    currentWordId: string; // 当前选中的单词 (使用 word 字段作为 ID)
    wordSessions: Record<string, WordSession>; // 单词 ID -> 会话数据
    learnedWords: string[]; // 已掌握的单词列表 (保留用于兼容)
    messages: Message[]; // 当前显示的消息 (与 currentWordId 同步)

    // FSRS 进度状态 (MindFlow 2.0)
    wordProgress: Record<string, WordProgress>;

    // Phase 3: Infinite Vocabulary
    dynamicVocabulary: Record<string, WordLearningData>; // 动态生成的单词数据

    // Daily Session State
    dailySessionActive: boolean;
    startDailySession: () => void;
    endDailySession: () => void;

    // Card-Driven Learning Flow (Token Optimization)
    currentCardStage: CardStage;
    countdownActive: boolean;
    countdownSeconds: number;
    showCardForStage: (stage: CardStage) => void;
    advanceToNextCard: (isSuccess: boolean) => void;
    startCountdownToNextWord: () => void;
    cancelCountdown: () => void;

    // Actions
    addMessage: (message: Omit<Message, 'id'>) => string;
    updateMessage: (id: string, updater: (content: string) => string) => void;
    deleteMessage: (id: string) => void;
    updateLastMessage: (updater: (content: string) => string) => void;
    setTyping: (typing: boolean) => void;
    setQuickReplies: (replies: QuickReply[]) => void;
    updateMastery: (update: Partial<MasteryState>) => void;
    toggleAutoMode: () => void;
    switchWord: (wordId: string) => void; // 切换单词

    // FSRS Actions
    recordReview: (wordId: string, rating: Rating) => void;

    // Phase 6: Learning Cycle Actions
    setLearningPhase: (wordId: string, phase: LearningPhase) => void;
    advanceLearningPhase: (wordId: string) => void;

    startLearning: () => Promise<void>;    // AI Actions
    sendMessage: (content: string) => Promise<void>;
    generateCardCommentary: (word: WordLearningData, stage: CardStage) => Promise<void>;
    handleQuickReply: (reply: QuickReply) => Promise<void>;
    getCurrentWord: () => WordLearningData | null;
    autoContinue: () => Promise<void>; // AI 自动继续
    handleUserSilence: () => Promise<void>; // 处理用户沉默
    chatRoleplay: (scenario: string, aiRole: string, userRole: string, history: RoleplayMessage[]) => Promise<string>; // 角色扮演对话
    addDynamicWord: (wordData: WordLearningData) => void; // New action for Phase 3
    toggleLearnedWord: (wordId: string) => void; // Manual graduation
    clearData: () => void; // Reset all data
}

export interface RoleplayMessage {
    role: 'user' | 'ai';
    content: string;
}

const genId = () => Math.random().toString(36).substring(7);

// 获取或初始化单词会话
const getSession = (state: AgentState, wordId: string): WordSession => {
    return state.wordSessions[wordId] || {
        messages: [
            {
                id: genId(),
                role: 'assistant',
                content: `👋 让我们来学习单词 "${wordId}" 吧！`,
            }
        ],
        conversationHistory: [],
        mastery: initialMasteryState,
        learningPhase: LearningPhase.Reading,
    };
};

// ===== Store 实现 =====
export const useChatStore = create<AgentState>()(
    persist(
        (set, get) => ({
            isTyping: false,
            dailySessionActive: false,
            startDailySession: () => set({ dailySessionActive: true }),
            endDailySession: () => set({ dailySessionActive: false }),
            quickReplies: [
                { text: "开始学习", emoji: "🚀" },
            ],
            autoMode: false,

            currentWordId: VOCABULARY_DATABASE[0].word, // 默认第一个单词
            wordSessions: {}, // 初始为空，按需创建
            learnedWords: [],
            wordProgress: {}, // FSRS Init
            dynamicVocabulary: {}, // Init
            messages: [], // Initialize messages array

            addDynamicWord: (wordData) => {
                set((state) => ({
                    dynamicVocabulary: {
                        ...(state.dynamicVocabulary || {}),
                        [wordData.word.toLowerCase()]: wordData
                    }
                }));
            },

            toggleLearnedWord: (wordId: string) => {
                const { learnedWords, wordProgress } = get();
                const isLearned = learnedWords.includes(wordId);
                let newLearnedWords = [...learnedWords];

                if (isLearned) {
                    newLearnedWords = newLearnedWords.filter(w => w !== wordId);
                } else {
                    newLearnedWords.push(wordId);
                    // Also initialize FSRS if not exists
                    if (!wordProgress[wordId]) {
                        get().recordReview(wordId, 'good');
                    }
                }

                set({ learnedWords: newLearnedWords });
                console.log(`[Mastery] Manually toggled ${wordId} to ${!isLearned ? 'Learned' : 'Unlearned'}`);
            },
            // Card-Driven Learning Flow State
            currentCardStage: CardStage.Phonetic,
            countdownActive: false,
            countdownSeconds: 5,

            // Card-Driven Learning Flow Actions
            showCardForStage: (stage: CardStage) => {
                const { currentWordId, getCurrentWord } = get();
                // Upgrade: Use getCurrentWord() instead of direct DB lookup to support Dynamic Words
                const word = getCurrentWord();
                if (!word || word.word.toLowerCase() !== currentWordId.toLowerCase()) {
                    // Fallback lookup if mismatch (should not happen if selectWord works right)
                    const dbWord = VOCABULARY_DATABASE.find(w => w.word.toLowerCase() === currentWordId.toLowerCase());
                    if (!dbWord) return;
                }

                // Safe access after check
                const targetWord = word!;

                set({ currentCardStage: stage });
                // Trigger Contextual AI Commentary (This is now the MAIN content)
                get().generateCardCommentary(targetWord, stage);
            },

            advanceToNextCard: (_isSuccess: boolean) => {
                const { currentCardStage } = get();

                // 新系统使用 system-card-store 管理卡片状态
                // 此函数保留为向后兼容
                const nextStage = getNextCardStage(currentCardStage);

                if (nextStage === CardStage.Completed) {
                    set({ currentCardStage: CardStage.Completed });
                    get().startCountdownToNextWord();
                } else {
                    set({ currentCardStage: nextStage });
                }
            },

            startCountdownToNextWord: () => {
                set({ countdownActive: true, countdownSeconds: 5 });

                const interval = setInterval(() => {
                    const { countdownSeconds, countdownActive } = get();
                    if (!countdownActive) {
                        clearInterval(interval);
                        return;
                    }

                    if (countdownSeconds <= 1) {
                        clearInterval(interval);
                        set({ countdownActive: false, countdownSeconds: 5 });
                        // 进入下一个单词
                        const currentIdx = VOCABULARY_DATABASE.findIndex(w => w.word === get().currentWordId);
                        if (currentIdx < VOCABULARY_DATABASE.length - 1) {
                            get().switchWord(VOCABULARY_DATABASE[currentIdx + 1].word);
                            // 新系统会自动通过 SystemCardArea 显示卡片
                        }
                    } else {
                        set({ countdownSeconds: countdownSeconds - 1 });
                    }
                }, 1000);
            },

            cancelCountdown: () => {
                set({ countdownActive: false, countdownSeconds: 5 });
            },

            addMessage: (msgInput) => {
                const { currentWordId, wordSessions } = get();
                const session = getSession(get(), currentWordId);

                // Deduplication: Check if identical to last message
                const lastMsg = session.messages[session.messages.length - 1];
                if (lastMsg &&
                    lastMsg.role === msgInput.role &&
                    lastMsg.content === msgInput.content &&
                    lastMsg.type === (msgInput.type || 'text') &&
                    JSON.stringify(lastMsg.cardData) === JSON.stringify(msgInput.cardData)
                ) {
                    console.warn(`[ChatStore] Duplicate message suppressed: ${msgInput.content || msgInput.cardData?.type}`);
                    return lastMsg.id;
                }

                const id = genId();
                const msg: Message = { ...msgInput, id };

                const newSession = {
                    ...session,
                    messages: [...session.messages, msg]
                };

                set({
                    wordSessions: {
                        ...wordSessions,
                        [currentWordId]: newSession
                    },
                    messages: newSession.messages // Update top-level messages
                });
                return id;
            },

            updateMessage: (id, updater) => {
                const { currentWordId, wordSessions } = get();
                const session = getSession(get(), currentWordId);
                const msgIndex = session.messages.findIndex(m => m.id === id);

                if (msgIndex === -1) return;

                const targetMsg = session.messages[msgIndex];
                const newContent = updater(targetMsg.content);
                const updatedMsg = { ...targetMsg, content: newContent };

                const newMessages = [...session.messages];
                newMessages[msgIndex] = updatedMsg;

                const newSession = { ...session, messages: newMessages };

                set({
                    wordSessions: {
                        ...wordSessions,
                        [currentWordId]: newSession
                    },
                    messages: newSession.messages
                });
            },

            deleteMessage: (id) => {
                const { currentWordId, wordSessions } = get();
                const session = getSession(get(), currentWordId);
                const newMessages = session.messages.filter(m => m.id !== id);
                const newSession = { ...session, messages: newMessages };

                set({
                    wordSessions: {
                        ...wordSessions,
                        [currentWordId]: newSession
                    },
                    messages: newSession.messages
                });
            },

            updateLastMessage: (updater) => {
                const { currentWordId, wordSessions } = get();
                const session = getSession(get(), currentWordId);
                const lastMsg = session.messages[session.messages.length - 1];

                if (!lastMsg) return;

                const newContent = updater(lastMsg.content);
                const updatedMsg = { ...lastMsg, content: newContent };

                const newMessages = [...session.messages.slice(0, -1), updatedMsg];
                const newSession = { ...session, messages: newMessages };

                set({
                    wordSessions: {
                        ...wordSessions,
                        [currentWordId]: newSession
                    },
                    messages: newSession.messages
                });
            },

            setTyping: (typing) => set({ isTyping: typing }),

            setQuickReplies: (replies) => set({ quickReplies: replies }),

            // FSRS 记录复习
            recordReview: (wordId: string, rating: Rating) => {
                const { wordProgress } = get();
                const currentProgress = wordProgress[wordId] || { ...fsrs.createEmptyState(), wordId };

                const nextProgress = fsrs.schedule(currentProgress, rating);

                set({
                    wordProgress: {
                        ...wordProgress,
                        [wordId]: { ...nextProgress, wordId }
                    }
                });

                console.log(`[FSRS] Review recorded for ${wordId}:`, { rating, nextDue: new Date(nextProgress.due).toLocaleString() });
            },

            updateMastery: (update) => {
                const { currentWordId, wordSessions, learnedWords } = get();
                const session = getSession(get(), currentWordId);
                const newMastery = { ...session.mastery, ...update };

                // 检查是否新掌握了单词 (Quiz 和 Spelling 都通过)
                const newLearnedWords = [...learnedWords];
                if (newMastery.quizPassed && newMastery.spellingPassed && !newLearnedWords.includes(currentWordId)) {
                    newLearnedWords.push(currentWordId);
                    // Trigger FSRS initial mastery if not exists
                    if (!get().wordProgress[currentWordId]) {
                        get().recordReview(currentWordId, 'good'); // Default to 'good' for initial mastery
                    }
                }

                set({
                    wordSessions: {
                        ...wordSessions,
                        [currentWordId]: {
                            ...session,
                            mastery: newMastery
                        }
                    },
                    learnedWords: newLearnedWords
                });
            },

            setLearningPhase: (wordId, phase) => {
                const session = getSession(get(), wordId);
                set({
                    wordSessions: {
                        ...get().wordSessions,
                        [wordId]: { ...session, learningPhase: phase }
                    }
                });
            },

            advanceLearningPhase: (wordId) => {
                const session = getSession(get(), wordId);
                const current = session.learningPhase;
                if (current < LearningPhase.Completed) {
                    const next = current + 1;
                    get().setLearningPhase(wordId, next);
                    console.log(`[Cycle] Advanced ${wordId} to Phase ${next} (${LearningPhase[next]})`);
                }
            },

            toggleAutoMode: () =>
                set((state) => ({ autoMode: !state.autoMode })),

            clearData: () => {
                set({
                    wordSessions: {},
                    wordProgress: {},
                    learnedWords: [],
                    currentWordId: '',
                    messages: [],
                    isTyping: false
                });
                // Ensure page refresh or reload to reset UI components deeply if needed
                if (typeof window !== 'undefined') {
                    window.location.reload();
                }
            },

            switchWord: (wordId) => {
                const { wordSessions } = get();
                // 如果切换到新单词且该单词没有会话，初始化它
                if (!wordSessions[wordId]) {
                    const initialMessages = [{
                        id: genId(),
                        role: 'assistant' as const,
                        content: `👋 让我们来学习单词 "${wordId}" 吧！`,
                    }];
                    set((state) => ({
                        currentWordId: wordId,
                        wordSessions: {
                            ...state.wordSessions,
                            [wordId]: {
                                messages: initialMessages,
                                conversationHistory: [],
                                mastery: initialMasteryState,
                                learningPhase: LearningPhase.Reading
                            }
                        },
                        messages: initialMessages, // Update top-level messages
                        // 切换时重置快捷回复
                        quickReplies: [
                            { text: "开始学习", emoji: "🚀" },
                            { text: "考考我", emoji: "❓" },
                        ],
                        isTyping: false
                    }));
                } else {
                    set({
                        currentWordId: wordId,
                        messages: wordSessions[wordId].messages, // Switch messages context
                        // 恢复该单词的快捷回复逻辑
                        quickReplies: generateContextualReplies(
                            wordSessions[wordId].messages[wordSessions[wordId].messages.length - 1] || null,
                            wordSessions[wordId].mastery,
                            wordId
                        ),
                        isTyping: false
                    });
                }
            },

            getCurrentWord: () => {
                const { currentWordId, dynamicVocabulary } = get();
                if (!currentWordId) return null;
                // 1. Check Dynamic Cache First (Priority for new words)
                if (dynamicVocabulary && dynamicVocabulary[currentWordId.toLowerCase()]) {
                    return dynamicVocabulary[currentWordId.toLowerCase()];
                }
                // 2. Use the unified getWordData (Static + IELTS)
                return getWordData(currentWordId) || null;
            },

            handleQuickReply: async (reply) => {
                const text = reply.emoji ? `${reply.emoji} ${reply.text}` : reply.text;
                await get().sendMessage(text);
            },

            startLearning: async () => {
                await get().sendMessage("🚀 开始学习");
            },

            // ===== 角色扮演专用对话 =====
            chatRoleplay: async (scenario, aiRole, userRole, history) => {
                try {
                    const { callSimpleChat } = await import('@/lib/ai/deepseek');
                    const roleplayPrompt = `
你现在正在进行一个角色扮演游戏。
场景：${scenario}
你的角色：${aiRole}
用户角色：${userRole}

规则：
1. 必须完全沉浸在角色中，不要说"作为AI"之类的话。
2. 回复要简短、自然、口语化（1-2句话）。
3. 如果用户使用了目标单词，记得在回复中自然地给予反馈或继续剧情。
4. 主要使用中文，但在必要的英语学习场景（如点餐）可以用英文。

历史对话：
${history.map(m => `${m.role === 'user' ? '用户' : aiRole}: ${m.content}`).join('\n')}
            `.trim();
                    const message = history.length > 0 ? history[history.length - 1].content : '';
                    if (!message) return "（等待用户输入...）";

                    const response = await callSimpleChat(roleplayPrompt, message);
                    return response;
                } catch (error) {
                    console.error("Roleplay API error:", error);
                    return "（AI 暂时掉线了，请重试）";
                }
            },

            // ===== AI 自动继续 =====
            autoContinue: async () => {
                const word = get().getCurrentWord();
                if (!word || get().isTyping) return;

                set({ isTyping: true, quickReplies: [] });

                const { currentWordId } = get();
                // Removed unused wordSessions retrieval
                const session = getSession(get(), currentWordId);

                // MindFlow 2.0: 使用 6 步学习法指令
                const phaseInstruction = "Contextual learning flow active.";

                const systemPrompt = constructSystemPrompt(
                    {
                        id: 'learning-session',
                        name: 'Word Learning',
                        description: `Teaching the word: ${currentWordId}`,
                        category: 'learning',
                        systemPrompt: `${phaseInstruction}\n\nCurrent Mastery Stats: ${JSON.stringify(session.mastery)}\nUser Progress: Phase ${session.learningPhase}`,
                        initialMessage: `Let's learn ${currentWordId}!`,
                        persona: CRYSTAL_PERSONA
                    },
                    CRYSTAL_PERSONA
                );

                const newHistory: DeepSeekMessage[] = [
                    ...session.conversationHistory,
                    { role: 'system' as const, content: systemPrompt }
                ];

                try {
                    const { callAgent } = await import('@/lib/ai/deepseek');
                    // Removed unused masteryInfo
                    // const masteryInfo = `...`;

                    // Streaming: Start with empty message
                    const messageId = get().addMessage({ role: 'assistant', content: '' });

                    const response = await callAgent(
                        newHistory,
                        word.word,
                        word.detail.definition,
                        (token) => get().updateMessage(messageId, (prev) => prev + token)
                    );

                    // Race condition check: If currentWordId changed, discard response
                    if (get().currentWordId !== currentWordId) return;

                    // 注意：executeToolCall 会调用 addMessage，这会自动更新当前 session
                    if (response.toolCall) {
                        await executeToolCall(response.toolCall, word, response.message, get, set);
                    } else {
                        // If no tool call, we just need to sync the history with the fully streamed message
                        // The UI message is already updated via streaming.
                        const updatedSession = getSession(get(), currentWordId);
                        set((state) => ({
                            wordSessions: {
                                ...state.wordSessions,
                                [currentWordId]: {
                                    ...updatedSession,
                                    conversationHistory: [
                                        ...updatedSession.conversationHistory,
                                        { role: 'assistant' as const, content: response.message }
                                    ]
                                }
                            }
                        }));
                    }

                    const currentSession = getSession(get(), currentWordId);
                    get().setLearningPhase(currentWordId, session.learningPhase); // Ensure phase is sync (optional)

                    set({
                        isTyping: false,
                        quickReplies: response.quickReplies || generateContextualReplies(
                            currentSession.messages[currentSession.messages.length - 1] || null,
                            session.mastery,
                            currentWordId
                        )
                    });

                    if (get().autoMode) {
                        setTimeout(() => get().autoContinue(), 5000);
                    }

                } catch (error) {
                    console.error("Auto continue error:", error);
                    set({ isTyping: false });
                }
            },

            // ===== 处理用户沉默（智能唤醒） =====
            // ===== 处理用户沉默（智能唤醒） =====
            handleUserSilence: async () => {
                const word = get().getCurrentWord();
                if (!word || get().isTyping || get().autoMode) return;

                set({ isTyping: true });

                const { currentWordId } = get();
                const session = getSession(get(), currentWordId);

                // 1. Analyze Context based on last message
                const lastMsg = session.messages[session.messages.length - 1];
                let proactivePrompt = "";
                let userContext = "用户沉默中，需要激活";

                if (lastMsg?.type === 'card') {
                    const cardType = lastMsg.cardData?.type as string | undefined;
                    // 兼容新旧卡片类型
                    if (cardType === 'phonetic' || cardType === 'definition') {
                        proactivePrompt = EXPANSION_PROMPTS.detail(word.word);
                        userContext = "User is silent at Definition card";
                    } else if (cardType === 'example') {
                        proactivePrompt = EXPANSION_PROMPTS.speaking(word.word);
                        userContext = "User is silent at Example card";
                    } else if (cardType === 'spelling' || cardType === 'memory_hook' || cardType === 'collocation') {
                        proactivePrompt = EXPANSION_PROMPTS.spelling_writing(word.word);
                        userContext = "User is silent at Spelling card";
                    } else {
                        proactivePrompt = "User is looking at a card and is silent. Provide an interesting cultural fact about the word.";
                        userContext = "User silent at unknown card";
                    }
                } else if (lastMsg?.role === 'assistant') {
                    // Last was text from AI
                    proactivePrompt = "User is silent after your last comment. Provide ONE more distinct, interesting fact or usage example about the word. Do NOT ask a question. Just share knowledge.";
                    userContext = "User silent after AI comment";
                } else {
                    // Last was user text
                    proactivePrompt = "User is silent. specific deeper insight about the current word.";
                }

                const systemPrompt = `[系统指令: ${proactivePrompt} 请简短自然地发起对话，不要问'你在吗'。⚠️重要：本次只用文字回复，严禁调用 show_card 工具。]`;

                const newHistory: DeepSeekMessage[] = [
                    ...session.conversationHistory,
                    { role: 'system' as const, content: systemPrompt }
                ];

                try {
                    const { callAgent } = await import('@/lib/ai/deepseek');
                    const response = await callAgent(
                        newHistory,
                        word.word,
                        word.detail.definition
                    );

                    if (response.toolCall) {
                        await executeToolCall(response.toolCall, word, response.message, get, set);
                    } else if (response.message) {
                        get().addMessage({ role: 'assistant', content: response.message });

                        // 更新 conversationHistory
                        const updatedSession = getSession(get(), currentWordId);
                        set((state) => ({
                            wordSessions: {
                                ...state.wordSessions,
                                [currentWordId]: {
                                    ...updatedSession,
                                    conversationHistory: [
                                        ...updatedSession.conversationHistory,
                                        { role: 'assistant' as const, content: response.message }
                                    ]
                                }
                            }
                        }));
                    }

                    const currentSession = getSession(get(), currentWordId);
                    set({
                        isTyping: false,
                        quickReplies: response.quickReplies || generateContextualReplies(
                            currentSession.messages[currentSession.messages.length - 1] || null,
                            currentSession.mastery,
                            currentWordId
                        )
                    });

                } catch (error) {
                    console.error("Silence handler error:", error);
                    set({ isTyping: false });
                }
            },

            // ===== 发送消息 (核心 Agent 逻辑) =====
            sendMessage: async (content: string) => {
                const word = get().getCurrentWord();
                const { currentWordId } = get();
                const session = getSession(get(), currentWordId);
                const mastery = session.mastery;

                if (!word || get().isTyping) return;

                set({ isTyping: true, quickReplies: [] });

                // Add user message
                get().addMessage({ role: 'user', content });

                // Build context
                if (get().wordSessions[get().currentWordId]) {
                    const wordId = get().currentWordId;
                    const currentSessionState = get().wordSessions[wordId]; // Get current state for phase
                    const text = content.trim();

                    // MindFlow 2.0: Check for phase completion triggers
                    if (currentSessionState.learningPhase === LearningPhase.Reading && (text.includes("我记住了") || text.includes("Got it"))) {
                        get().advanceLearningPhase(wordId);
                    } else if (currentSessionState.learningPhase === LearningPhase.Example && (text.includes("看懂了") || text.includes("Understood"))) {
                        get().advanceLearningPhase(wordId);
                    } else if (currentSessionState.learningPhase === LearningPhase.Speaking && (text.includes("读完了") || text.includes("Done"))) {
                        get().advanceLearningPhase(wordId);
                    }
                    // Quiz/Spelling usually handled by specific interactions, but simple "next" works too
                }

                // Refresh session after potential update
                const updatedSession = getSession(get(), currentWordId);

                // Update conversation history
                const newHistory: DeepSeekMessage[] = [
                    ...updatedSession.conversationHistory, // Use updated session
                    { role: 'user' as const, content }
                ];

                set((state) => ({
                    wordSessions: {
                        ...state.wordSessions,
                        [currentWordId]: {
                            ...session, // safe to use session as base here since addMessage updated messages but not this object reference in closures? No, fetch fresh
                            conversationHistory: newHistory,
                            // Need to preserve messages updated by addMessage just now
                            messages: get().wordSessions[currentWordId].messages
                        }
                    }
                }));

                try {
                    const { callAgent } = await import('@/lib/ai/deepseek');

                    // Streaming: Start with '...' to avoid empty bubble
                    const messageId = get().addMessage({ role: 'assistant', content: '...' });

                    const response = await callAgent(
                        newHistory,
                        word.word,
                        word.detail.definition,
                        (token) => get().updateMessage(messageId, (prev) => (prev === '...' ? token : prev + token))
                    );

                    if (response.toolCall) {
                        // If tool called:
                        // 1. If message was just placeholder "...", delete it.
                        // 2. If message had real content, keep it but remove the "..." prefix if present.
                        const currentSession = get().wordSessions[currentWordId];
                        const currentMsg = currentSession?.messages.find(m => m.id === messageId);

                        if (currentMsg && (currentMsg.content === '...' || currentMsg.content === '')) {
                            get().deleteMessage(messageId);
                        } else if (currentMsg && currentMsg.content.startsWith('...')) {
                            get().updateMessage(messageId, (prev) => prev.replace('...', '').trim());
                        }

                        await executeToolCall(response.toolCall, word, response.message, get, set);
                    } else {
                        // The UI message is already updated via streaming.
                        // Sync conversation history.
                        const updatedSession = getSession(get(), currentWordId);
                        set((state) => ({
                            wordSessions: {
                                ...state.wordSessions,
                                [currentWordId]: {
                                    ...updatedSession,
                                    conversationHistory: [
                                        ...updatedSession.conversationHistory,
                                        { role: 'assistant' as const, content: response.message }
                                    ]
                                }
                            }
                        }));
                    }

                    const finalSession = getSession(get(), currentWordId);
                    const lastMsg = finalSession.messages[finalSession.messages.length - 1];
                    set({
                        isTyping: false,
                        quickReplies: response.quickReplies || generateContextualReplies(lastMsg, finalSession.mastery, currentWordId)
                    });

                } catch (error) {
                    console.error("Agent error:", error);
                    get().addMessage({ role: 'assistant', content: '让我们继续聊这个词吧！' });
                    set({
                        isTyping: false,
                        quickReplies: [
                            { text: "好的", emoji: "👍" },
                            { text: "考考我", emoji: "❓" },
                        ]
                    });
                }
            },

            // ===== AI 生成卡片评论 (Contextual Commentary) =====
            generateCardCommentary: async (word: WordLearningData, stage: CardStage) => {
                // Determine prompt based on stage
                let prompt = "";
                const cardType = getCardTypeForStage(stage);

                switch (cardType) {
                    case 'detail':
                        prompt = COMMENTARY_PROMPTS.detail(word.word, word.detail.definition);
                        break;
                    case 'quiz':
                        const optionsText = word.quiz.options.map(o => `${o.id}: ${o.label}`).join('\n');
                        prompt = COMMENTARY_PROMPTS.quiz(word.word, optionsText);
                        break;
                    case 'speaking':
                        prompt = COMMENTARY_PROMPTS.speaking(word.word);
                        break;
                    case 'spelling_writing':
                        prompt = COMMENTARY_PROMPTS.spelling_writing(word.word);
                        break;
                    default:
                        return;
                }

                // Add system message to history invisibly (or just use one-shot call)
                // We'll use a direct call pattern similar to sendMessage but strictly for this purpose
                const { currentWordId } = get();
                const session = getSession(get(), currentWordId);

                try {
                    const { callAgent } = await import('@/lib/ai/deepseek');

                    // Construct a CLEAN, one-shot history.
                    // We intentionally DISCARD the previous conversation history for this specific call.
                    // This forces the AI to obey the new "System Override" without being polluted by past context.
                    const commentarySystemMsg: DeepSeekMessage = {
                        role: 'system',
                        content: `[System Instruction]: ${prompt} \nReply in CHINESE.`
                    };

                    const newHistory = [
                        commentarySystemMsg
                    ];

                    const messageId = get().addMessage({ role: 'assistant', content: '...' }); // Placeholder content to prevent "empty bubble" visual glitch
                    let prevContent = '...';

                    // Stream response
                    const response = await callAgent(
                        newHistory,
                        word.word,
                        word.detail.definition,
                        (token) => {
                            // On first token, clear the placeholder '...'
                            if (token && prevContent === '...') {
                                get().updateMessage(messageId, () => token);
                                prevContent = token;
                            } else {
                                get().updateMessage(messageId, (prev) => (prev === '...' ? token : prev + token));
                            }
                        }
                    );

                    // Update Context
                    const updatedSession = getSession(get(), currentWordId);
                    set((state) => ({
                        wordSessions: {
                            ...state.wordSessions,
                            [currentWordId]: {
                                ...updatedSession,
                                conversationHistory: [
                                    ...updatedSession.conversationHistory,
                                    commentarySystemMsg, // Optional: do we record the detailed instruction? Maybe just the result. 
                                    { role: 'assistant', content: response.message }
                                ]
                            }
                        }
                    }));

                } catch (error) {
                    console.error("Commentary generation failed:", error);
                    // Silently fail or minimal fallback
                }
            }
        }),
        {
            name: 'english-agent-storage-v2', // Changed name to reset/migrate storage for new structure
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                currentWordId: state.currentWordId,
                wordSessions: state.wordSessions,
                learnedWords: state.learnedWords,
                autoMode: state.autoMode,
                messages: state.messages // Persist current messages
            }),
        }
    )
);

// 根据状态生成智能快捷回复
function generateSmartReplies(mastery: MasteryState, phase: LearningPhase = LearningPhase.Reading): QuickReply[] {
    // Phase 6: Completed or Mastery check
    if (phase >= LearningPhase.Completed || (mastery.quizPassed && mastery.spellingPassed)) {
        return [
            { text: "下一个单词", emoji: "➡️" },
            { text: "再巩固一下", emoji: "📝" },
        ];
    }

    // Phase specific suggestions
    switch (phase) {
        case LearningPhase.Reading:
            return [{ text: "我记住了", emoji: "👀" }, { text: "再讲讲", emoji: "🤔" }];
        case LearningPhase.Example:
            return [{ text: "看懂了", emoji: "👌" }, { text: "再来一个", emoji: "🔄" }];
        case LearningPhase.Speaking:
            return [{ text: "读完了", emoji: "🗣️" }];
        case LearningPhase.Quiz:
            // Usually quiz card handles input, but user can ask for help
            return [{ text: "准备好了", emoji: "❓" }];
        case LearningPhase.Spelling:
            return [{ text: "开始拼写", emoji: "✍️" }];
        case LearningPhase.Writing:
            return [{ text: "我来造句", emoji: "📝" }];
        default:
            return [{ text: "继续", emoji: "➡️" }];
    }
}

// ===== 执行工具调用 =====
async function executeToolCall(
    toolCall: { name: string; arguments: Record<string, unknown> },
    word: WordLearningData,
    aiMessage: string,
    get: () => AgentState,
    set: (partial: Partial<AgentState> | ((state: AgentState) => Partial<AgentState>)) => void
) {
    const { currentWordId } = get();

    // 1. Centralized History Update: Record interaction so AI remembers tool usage
    const toolCallId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const assistantMsg: DeepSeekMessage = {
        role: 'assistant',
        content: aiMessage || null,
        tool_calls: [{
            id: toolCallId,
            type: 'function',
            function: { name: toolCall.name, arguments: JSON.stringify(toolCall.arguments) }
        }]
    };
    const toolMsg: DeepSeekMessage = {
        role: 'tool',
        tool_call_id: toolCallId,
        content: JSON.stringify({ success: true, message: "UI Component Rendered. DO NOT repeat the content (examples, definitions, etc.) in your next text response. Keep it brief and encouraging." })
    };

    const s = getSession(get(), currentWordId);
    set((state) => ({
        wordSessions: {
            ...state.wordSessions,
            [currentWordId]: {
                ...s,
                conversationHistory: [...s.conversationHistory, assistantMsg, toolMsg]
            }
        }
    }));

    const context: SkillContext = {
        getState: get,
        setState: set,
        currentWordId
    };

    try {
        // ALWAYS add the AI's introductory message if it exists, before the tool runs
        if (aiMessage && aiMessage.trim() !== "" && aiMessage !== "...") {
            get().addMessage({ role: 'assistant', content: aiMessage });
        }

        await SkillRegistry.execute(toolCall.name, toolCall.arguments, context);
    } catch (error) {
        console.error(`Error executing skill ${toolCall.name}:`, error);
        // Fallback to simple assistant message ONLY if we didn't add the aiMessage already
        if (aiMessage && (aiMessage === "..." || aiMessage === "")) {
            get().addMessage({ role: 'assistant', content: "抱歉，卡片生成遇到了一点问题，请稍后重试。" });
        }
    }
}

// 内部处理用户互动完成后的 AI 自动跟进
async function handleInteractionComplete(type: string, message: string) {
    const state = useChatStore.getState();
    const word = state.getCurrentWord();
    if (!word) return;

    const { currentWordId } = state;
    const session = getSession(state, currentWordId);

    state.setTyping(true);
    state.setQuickReplies([]);

    const systemPrompt = `[系统通知] 用户刚刚完成了 ${type}。结果：${message}。请立刻根据这个结果给予反馈（比如解释为什么选这个答案，或者夸奖），然后继续教学。不要等待用户回复。`;

    const newHistory: DeepSeekMessage[] = [
        ...session.conversationHistory,
        { role: 'system' as const, content: systemPrompt }
    ];

    try {
        const { callAgent } = await import('@/lib/ai/deepseek');
        const masteryInfo = `
【掌握进度】
- 测验: ${session.mastery.quizPassed ? '✅' : '未测'}
- 拼写: ${session.mastery.spellingPassed ? '✅' : '未测'}
        `.trim();

        // Streaming: Start with '...' to avoid empty bubble
        const messageId = state.addMessage({ role: 'assistant', content: '...' });

        const response = await callAgent(
            newHistory,
            word.word,
            word.detail.definition,
            (token) => state.updateMessage(messageId, (prev) => (prev === '...' ? token : prev + token))
        );

        if (response.toolCall) {
            state.deleteMessage(messageId);
            await executeToolCall(response.toolCall, word, response.message, useChatStore.getState, useChatStore.setState);
        } else {
            // Update history
            const s = getSession(useChatStore.getState(), currentWordId);
            useChatStore.setState((prev) => ({
                wordSessions: {
                    ...prev.wordSessions,
                    [currentWordId]: {
                        ...s,
                        conversationHistory: [
                            ...s.conversationHistory,
                            { role: 'assistant' as const, content: response.message }
                        ]
                    }
                }
            }));
        }

        const finalSession = getSession(useChatStore.getState(), currentWordId);
        state.setTyping(false);
        state.setQuickReplies(response.quickReplies || generateSmartReplies(finalSession.mastery, finalSession.learningPhase));

        if (state.autoMode) {
            setTimeout(() => state.autoContinue(), 5000);
        }

    } catch (error) {
        console.error("Interaction follow-up error:", error);
        state.setTyping(false);
    }
}

export function recordCorrectAnswer() {
    const state = useChatStore.getState();
    state.updateMastery({ correctAnswers: getSession(state, state.currentWordId).mastery.correctAnswers + 1 });
    handleInteractionComplete("练习", "回答正确");
}

export function recordQuizPassed() {
    const state = useChatStore.getState();
    const currentCorrect = getSession(state, state.currentWordId).mastery.correctAnswers;
    state.updateMastery({ quizPassed: true, correctAnswers: currentCorrect + 1 });
    handleInteractionComplete("测验", "通过");
}

export function recordSpellingPassed() {
    const state = useChatStore.getState();
    const currentCorrect = getSession(state, state.currentWordId).mastery.correctAnswers;
    state.updateMastery({ spellingPassed: true, correctAnswers: currentCorrect + 1 });
    handleInteractionComplete("拼写测验", "通过");
}

export function recordRoleplayPassed() {
    handleInteractionComplete("情景模拟", "成功通关！");
}
