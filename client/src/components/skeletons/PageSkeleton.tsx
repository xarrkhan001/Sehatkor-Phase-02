import { Skeleton } from "@/components/ui/skeleton";

type PageSkeletonProps = {
  withSidebar?: boolean;
};

const PageSkeleton = ({ withSidebar = false }: PageSkeletonProps) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className={`grid gap-6 ${withSidebar ? 'lg:grid-cols-[260px_1fr]' : ''}`}>
        {withSidebar && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        )}
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton;



