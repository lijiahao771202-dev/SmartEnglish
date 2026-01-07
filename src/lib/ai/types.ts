import { z } from 'zod';

export interface Persona {
    name: string;
    avatar: string;
    roleDescription: string;
}

export interface Scenario {
    id: string;
    name: string;
    description: string;
    category: string;
    persona: Persona;
    systemPrompt: string;
    initialMessage: string;
}


export const ExampleSchema = z.object({
    sentence: z.string(),
    translation: z.string(),
});

export const VocabularyCardSchema = z.object({
    word: z.string(),
    phonetic: z.string(),
    definition: z.string(),
    definition_en: z.string(),
    examples: z.array(ExampleSchema).min(1),
    synonyms: z.array(z.string()).optional(),
    antonyms: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export type Example = z.infer<typeof ExampleSchema>;
export type VocabularyCard = z.infer<typeof VocabularyCardSchema>;

export interface AIResponse {
    cards: VocabularyCard[];
}
