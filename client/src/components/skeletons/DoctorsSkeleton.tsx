import { Skeleton } from "@/components/ui/skeleton";

const DoctorsSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-xl bg-white space-y-3">
            <Skeleton className="h-32 w-full" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsSkeleton;



