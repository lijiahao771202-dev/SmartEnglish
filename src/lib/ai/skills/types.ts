import { CardData } from '@/lib/ai/card-types';
import { AgentState } from '@/lib/store/chat-store';

export interface SkillContext {
    getState: () => AgentState;
    setState: (update: Partial<AgentState> | ((state: AgentState) => Partial<AgentState>)) => void;
    currentWordId: string;
}

export interface Skill {
    name: string;
    description: string;
    parameters: {
        type: "object";
        properties: Record<string, unknown>;
        required: string[];
    };
    execute: (args: any, context: SkillContext) => Promise<void>;
}
