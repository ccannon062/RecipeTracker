import { useState, useEffect } from "react";
import Link from "next/link";
import { IoSearch } from "react-icons/io5";

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [maxPrepTime, setMaxPrepTime] = useState("");
  const [maxServings, setMaxServings] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!initialLoad) {
        setLoading(true);
      }
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (maxPrepTime) params.append("maxPrepTime", maxPrepTime);
        if (maxServings) params.append("maxServings", maxServings);
        if (sortBy) params.append("sortBy", sortBy);

        const url = `/api/recipes${
          params.toString() ? `?${params.toString()}` : ""
        }`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const result = await response.json();
        setRecipes(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchRecipes();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, maxPrepTime, maxServings, sortBy, initialLoad]);

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>{error}</p>
      </div>
    );
  }

  if (initialLoad) {
    return (
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
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">All Recipes</h1>

      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-4">
            <div className="relative">
              <IoSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search recipes by name or ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#344e41] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Prep Time (min)
            </label>
            <input
              type="number"
              placeholder="Any"
              value={maxPrepTime}
              onChange={(e) => setMaxPrepTime(e.target.value)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#344e41] focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Servings
            </label>
            <input
              type="number"
              placeholder="Any"
              value={maxServings}
              onChange={(e) => setMaxServings(e.target.value)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#344e41] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#344e41] focus:border-transparent outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="time-asc">Shortest Time</option>
              <option value="time-desc">Longest Time</option>
              <option value="servings-asc">Least Servings</option>
              <option value="servings-desc">Most Servings</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setMaxPrepTime("");
                setMaxServings("");
                setSortBy("newest");
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <svg
            className="size-8 animate-spin text-[#344e41]"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Link key={recipe.RecipeID} href={`/recipes/${recipe.RecipeID}`}>
              <div
                key={recipe.RecipeID}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col"
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
                  <h2 className="text-xl font-bold mb-2">
                    {recipe.RecipeName}
                  </h2>
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
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No recipes found matching your filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setMaxPrepTime("");
              setMaxServings("");
              setSortBy("newest");
            }}
            className="mt-4 px-6 py-2 bg-[#344e41] text-white rounded-lg hover:bg-[#2a3e33] transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
