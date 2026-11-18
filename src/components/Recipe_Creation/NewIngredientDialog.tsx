import React, { useEffect, useState } from 'react';
import {
  Description, Dialog, DialogPanel,
  DialogTitle, DialogBackdrop,
  Button, Input, Field, Label
} from '@headlessui/react';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { IngredientDocumentType } from '../../types/index';

interface NewIngredientDialogProps {
  ingredientList: IngredientDocumentType[],
  updateIngredientList: (newIngredient: IngredientDocumentType) => void
}

function NewIngredientDialog({ ingredientList, updateIngredientList }: NewIngredientDialogProps) {
  const [isOpen, setIsOpen] = useState(false); // State to manage dialog visibility
  const [ingredientName, setIngredientName] = useState(''); // State to manage the ingredient name input
  const [message, setMessage] = useState(''); // State to manage feedback messages

  useEffect(() => {
    setIngredientName('');
    setMessage('');
  }, [isOpen]); // Reset ingredient name when dialog is opened/closed

  // Handle input change for the ingredient name
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIngredientName(e.target.value);
    setMessage('');
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!ingredientName.trim()) return;
    if (ingredientName.trim().length > 20) {
      setMessage('This ingredient name is too long!');
      return;
    }

    const ingredient = ingredientName.trim();
    const isDuplicate = ingredientList.some(i =>
      i.name.toLowerCase() === ingredient.toLowerCase()
    );

    if (isDuplicate) {
      setMessage('This ingredient is already available');
      return;
    }

    const newIngredient: IngredientDocumentType = {
      _id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
      name: ingredient,
      createdBy: null,
      createdAt: new Date().toISOString(),
    };

    updateIngredientList(newIngredient);
    setIngredientName('');
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-full hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 shadow-md transition duration-300">
        <PlusCircleIcon className="block mr-2 h-6 w-6" />
        Add New Ingredient
      </Button>
      <Dialog open={isOpen} onClose={() => { }} className="relative z-modal">
        <DialogBackdrop className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 border bg-white p-12 rounded-lg shadow-lg">
            <DialogTitle className="text-xl font-bold">Add New Ingredient</DialogTitle>
            <Description className="text-sm text-gray-500">Enter a name for your ingredient and it will be added to your list.</Description>
            <Field className="mb-4">
              <Label htmlFor="ingredientName" className="block text-sm font-medium text-gray-700">Ingredient Name</Label>
              <Input
                type="text"
                id="ingredientName"
                name="ingredientName"
                className={clsx(
                  'mt-3 block w-full rounded-lg border-none bg-black/5 py-1.5 px-3 text-sm/6 text-black',
                  'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
                )}
                value={ingredientName}
                onChange={handleInputChange}
              />
            </Field>
            <div className="text-red-400 font-bold mb-2" style={{ whiteSpace: 'pre-line' }}>
              <span>{message}</span>
            </div>
            <div className="flex gap-4 flex-end">
                <Button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button
                  className="bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700"
                  onClick={handleSubmit}
                  disabled={!ingredientName.trim()}
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
