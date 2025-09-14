import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
  title: string;
  subtitle: string;
  label: string; // e.g., "Search doctors"
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  resultsCount?: number;
  className?: string;
  minimal?: boolean; // when true, remove decorative effects
};

const PageSearchHeader: React.FC<Props> = ({
  title,
  subtitle,
  label,
  placeholder,
  value,
  onChange,
  resultsCount,
  className = "",
  minimal = false,
}) => {
  return (
    <div className={`relative isolate rounded-2xl border ${minimal ? 'border-gray-200 bg-white' : 'border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm'} ${className}`}>
      {/* Decorative gradient blobs (disabled in minimal mode) */}
      {!minimal && (
        <>
          <div className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-fuchsia-400/30 via-sky-400/20 to-emerald-400/30 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-tr from-emerald-400/20 via-sky-400/20 to-fuchsia-400/20 blur-2xl" />
        </>
      )}

      <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-end">
        {/* Left: Title/Subheading */}
        <div className="text-left">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-1 text-base md:text-lg text-slate-500">
            {subtitle}
          </p>
        </div>

        {/* Right: Label + results + Input */}
        <div className="w-full md:w-[420px] md:justify-self-end">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm md:text-base font-semibold text-slate-800">
              {label}
            </span>
            {typeof resultsCount === "number" && (
              <span className="text-xs text-slate-500">
                Showing {resultsCount} {resultsCount === 1 ? "result" : "results"}
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="h-11 w-full pl-10 rounded-lg border border-slate-200 bg-white/90 text-slate-800 placeholder:text-slate-400 shadow-sm transition focus-visible:ring-2 focus-visible:ring-sky-400/40 focus:border-sky-300 hover:border-slate-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageSearchHeader;
