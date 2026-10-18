// src/types/smartchef.ts

export interface IngredientItem {
  name: string;
  quantity?: string;
  expiresOn?: string;   // ISO date
  category?: string;    // "pantry" | "produce" | "fridge" | "freezer"
}

export interface RecipeIngredient {
  quantity: number;
  unit: string;
  item: string;
}

export interface RecipeImage {
  thumbUrl: string;
  pageUrl: string;
  artist: string;
  license: string;
  licenseUrl?: string;
}

export interface Recipe {
  id: string;
  title: string;
  dish_type: string;
  primary_ingredient: string;
  cuisine: string | null;
  servings: number;
  prep_minutes: number;
  cook_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  dietary_tags: string[];
  ingredients: RecipeIngredient[];
  steps: string[];
  notes: string | null;
  image?: RecipeImage | null;
  createdAt: string;
  updatedAt: string;
}

/** Envelope wrapping every export. Version it or you will regret it. */
export interface ExportEnvelope<T> {
  format: 'smartchef';
  schemaVersion: 1;
  kind: 'inventory' | 'recipes' | 'bundle';
  exportedAt: string;
  app: { name: string; version: string };
  data: T;
}

export interface InventoryData {
  items: IngredientItem[];
  notes?: string;
}

export interface BundleData {
  inventory: InventoryData;
  recipes: Recipe[];
}
