import { Skeleton } from "@/components/ui/skeleton";

const AuthSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="border rounded-2xl p-6 bg-white space-y-4">
        <Skeleton className="h-7 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
};

export default AuthSkeleton;



