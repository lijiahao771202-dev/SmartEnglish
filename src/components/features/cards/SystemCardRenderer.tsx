"use client";

import { CardData } from "@/lib/ai/card-types";
import {
    PhoneticCard,
    DefinitionCard,
    ExampleCard,
    MemoryHookCard,
    CollocationCard,
    SpellingCard,
    WritingCard
} from "./system";

interface SystemCardRendererProps {
    cardData: CardData;
    onComplete: () => void;
}

/**
 * 统一卡片渲染器
 * 根据卡片类型渲染对应组件
 */
export function SystemCardRenderer({ cardData, onComplete }: SystemCardRendererProps) {
    switch (cardData.type) {
        case 'phonetic':
            return <PhoneticCard data={cardData} onComplete={onComplete} />;

        case 'definition':
            return <DefinitionCard data={cardData} onComplete={onComplete} />;

        case 'example':
            return <ExampleCard data={cardData} onComplete={onComplete} />;

        case 'memory_hook':
            return <MemoryHookCard data={cardData} onComplete={onComplete} />;

        case 'collocation':
            return <CollocationCard data={cardData} onComplete={onComplete} />;

        case 'spelling':
            return <SpellingCard data={cardData} onComplete={onComplete} />;

        case 'writing':
            return <WritingCard data={cardData} onComplete={onComplete} />;

        default:
            return (
                <div className="p-4 bg-red-500/20 rounded-xl text-red-300">
                    未知卡片类型
                </div>
            );
    }
}
