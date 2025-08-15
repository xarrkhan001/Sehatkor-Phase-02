import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface ServiceCardSkeletonProps {
  count?: number;
  className?: string;
}

const ServiceCardSkeleton = ({ count = 8, className = "" }: ServiceCardSkeletonProps) => {
  return (
    <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="shadow-md rounded-xl border border-gray-200 animate-pulse">
          <CardContent className="p-5">
            {/* Image Skeleton */}
            <Skeleton className="w-full h-40 rounded-lg mb-4" />
            
            {/* Title and Badge */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="text-right">
                <Skeleton className="h-5 w-20 mb-1" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            </div>

            {/* Description */}
            <div className="mb-4 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>

            {/* Rating and Location */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-8" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 flex-1 min-w-[100px] rounded-md" />
              <Skeleton className="h-9 flex-1 min-w-[100px] rounded-md" />
              <Skeleton className="h-9 flex-1 min-w-[100px] rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ServiceCardSkeleton;
