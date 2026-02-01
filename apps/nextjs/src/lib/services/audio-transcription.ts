/**
 * Audio Transcription Service
 *
 * Shared helper for transcribing audio to text using Gemini.
 */

import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

interface TranscribeAudioParams {
  audioBase64: string;
  mimeType?: string;
}

/**
 * Transcribe audio to text using Gemini.
 * Returns the transcribed text or empty string if failed.
 */
export async function transcribeAudio(params: TranscribeAudioParams): Promise<string> {
  const { audioBase64, mimeType = 'audio/webm' } = params;

  const response = await genAI.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: 'Transcribe this audio exactly as spoken. Return only the transcription, no additional text.' },
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
        ],
      },
    ],
  });

  return response.text?.trim() ?? '';
}
