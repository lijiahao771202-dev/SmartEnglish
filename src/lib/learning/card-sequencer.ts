/**
 * 卡片序列引擎 - 新的 4 卡片学习流
 * Detail -> Quiz -> Speaking -> SpellingWriting -> Mastered
 */

// 学习阶段枚举

// ===== 学习阶段枚举 =====
export enum CardStage {
    Detail = 'detail',
    Quiz = 'quiz',
    Speaking = 'speaking',
    SpellingWriting = 'spelling_writing',
    Mastered = 'mastered'
}

// 阶段到卡片类型的映射
const STAGE_TO_CARD_TYPE: Record<CardStage, string> = {
    [CardStage.Detail]: 'detail',
    [CardStage.Quiz]: 'quiz',
    [CardStage.Speaking]: 'speaking',
    [CardStage.SpellingWriting]: 'spelling_writing',
    [CardStage.Mastered]: 'mastered'
};

// 阶段名称（用于 UI 显示）
const STAGE_NAMES: Record<CardStage, string> = {
    [CardStage.Detail]: '📖 详情学习',
    [CardStage.Quiz]: '❓ 词义测验',
    [CardStage.Speaking]: '🗣️ 发音跟读',
    [CardStage.SpellingWriting]: '✍️ 拼写仿写',
    [CardStage.Mastered]: '✅ 已掌握'
};

// 阶段顺序
const STAGE_ORDER: CardStage[] = [
    CardStage.Detail,
    CardStage.Quiz,
    CardStage.Speaking,
    CardStage.SpellingWriting,
    CardStage.Mastered
];

// ===== 核心函数 =====

/**
 * 获取下一个学习阶段
 */
export function getNextCardStage(currentStage: CardStage): CardStage {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex >= STAGE_ORDER.length - 1) {
        return CardStage.Mastered;
    }
    return STAGE_ORDER[currentIndex + 1];
}

/**
 * 获取阶段对应的卡片类型
 */
export function getCardTypeForStage(stage: CardStage): string {
    return STAGE_TO_CARD_TYPE[stage];
}

/**
 * 获取阶段显示名称
 */
export function getStageName(stage: CardStage): string {
    return STAGE_NAMES[stage];
}

/**
 * 计算学习进度百分比
 */
export function getStageProgress(stage: CardStage): number {
    const currentIndex = STAGE_ORDER.indexOf(stage);
    if (currentIndex === -1) return 0;
    return Math.round((currentIndex / (STAGE_ORDER.length - 1)) * 100);
}

/**
 * 获取阶段完成后的预设评论
 * @deprecated MindFlow 2.0 uses "Deep Dive" mode. No automatic transitions comments.
 */
export function getCompletionComment(_stage: CardStage, _isSuccess: boolean): string {
    return ""; // Silence is golden.
}

/**
 * 检查是否全部通过（4个阶段都完成）
 */
export function isWordMastered(passedStages: Set<CardStage>): boolean {
    const requiredStages = [
        CardStage.Detail,
        CardStage.Quiz,
        CardStage.Speaking,
        CardStage.SpellingWriting
    ];
    return requiredStages.every(stage => passedStages.has(stage));
}
