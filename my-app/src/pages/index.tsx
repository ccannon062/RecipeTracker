import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch("/api/recipes");
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const result = await response.json();
        setRecipes(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);
  return error ? (
    <div className="flex justify-center items-center min-h-screen">
      <p>{error}</p>
    </div>
  ) : loading ? (
    <div className="flex justify-center items-center min-h-screen">
      <svg
        className="size-10 animate-spin text-black"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  ) : recipes.length > 0 ? (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">All Recipes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <Link key={recipe.RecipeID} href={`/recipes/${recipe.RecipeID}`}>
            <div
              key={recipe.RecipeID}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            >
              <img
                src={
                  recipe.Photo_URL ||
                  "https://via.placeholder.com/400x300?text=No+Image"
                }
                alt={recipe.RecipeName}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{recipe.RecipeName}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {recipe.RecipeDescription}
                </p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>⏱️ {recipe.TotalTime} min</span>
                  <span>{recipe.Servings} servings</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center min-h-screen">
      <p>No Recipes Available...</p>
    </div>
  );
}
