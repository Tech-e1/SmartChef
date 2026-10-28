import type { IngredientItem, Recipe, ExportEnvelope, InventoryData, BundleData } from '@/types/smartchef';

const APP_NAME = 'SmartChef';
const APP_VERSION = '0.1.0';

/* ---------- helpers ---------- */

function makeEnvelope<T>(kind: ExportEnvelope<T>['kind'], data: T): ExportEnvelope<T> {
  return {
    format: 'smartchef',
    schemaVersion: 1,
    kind,
    exportedAt: new Date().toISOString(),
    app: { name: APP_NAME, version: APP_VERSION },
    data,
  };
}

export function downloadFile(filename: string, content: string | Blob) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------- inventory ---------- */

export function inventoryToText(items: IngredientItem[]): string {
  if (!items.length) return '(no ingredients)';
  const lines = items.map(i => {
    const parts = [i.name];
    if (i.quantity) parts.push(`— ${i.quantity}`);
    if (i.expiresOn) parts.push(`expires ${i.expiresOn}`);
    if (i.category) parts.push(`[${i.category}]`);
    return parts.join(' ');
  });
  return `SmartChef Inventory\nExported: ${new Date().toISOString()}\n\n${lines.join('\n')}`;
}

export function exportInventoryJSON(items: IngredientItem[]) {
  const envelope = makeEnvelope<InventoryData>('inventory', { items });
  downloadFile(
    `smartchef-inventory-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(envelope, null, 2)
  );
}

/* ---------- recipes ---------- */

export function exportRecipesJSON(recipes: Recipe[]) {
  const envelope = makeEnvelope<Recipe[]>('recipes', recipes);
  downloadFile(
    `smartchef-recipes-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(envelope, null, 2)
  );
}

export function exportAllRecipesTXT(recipes: Recipe[]) {
  if (!recipes.length) {
    downloadFile('smartchef-recipes.txt', '(no recipes)');
    return;
  }
  const lines: string[] = [];
  for (const r of recipes) {
    lines.push(`# ${r.title}`);
    lines.push(`  Type: ${r.dish_type} | Cuisine: ${r.cuisine ?? '—'} | Servings: ${r.servings}`);
    lines.push(`  Prep: ${r.prep_minutes}m | Cook: ${r.cook_minutes}m | Difficulty: ${r.difficulty}`);
    if (r.dietary_tags.length) lines.push(`  Tags: ${r.dietary_tags.join(', ')}`);
    lines.push('');
    lines.push('  Ingredients:');
    for (const ing of r.ingredients) {
      lines.push(`    - ${ing.quantity} ${ing.unit} ${ing.item}`);
    }
    lines.push('');
    lines.push('  Steps:');
    r.steps.forEach((s, i) => lines.push(`    ${i + 1}. ${s}`));
    if (r.notes) lines.push(`\n  Notes: ${r.notes}`);
    lines.push('\n---\n');
  }
  downloadFile(`smartchef-recipes-${new Date().toISOString().slice(0, 10)}.txt`, lines.join('\n'));
}

/* ---------- bundle ---------- */

export function exportBundleJSON(inventory: InventoryData, recipes: Recipe[]) {
  const bundle: BundleData = { inventory, recipes };
  const envelope = makeEnvelope<BundleData>('bundle', bundle);
  downloadFile(
    `smartchef-backup-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(envelope, null, 2)
  );
}