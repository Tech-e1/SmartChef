export type Ingredient = {
    name: string
    quantity?: number | null
    id: string
}

// Type for dietary preferences in client
export type DietaryPreference = 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Keto' | 'Dairy-Free' | 'Halal' | 'Kosher';

interface RecipeIngredient {
    name: string;
    quantity: string;
}

interface AdditionalInformation {
    tips: string;
    variations: string;
    servingSuggestions: string;
    nutritionalInformation: string;
}

export interface Recipe {
    name: string;
    ingredients: RecipeIngredient[];
    instructions: string[];
    dietaryPreference: string[];
    additionalInformation: AdditionalInformation;
    ollamaPromptId: string;
    audio?: string;
}

// this is for raw recipe documents to be stored in the db
interface tagType {
    _id: string;
    tag: string;
}

export interface IngredientDocumentType {
    _id: string;
    name: string;
    createdBy: string | null;
    createdAt: string;
}

export interface UploadReturnType {
    location: string;
    uploaded: boolean;
}

export interface PaginationQueryType {
    page?: string;
    limit?: string;
    sortOption?: string;
    query?: string;
}