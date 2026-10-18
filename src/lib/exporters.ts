// src/lib/store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { IngredientItem, Recipe } from '@/types/smartchef';

interface SmartChefState {
  inventory: IngredientItem[];
  recipes: Recipe[];
  addIngredient: (i: IngredientItem) => void;
  removeIngredient: (name: string) => void;
  setInventory: (items: IngredientItem[]) => void;
  upsertRecipe: (r: Recipe) => void;
  removeRecipe: (id: string) => void;
  setRecipes: (r: Recipe[]) => void;
  clearAll: () => void;
}

export const useSmartChef = create<SmartChefState>()(
  persist(
    (set) => ({
      inventory: [],
      recipes: [],

      addIngredient: (i) =>
        set((s) => ({
          inventory: [...s.inventory.filter(x => x.name !== i.name), i],
        })),

      removeIngredient: (name) =>
        set((s) => ({ inventory: s.inventory.filter(x => x.name !== name) })),

      setInventory: (items) => set({ inventory: items }),

      upsertRecipe: (r) =>
        set((s) => ({
          recipes: [...s.recipes.filter(x => x.id !== r.id), r],
        })),

      removeRecipe: (id) =>
        set((s) => ({ recipes: s.recipes.filter(r => r.id !== id) })),

      setRecipes: (recipes) => set({ recipes }),

      clearAll: () => set({ inventory: [], recipes: [] }),
    }),
    {
      name: 'smartchef:v1',
      // Native localStorage. Do NOT import the `localStorage` npm package —
      // it's a Node-side polyfill and can shadow the browser global.
      storage: createJSONStorage(() => window.localStorage),
      version: 1,
    }
  )
);
