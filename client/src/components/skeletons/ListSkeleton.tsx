import { Skeleton } from "@/components/ui/skeleton";

const ListSkeleton = ({ rows = 8 }: { rows?: number }) => {
  return (
    <div className="container mx-auto px-4 py-6 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border rounded-xl bg-white space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-72" />
        </div>
      ))}
    </div>
  );
};

export default ListSkeleton;



