import { Skeleton } from "@/components/ui/skeleton";
import { Stethoscope } from "lucide-react";

const BlogSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section Skeleton */}
      <div className="relative bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50"></div>
        <div className="relative container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl shadow-lg mb-8">
                <Stethoscope className="w-10 h-10 text-blue-600" />
              </div>
              <Skeleton className="h-16 w-96 mx-auto mb-4" />
              <Skeleton className="h-8 w-80 mx-auto mb-6" />
              <Skeleton className="h-6 w-full max-w-4xl mx-auto mb-2" />
              <Skeleton className="h-6 w-3/4 mx-auto" />
            </div>
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-lg">
                  <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        {/* Featured Article Skeleton */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-48 mx-auto mb-4" />
            <Skeleton className="w-24 h-1 mx-auto rounded-full" />
          </div>
          
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
            <div className="grid lg:grid-cols-5 gap-0">
              <div className="lg:col-span-2 relative h-80 lg:h-auto">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="lg:col-span-3 p-10 lg:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-10 w-4/5 mb-6" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-3/4 mb-8" />
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="h-8 w-px bg-gray-200"></div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                
                <Skeleton className="h-12 w-40 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Section Skeleton */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-48 mx-auto mb-3" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <Skeleton className="flex-1 h-14 rounded-xl" />
                <Skeleton className="h-14 w-32 rounded-xl" />
              </div>

              <div className="space-y-3">
                <Skeleton className="h-4 w-48 mb-4" />
                <div className="flex flex-wrap gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-24 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Articles Grid Skeleton */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-56 mx-auto mb-4" />
            <Skeleton className="w-24 h-1 mx-auto rounded-full mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <Skeleton className="h-56 w-full" />
                <div className="p-6">
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-4/5 mb-3" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4 mb-6" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="w-10 h-10 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Section Skeleton */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl"></div>
          <div className="relative p-12 text-center rounded-3xl">
            <div className="max-w-3xl mx-auto">
              <Skeleton className="w-20 h-20 rounded-2xl mx-auto mb-8" />
              <Skeleton className="h-10 w-80 mx-auto mb-4" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-4/5 mx-auto mb-8" />
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-6">
                <Skeleton className="flex-1 h-14 rounded-xl" />
                <Skeleton className="h-14 w-48 rounded-xl" />
              </div>
              <div className="flex items-center justify-center gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-24" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogSkeleton;



