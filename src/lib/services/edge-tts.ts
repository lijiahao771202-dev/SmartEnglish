import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

export const EDGE_TTS_VOICE = 'zh-CN-XiaoxiaoNeural'; // 默认使用 Xiaoxiao (适合中英混读)

const EDGE_URL = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4';

/**
 * 将文本转为 SSML
 */
function createSSML(text: string, voice: string) {
    return `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
        <voice name='${voice}'>
            <prosody rate='+0%' pitch='+0%'>
                ${text}
            </prosody>
        </voice>
    </speak>`;
}

/**
 * 格式化 WebSocket 消息
 */
function createMessage(header: Record<string, string>, data: string) {
    const headerStr = Object.entries(header).map(([k, v]) => `${k}:${v}`).join('\r\n');
    return `${headerStr}\r\n\r\n${data}`;
}

/**
 * 调用 Edge TTS 生成音频
 */
export async function generateEdgeTTS(text: string, voice: string = EDGE_TTS_VOICE): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        console.log(`[EdgeTTS] Connecting to: ${EDGE_URL}`);
        const ws = new WebSocket(EDGE_URL);
        const requestId = uuidv4();
        const audioChunks: Buffer[] = [];

        // 设置 10 秒超时
        const timeout = setTimeout(() => {
            console.error('[EdgeTTS] Timeout');
            ws.close();
            reject(new Error('Edge TTS request timeout'));
        }, 10000);

        ws.on('open', () => {
            console.log('[EdgeTTS] WebSocket Open');

            // 1. 发送配置
            const configData = JSON.stringify({
                context: {
                    synthesis: {
                        audio: {
                            metadataoptions: {
                                sentenceBoundaryEnabled: "false",
                                wordBoundaryEnabled: "false"
                            },
                            outputFormat: "audio-24khz-48kbitrate-mono-mp3"
                        }
                    }
                }
            });

            ws.send(createMessage({
                'Content-Type': 'application/json; charset=utf-8',
                'Path': 'speech.config',
                'X-Timestamp': new Date().toISOString()
            }, configData));

            // 2. 发送 SSML (文本)
            console.log(`[EdgeTTS] Sending SSML for text: ${text.substring(0, 20)}...`);
            const ssml = createSSML(text, voice);
            ws.send(createMessage({
                'Content-Type': 'application/ssml+xml',
                'X-RequestId': requestId,
                'Path': 'ssml',
                'X-Timestamp': new Date().toISOString()
            }, ssml));
        });

        ws.on('message', (data, isBinary) => {
            if (isBinary) {
                // 音频数据
                const buffer = data as Buffer;
                const headerLength = buffer.readUInt16BE(0);
                const header = buffer.subarray(2, 2 + headerLength).toString();

                if (header.includes('Path:audio')) {
                    const audioData = buffer.subarray(2 + headerLength);
                    audioChunks.push(audioData);
                }
            } else {
                // 文本消息
                const message = data.toString();
                // console.log('[EdgeTTS] Text Message:', message);
                if (message.includes('Path:turn.end')) {
                    console.log('[EdgeTTS] Received turn.end');
                    ws.close();
                }
            }
        });

        ws.on('close', (code, reason) => {
            clearTimeout(timeout);
            console.log(`[EdgeTTS] WebSocket Closed. Code: ${code}, Reason: ${reason}`);

            // 合并所有音频块
            if (audioChunks.length > 0) {
                console.log(`[EdgeTTS] Success. Received ${audioChunks.length} chunks.`);
                resolve(Buffer.concat(audioChunks));
            } else {
                console.error('[EdgeTTS] Failed. No audio data received.');
                reject(new Error(`No audio data received. WebSocket closed with code ${code}`));
            }
        });

        ws.on('error', (error) => {
            clearTimeout(timeout);
            console.error('[EdgeTTS] WebSocket Error:', error);
            reject(error);
        });
    });
}
