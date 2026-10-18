// src/lib/importers.ts
import type {
  ExportEnvelope, InventoryData, Recipe, BundleData,
} from '@/types/smartchef';

export type MergeStrategy = 'replace' | 'merge';

export interface ImportResult {
  ok: boolean;
  error?: string;
  kind?: ExportEnvelope<unknown>['kind'];
  inventory?: InventoryData['items'];
  recipes?: Recipe[];
  warnings: string[];
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB guard

/* ---------- shape validation ---------- */

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function validIngredient(v: unknown): boolean {
  return isObj(v) && typeof v.name === 'string' && v.name.trim().length > 0;
}

function validRecipe(v: unknown): v is Recipe {
  if (!isObj(v)) return false;
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    Array.isArray(v.ingredients) &&
    Array.isArray(v.steps) &&
    v.steps.every(s => typeof s === 'string')
  );
}

/** Coerce loosely-shaped records into a Recipe, dropping junk fields. */
function normalizeRecipe(raw: Record<string, any>, warnings: string[]): Recipe | null {
  if (!validRecipe(raw)) return null;

  const now = new Date().toISOString();

  const recipe: Recipe = {
    id: raw.id,
    title: String(raw.title).slice(0, 200),
    dish_type: typeof raw.dish_type === 'string' ? raw.dish_type : 'dish',
    primary_ingredient:
      typeof raw.primary_ingredient === 'string' ? raw.primary_ingredient : 'unknown',
    cuisine: typeof raw.cuisine === 'string' ? raw.cuisine : null,
    servings: Number.isFinite(raw.servings) ? Number(raw.servings) : 2,
    prep_minutes: Number.isFinite(raw.prep_minutes) ? Number(raw.prep_minutes) : 0,
    cook_minutes: Number.isFinite(raw.cook_minutes) ? Number(raw.cook_minutes) : 0,
    difficulty: ['easy', 'medium', 'hard'].includes(raw.difficulty)
      ? raw.difficulty : 'medium',
    dietary_tags: Array.isArray(raw.dietary_tags)
      ? raw.dietary_tags.filter((t: unknown) => typeof t === 'string') : [],
    ingredients: raw.ingredients
      .filter(isObj)
      .map((i: any) => ({
        quantity: Number.isFinite(i.quantity) ? Number(i.quantity) : 0,
        unit: typeof i.unit === 'string' ? i.unit : '',
        item: String(i.item ?? '').slice(0, 120),
      }))
      .filter((i: any) => i.item.length > 0),
    steps: raw.steps.map((s: unknown) => String(s).slice(0, 2000)),
    notes: typeof raw.notes === 'string' ? raw.notes.slice(0, 2000) : null,
    image: isObj(raw.image) && typeof raw.image.thumbUrl === 'string'
      ? {
          thumbUrl: raw.image.thumbUrl,
          pageUrl: String(raw.image.pageUrl ?? ''),
          artist: String(raw.image.artist ?? ''),
          license: String(raw.image.license ?? ''),
          licenseUrl: raw.image.licenseUrl ? String(raw.image.licenseUrl) : undefined,
        }
      : null,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
  };

  if (recipe.ingredients.length === 0) {
    warnings.push(`"${recipe.title}" imported with no ingredients`);
  }
  return recipe;
}

/* ---------- parse ---------- */

export async function parseImportFile(file: File): Promise<ImportResult> {
  const warnings: string[] = [];

  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'File too large (max 5 MB)', warnings };
  }

  let text: string;
  try {
    text = await file.text();
  } catch {
    return { ok: false, error: 'Could not read file', warnings };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Not valid JSON', warnings };
  }

  if (!isObj(parsed)) {
    return { ok: false, error: 'Unexpected file structure', warnings };
  }

  // Reject anything that isn't ours, but tolerate a bare {inventory, recipes}.
  const env = parsed as Partial<ExportEnvelope<any>>;
  if (env.format !== 'smartchef') {
    if ('recipes' in parsed || 'inventory' in parsed) {
      warnings.push('No envelope found — treating as legacy bundle');
    } else {
      return { ok: false, error: 'Not a SmartChef export file', warnings };
    }
  }

  if (typeof env.schemaVersion === 'number' && env.schemaVersion > 1) {
    warnings.push(
      `File was written by a newer version (schema v${env.schemaVersion}). Some fields may be ignored.`
    );
  }

  const data: any = env.data ?? parsed;
  const result: ImportResult = { ok: true, kind: env.kind, warnings };

  if (Array.isArray(data.items)) {
    result.inventory = data.items.filter(validIngredient).map((i: any) => ({
      name: String(i.name).slice(0, 120),
      quantity: i.quantity ? String(i.quantity).slice(0, 60) : undefined,
      expiresOn: typeof i.expiresOn === 'string' ? i.expiresOn : undefined,
      category: typeof i.category === 'string' ? i.category : undefined,
    }));
  }

  if (Array.isArray(data.recipes)) {
    result.recipes = data.recipes
      .map((r: any) => normalizeRecipe(r, warnings))
      .filter(Boolean) as Recipe[];
  }

  if (!result.inventory && !result.recipes) {
    return { ok: false, error: 'No inventory or recipes found in file', warnings };
  }

  return result;
}

/* ---------- merge ---------- */

export function mergeInventory(
  current: InventoryData['items'],
  incoming: InventoryData['items'],
  strategy: MergeStrategy
): InventoryData['items'] {
  if (strategy === 'replace') return incoming;
  const map = new Map(current.map(i => [i.name.toLowerCase(), i]));
  for (const i of incoming) map.set(i.name.toLowerCase(), i);
  return [...map.values()];
}

export function mergeRecipes(
  current: Recipe[],
  incoming: Recipe[],
  strategy: MergeStrategy
): Recipe[] {
  if (strategy === 'replace') return incoming;
  const map = new Map(current.map(r => [r.id, r]));
  for (const r of incoming) {
    const existing = map.get(r.id);
    // Keep whichever was touched more recently.
    if (!existing || new Date(r.updatedAt) >= new Date(existing.updatedAt)) {
      map.set(r.id, r);
    }
  }
  return [...map.values()];
}
