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

export { recipe, aigenerated, ingredient, notification, user };