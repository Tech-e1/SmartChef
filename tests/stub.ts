import mongoose from 'mongoose';

// Mock mongoose models
const mockModel = (name: string) => {
  return {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  };
};

const recipe = mockModel('Recipe');
const aigenerated = mockModel('AIGenerated');
const ingredient = mockModel('Ingredient');
const notification = mockModel('Notification');
const user = mockModel('User');

// Stub data for tests
export const stubRecipeBatch = [
  {
    id: '1',
    title: 'Test Recipe 1',
    dish_type: 'main',
    primary_ingredient: 'chicken',
    cuisine: 'Italian',
    servings: 4,
    prep_minutes: 15,
    cook_minutes: 30,
    difficulty: 'easy' as const,
    dietary_tags: ['healthy'],
    ingredients: [{ quantity: 2, unit: 'pcs', item: 'chicken breast' }],
    steps: ['Step 1', 'Step 2'],
    notes: 'Test notes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Test Recipe 2',
    dish_type: 'dessert',
    primary_ingredient: 'chocolate',
    cuisine: 'French',
    servings: 6,
    prep_minutes: 20,
    cook_minutes: 25,
    difficulty: 'medium' as const,
    dietary_tags: ['vegetarian'],
    ingredients: [{ quantity: 200, unit: 'g', item: 'dark chocolate' }],
    steps: ['Step 1', 'Step 2'],
    notes: 'Test notes 2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const stubNotifications = [
  {
    _id: 'notif1',
    read: false,
    message: 'Test notification 1',
    recipeId: '1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'notif2',
    read: true,
    message: 'Test notification 2',
    recipeId: '2',
    createdAt: new Date().toISOString(),
  },
];

export const stub_recipe_1 = {
  id: '1',
  title: 'Test Recipe 1',
  dish_type: 'main',
  primary_ingredient: 'chicken',
  cuisine: 'Italian',
  servings: 4,
  prep_minutes: 15,
  cook_minutes: 30,
  difficulty: 'easy' as const,
  dietary_tags: ['healthy'],
  ingredients: [{ quantity: 2, unit: 'pcs', item: 'chicken breast' }],
  steps: ['Step 1', 'Step 2'],
  notes: 'Test notes',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const getServerSessionStub = jest.fn().mockResolvedValue({
  user: {
    id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/image.jpg',
  },
});

export const ingredientListStub = [
  {
    _id: 'ing1',
    name: 'chicken breast',
    createdBy: 'user1',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'ing2',
    name: 'dark chocolate',
    createdBy: 'user1',
    createdAt: new Date().toISOString(),
  },
];

export { recipe, aigenerated, ingredient, notification, user };