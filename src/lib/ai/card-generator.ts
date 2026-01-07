import { callSimpleChat } from "./deepseek";
import { WordLearningData } from "@/lib/data/vocabulary-cards";

/**
 * Generates full WordLearningData for a given word using AI.
 * This is the fallback mechanism when the word is not found in the local database.
 */
export async function generateWordDataAI(word: string): Promise<WordLearningData | null> {
    const systemPrompt = `
You are an expert English teacher. Your task is to generate valid JSON data for the word "${word}" to be used in a vocabulary learning app.

You must return a single JSON object adhering strictly to the structure below.
Do not include any markdown formatting or extra text. Just the raw JSON or JSON wrapped in \`\`\`json ... \`\`\`.

Required Structure:
{
    "word": "${word}",
    "detail": {
        "type": "detail",
        "word": "${word}",
        "phonetic": "...", 
        "definition": "Simple Chinese definition",
        "definitionEn": "Simple English definition",
        "exampleSentence": "A good example sentence.",
        "exampleTranslation": "Translation of the example.",
        "aiSupplement": "A short, fun fact, etymology, or memory hook (in Chinese)."
    },
    "quiz": {
        "type": "quiz",
        "word": "${word}",
        "question": "A multiple choice question about the word's meaning or usage (in Chinese).",
        "options": [
            { "id": "A", "label": "Option A", "isCorrect": false },
            { "id": "B", "label": "Correct Option", "isCorrect": true },
            { "id": "C", "label": "Option C", "isCorrect": false },
            { "id": "D", "label": "Option D", "isCorrect": false }
        ],
        "explanation": "Brief explanation of the answer."
    },
    "speaking": {
        "type": "speaking",
        "word": "${word}",
        "sentence": "A good sentence for shadowing practice.",
        "sentenceTranslation": "Translation of the sentence.",
        "highlightWord": "${word}"
    },
    "spellingWriting": {
        "type": "spelling_writing",
        "word": "${word}",
        "hint": "masked word e.g. w_r_",
        "definition": "Simple Chinese definition",
        "exampleSentence": "A sentence with the word."
    },
    "examples": {
        "type": "example",
        "word": "${word}",
        "examples": [
            { "sentence": "Example 1", "translation": "Translation 1", "audioUrl": "" },
            { "sentence": "Example 2", "translation": "Translation 2", "audioUrl": "" },
            { "sentence": "Example 3", "translation": "Translation 3", "audioUrl": "" }
        ]
    }
}
`;

    try {
        const rawResponse = await callSimpleChat(systemPrompt, `Generate data for: ${word}`);

        // Clean and parse JSON
        const jsonMatch = rawResponse.match(/```json\s*(\{[\s\S]*?\})\s*```/) || rawResponse.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            const data = JSON.parse(jsonStr) as WordLearningData;

            // Ensure types are correct strings (basic validation)
            data.detail.type = 'detail';
            data.quiz.type = 'quiz';
            data.speaking.type = 'speaking';
            data.spellingWriting.type = 'spelling_writing';
            if (data.examples) data.examples.type = 'example';

            return data;
        }

        console.error("AI Generation Failed: No JSON found in response", rawResponse);
        return null;

    } catch (e) {
        console.error("AI Generation Error for word:", word, e);
        return null;
    }
}

/**
 * Generates ONLY example card data for a word.
 * Useful when the word exists in DB but lacks examples.
 */
export async function generateExamplesAI(word: string): Promise<any | null> {
    const systemPrompt = `
You are an expert English teacher. Generate 3 natural example sentences for the word "${word}" with Chinese translations.
Return ONLY a JSON object:
{
    "type": "example",
    "word": "${word}",
    "examples": [
        { "sentence": "Example 1", "translation": "译文 1" },
        { "sentence": "Example 2", "translation": "译文 2" },
        { "sentence": "Example 3", "translation": "译文 3" }
    ]
}
`;
    try {
        const rawResponse = await callSimpleChat(systemPrompt, `Generate examples for: ${word}`);
        const jsonMatch = rawResponse.match(/```json\s*(\{[\s\S]*?\})\s*```/) || rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        }
        return null;
    } catch (e) {
        return null;
    }
}
