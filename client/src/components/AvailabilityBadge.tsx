type Availability = 'Online' | 'Physical' | 'Online and Physical' | string;

type Size = 'sm' | 'md' | 'lg';

interface Props {
  availability?: Availability | null;
  size?: Size;
  className?: string;
}

const sizeClasses: Record<Size, string> = {
  sm: "text-[11px]",
  md: "text-[12px]",
  lg: "text-[13px]",
};

const colorFor = (availability?: Availability | null) => {
  if (!availability) return "text-gray-600";
  const a = String(availability).toLowerCase();
  if (a === 'online') return "text-emerald-700";
  if (a === 'physical') return "text-violet-700";
  return "text-teal-700"; // Online and Physical or others
};

const iconFor = (availability?: Availability | null) => {
  if (!availability) return "⏺️";
  const a = String(availability).toLowerCase();
  if (a === 'online') return "💻";
  if (a === 'physical') return "🏥";
  return "🔁"; // Online & Physical
};

export default function AvailabilityBadge({ availability, size = 'md', className = '' }: Props) {
  const label = (() => {
    const a = String(availability || '').toLowerCase();
    if (a === 'online and physical') return 'Online & Physical';
    return availability || 'Availability';
  })();

  return (
    <span className={`inline-flex items-center gap-1 font-semibold ${sizeClasses[size]} ${colorFor(availability)} ${className}`}>
      <span className="leading-none" aria-hidden>{iconFor(availability)}</span>
      <span className="leading-none">{label}</span>
    </span>
  );
}
