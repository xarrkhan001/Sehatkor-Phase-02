import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface RatingBadgeProps {
  rating: number;
  totalRatings?: number;
  showStars?: boolean;
  size?: "sm" | "md" | "lg";
}

const RatingBadge = ({ rating, totalRatings, showStars = true, size = "md" }: RatingBadgeProps) => {
  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) {
      return {
        label: "Excellent",
        variant: "default" as const,
        className: "bg-green-500 hover:bg-green-600 text-white border-green-500"
      };
    } else if (rating >= 3.5) {
      return {
        label: "Good",
        variant: "secondary" as const,
        className: "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
      };
    } else if (rating > 0) {
      return {
        label: "Normal",
        variant: "outline" as const,
        className: "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
      };
    } else {
      return {
        label: "No Rating",
        variant: "outline" as const,
        className: "bg-gray-50 text-gray-500 border-gray-200"
      };
    }
  };

  const badge = getRatingBadge(rating);
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2"
  };

  const starSize = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-5 h-5"
  };

  if (rating === 0) {
    return (
      <Badge 
        variant={badge.variant}
        className={`${badge.className} ${sizeClasses[size]} font-medium`}
      >
        {badge.label}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={badge.variant}
        className={`${badge.className} ${sizeClasses[size]} font-medium flex items-center gap-1`}
      >
        {showStars && <Star className={`${starSize[size]} fill-current`} />}
        {badge.label}
      </Badge>
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <span className="font-semibold">{rating.toFixed(1)}</span>
        {totalRatings && totalRatings > 0 && (
          <span className="text-gray-500">({totalRatings})</span>
        )}
      </div>
    </div>
  );
};

export default RatingBadge;
