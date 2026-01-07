import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generateVocabularyPrompt, SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { VocabularyCardSchema } from '@/lib/ai/types';

// Lazy initialize OpenAI client
const getClient = () => {
    return new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API_KEY,
    });
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { word } = body;

        if (!word || typeof word !== 'string') {
            return NextResponse.json(
                { error: 'Word is required and must be a string' },
                { status: 400 }
            );
        }

        if (!process.env.DEEPSEEK_API_KEY) {
            return NextResponse.json(
                { error: 'DeepSeek API key is not configured' },
                { status: 500 }
            );
        }

        const completion = await getClient().chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: generateVocabularyPrompt(word) },
            ],
            model: 'deepseek-chat',
            temperature: 1.0,
            response_format: { type: 'json_object' },
        });

        const content = completion.choices[0].message.content;

        if (!content) {
            throw new Error('No content received from AI');
        }

        try {
            const parsedData = JSON.parse(content);
            // Validate with Zod
            const validatedData = VocabularyCardSchema.parse(parsedData);
            return NextResponse.json(validatedData);
        } catch (parseError) {
            console.error('JSON Parse/Validation Error:', parseError);
            console.error('Raw Content:', content);
            return NextResponse.json(
                { error: 'Failed to parse AI response', details: (parseError as any).message },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('AI Generation Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: (error as any).message },
            { status: 500 }
        );
    }
}
