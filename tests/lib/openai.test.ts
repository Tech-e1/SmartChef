import { generateRecipe, generateImages, validateIngredient, getTTS, generateRecipeTags, generateChatResponse, OPENAI_TEXT_MODEL } from "../../src/lib/openai";
import aigenerated from "../../src/models/aigenerated";
import recipe from "../../src/models/recipe";
import OpenAI from 'openai';
import { stubRecipeBatch } from "../stub";

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'Test response' } }] }),
        },
      },
      images: {
        generate: jest.fn().mockResolvedValue({ data: [{ url: 'https://example.com/image.jpg' }] }),
      },
      audio: {
        speech: {
          create: jest.fn().mockResolvedValue({ data: 'https://example.com/audio.mp3' }),
        },
      },
    })),
  };
});

test('openai functions', async () => {
  const result = await generateRecipe('test prompt');
  expect(result).toBeDefined();
});