import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-xl bg-white">
            <Skeleton className="h-4 w-24" />
            <div className="mt-4">
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {[0,1].map((i) => (
          <div key={i} className="p-4 border rounded-xl bg-white space-y-3">
            <Skeleton className="h-5 w-40" />
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-3 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;



