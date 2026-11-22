import React, { useEffect, useState } from 'react';
import {
  Description, Dialog, DialogPanel,
  DialogTitle, DialogBackdrop,
  Button, Textarea, Field, Label
} from '@headlessui/react';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { IngredientDocumentType, Ingredient } from '../../types/index';

interface NewIngredientDialogProps {
  ingredientList: IngredientDocumentType[],
  updateIngredientList: (newIngredients: IngredientDocumentType[]) => void,
  ingredients: Ingredient[],
  updateIngredients: (ingredients: Ingredient[]) => void
}

function NewIngredientDialog({ ingredientList, updateIngredientList, ingredients, updateIngredients }: NewIngredientDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [ingredientInput, setIngredientInput] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setIngredientInput('');
    setMessage('');
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIngredientInput(e.target.value);
    setMessage('');
  };

  const parseIngredients = (input: string): string[] => {
    return input
      .split(/[,;]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  };

  const handleSubmit = () => {
    const parsed = parseIngredients(ingredientInput);
    if (parsed.length === 0) return;

    const existingNames = new Set([
      ...ingredientList.map(i => i.name.toLowerCase()),
      ...ingredients.map(i => i.name.toLowerCase())
    ]);

    const added: string[] = [];
    const skipped: string[] = [];
    const newIngredients: IngredientDocumentType[] = [];
    const newSelectedIngredients: Ingredient[] = [];

    for (const name of parsed) {
      const lower = name.toLowerCase();
      if (existingNames.has(lower)) {
        skipped.push(name);
        continue;
      }
      if (ingredients.length + newSelectedIngredients.length >= 10) {
        skipped.push(`${name} (limit reached)`);
        continue;
      }
      existingNames.add(lower);
      added.push(name);

      const doc: IngredientDocumentType = {
        _id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
        name,
        createdBy: null,
        createdAt: new Date().toISOString(),
      };
      newIngredients.push(doc);

      newSelectedIngredients.push({ name, id: crypto.randomUUID?.() || Math.random().toString(36).slice(2) });
    }

    if (added.length > 0) {
      newIngredients.forEach(doc => updateIngredientList(doc));
      updateIngredients([...ingredients, ...newSelectedIngredients]);
    }

    if (added.length > 0 && skipped.length === 0) {
      setMessage(`Added ${added.length} ingredient${added.length > 1 ? 's' : ''}: ${added.join(', ')}`);
      setTimeout(() => setIsOpen(false), 1500);
    } else if (added.length > 0 && skipped.length > 0) {
      setMessage(`Added: ${added.join(', ')}\nSkipped: ${skipped.join(', ')}`);
    } else {
      setMessage(`Skipped: ${skipped.join(', ')}`);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-full hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 shadow-md transition duration-300"
      >
        <PlusCircleIcon className="block mr-2 h-6 w-6" />
        Add New Ingredient
      </Button>
      <Dialog open={isOpen} onClose={() => { }} className="relative z-modal">
        <DialogBackdrop className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 border bg-white p-12 rounded-lg shadow-lg">
            <DialogTitle className="text-xl font-bold">Add New Ingredient(s)</DialogTitle>
            <Description className="text-sm text-gray-500">
              Enter one or more ingredients separated by commas (,) or semicolons (;).
              They will be added to your available list and selected for the recipe.
            </Description>
            <Field className="mb-4">
              <Label htmlFor="ingredientInput" className="block text-sm font-medium text-gray-700">
                Ingredient Names
              </Label>
              <Textarea
                id="ingredientInput"
                name="ingredientInput"
                rows={4}
                className={clsx(
                  'mt-3 block w-full rounded-lg border-none bg-black/5 py-1.5 px-3 text-sm/6 text-black',
                  'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
                )}
                value={ingredientInput}
                onChange={handleInputChange}
                placeholder="e.g., flour, sugar; eggs, butter"
              />
            </Field>
            <div className="text-red-400 font-bold mb-2 text-sm" style={{ whiteSpace: 'pre-line' }}>
              <span>{message}</span>
            </div>
            <div className="flex gap-4 flex-end">
              <Button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button
                className="bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700"
                onClick={handleSubmit}
                disabled={!ingredientInput.trim()}
              >
                Submit
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}

export default NewIngredientDialog;