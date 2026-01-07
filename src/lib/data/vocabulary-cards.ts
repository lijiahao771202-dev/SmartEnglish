/**
 * 本地词汇数据库 - 新的 4 卡片学习流
 * Detail -> Quiz -> Speaking -> SpellingWriting
 */

import {
    DetailCardData,
    QuizCardData,
    SpeakingCardData,
    SpellingWritingCardData
} from "@/lib/ai/card-types";

export interface WordLearningData {
    word: string;
    detail: DetailCardData;
    quiz: QuizCardData;
    speaking: SpeakingCardData;
    spellingWriting: SpellingWritingCardData;
}

// 词汇数据库
export const VOCABULARY_DATABASE: WordLearningData[] = [
    {
        word: "serendipity",
        detail: {
            type: "detail",
            word: "serendipity",
            phonetic: "/ˌser.ənˈdɪp.ə.ti/",
            definition: "机缘巧合；意外发现美好事物的运气",
            definitionEn: "The occurrence of events by chance in a happy way",
            exampleSentence: "Finding that bookstore was pure serendipity.",
            exampleTranslation: "发现那家书店纯属机缘巧合。",
            aiSupplement: "词源故事：这个词来自18世纪的一个童话《三个锡兰王子》(The Three Princes of Serendip)。故事中的王子们总是意外发现他们并非寻找的珍宝。联想记忆：想象你在街角意外遇到多年未见的老友——这就是 serendipity！"
        },
        quiz: {
            type: "quiz",
            word: "serendipity",
            question: "serendipity 的意思是什么？",
            options: [
                { id: "A", label: "悲伤的经历", isCorrect: false },
                { id: "B", label: "机缘巧合；意外发现美好事物", isCorrect: true },
                { id: "C", label: "精心的计划", isCorrect: false },
                { id: "D", label: "困难的挑战", isCorrect: false }
            ],
            explanation: "Serendipity 描述的是意外发现美好事物的运气，就像在旧书店里意外遇到一本改变人生的书。"
        },
        speaking: {
            type: "speaking",
            word: "serendipity",
            sentence: "Finding that café was pure serendipity.",
            sentenceTranslation: "发现那家咖啡馆纯属机缘巧合。",
            highlightWord: "serendipity"
        },
        spellingWriting: {
            type: "spelling_writing",
            word: "serendipity",
            hint: "s_r_n_i_i_y",
            definition: "机缘巧合；意外发现美好事物的运气",
            exampleSentence: "It was pure serendipity that we met at the coffee shop."
        }
    },
    {
        word: "ephemeral",
        detail: {
            type: "detail",
            word: "ephemeral",
            phonetic: "/ɪˈfem.ər.əl/",
            definition: "短暂的；转瞬即逝的",
            definitionEn: "Lasting for a very short time",
            exampleSentence: "Fame in the digital age can be ephemeral.",
            exampleTranslation: "数字时代的名声可能转瞬即逝。",
            aiSupplement: "词源：来自希腊语 ephemeros，意思是'只存在一天的'。联想记忆：想象樱花盛开的短暂美丽，或者清晨露珠在阳光下蒸发——这些都是 ephemeral 的最好诠释！"
        },
        quiz: {
            type: "quiz",
            word: "ephemeral",
            question: "下列哪个最能体现 ephemeral 的含义？",
            options: [
                { id: "A", label: "金字塔", isCorrect: false },
                { id: "B", label: "流星", isCorrect: true },
                { id: "C", label: "钻石", isCorrect: false },
                { id: "D", label: "大山", isCorrect: false }
            ],
            explanation: "流星只在夜空中闪耀片刻就消失了，这正是 ephemeral（短暂的）的最好例子！"
        },
        speaking: {
            type: "speaking",
            word: "ephemeral",
            sentence: "Cherry blossoms are beautiful but ephemeral.",
            sentenceTranslation: "樱花美丽但是转瞬即逝。",
            highlightWord: "ephemeral"
        },
        spellingWriting: {
            type: "spelling_writing",
            word: "ephemeral",
            hint: "e_h_m_r_l",
            definition: "短暂的；转瞬即逝的",
            exampleSentence: "The beauty of cherry blossoms is ephemeral."
        }
    },
    {
        word: "meticulous",
        detail: {
            type: "detail",
            word: "meticulous",
            phonetic: "/məˈtɪk.jə.ləs/",
            definition: "一丝不苟的；细致的",
            definitionEn: "Showing great attention to detail; very careful",
            exampleSentence: "She was meticulous in her research.",
            exampleTranslation: "她做研究一丝不苟。",
            aiSupplement: "文化背景：日本匠人精神（Monozukuri）就是 meticulous 的完美体现。联想记忆：想象一个钟表师傅用放大镜仔细检查每一个微小零件——这种对细节的极致追求就是 meticulous！"
        },
        quiz: {
            type: "quiz",
            word: "meticulous",
            question: "一个 meticulous 的人会怎么做？",
            options: [
                { id: "A", label: "匆忙完成任务", isCorrect: false },
                { id: "B", label: "仔细检查每一个细节", isCorrect: true },
                { id: "C", label: "忽略小问题", isCorrect: false },
                { id: "D", label: "随意处理事情", isCorrect: false }
            ],
            explanation: "Meticulous 的人对细节非常讲究，做事认真仔细，会反复检查每一个环节。"
        },
        speaking: {
            type: "speaking",
            word: "meticulous",
            sentence: "The architect was meticulous about every measurement.",
            sentenceTranslation: "那位建筑师对每一个尺寸都一丝不苟。",
            highlightWord: "meticulous"
        },
        spellingWriting: {
            type: "spelling_writing",
            word: "meticulous",
            hint: "m_t_c_l_u_",
            definition: "一丝不苟的；细致的",
            exampleSentence: "She is meticulous about organizing her desk."
        }
    },
    {
        word: "ubiquitous",
        detail: {
            type: "detail",
            word: "ubiquitous",
            phonetic: "/juːˈbɪk.wɪ.təs/",
            definition: "无处不在的；普遍存在的",
            definitionEn: "Present, appearing, or found everywhere",
            exampleSentence: "Smartphones have become ubiquitous in modern life.",
            exampleTranslation: "智能手机在现代生活中已经无处不在。",
            aiSupplement: "词源：来自拉丁语 ubique，意思是'到处'。生活例子：星巴克、WiFi、社交媒体——这些都是当代 ubiquitous 的代表！20年前它们还很稀有，现在却随处可见。"
        },
        quiz: {
            type: "quiz",
            word: "ubiquitous",
            question: "在现代城市中，什么是 ubiquitous 的？",
            options: [
                { id: "A", label: "城堡", isCorrect: false },
                { id: "B", label: "红绿灯", isCorrect: true },
                { id: "C", label: "古董店", isCorrect: false },
                { id: "D", label: "马车", isCorrect: false }
            ],
            explanation: "红绿灯在每个城市的街道上都能看到，它们是 ubiquitous（无处不在的）！"
        },
        speaking: {
            type: "speaking",
            word: "ubiquitous",
            sentence: "Coffee shops have become ubiquitous in urban areas.",
            sentenceTranslation: "咖啡店在城市地区已经无处不在。",
            highlightWord: "ubiquitous"
        },
        spellingWriting: {
            type: "spelling_writing",
            word: "ubiquitous",
            hint: "u_i_u_t_u_",
            definition: "无处不在的；普遍存在的",
            exampleSentence: "Smartphones have become ubiquitous in modern society."
        }
    },
    {
        word: "resilience",
        detail: {
            type: "detail",
            word: "resilience",
            phonetic: "/rɪˈzɪl.i.əns/",
            definition: "韧性；恢复力",
            definitionEn: "The ability to recover quickly from difficulties",
            exampleSentence: "Her resilience after the setback inspired everyone.",
            exampleTranslation: "她在挫折后的韧性激励了每个人。",
            aiSupplement: "形象比喻：Resilience 就像弹簧——被压下去后又弹回来。生活智慧：心理学家说，resilience 不是天生的，而是可以培养的能力。每次从困难中站起来，你的 resilience 就会变得更强！"
        },
        quiz: {
            type: "quiz",
            word: "resilience",
            question: "下列哪个行为体现了 resilience？",
            options: [
                { id: "A", label: "失败一次就放弃", isCorrect: false },
                { id: "B", label: "挫折后重新振作", isCorrect: true },
                { id: "C", label: "遇到困难就抱怨", isCorrect: false },
                { id: "D", label: "逃避所有挑战", isCorrect: false }
            ],
            explanation: "Resilience 是从困难中恢复的能力，体现在遇到挫折后能够重新站起来继续前进。"
        },
        speaking: {
            type: "speaking",
            word: "resilience",
            sentence: "Building resilience takes practice and time.",
            sentenceTranslation: "培养韧性需要练习和时间。",
            highlightWord: "resilience"
        },
        spellingWriting: {
            type: "spelling_writing",
            word: "resilience",
            hint: "r_s_l_e_c_",
            definition: "韧性；恢复力",
            exampleSentence: "The team showed great resilience after losing the first match."
        }
    }
];

// 辅助函数：根据单词获取学习数据
export function getWordData(word: string): WordLearningData | undefined {
    return VOCABULARY_DATABASE.find(w => w.word.toLowerCase() === word.toLowerCase());
}

// 辅助函数：获取随机单词
export function getRandomWord(): WordLearningData {
    return VOCABULARY_DATABASE[Math.floor(Math.random() * VOCABULARY_DATABASE.length)];
}
