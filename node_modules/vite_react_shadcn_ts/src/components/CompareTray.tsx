import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Scale, ArrowRight } from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";

const CompareTray = () => {
  const { items, remove, clear, maxItems } = useCompare();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[1000]">
      <Card className="p-3 sm:p-4 shadow-2xl bg-background/95 backdrop-blur border">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-primary" />
              <div className="font-semibold">Compare Services</div>
              <div className="text-xs text-muted-foreground">{items.length}/{maxItems}</div>
            </div>
            <div className="flex gap-2 overflow-x-auto py-1">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-2 px-2 py-1 rounded bg-muted text-sm shrink-0">
                  <span className="truncate max-w-[140px]">{item.name}</span>
                  <button onClick={() => remove(item.id)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" onClick={clear} className="hidden sm:inline-flex">Clear</Button>
            <Button asChild className="gap-2">
              <Link to="/compare">
                Compare Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CompareTray;













