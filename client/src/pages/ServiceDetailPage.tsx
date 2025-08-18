import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import ServiceManager, { Service as RealService } from "@/lib/serviceManager";
import { mockServices, Service as MockService } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ArrowLeft } from "lucide-react";

type Unified = {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  location: string;
  provider: string;
  image?: string;
  type: "Treatment" | "Medicine" | "Test" | "Surgery";
};

const ServiceDetailPage = () => {
  const params = useParams();
  const id = params.id as string;

  const item: Unified | undefined = useMemo(() => {
    const source = (ServiceManager as any).getAllServicesWithVariants
      ? (ServiceManager as any).getAllServicesWithVariants()
      : ServiceManager.getAllServices();
    const realMapped = source.map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: s.price,
      rating: s?.rating ?? 4.5,
      location: s?.location ?? "Karachi",
      provider: s.providerName,
      image: s.image,
      type: s.providerType === "doctor" ? "Treatment" : s.providerType === "pharmacy" ? "Medicine" : s.providerType === "laboratory" ? "Test" : s.category === "Surgery" ? "Surgery" : "Treatment",
    } as Unified));
    const mockMapped = mockServices.map((m: MockService) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      price: m.price,
      rating: m.rating,
      location: m.location,
      provider: m.provider,
      image: m.image,
      type: m.type,
    }));
    const combined = [...realMapped, ...mockMapped];
    return combined.find(x => x.id === id);
  }, [id]);

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-muted-foreground">Service not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="p-4">
              <div className="w-full h-56 rounded bg-muted overflow-hidden flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-muted-foreground">No Image</span>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">{item.name}</CardTitle>
              <CardDescription>{item.provider}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="text-primary font-bold text-xl">{item.price === 0 ? "Free" : `PKR ${item.price.toLocaleString()}`}</div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      {item.rating}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {item.location}
                    </div>
                    <Badge variant="outline">{item.type}</Badge>
                  </div>
                </div>
                <Button size="lg">Book Now</Button>
              </div>
              <p className="mt-4 text-muted-foreground leading-relaxed">{item.description}</p>
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Best Price Nearby</div>
                    <div className="text-lg font-semibold mt-1">PKR {Math.max(0, Math.round(item.price * 0.85)).toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Top Rated Alternative</div>
                    <div className="text-lg font-semibold mt-1">4.9 ★</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;


