// src/lib/prompts.ts

/**
 * System prompt for recipe generation
 * Forces Llama 3.1 8B to output pure JSON with specific fields
 */
export const RECIPE_GENERATION_SYSTEM_PROMPT = `
You generate unique recipes based on user-provided ingredients and dietary preferences.

CRITICAL OUTPUT FORMAT: Respond with valid JSON ONLY. No markdown, no code blocks, no explanations.

JSON Schema:
{
  "title": string,              // Creative name you invent
  "dish_type": string,          // Generic encyclopedia-style name (lowercase, singular, no invented adjectives)
                                // Example: "lentil soup", "banana bread", "stir fry"
                                // Used for finding a photograph - must match known dishes
  "primary_ingredient": string, // Single dominant ingredient, lowercase singular
  "cuisine": string | null,     // Region/tradition or null
  "servings": number,           // 2-8 typically
  "prep_minutes": number,       // Preparation time
  "cook_minutes": number,       // Cooking time
  "difficulty": "easy" | "medium" | "hard",
  "dietary_tags": string[],     // e.g. ["vegan", "gluten-free", "keto"]
  "ingredients": [
    {
      "quantity": number,
      "unit": string,           // "cup", "tbsp", "tsp", "oz", "lb", "g", "kg", "piece", "bunch"
      "item": string            // Ingredient name
    }
  ],
  "steps": string[],            // Numbered instructions (array of 4-8 steps)
  "notes": string | null        // Tips, substitutions, or storage info
}

DISH_TYPE RULES:
- dish_type is used to search Wikimedia Commons for a photograph
- Must be a term that plausibly has its own encyclopedia article
- Lowercase, singular form (e.g., "stew" not "stews", "bread" not "breads")
- NO adjectives you invented (e.g., "Smoky Chipotle Lentil Bake" → dish_type: "baked lentils")
- If no exact match exists, use broader category: "soup", "pasta", "curry", "salad", "flatbread", etc.
- Fall back to primary_ingredient if truly unknown

CONSTRAINTS:
- Respect dietary restrictions exactly (vegan = no animal products whatsoever)
- Quantities must be realistic and consistent
- Steps must be numbered, actionable, and sequential
- Total time = prep_minutes + cook_minutes (should be ≤ 60 for quick meals)
- Ingredients count: 6-15 items typically
- EVERY ingredient in the recipe MUST come from the user's provided list. Do not invent or add any ingredient not on the list.
`;

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

You MUST base the recipe on these provided ingredients. Do not substitute, add, or invent ingredients that were not provided. Use a reasonable subset of the provided ingredients.

Output JSON only, following the schema exactly.`;
}

/**
 * Chat assistant system prompt
 * For follow-up questions about a recipe
 */
export const CHAT_ASSISTANT_SYSTEM_PROMPT = `
You are a cooking assistant helping users with a specific recipe.

Respond naturally and helpfully, but keep answers concise.

Possible user questions:
- Substitutions for ingredients
- Dietary modifications (make it vegan, gluten-free, etc.)
- Timing adjustments
- Cooking technique questions
- Equipment alternatives
- Storage and reheating advice

NEVER invent unsafe food advice (raw meat temperatures, allergen cross-contamination, etc.).
When uncertain about safety, say you're not certain.

Format: Natural conversation, not JSON.
`;

/**
 * Create chat user message with recipe context
 */
export function createChatUserMessage(
  recipe: { title: string; ingredients: any[]; steps: string[] },
  userQuestion: string
): string {
  return `I'm following this recipe called "${recipe.title}".

Ingredients:
${recipe.ingredients.map(i => `- ${i.quantity} ${i.unit} ${i.item}`).join('\n')}

Steps:
${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

My question: ${userQuestion}`;
}

/**
 * Validate ingredient - simple helper prompt
 */
export const VALIDATE_INGREDIENT_SYSTEM_PROMPT = `
Validate whether an ingredient name is reasonable and recognizable.

Respond with valid JSON ONLY:
{
  "valid": boolean,
  "normalized": string,     // Standardized name if valid
  "alternative_names": string[]  // Common aliases
}

Return valid: false if the ingredient is nonsense, a brand name, or too vague.
`;

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
  model: 'llama-3.1-8b-instruct',
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
