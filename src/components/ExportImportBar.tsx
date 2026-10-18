// src/components/ExportImportBar.tsx
import { useRef, useState } from 'react';
import { useSmartChef } from '@/lib/store';
import {
  exportInventoryJSON, exportRecipesJSON, exportBundleJSON,
  exportAllRecipesTXT, inventoryToText, downloadFile,
} from '@/lib/exporters';
import {
  parseImportFile, mergeInventory, mergeRecipes, type MergeStrategy,
} from '@/lib/importers';

export function ExportImportBar() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<MergeStrategy>('merge');

  const {
    inventory, recipes, setInventory, setRecipes,
  } = useSmartChef();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await parseImportFile(file);
    if (!res.ok) {
      setStatus(`Import failed: ${res.error}`);
      e.target.value = '';
      return;
    }

    if (res.inventory) setInventory(mergeInventory(inventory, res.inventory, strategy));
    if (res.recipes) setRecipes(mergeRecipes(recipes, res.recipes, strategy));

    const bits = [
      res.inventory ? `${res.inventory.length} ingredients` : null,
      res.recipes ? `${res.recipes.length} recipes` : null,
    ].filter(Boolean).join(', ');

    setStatus(
      `Imported ${bits}${res.warnings.length ? ` — ${res.warnings.length} warning(s)` : ''}`
    );
    e.target.value = '';
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-2 text-sm">
      {/* Export */}
      <button onClick={() => exportInventoryJSON(inventory)}
        disabled={!inventory.length}
        className="rounded border px-3 py-1.5 disabled:opacity-40">
        Export inventory (JSON)
      </button>

      <button onClick={() => downloadFile(
          `smartchef-inventory-${new Date().toISOString().slice(0,10)}.txt`,
          inventoryToText(inventory))}
        disabled={!inventory.length}
        className="rounded border px-3 py-1.5 disabled:opacity-40">
        Export inventory (TXT)
      </button>

      <button onClick={() => exportAllRecipesTXT(recipes)}
        disabled={!recipes.length}
        className="rounded border px-3 py-1.5 disabled:opacity-40">
        Export all recipes (TXT)
      </button>

      <button onClick={() => exportBundleJSON({ items: inventory }, recipes)}
        className="rounded border px-3 py-1.5">
        Backup everything
      </button>

      {/* Import */}
      <span className="mx-2 text-gray-400">|</span>

      <select value={strategy}
        onChange={e => setStrategy(e.target.value as MergeStrategy)}
        className="rounded border px-2 py-1.5">
        <option value="merge">Merge with existing</option>
        <option value="replace">Replace everything</option>
      </select>

      <button onClick={() => fileRef.current?.click()}
        className="rounded border px-3 py-1.5">
        Import file…
      </button>

      <input ref={fileRef} type="file" accept=".json,application/json"
        onChange={handleFile} className="hidden" />

      {status && <span className="text-xs text-gray-600">{status}</span>}
    </div>
  );
}
