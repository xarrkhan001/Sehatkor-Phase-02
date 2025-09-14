import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Sparkles, ShieldCheck, Stethoscope, Microscope, Pill } from "lucide-react";

type Variant = "default" | "doctor" | "clinic" | "laboratory" | "pharmacy";

const variantIconMap: Record<Variant, React.ComponentType<any>> = {
  default: Search,
  doctor: Stethoscope,
  clinic: ShieldCheck,
  laboratory: Microscope,
  pharmacy: Pill,
};

interface EmptyStateProps {
  title?: string;
  message?: string;
  variant?: Variant;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No results found",
  message = "Try adjusting your search criteria",
  variant = "default",
  actionLabel,
  onAction,
  className = "",
}) => {
  const Icon = variantIconMap[variant] || Search;

  return (
    <Card className={`overflow-hidden border-0 shadow-none bg-transparent ${className}`}>
      <CardContent className="p-0">
        <div className="relative rounded-2xl border bg-white/95 backdrop-blur-[1px]">
          {/* Subtle pattern background */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-500 via-sky-500 to-emerald-500" />

          <div className="relative px-6 py-12 text-center">
            {/* Icon with gradient halo */}
            <div className="mx-auto mb-6 relative h-20 w-20">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-500 via-sky-400 to-emerald-400 blur-xl opacity-60" />
              <div className="relative h-full w-full rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                <Icon className="h-9 w-9 text-slate-600" />
              </div>
            </div>

            {/* Heading */}
            <div className="mx-auto max-w-xl">
              <h3 className="text-2xl font-semibold tracking-tight text-slate-800">
                {title}
              </h3>
              <p className="mt-1 text-slate-500">
                {message}
              </p>
            </div>

            {/* Suggestions */}
            <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border bg-fuchsia-50 px-3 py-1 text-xs text-fuchsia-700 border-fuchsia-200">
                <Sparkles className="h-3.5 w-3.5" /> Refine filters
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border bg-sky-50 px-3 py-1 text-xs text-sky-700 border-sky-200">
                <Sparkles className="h-3.5 w-3.5" /> Try different keywords
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border bg-emerald-50 px-3 py-1 text-xs text-emerald-700 border-emerald-200">
                <Sparkles className="h-3.5 w-3.5" /> Expand price range
              </span>
            </div>

            {/* Action */}
            {actionLabel && onAction && (
              <div className="mt-7">
                <Button variant="outline" onClick={onAction} className="border-slate-300">
                  {actionLabel}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default EmptyState;
