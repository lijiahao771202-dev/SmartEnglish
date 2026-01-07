"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { WritingCardData } from "@/lib/ai/card-types";

interface WritingCardProps {
    data: WritingCardData;
    onComplete: () => void;
}

/**
 * 仿写卡片
 * 用户使用目标单词造句，AI 进行评分和反馈
 */
export function WritingCard({ data, onComplete }: WritingCardProps) {
    const [userSentence, setUserSentence] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{
        score: number;
        comment: string;
        correction?: string;
    } | null>(null);

    // 提交用户造句给 AI 评分
    const handleSubmit = async () => {
        if (!userSentence.trim() || isSubmitting) return;

        setIsSubmitting(true);

        try {
            const { callTeachingStream } = await import("@/lib/ai/deepseek");

            const prompt = `
[仿写评分任务]
- 目标单词: "${data.word}"
- 单词释义: ${data.definition}
- 参考例句: "${data.exampleSentence}"
- 用户造句: "${userSentence}"

请用以下 JSON 格式评分（只返回 JSON，不要其他内容）：
{
  "score": 1-10 分,
  "comment": "简短评价（1-2句话）",
  "correction": "如果有语法错误，给出修正版本，否则省略此字段"
}

评分标准：
- 单词使用是否正确
- 语法是否正确
- 句子是否自然
`;

            let fullResponse = "";
            await callTeachingStream(
                "你是一位友好的英语老师，擅长给学生的造句评分和反馈。",
                [{ role: "user" as const, content: prompt }],
                (token) => {
                    fullResponse += token;
                }
            );

            // 解析 AI 返回的 JSON
            try {
                const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const result = JSON.parse(jsonMatch[0]);
                    setFeedback({
                        score: result.score || 7,
                        comment: result.comment || "不错的尝试！",
                        correction: result.correction
                    });
                }
            } catch {
                setFeedback({
                    score: 7,
                    comment: "不错的尝试！继续加油～",
                });
            }
        } catch (error) {
            console.error("[WritingCard] Error:", error);
            setFeedback({
                score: 6,
                comment: "评分出错，但你的尝试很棒！",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // 获取分数对应的颜色和评价
    const getScoreInfo = (score: number) => {
        if (score >= 9) return { color: "from-emerald-500 to-green-600", emoji: "🌟", label: "完美！" };
        if (score >= 7) return { color: "from-blue-500 to-indigo-600", emoji: "👍", label: "很好！" };
        if (score >= 5) return { color: "from-yellow-500 to-orange-500", emoji: "💪", label: "加油！" };
        return { color: "from-red-400 to-pink-500", emoji: "📚", label: "继续努力！" };
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-5 border border-white/20 shadow-xl"
        >
            {/* 标题 */}
            <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-medium flex items-center gap-1">
                    <Sparkles size={12} />
                    仿写练习
                </div>
            </div>

            {/* 单词和提示 */}
            <div className="mb-4">
                <h3 className="text-2xl font-bold text-white mb-2">{data.word}</h3>
                <p className="text-sm text-purple-200 mb-2">{data.definition}</p>
                <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                    <p className="text-xs text-purple-300 mb-1">📝 参考例句</p>
                    <p className="text-sm text-white/90 italic">{data.exampleSentence}</p>
                </div>
            </div>

            {/* 用户输入区 */}
            {!feedback ? (
                <div className="space-y-3">
                    <p className="text-sm text-purple-200">
                        请用 <span className="text-yellow-400 font-bold">{data.word}</span> 造一个句子：
                    </p>
                    <textarea
                        value={userSentence}
                        onChange={(e) => setUserSentence(e.target.value)}
                        placeholder="在这里输入你的句子..."
                        className="w-full h-24 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        disabled={isSubmitting}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!userSentence.trim() || isSubmitting}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                AI 评分中...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                提交评分
                            </>
                        )}
                    </button>
                </div>
            ) : (
                /* 反馈区 */
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                >
                    {/* 分数显示 */}
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getScoreInfo(feedback.score).color} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                            {feedback.score}
                        </div>
                        <div>
                            <p className="text-lg text-white font-bold flex items-center gap-2">
                                {getScoreInfo(feedback.score).emoji} {getScoreInfo(feedback.score).label}
                            </p>
                            <p className="text-sm text-purple-200">{feedback.comment}</p>
                        </div>
                    </div>

                    {/* 用户句子 */}
                    <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                        <p className="text-xs text-purple-300 mb-1">你写的句子</p>
                        <p className="text-sm text-white/90">{userSentence}</p>
                    </div>

                    {/* 修正建议 */}
                    {feedback.correction && (
                        <div className="p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
                            <p className="text-xs text-yellow-300 mb-1">💡 建议修正</p>
                            <p className="text-sm text-yellow-100">{feedback.correction}</p>
                        </div>
                    )}

                    {/* 继续按钮 */}
                    <button
                        onClick={onComplete}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        <CheckCircle size={18} />
                        完成学习 🎉
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
}
