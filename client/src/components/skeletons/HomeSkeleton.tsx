import { Skeleton } from "@/components/ui/skeleton";

const HomeSkeleton = () => {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section Skeleton */}
      <section className="relative pt-16 md:pt-20 pb-8 md:pb-12 lg:pt-24 lg:pb-16 overflow-visible">
        {/* Background Placeholder */}
        <div className="absolute inset-0 bg-white z-0 rounded-b-[2rem] lg:rounded-b-[3rem] overflow-hidden">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-emerald-50/5 rounded-full blur-[120px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Top Bar Skeleton (Greeting & Helpline) */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3 bg-white p-2 rounded-full border border-gray-100 px-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-2 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>

            {/* Header Content Skeleton */}
            <div className="text-center mb-10 space-y-4">
              <Skeleton className="h-6 w-48 mx-auto rounded-full" />
              <Skeleton className="h-12 md:h-16 w-3/4 mx-auto" />
              <Skeleton className="hidden md:block h-4 w-64 md:w-80 mx-auto" />
              {/* Search Bar Skeleton - Sharp Corners */}
              <div className="max-w-3xl mx-auto flex gap-0 p-1 bg-white border border-gray-200">
                <Skeleton className="h-10 flex-1 rounded-none" />
                <Skeleton className="h-10 w-24 rounded-none" />
              </div>
            </div>

            {/* Bento Grid Skeleton */}
            <div className="grid grid-cols-5 md:grid-cols-12 gap-3 md:gap-4">
              {/* Large Card */}
              <div className="col-span-2 row-span-2 h-48 md:col-span-3 md:h-80 bg-emerald-50/30 border border-emerald-100 rounded-2xl p-4 relative overflow-hidden">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full" />
              </div>
              {/* Medium Cards */}
              <div className="col-span-3 h-24 md:col-span-4 md:h-36 bg-blue-50/30 border border-blue-100 rounded-2xl p-4 relative overflow-hidden">
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-3 w-1/3 mb-4" />
                <Skeleton className="absolute -bottom-2 -right-2 h-20 w-20 rounded-full" />
              </div>
              <div className="col-span-3 h-24 md:col-span-5 md:h-36 bg-orange-50/30 border border-orange-100 rounded-2xl p-4 relative overflow-hidden">
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-3 w-1/3 mb-4" />
                <Skeleton className="absolute -bottom-2 -right-2 h-20 w-20 rounded-full" />
              </div>
              {/* Bottom Cards */}
              <div className="hidden md:block md:col-span-4 h-36 bg-purple-50/30 border border-purple-100 rounded-2xl p-4 relative overflow-hidden">
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-3 w-1/3 mb-4" />
                <Skeleton className="absolute -bottom-2 -right-2 h-20 w-20 rounded-full" />
              </div>
              <div className="hidden md:block md:col-span-5 h-36 bg-teal-50/30 border border-teal-100 rounded-2xl p-4 relative overflow-hidden">
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-3 w-1/3 mb-4" />
                <Skeleton className="absolute -bottom-2 -right-2 h-20 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section Skeleton */}
      <section className="py-8 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-24 mx-auto mb-2" />
                <Skeleton className="h-3 w-32 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Content Placeholder */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeSkeleton;



