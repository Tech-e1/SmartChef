// src/lib/prompts.ts

/**
 * System prompt for recipe generation
 * Forces the model to output pure JSON using ONLY user-provided ingredients
 */
export const RECIPE_GENERATION_SYSTEM_PROMPT = `\nYou generate unique recipes using ONLY the ingredients the user provides. You do not invent, substitute, or add any ingredient that is not on the user's list.\n\nCRITICAL OUTPUT FORMAT: Respond with valid JSON ONLY. No markdown, no code blocks, no explanations.\n\nJSON Schema:\n{\n  \"title\": string,\n  \"dish_type\": string,\n  \"primary_ingredient\": string,\n  \"cuisine\": string | null,\n  \"servings\": number,\n  \"prep_minutes\": number,\n  \"cook_minutes\": number,\n  \"difficulty\": \"easy\" | \"medium\" | \"hard\",\n  \"dietary_tags\": string[],\n  \"ingredients\": [\n    {\n      \"quantity\": number,\n      \"unit\": string,\n      \"item\": string\n    }\n  ],\n  \"steps\": string[],\n  \"notes\": string | null\n}\n\nINGREDIENT RULES (MUST FOLLOW):\n- The recipe's "ingredients" array MUST contain items from the user's provided ingredient list ONLY.\n- Do NOT add any ingredient that is not on the user's list.\n- Do NOT substitute ingredients (e.g., if user has "onion" but not "garlic", do not use "garlic").\n- Use at least 3-5 of the user's provided ingredients in the recipe.\n- Every "item" in the ingredients array must match (case-insensitive) one of the user's provided ingredients.\n- If you cannot make a recipe with the provided ingredients, still output a valid JSON using the closest matching ingredients from the list.\n\nDISH_TYPE RULES:\n- dish_type is used to search Wikimedia Commons for a photograph\n- Must be a term that plausibly has its own encyclopedia article\n- Lowercase, singular form (e.g., \"stew\" not \"stews\", \"bread\" not \"breads\")\n- NO invented adjectives (e.g., \"Smoky Chipotle Lentil Bake\" → dish_type: \"baked lentils\")\n- If no exact match exists, use broader category: \"soup\", \"pasta\", \"curry\", \"salad\", \"flatbread\", etc.\n- Fall back to primary_ingredient if truly unknown\n\nOTHER CONSTRAINTS:\n- Respect dietary restrictions exactly (vegan = no animal products whatsoever)\n- Quantities must be realistic and consistent\n- Steps must be numbered, actionable, and sequential\n- Total time = prep_minutes + cook_minutes (should be ≤ 60 for quick meals)\n- Ingredients count: 6-15 items typically\n`;

/**
 * User prompt template for recipe generation
 * Fill in the variables before sending to LLM
 */
export function createRecipeUserPrompt(
  ingredients: string[],
  dietaryPreferences: string[] = []
): string {
  const ingredientList = ingredients.map(i => `- ${i}`).join('\n');
  const dietaryList = dietaryPreferences.length > 0
    ? `Dietary preferences: ${dietaryPreferences.join(', ')}.`
    : 'No specific dietary restrictions.';

  return `Generate a recipe using ONLY the following available ingredients:

${ingredientList}

${dietaryList}

MANDATORY: Every ingredient in your recipe's ingredients array MUST come from the list above. Do not add, substitute, or invent any ingredient that is not listed above. Use at least 3-5 ingredients from the provided list.

Output JSON only, following the schema exactly.`;
}

/**
 * Chat assistant system prompt
 * For follow-up questions about a recipe
 */
export const CHAT_ASSISTANT_SYSTEM_PROMPT = `\nYou are a cooking assistant helping users with a specific recipe.\n\nRespond naturally and helpfully, but keep answers concise.\n\nPossible user questions:\n- Substitutions for ingredients\n- Dietary modifications (make it vegan, gluten-free, etc.)\n- Timing adjustments\n- Cooking technique questions\n- Equipment alternatives\n- Storage and reheating advice\n\nNEVER invent unsafe food advice (raw meat temperatures, allergen cross-contamination, etc.).\nWhen uncertain about safety, say you're not certain.\n\nFormat: Natural conversation, not JSON.\n`;

/**
 * Create chat user message with recipe context
 */
export function createChatUserMessage(
  recipe: { title: string; ingredients: any[]; steps: string[] },
  userQuestion: string
): string {
  return `I'm following this recipe called \"${recipe.title}\".\n\nIngredients:\n${recipe.ingredients.map(i => `- ${i.quantity} ${i.unit} ${i.item}`).join('\n')}\n\nSteps:\n${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nMy question: ${userQuestion}`;
}

/**
 * Validate ingredient - simple helper prompt
 */
export const VALIDATE_INGREDIENT_SYSTEM_PROMPT = `\nValidate whether an ingredient name is reasonable and recognizable.\n\nRespond with valid JSON ONLY:\n{\n  \"valid\": boolean,\n  \"normalized\": string,     // Standardized name if valid\n  \"alternative_names\": string[]  // Common aliases\n}\n\nReturn valid: false if the ingredient is nonsense, a brand name, or too vague.\n`;

/**
 * Ollama API configuration
 */
export const OLLAMA_CONFIG = {
  endpoint: process.env.OLLAMA_HOST || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'llama3.1:8b-instruct',
  temperature: 0.7,
  numPredictions: 2048,       // Max tokens
};

/**
 * Groq API configuration (if using hosted instead of local)
 */
export const GROQ_CONFIG = {
  apiKey: process.env.GROQ_API_KEY,
  baseUrl: 'https://api.groq.com/openai/v1',
  model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
  temperature: 0.7,
};

/**
 * NVIDIA NIM API configuration
 * Requires NVIDIA_API_KEY environment variable
 */
export const NVIDIA_CONFIG = {
  apiKey: process.env.NVIDIA_API_KEY,
  baseUrl: 'https://integrate.api.nvidia.com/v1',
  model: process.env.NVIDIA_MODEL || 'minimaxai/minimax-m3.1-flash',
  temperature: 0.7,
};

/**
 * Image search anchors for Wikimedia Commons
 * Order matters: try specific → broad → ingredient
 */
export function getImageSearchAnchors(dish: {
  dish_type: string;
  primary_ingredient: string;
  cuisine?: string | null;
}): string[] {
  const anchors: string[] = [];

  // 1. Try dish_type first (best chance for named dish)
  anchors.push(dish.dish_type);

  // 2. Combine dish + cuisine if available
  if (dish.cuisine) {
    anchors.push(`${dish.dish_type} ${dish.cuisine}`);
  }

  // 3. Fallback to primary ingredient
  anchors.push(dish.primary_ingredient);

  return anchors;
}
