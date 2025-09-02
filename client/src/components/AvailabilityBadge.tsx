import { Badge } from "@/components/ui/badge";

type Availability = 'Online' | 'Physical' | 'Online and Physical' | string;

type Size = 'sm' | 'md' | 'lg';

interface Props {
  availability?: Availability | null;
  size?: Size;
  className?: string;
}

const sizeClasses: Record<Size, string> = {
  sm: "text-[10px] !px-1 !py-0.5 whitespace-nowrap leading-tight tracking-tight",
  md: "text-[11px] !px-1.5 !py-0.5 whitespace-nowrap leading-tight tracking-tight",
  lg: "text-[12px] !px-2 !py-1 whitespace-nowrap leading-tight tracking-tight",
};

const gradientFor = (availability?: Availability | null) => {
  if (!availability) return "bg-gray-50 text-gray-600 border border-gray-200";
  const a = String(availability).toLowerCase();
  if (a === 'online') return "bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-400 hover:via-emerald-600 hover:to-emerald-700 text-white border-emerald-300";
  if (a === 'physical') return "bg-gradient-to-r from-violet-400 via-fuchsia-500 to-purple-600 hover:from-violet-500 hover:via-fuchsia-600 hover:to-purple-700 text-white border-violet-300";
  return "bg-gradient-to-r from-teal-400 via-cyan-500 to-teal-600 hover:from-teal-400 hover:via-cyan-600 hover:to-teal-700 text-white border-teal-300"; // Online and Physical or others
};

export default function AvailabilityBadge({ availability, size = 'md', className = '' }: Props) {
  const style = `${gradientFor(availability)} ${sizeClasses[size]} font-medium rounded-full shadow-sm`;
  const label = (() => {
    const a = String(availability || '').toLowerCase();
    if (a === 'online and physical') return 'Online & Physical';
    return availability || 'Availability';
  })();
  return (
    <Badge className={`${style} ${className}`}>{label}</Badge>
  );
}
