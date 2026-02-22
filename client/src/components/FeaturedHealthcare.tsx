import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, ArrowRight, Activity } from "lucide-react";
import ServiceManager, { Service } from "@/lib/serviceManager";
import { Button } from "@/components/ui/button";

interface SimpleService {
    id: string;
    name: string;
    provider: string;
    price: number;
    rating: number;
    location: string;
    image?: string;
    providerType: string;
}

const cardStyles = [
    { bg: "bg-gradient-to-br from-white to-emerald-50/50", border: "border-emerald-100/60", icon: "text-emerald-500", shadow: "hover:shadow-emerald-100" },
    { bg: "bg-gradient-to-br from-white to-blue-50/50", border: "border-blue-100/60", icon: "text-blue-500", shadow: "hover:shadow-blue-100" },
    { bg: "bg-gradient-to-br from-white to-purple-50/50", border: "border-purple-100/60", icon: "text-purple-500", shadow: "hover:shadow-purple-100" },
    { bg: "bg-gradient-to-br from-white to-rose-50/50", border: "border-rose-100/60", icon: "text-rose-500", shadow: "hover:shadow-rose-100" },
    { bg: "bg-gradient-to-br from-white to-amber-50/50", border: "border-amber-100/60", icon: "text-amber-500", shadow: "hover:shadow-amber-100" },
    { bg: "bg-gradient-to-br from-white to-sky-50/50", border: "border-sky-100/60", icon: "text-sky-500", shadow: "hover:shadow-sky-100" },
];

const FeaturedHealthcare = () => {
    const [services, setServices] = useState<SimpleService[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const result = await ServiceManager.fetchPublicServices({ limit: 12 });
                const mapped = result.services.map((s: Service) => ({
                    id: s.id,
                    name: s.name,
                    provider: s.providerName || "Provider",
                    price: Number(s.price || 0),
                    rating: s.averageRating || s.rating || 5.0,
                    location: s.city || s.location || "Pakistan",
                    image: s.image,
                    providerType: s.providerType
                }));
                setServices(mapped);
            } catch (error) {
                console.error("Error fetching featured services:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();
    }, []);

    if (loading || services.length === 0) return null;

    return (
        <section className="py-12 bg-gray-50/50 border-y border-gray-100 overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Centered Header */}
                <div className="flex flex-col items-center text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                        Top <span className="text-emerald-600">Healthcare Services</span>
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">Directly book verified experts near you</p>
                    <Button asChild variant="ghost" size="sm" className="mt-4 text-emerald-600 hover:text-emerald-700 font-bold hover:bg-emerald-50">
                        <Link to="/search" className="flex items-center gap-1">
                            View All Services <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </Button>
                </div>

                {/* Marquee Container */}
                <div className="relative group">
                    <div className="flex items-center w-max will-change-transform marquee-animation pause-on-hover">
                        {/* First copy */}
                        <div className="flex items-center gap-4 px-2">
                            {services.map((service, idx) => {
                                const style = cardStyles[idx % cardStyles.length];
                                return (
                                    <div
                                        key={service.id}
                                        className={`w-[240px] md:w-[280px] shrink-0 ${style.bg} rounded-2xl border ${style.border} shadow-sm ${style.shadow} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                                    >
                                        <Link to={`/service/${service.id}`} className="p-4 block">
                                            <div className="flex gap-3">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white/50 backdrop-blur-sm shadow-inner">
                                                    {service.image ? (
                                                        <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className={`w-full h-full flex items-center justify-center ${style.icon}`}>
                                                            <Activity className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                                        <span className="text-[10px] font-bold text-gray-600">{service.rating.toFixed(1)}</span>
                                                    </div>
                                                    <h3 className="text-sm font-bold text-gray-900 truncate leading-tight mb-1">
                                                        {service.name}
                                                    </h3>
                                                    <p className="text-[10px] text-gray-500 font-medium truncate">
                                                        {service.provider}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-gray-100/50 flex items-center justify-between">
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                    <MapPin className="w-2.5 h-2.5" />
                                                    <span className="truncate max-w-[100px] font-medium">{service.location}</span>
                                                </div>
                                                <span className={`text-xs font-black ${style.icon}`}>
                                                    {service.price === 0 ? "Free" : `Rs. ${service.price.toLocaleString()}`}
                                                </span>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Second copy for seamless loop */}
                        <div className="flex items-center gap-4 px-2" aria-hidden="true">
                            {services.map((service, idx) => {
                                const style = cardStyles[idx % cardStyles.length];
                                return (
                                    <div
                                        key={`dup-${service.id}`}
                                        className={`w-[240px] md:w-[280px] shrink-0 ${style.bg} rounded-2xl border ${style.border} shadow-sm ${style.shadow} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                                    >
                                        <Link to={`/service/${service.id}`} className="p-4 block">
                                            <div className="flex gap-3">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white/50 backdrop-blur-sm shadow-inner">
                                                    {service.image ? (
                                                        <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className={`w-full h-full flex items-center justify-center ${style.icon}`}>
                                                            <Activity className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                                        <span className="text-[10px] font-bold text-gray-600">{service.rating.toFixed(1)}</span>
                                                    </div>
                                                    <h3 className="text-sm font-bold text-gray-900 truncate leading-tight mb-1">
                                                        {service.name}
                                                    </h3>
                                                    <p className="text-[10px] text-gray-500 font-medium truncate">
                                                        {service.provider}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-gray-100/50 flex items-center justify-between">
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                    <MapPin className="w-2.5 h-2.5" />
                                                    <span className="truncate max-w-[100px] font-medium">{service.location}</span>
                                                </div>
                                                <span className={`text-xs font-black ${style.icon}`}>
                                                    {service.price === 0 ? "Free" : `Rs. ${service.price.toLocaleString()}`}
                                                </span>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .marquee-animation {
          animation: service-marquee 180s linear infinite;
        }
        .pause-on-hover:hover {
          animation-play-state: paused;
        }
        @keyframes service-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </section>
    );
};

export default FeaturedHealthcare;
