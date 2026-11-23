import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import {
  CHAT_ASSISTANT_SYSTEM_PROMPT,
  createChatUserMessage,
  OLLAMA_CONFIG,
} from '@/lib/prompts';

/**
 * POST /api/chat-assistant
 * Handles chat queries about a recipe using the local Ollama AI.
 * Runs entirely on the user's device — no external API keys or cloud services.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        const { recipeId, message, history, recipe } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Build the user prompt with recipe context
        const userPrompt = createChatUserMessage(
            recipe || { title: 'Unknown Recipe', ingredients: [], steps: [] },
            message
        );

        // Call local Ollama
        const endpoint = `${OLLAMA_CONFIG.endpoint}/api/chat`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: OLLAMA_CONFIG.model,
                    messages: [
                        { role: 'system', content: CHAT_ASSISTANT_SYSTEM_PROMPT },
                        { role: 'user', content: userPrompt },
                    ],
                    stream: false,
                    options: {
                        temperature: 0.7,
                        num_predict: 1024,
                    },
                }),
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[Ollama Chat] API error:', errorText);
                return res.status(500).json({
                    error: `Ollama chat failed: HTTP ${response.status}. Make sure Ollama is running locally.`,
                });
            }

            const data = await response.json();
            const reply = data.message?.content || '';

            return res.status(200).json({
                reply,
                totalTokens: 0, // Ollama doesn't return token count in this format
            });
        } finally {
            clearTimeout(timeoutId);
        }
    } catch (err: any) {
        console.error('Chat Assistant Error:', err);
        return res.status(500).json({
            error: err.message || 'Internal server error',
        });
    }
};

export default apiMiddleware(['POST'], handler);