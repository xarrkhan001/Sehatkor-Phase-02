import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface RatingBadgeProps {
  rating?: number;
  totalRatings?: number;
  ratingBadge?: "excellent" | "good" | "fair" | "poor" | "Excellent" | "Good" | "Fair" | "Poor" | null;
  showStars?: boolean;
  size?: "sm" | "md" | "lg";
  yourBadge?: "excellent" | "good" | "fair" | "poor" | null;
  layout?: 'row' | 'column-compact';
}

const RatingBadge = ({ rating = 0, totalRatings = 0, ratingBadge, showStars = true, size = "md", yourBadge = null, layout = 'row' }: RatingBadgeProps) => {
  const safeRating = Number.isFinite(rating) ? rating : 0;
  const getRatingBadge = (numeric: number, ratingBadge?: "excellent" | "good" | "fair" | "poor" | null) => {
    // Use backend ratingBadge if available, otherwise derive from numeric rating
    if (ratingBadge) {
      switch (ratingBadge) {
        case "excellent":
          return {
            label: "Excellent",
            variant: "default" as const,
            className: "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:via-amber-600 hover:to-yellow-600 text-white border-amber-400"
          };
        case "good":
          return {
            label: "Good",
            variant: "secondary" as const,
            className: "bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-400 hover:via-emerald-600 hover:to-emerald-700 text-white border-emerald-300"
          };
        case "fair":
          return {
            label: "Fair",
            variant: "secondary" as const,
            className: "bg-gradient-to-r from-purple-400 via-violet-500 to-fuchsia-600 hover:from-purple-500 hover:via-violet-600 hover:to-fuchsia-700 text-white border-violet-300"
          };
        case "poor":
          return {
            label: "Poor",
            variant: "outline" as const,
            className: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300"
          };
      }
    }
    
    // Fallback to numeric rating logic
    if (numeric >= 4.5) {
      return {
        label: "Excellent",
        variant: "default" as const,
        className: "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:via-amber-600 hover:to-yellow-600 text-white border-amber-400"
      };
    } else if (numeric >= 3.5) {
      return {
        label: "Good",
        variant: "secondary" as const,
        className: "bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-400 hover:via-emerald-600 hover:to-emerald-700 text-white border-emerald-300"
      };
    } else if (numeric > 0) {
      return {
        label: "Fair",
        variant: "secondary" as const,
        className: "bg-gradient-to-r from-purple-400 via-violet-500 to-fuchsia-600 hover:from-purple-500 hover:via-violet-600 hover:to-fuchsia-700 text-white border-violet-300"
      };
    } else {
      return {
        label: "No Rating",
        variant: "outline" as const,
        className: "bg-gray-50 text-gray-500 border-gray-200"
      };
    }
  };

  const normalizedBadge = ratingBadge ? (String(ratingBadge).toLowerCase() as "excellent" | "good" | "fair" | "poor") : null;
  const badge = getRatingBadge(safeRating, normalizedBadge);
  const normalizedYour = yourBadge ? (String(yourBadge).toLowerCase() as "excellent" | "good" | "fair" | "poor") : null;
  const your = normalizedYour ? getRatingBadge(safeRating, normalizedYour) : null;
  
  const sizeClasses = {
    sm: "text-[8px] px-1 py-0.5 h-5 min-h-[20px] flex items-center",
    md: "text-[8px] px-1 py-0.5 h-5 min-h-[20px] flex items-center",
    lg: "text-[8px] px-1 py-0.5 h-5 min-h-[20px] flex items-center"
  };

  const starSize = {
    sm: "w-2.5 h-2.5",
    md: "w-2.5 h-2.5", 
    lg: "w-2.5 h-2.5"
  };

  const starsFor = (kindLabel: string) => {
    const k = kindLabel.toLowerCase();
    if (k === 'excellent') return 5;
    if (k === 'good') return 4;
    if (k === 'fair') return 3;
    if (k === 'poor') return 2;
    return 0;
  };

  const starColorFor = (kindLabel: string) => {
    const k = kindLabel.toLowerCase();
    if (k === 'excellent') return 'text-amber-500';
    if (k === 'good') return 'text-emerald-500';
    if (k === 'fair') return 'text-violet-500';
    if (k === 'poor') return 'text-red-500';
    return 'text-gray-400';
  };

  if (layout === 'column-compact') {
    return (
      <div className={`grid ${your ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wide text-gray-500">Overall</span>
          <div className="flex items-center gap-2">
            <Badge 
              variant={badge.variant}
              className={`${badge.className} ${sizeClasses[size]} font-semibold flex items-center gap-1 rounded-full shadow-sm`}
            >
              {showStars && <Star className={`${starSize[size]} fill-current`} />}
              {badge.label}
              {safeRating > 0 && (
                <span className="ml-1 opacity-90">{safeRating.toFixed(1)}</span>
              )}
            </Badge>
          </div>
          <div className={`mt-1 flex items-center gap-0.5 ${starColorFor(badge.label)}`}>
            {Array.from({ length: starsFor(badge.label) }).map((_, i) => (
              <Star key={i} className={`${starSize.sm} fill-current`} />
            ))}
          </div>
          {totalRatings > 0 && (
            <div className="text-[11px] text-gray-500">({totalRatings})</div>
          )}
        </div>
        {your && (
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wide text-gray-500">Your</span>
            <div className="flex items-center gap-2">
              <Badge 
                variant={your.variant}
                className={`${your.className} ${sizeClasses.sm} font-semibold flex items-center gap-1 rounded-full ring-1 ring-offset-1 ring-white/60`}
              >
                {showStars && <Star className={`${starSize.sm} fill-current`} />}
                {your.label}
              </Badge>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={badge.variant}
        className={`${badge.className} ${sizeClasses[size]} font-semibold flex items-center gap-1 rounded-full shadow-sm`}
      >
        {showStars && <Star className={`${starSize[size]} fill-current`} />}
        {badge.label}
        {safeRating > 0 && (
          <span className="ml-1 opacity-90">{safeRating.toFixed(1)}</span>
        )}
      </Badge>
      {your && (
        <Badge 
          variant={your.variant}
          className={`${your.className} ${sizeClasses.sm} font-semibold flex items-center gap-1 rounded-full ring-1 ring-offset-1 ring-white/60`}
        >
          {showStars && <Star className={`${starSize.sm} fill-current`} />}
          Your: {your.label}
        </Badge>
      )}
      {/* Mini star row */}
      <div className={`flex items-center gap-0.5 ${starColorFor(badge.label)}`}>
        {Array.from({ length: starsFor(badge.label) }).map((_, i) => (
          <Star key={i} className={`${starSize.sm} fill-current`} />
        ))}
      </div>
      <div className="flex items-center gap-1 text-sm text-gray-600">
        {totalRatings > 0 && (
          <span className="text-gray-500">({totalRatings})</span>
        )}
      </div>
    </div>
  );
}

export default RatingBadge;


