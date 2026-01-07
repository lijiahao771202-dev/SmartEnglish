/**
 * 卡片序列管理器
 * 管理 6 张系统卡片的进度
 */

import { SystemCardType, CARD_SEQUENCE } from '@/lib/ai/card-types';

// 学习阶段枚举 (与卡片类型对应)
export enum CardStage {
    Phonetic = 'phonetic',
    Definition = 'definition',
    Example = 'example',
    MemoryHook = 'memory_hook',
    Collocation = 'collocation',
    Spelling = 'spelling',
    Completed = 'completed'
}

// 阶段名称
const STAGE_NAMES: Record<CardStage, string> = {
    [CardStage.Phonetic]: '🔊 发音学习',
    [CardStage.Definition]: '📖 释义理解',
    [CardStage.Example]: '📝 例句精读',
    [CardStage.MemoryHook]: '💡 助记强化',
    [CardStage.Collocation]: '🔗 搭配运用',
    [CardStage.Spelling]: '✍️ 拼写挑战',
    [CardStage.Completed]: '✅ 完成'
};

/**
 * 获取下一个阶段
 */
export function getNextStage(current: CardStage): CardStage {
    const stages = Object.values(CardStage);
    const index = stages.indexOf(current);

    if (index === -1 || index >= stages.length - 1) {
        return CardStage.Completed;
    }

    return stages[index + 1] as CardStage;
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
    const stages = Object.values(CardStage);
    const index = stages.indexOf(stage);

    if (index === -1) return 0;

    // 完成阶段是 100%
    if (stage === CardStage.Completed) return 100;

    // 其他阶段按比例计算
    return Math.round((index / (stages.length - 1)) * 100);
}

/**
 * 从 SystemCardType 转换为 CardStage
 */
export function cardTypeToStage(type: SystemCardType): CardStage {
    return type as CardStage;
}

/**
 * 从 CardStage 转换为 SystemCardType
 */
export function stageToCardType(stage: CardStage): SystemCardType | null {
    if (stage === CardStage.Completed) return null;
    return stage as SystemCardType;
}

/**
 * 检查是否完成所有卡片
 */
export function isAllCompleted(completedCards: Set<SystemCardType>): boolean {
    return CARD_SEQUENCE.every(type => completedCards.has(type));
}

// 兜底函数 (为了兼容性保留)
export function getCardTypeForStage(stage: CardStage): string {
    return stage;
}

export function getCompletionComment(): string {
    return "";
}

export function getNextCardStage(current: CardStage): CardStage {
    return getNextStage(current);
}
