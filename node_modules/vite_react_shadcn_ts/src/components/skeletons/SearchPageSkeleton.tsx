import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const SearchPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <Skeleton className="h-10 w-20 lg:hidden" />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <Skeleton className="h-6 w-16" />
              </CardHeader>
              <CardContent className="space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Results Skeleton */}
          <div className="lg:col-span-3">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="shadow-md rounded-xl border border-gray-200 animate-pulse">
                  <CardContent className="p-5">
                    {/* Image */}
                    <Skeleton className="w-full h-40 rounded-lg mb-4" />
                    
                    {/* Title and Price */}
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
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-9 flex-1 min-w-[100px]" />
                      <Skeleton className="h-9 flex-1 min-w-[100px]" />
                      <Skeleton className="h-9 flex-1 min-w-[100px]" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPageSkeleton;
