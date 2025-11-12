import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { IoStar, IoStarOutline } from "react-icons/io5";

interface Rating {
  RatingID: number;
  RecipeID: number;
  UserID: number;
  Rating: number;
  Notes: string | null;
  CreatedAt: Date;
  Username: string;
  FirstName: string;
  LastName: string;
}

interface RatingData {
  ratings: Rating[];
  average: number;
  count: number;
}

interface RatingComponentProps {
  recipeId: number;
}

export default function RatingComponent({ recipeId }: RatingComponentProps) {
  const { user } = useAuth();
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [userNotes, setUserNotes] = useState<string>("");
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchRatings();
  }, [recipeId]);

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/ratings/${recipeId}`);
      if (response.ok) {
        const data = await response.json();
        setRatingData(data);

        if (user) {
          const existingRating = data.ratings.find(
            (r: Rating) => r.UserID === user.UserID
          );
          if (existingRating) {
            setUserRating(existingRating.Rating);
            setUserNotes(existingRating.Notes || "");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to rate recipes");
      return;
    }

    if (userRating === 0) {
      setError("Please select a star rating");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`/api/ratings/${recipeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: userRating, notes: userNotes }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit rating");
      }

      setSuccess(true);
      await fetchRatings();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to submit rating. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (
    rating: number,
    interactive: boolean = false,
    size: number = 24
  ) => {
    const stars = [];
    const displayRating = interactive ? hoverRating || userRating : rating;

    for (let i = 1; i <= 5; i++) {
      const filled = i <= displayRating;
      stars.push(
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setUserRating(i)}
          onMouseEnter={() => interactive && setHoverRating(i)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${
            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
          } transition-transform`}
        >
          {filled ? (
            <IoStar className="text-yellow-500" size={size} />
          ) : (
            <IoStarOutline className="text-gray-400" size={size} />
          )}
        </button>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <p className="text-gray-600">Loading ratings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-[#344e41]">
        Ratings & Reviews
      </h2>

      {ratingData && ratingData.count > 0 && (
        <div className="mb-6 p-4 bg-[#dad7cd] rounded-lg">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-[#344e41]">
              {Number(ratingData.average || 0).toFixed(1)}
            </div>
            <div>
              <div className="flex">
                {renderStars(Number(ratingData.average || 0), false, 20)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {ratingData.count}{" "}
                {ratingData.count === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
        </div>
      )}

      {user ? (
        <form
          onSubmit={handleSubmitRating}
          className="mb-6 p-4 border border-gray-200 rounded-lg"
        >
          <h3 className="font-semibold text-[#344e41] mb-3">
            {userRating > 0 ? "Update Your Review" : "Leave a Review"}
          </h3>

          {error && (
            <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-3 p-2 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
              Review submitted successfully!
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#344e41] mb-2">
              Your Rating *
            </label>
            <div className="flex gap-1">
              {renderStars(userRating, true, 32)}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#344e41] mb-2">
              Your Review (optional)
            </label>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#588157]"
              placeholder="Share your thoughts about this recipe..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting || userRating === 0}
            className="bg-[#344e41] text-white px-6 py-2 rounded hover:bg-[#588157] transition disabled:opacity-50"
          >
            {submitting
              ? "Submitting..."
              : userRating > 0 &&
                ratingData?.ratings.find((r) => r.UserID === user.UserID)
              ? "Update Review"
              : "Submit Review"}
          </button>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-lg text-center">
          <p className="text-gray-700">Please log in to leave a rating</p>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-[#344e41] mb-4">
          All Reviews ({ratingData?.count || 0})
        </h3>

        {ratingData && ratingData.ratings.length > 0 ? (
          <div className="space-y-4">
            {ratingData.ratings.map((rating) => (
              <div
                key={rating.RatingID}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-[#344e41]">
                      {rating.FirstName} {rating.LastName}
                    </p>
                    <p className="text-sm text-gray-600">@{rating.Username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {renderStars(rating.Rating, false, 16)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(rating.CreatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {rating.Notes && (
                  <p className="text-gray-700 mt-2">{rating.Notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">
            No reviews yet. Be the first to review this recipe!
          </p>
        )}
      </div>
    </div>
  );
}
