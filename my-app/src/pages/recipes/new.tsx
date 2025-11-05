import { useRouter } from "next/router";
import RecipeForm from "@/components/recipes/RecipeForm";

export default function NewRecipe() {
  const router = useRouter();

  const handleSubmit = async (formData) => {
    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create recipe");
      }

      const result = await response.json();

      router.push(`/recipes/${result.RecipeID}`);
    } catch (error) {
      alert("Error creating recipe: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <RecipeForm mode="create" onSubmit={handleSubmit} />
    </div>
  );
}
