import { NextRequest, NextResponse } from 'next/server';
import { generateEdgeTTS, EDGE_TTS_VOICE } from '@/lib/services/edge-tts';

export async function POST(req: NextRequest) {
    try {
        const { text, voice } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const audioBuffer = await generateEdgeTTS(text, voice || EDGE_TTS_VOICE);

        // 返回音频流
        return new NextResponse(audioBuffer as unknown as BodyInit, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.length.toString()
            }
        });

    } catch (error) {
        console.error('[TTS API] Detailed Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
