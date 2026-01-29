import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  label: string; // e.g., "Search doctors"
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  resultsCount?: number;
  className?: string;
  minimal?: boolean; // when true, remove decorative effects
  rightContent?: React.ReactNode; // Content to display above the search bar on the right
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
  rightContent,
}) => {
  return (
    <div className={`relative isolate rounded-none border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50/20 backdrop-blur-2xl shadow-sm overflow-hidden ${className}`}>
      {/* Attractive Background Pattern - Medical/Clean Look */}
      <div className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(rgba(14, 165, 233, 0.2) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Stronger Ambient Glows for Richness */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-100/40 to-indigo-100/0 blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-gradient-to-tr from-sky-100/30 to-blue-50/0 blur-3xl opacity-50 pointer-events-none" />

      {/* Refined Top Accent */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />


      <div className="relative grid gap-4 p-4 md:grid-cols-2 md:items-start z-10">
        {/* Left: Title/Subheading + Search Input */}
        <div className="text-left flex flex-col gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-1 text-sm md:text-base text-slate-500">
              {subtitle}
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="relative group transition-all duration-300 hover:scale-[1.01]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors h-4 w-4 z-10" />
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="relative h-10 w-full pl-10 pr-4 rounded-none border-0 bg-white/80 shadow-sm ring-1 ring-slate-200 text-slate-700 placeholder:text-slate-400 text-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Right: Urdu Content */}
        {rightContent && (
          <div className="md:text-right flex flex-col items-end">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageSearchHeader;
