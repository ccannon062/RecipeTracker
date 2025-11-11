import { useState, useEffect } from "react";

interface RecipeFormProps {
  mode: "create" | "edit";
  initialData?: any;
  onSubmit: (data: any) => void;
}

export default function RecipeForm({
  mode,
  initialData,
  onSubmit,
}: RecipeFormProps) {
  const [formData, setFormData] = useState({
    RecipeName: "",
    RecipeDescription: "",
    PrepTime: 0,
    CookTime: 0,
    Servings: 0,
    Photo_URL: "",
    Instructions: "",
    ingredients: [{ IngredientID: "", Quantity: "", Unit: "" }],
    categories: [] as number[],
  });

  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [error, setError] = useState();

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch("/api/ingredients");
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const result = await response.json();
        setAvailableIngredients(result);
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const result = await response.json();
        setAvailableCategories(result);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchIngredients();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (mode === "edit" && initialData && availableCategories.length > 0) {
      const categoryIds =
        initialData.categories?.map((catName: string) => {
          const cat = availableCategories.find(
            (c: any) => c.CategoryName === catName
          );
          return cat?.CategoryID;
        }).filter((id: any) => id !== undefined) || [];

      setFormData({
        RecipeName: initialData.RecipeName || "",
        RecipeDescription: initialData.RecipeDescription || "",
        PrepTime: initialData.PrepTime || 0,
        CookTime: initialData.CookTime || 0,
        Servings: initialData.Servings || 0,
        Photo_URL: initialData.Photo_URL || "",
        Instructions: initialData.Instructions || "",
        ingredients:
          initialData.ingredients?.length > 0
            ? initialData.ingredients.map((ing) => ({
                IngredientID: ing.IngredientID,
                Quantity: ing.Quantity,
                Unit: ing.Unit,
              }))
            : [{ IngredientID: "", Quantity: "", Unit: "" }],
        categories: categoryIds,
      });
    }
  }, [mode, initialData, availableCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue =
      name === "PrepTime" || name === "CookTime" || name === "Servings"
        ? Number(value)
        : value;

    setFormData({
      ...formData,
      [name]: processedValue,
    });
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index][field] = value;
    setFormData({
      ...formData,
      ingredients: updatedIngredients,
    });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { IngredientID: "", Quantity: "", Unit: "" },
      ],
    });
  };

  const removeIngredient = (index) => {
    const updatedIngredients = formData.ingredients.filter(
      (_, i) => i !== index
    );
    setFormData({
      ...formData,
      ingredients: updatedIngredients,
    });
  };

  const toggleCategory = (categoryId: number) => {
    const isSelected = formData.categories.includes(categoryId);
    setFormData({
      ...formData,
      categories: isSelected
        ? formData.categories.filter((id) => id !== categoryId)
        : [...formData.categories, categoryId],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200"
    >
      <h2 className="text-3xl font-bold mb-6 text-[#344e41]">
        {mode === "create" ? "Create New Recipe" : "Edit Recipe"}
      </h2>

      <div className="mb-4">
        <label className="block text-[#344e41] font-semibold mb-2">
          Recipe Name *
        </label>
        <input
          type="text"
          name="RecipeName"
          value={formData.RecipeName}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#588157]"
          placeholder="e.g., Chocolate Chip Cookies"
        />
      </div>

      <div className="mb-4">
        <label className="block text-[#344e41] font-semibold mb-2">
          Description
        </label>
        <textarea
          name="RecipeDescription"
          value={formData.RecipeDescription}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#588157]"
          placeholder="Brief description of your recipe"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-[#344e41] font-semibold mb-2">
            Prep Time (minutes) *
          </label>
          <input
            type="number"
            name="PrepTime"
            value={formData.PrepTime}
            onChange={handleChange}
            required
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#588157]"
          />
        </div>

        <div>
          <label className="block text-[#344e41] font-semibold mb-2">
            Cook Time (minutes) *
          </label>
          <input
            type="number"
            name="CookTime"
            value={formData.CookTime}
            onChange={handleChange}
            required
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#588157]"
          />
        </div>

        <div>
          <label className="block text-[#344e41] font-semibold mb-2">
            Servings *
          </label>
          <input
            type="number"
            name="Servings"
            value={formData.Servings}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#588157]"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-[#344e41] font-semibold mb-2">
          Photo URL
        </label>
        <input
          type="url"
          name="Photo_URL"
          value={formData.Photo_URL}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#588157]"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-[#344e41] font-semibold mb-2">
          Categories
        </label>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((category: any) => (
            <button
              key={category.CategoryID}
              type="button"
              onClick={() => toggleCategory(category.CategoryID)}
              className={`px-3 py-2 rounded-lg border-2 transition-colors ${
                formData.categories.includes(category.CategoryID)
                  ? "bg-[#588157] text-white border-[#588157]"
                  : "bg-white text-[#344e41] border-gray-300 hover:border-[#588157]"
              }`}
            >
              {category.CategoryName}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-[#344e41] font-semibold mb-2">
          Instructions *
        </label>
        <textarea
          name="Instructions"
          value={formData.Instructions}
          onChange={handleChange}
          required
          rows={8}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#588157]"
          placeholder="Step-by-step cooking instructions..."
        />
      </div>

      <div className="mb-6">
        <label className="block text-[#344e41] font-semibold mb-2">
          Ingredients *
        </label>

        {formData.ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2 mb-3">
            <select
              value={ingredient.IngredientID}
              onChange={(e) =>
                handleIngredientChange(index, "IngredientID", e.target.value)
              }
              required
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#588157]"
            >
              <option value="">Select ingredient...</option>
              {availableIngredients.map((ing) => (
                <option key={ing.IngredientID} value={ing.IngredientID}>
                  {ing.IngredientName}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={ingredient.Quantity}
              onChange={(e) =>
                handleIngredientChange(index, "Quantity", e.target.value)
              }
              required
              min="0"
              step="0.01"
              placeholder="Qty"
              className="w-24 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#588157]"
            />

            <input
              type="text"
              value={ingredient.Unit}
              onChange={(e) =>
                handleIngredientChange(index, "Unit", e.target.value)
              }
              required
              placeholder="Unit"
              list="unit-options"
              className="w-24 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#588157]"
            />

            <datalist id="unit-options">
              <option value="cup" />
              <option value="tbsp" />
              <option value="tsp" />
              <option value="oz" />
              <option value="lb" />
              <option value="g" />
              <option value="kg" />
              <option value="ml" />
              <option value="L" />
              <option value="whole" />
              <option value="pinch" />
              <option value="bunch" />
              <option value="clove" />
              <option value="can" />
              <option value="package" />
            </datalist>

            {formData.ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addIngredient}
          className="mt-2 px-4 py-2 bg-[#588157] text-white rounded hover:bg-[#344e41]"
        >
          + Add Ingredient
        </button>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-1 bg-[#344e41] text-white py-3 rounded-lg font-semibold hover:bg-[#588157] transition"
        >
          {mode === "create" ? "Create Recipe" : "Update Recipe"}
        </button>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 bg-[#a3b18a] text-white py-3 rounded-lg font-semibold hover:bg-[#588157] transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
