import { Skeleton } from "@/components/ui/skeleton";

const HomeSkeleton = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section Skeleton */}
      <section className="relative overflow-visible py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 px-4 min-h-[70vh] sm:min-h-[75vh] md:min-h-[80vh] lg:min-h-[85vh]">
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
        <div className="container mx-auto relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center w-full space-y-6">
            <Skeleton className="h-12 sm:h-16 md:h-20 lg:h-24 w-3/4 mx-auto" />
            <Skeleton className="h-6 sm:h-8 w-2/3 mx-auto" />
            <div className="mt-6 w-full max-w-2xl mx-auto">
              <Skeleton className="h-12 w-full rounded-full" />
            </div>
            <div className="flex gap-4 justify-center mt-8">
              <Skeleton className="h-10 w-32 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section Skeleton */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 sm:h-10 md:h-12 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diseases Section Skeleton */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Skeleton className="h-8 sm:h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 lg:gap-5">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mx-auto mb-2" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section Skeleton */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Skeleton className="h-8 sm:h-10 w-48 mx-auto mb-4" />
            <Skeleton className="h-4 w-80 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 border rounded-xl bg-white animate-pulse">
                <div className="text-center">
                  <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-5 w-24 mx-auto mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compare Section Skeleton */}
      <section className="py-16 bg-gradient-to-b from-white to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <Skeleton className="h-6 w-24 mx-auto mb-2 rounded-full" />
            <Skeleton className="h-8 w-96 mx-auto mb-2" />
            <Skeleton className="h-4 w-80 mx-auto" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </section>

      {/* Features Section Skeleton */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-4 w-80 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4" />
                <Skeleton className="h-5 w-24 mx-auto mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section Skeleton */}
      <section className="py-16 sm:py-20 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Skeleton className="h-8 sm:h-10 w-80 mx-auto mb-6" />
          <Skeleton className="h-4 w-96 mx-auto mb-8" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-12 w-32 rounded-md" />
            <Skeleton className="h-12 w-32 rounded-md" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeSkeleton;



