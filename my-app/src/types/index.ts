export interface User {
  UserID: number;
  Username: string;
  Email: string;
  PasswordHash: string;
  FirstName: string;
  LastName: string;
  Role: string;
  CreatedAt: Date;
  UpdatedAt?: Date;
}

export interface Recipe {
  RecipeID: number;
  RecipeName: string;
  RecipeDescription: string;
  PrepTime: number;
  CookTime: number;
  TotalTime: number;
  Servings: number;
  Instructions: string;
  Photo_URL?: string;
  CreatedBy: number;
  CreatedAt: Date;
  UpdatedAt?: Date;
}

export interface Ingredient {
  IngredientID: number;
  IngredientName: string;
  Unit: string;
}

export interface RecipeIngredient {
  RecipeID: number;
  IngredientID: number;
  Quantity: number;
  Unit: string;
}

export interface Category {
  CategoryID: number;
  CategoryName: string;
  CategoryDescription?: string;
}

export interface RecipeRating {
  RatingID: number;
  RecipeID: number;
  UserID: number;
  Rating: number;
  Notes?: string;
  CreatedAt: Date;
}

export interface RecipeWithDetails extends Recipe {
  ingredients: IngredientWithDetails[];
  categories?: string[];
}

export interface IngredientWithDetails {
  IngredientID: number;
  IngredientName: string;
  Quantity: number;
  Unit: string;
}
