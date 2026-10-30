import { generateRecipe, generateImages, validateIngredient, getTTS, generateRecipeTags, generateChatResponse, OPENAI_TEXT_MODEL } from "../../src/lib/openai";
import aigenerated from "../../src/models/aigenerated";
import recipe from "../../src/models/recipe";
import OpenAI from 'openai';
import { stubRecipeBatch } from "../stub";

describe('OpenAI', () => {
  test('generates recipe', async () => {
    const result = await generateRecipe('test');
    expect(result).toBeDefined();
  });
});