import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Building2,
  Home,
  Truck,
  Rocket,
  CreditCard,
  Wallet,
  Coins,
  Car,
  Bike,
  Star
} from "lucide-react";

type Partner = {
  name: string;
  abbreviation?: string;
  gradientFrom?: string; // tailwind color token
  gradientTo?: string;   // tailwind color token
  logoUrl?: string;      // optional real logo path (public or remote)
};

type PartnersMarqueeProps = {
  title?: string;
  partners?: Array<string | Partner>;
  speed?: "slow" | "normal" | "fast"; // Added speed control prop
};

const presetPartners: Partner[] = [
  { name: "Adamjee Insurance", abbreviation: "AI", gradientFrom: "from-rose-500", gradientTo: "to-orange-500", logoUrl: "/partners/adamjee.svg" },
  { name: "Graana", abbreviation: "GR", gradientFrom: "from-emerald-500", gradientTo: "to-teal-500", logoUrl: "/partners/graana.svg" },
  { name: "Zameen.com", abbreviation: "ZM", gradientFrom: "from-green-500", gradientTo: "to-lime-500", logoUrl: "/partners/zameen.svg" },
  { name: "TCS", abbreviation: "TCS", gradientFrom: "from-indigo-500", gradientTo: "to-sky-500", logoUrl: "/partners/tcs.svg" },
  { name: "Swyft", abbreviation: "SW", gradientFrom: "from-violet-500", gradientTo: "to-fuchsia-500", logoUrl: "/partners/swyft.svg" },
  { name: "SadaPay", abbreviation: "SD", gradientFrom: "from-pink-500", gradientTo: "to-rose-500", logoUrl: "/partners/sadapay.svg" },
  { name: "JazzCash", abbreviation: "JC", gradientFrom: "from-amber-500", gradientTo: "to-yellow-500", logoUrl: "/partners/jazzcash.svg" },
  { name: "Easypaisa", abbreviation: "EP", gradientFrom: "from-emerald-500", gradientTo: "to-green-500", logoUrl: "/partners/easypaisa.svg" },
  { name: "Careem", abbreviation: "CR", gradientFrom: "from-lime-500", gradientTo: "to-emerald-500", logoUrl: "/partners/careem.svg" },
  { name: "Bykea", abbreviation: "BK", gradientFrom: "from-sky-500", gradientTo: "to-cyan-500", logoUrl: "/partners/bykea.svg" },
];

const normalizePartners = (items?: Array<string | Partner>): Partner[] => {
  const base = (items && items.length > 0 ? items : presetPartners).map((p, i) =>
    typeof p === "string"
      ? { name: p, abbreviation: p.split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase(), gradientFrom: presetPartners[i % presetPartners.length].gradientFrom, gradientTo: presetPartners[i % presetPartners.length].gradientTo }
      : p
  );
  return base;
};

const PartnersMarquee = ({ title = "Our Partners", partners, speed = "fast" }: PartnersMarqueeProps) => {
  const [remotePartners, setRemotePartners] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { apiUrl } = await import("@/config/api");
        const res = await fetch(apiUrl('/api/partners'));
        const data = await res.json();
        if (!cancelled && data?.success && Array.isArray(data.partners)) {
          setRemotePartners(data.partners);
        }
      } catch {}
      finally { if (!cancelled) setLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, []);

  // Remote partners first, then presets as fallback to fill space
  const gradients = [
    ["from-emerald-500","to-teal-500"],
    ["from-green-500","to-lime-500"],
    ["from-sky-500","to-blue-500"],
    ["from-indigo-500","to-sky-500"],
    ["from-violet-500","to-fuchsia-500"],
    ["from-amber-500","to-yellow-500"],
    ["from-rose-500","to-orange-500"],
  ];
  const priorityList: Partner[] = (remotePartners || []).map((p, i) => ({
    name: p.name,
    logoUrl: p.logoUrl,
    gradientFrom: gradients[i % gradients.length][0],
    gradientTo: gradients[i % gradients.length][1]
  }));
  const normalized = normalizePartners(priorityList.length > 0 ? priorityList : partners);
  
  // Animation duration based on speed prop
  const animationDuration = {
    slow: "50s",
    normal: "30s",
    fast: "18s"
  }[speed];

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold">{title}</h3>
          <Badge variant="secondary" className="mt-2 text-[10px] bg-red-100 text-red-700 border-red-200">Join Us</Badge>
        </div>
      </div>

      {/* Full-width marquee bar attached to viewport edges */}
      <div className="w-full overflow-hidden">
        <div className="relative overflow-hidden rounded-none border-y shadow-sm bg-gray-50">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-gray-50 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-gray-50 to-transparent z-10" />

          <div 
            className="flex items-center py-9 sm:py-11 w-max will-change-transform"
            style={{ animation: `marquee ${animationDuration} linear infinite` }}
          >
            {/* First copy */}
            <div className="flex items-center gap-8 sm:gap-10">
              {normalized.map((p, idx) => (
                <div key={`${p.name}-${idx}`} className="shrink-0 flex items-center gap-5 sm:gap-6 px-4 sm:px-5 py-2 sm:py-3">
                  <div className={`relative overflow-hidden h-16 w-16 sm:h-20 sm:w-20 rounded-full grid place-items-center ring-2 ring-white/70 shadow-lg bg-gradient-to-tr ${p.gradientFrom ?? "from-sky-500"} ${p.gradientTo ?? "to-blue-500"}`}>
                    <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_30%_30%,white,transparent)]" />
                    {p.logoUrl ? (
                      <img src={p.logoUrl} alt={p.name} className="absolute inset-0 h-full w-full object-contain p-2" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="relative z-10 drop-shadow-md">{getIconFor(p.name)}</div>
                    )}
                  </div>
                  <span className="whitespace-nowrap text-base sm:text-2xl font-semibold tracking-wide text-foreground/90">{p.name}</span>
                </div>
              ))}
            </div>
            {/* Second copy for seamless loop */}
            <div className="flex items-center gap-8 sm:gap-10" aria-hidden="true">
              {normalized.map((p, idx) => (
                <div key={`dup-${p.name}-${idx}`} className="shrink-0 flex items-center gap-5 sm:gap-6 px-4 sm:px-5 py-2 sm:py-3">
                  <div className={`relative overflow-hidden h-16 w-16 sm:h-20 sm:w-20 rounded-full grid place-items-center ring-2 ring-white/70 shadow-lg bg-gradient-to-tr ${p.gradientFrom ?? "from-sky-500"} ${p.gradientTo ?? "to-blue-500"}`}>
                    <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(60%_60%_at_30%_30%,white,transparent)]" />
                    {p.logoUrl ? (
                      <img src={p.logoUrl} alt="" className="absolute inset-0 h-full w-full object-contain p-2" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="relative z-10 drop-shadow-md">{getIconFor(p.name)}</div>
                    )}
                  </div>
                  <span className="whitespace-nowrap text-base sm:text-2xl font-semibold tracking-wide text-foreground/90">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};

const getIconFor = (name: string) => {
  const lower = name.toLowerCase();
  const commonProps = { className: "text-white w-7 h-7 sm:w-10 sm:h-10" } as const;
  if (lower.includes("insur")) return <ShieldCheck {...commonProps} />;
  if (lower.includes("zameen") || lower.includes("graana")) return <Home {...commonProps} />;
  if (lower.includes("tcs")) return <Truck {...commonProps} />;
  if (lower.includes("swyft")) return <Rocket {...commonProps} />;
  if (lower.includes("sadapay")) return <CreditCard {...commonProps} />;
  if (lower.includes("jazzcash")) return <Wallet {...commonProps} />;
  if (lower.includes("easypaisa")) return <Coins {...commonProps} />;
  if (lower.includes("careem")) return <Car {...commonProps} />;
  if (lower.includes("bykea")) return <Bike {...commonProps} />;
  return <Star {...commonProps} />;
};

export default PartnersMarquee;