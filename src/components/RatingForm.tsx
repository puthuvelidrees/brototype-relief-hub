import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RatingFormProps {
  complaintId: string;
  complaintStatus: string;
}

interface Rating {
  id: string;
  rating: number;
  feedback: string | null;
  created_at: string;
}

export default function RatingForm({ complaintId, complaintStatus }: RatingFormProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [existingRating, setExistingRating] = useState<Rating | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user && complaintStatus === "resolved") {
      loadExistingRating();
    }
  }, [user, complaintId, complaintStatus]);

  const loadExistingRating = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("complaint_ratings")
      .select("*")
      .eq("complaint_id", complaintId)
      .eq("user_id", user.id)
      .single();

    if (data) {
      setExistingRating(data);
      setRating(data.rating);
      setFeedback(data.feedback || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error(t.pleaseSelectRating);
      return;
    }

    if (!user) {
      toast.error("Please sign in to submit a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from("complaint_ratings")
          .update({
            rating,
            feedback: feedback.trim() || null,
          })
          .eq("id", existingRating.id);

        if (error) throw error;
        toast.success(t.ratingUpdated);
      } else {
        // Insert new rating
        const { error } = await supabase
          .from("complaint_ratings")
          .insert({
            complaint_id: complaintId,
            user_id: user.id,
            rating,
            feedback: feedback.trim() || null,
          });

        if (error) throw error;
        toast.success(t.ratingSubmitted);
      }

      loadExistingRating();
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      toast.error(error.message || t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't show anything if complaint is not resolved
  if (complaintStatus !== "resolved") {
    return null;
  }

  // Show existing rating in view mode
  if (existingRating && !isEditing) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{t.yourRating}</h3>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            {t.editRating}
          </Button>
        </div>
        
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-6 w-6",
                star <= existingRating.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              )}
            />
          ))}
        </div>

        {existingRating.feedback && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">{t.yourFeedback}</p>
            <p className="text-sm">{existingRating.feedback}</p>
          </div>
        )}
      </Card>
    );
  }

  // Show rating form
  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">
            {existingRating ? t.updateRating : t.rateResolution}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t.rateResolutionDescription}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t.rating}</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-colors",
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs text-muted-foreground">
              {rating === 1 && t.ratingPoor}
              {rating === 2 && t.ratingFair}
              {rating === 3 && t.ratingGood}
              {rating === 4 && t.ratingVeryGood}
              {rating === 5 && t.ratingExcellent}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="feedback" className="text-sm font-medium">
            {t.feedback} <span className="text-muted-foreground">({t.optional})</span>
          </label>
          <Textarea
            id="feedback"
            placeholder={t.feedbackPlaceholder}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            maxLength={500}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">
            {feedback.length}/500
          </p>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting || rating === 0}>
            {isSubmitting ? t.submitting : existingRating ? t.updateRating : t.submitRating}
          </Button>
          {existingRating && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setRating(existingRating.rating);
                setFeedback(existingRating.feedback || "");
              }}
            >
              {t.cancel}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
