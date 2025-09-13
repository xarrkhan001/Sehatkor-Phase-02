import { Badge } from "@/components/ui/badge";

type ServiceType = 'Private' | 'Public' | 'Charity' | 'NGO' | 'NPO' | 'Sehat Card' | string;

type Size = 'sm' | 'md' | 'lg';

interface Props {
  serviceType?: ServiceType | ServiceType[] | null;
  size?: Size;
  className?: string;
}

const sizeClasses: Record<Size, string> = {
  sm: "text-[10px] !px-1 !py-0.5 whitespace-nowrap leading-tight tracking-tight",
  md: "text-[11px] !px-1.5 !py-0.5 whitespace-nowrap leading-tight tracking-tight",
  lg: "text-[12px] !px-2 !py-1 whitespace-nowrap leading-tight tracking-tight",
};

const gradientFor = (type?: ServiceType | null) => {
  if (!type) return "bg-gray-50 text-gray-600 border border-gray-200";
  const t = String(type).toLowerCase();
  if (t === 'private') return "bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 hover:from-blue-400 hover:via-blue-600 hover:to-indigo-700 text-white border-blue-300";
  if (t === 'public') return "bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-400 hover:via-emerald-600 hover:to-emerald-700 text-white border-emerald-300";
  if (t === 'charity') return "bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 hover:from-orange-400 hover:via-amber-600 hover:to-orange-700 text-white border-amber-300";
  if (t === 'ngo') return "bg-gradient-to-r from-pink-400 via-rose-500 to-pink-600 hover:from-pink-400 hover:via-rose-600 hover:to-pink-700 text-white border-pink-300";
  if (t === 'npo') return "bg-gradient-to-r from-teal-400 via-cyan-500 to-teal-600 hover:from-teal-400 hover:via-cyan-600 hover:to-teal-700 text-white border-teal-300";
  if (t === 'sehat card') return "bg-gradient-to-r from-violet-400 via-fuchsia-500 to-purple-600 hover:from-violet-500 hover:via-fuchsia-600 hover:to-purple-700 text-white border-violet-300";
  return "bg-gradient-to-r from-slate-400 via-gray-500 to-slate-600 hover:from-slate-400 hover:via-gray-600 hover:to-slate-700 text-white border-slate-300";
};

export default function ServiceTypeBadge({ serviceType, size = 'md', className = '' }: Props) {
  // Handle array of service types
  if (Array.isArray(serviceType)) {
    if (serviceType.length === 0) {
      return null;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {serviceType.map((type, index) => (
          <ServiceTypeBadge 
            key={index} 
            serviceType={type} 
            size={size} 
            className={className} 
          />
        ))}
      </div>
    );
  }

  // Handle single service type
  const style = `${gradientFor(serviceType)} ${sizeClasses[size]} font-medium rounded-full shadow-sm`;
  const label = (() => {
    const t = String(serviceType || '').toLowerCase();
    if (t === 'sehat card') return 'Sehat Card';
    return serviceType || 'Type';
  })();
  return (
    <Badge className={`${style} ${className}`}>{label}</Badge>
  );
}
