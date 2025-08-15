import { useEffect, useState, useMemo } from "react";
import ServiceManager from "@/lib/serviceManager";
import { Service } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Minimize2, Maximize2, X, Search, Star, Home, Clock } from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";
import CompareTray from "@/components/CompareTray";
import ServiceCardSkeleton from "@/components/skeletons/ServiceCardSkeleton";
import { useAuth } from "@/contexts/AuthContext";

const PharmaciesPage = () => {
  const [pharmacyServices, setPharmacyServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showLocationMap, setShowLocationMap] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadServices = async () => {
      try {
        // First try to sync from server
        await ServiceManager.syncServicesFromServer();
      } catch (error) {
        console.log('Could not sync from server, using local data');
      }
      
      const source = ServiceManager.getAllServices();
      const realServices = source
        .filter((service: any) => service.providerType === 'pharmacy') // Only pharmacy services
        .map((service: any) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          rating: 4.5,
          location: "Karachi",
          type: "Medicine",
          homeService: false,
          image: service.image,
          provider: service.providerName || "Pharmacy",
          createdAt: (service as any).createdAt,
          _providerId: (service as any).providerId,
        }) as Service);
      
      // Sort: own services first, then by creation date
      realServices.sort((a: any, b: any) => {
        const aOwn = (a as any)._providerId && user?.id && (a as any)._providerId === user.id;
        const bOwn = (b as any)._providerId && user?.id && (b as any)._providerId === user.id;
        if (aOwn !== bOwn) return aOwn ? -1 : 1;
        const ad = (a as any).createdAt ? Date.parse((a as any).createdAt) : 0;
        const bd = (b as any).createdAt ? Date.parse((b as any).createdAt) : 0;
        return bd - ad;
      });
      setPharmacyServices(realServices as any);
      setIsLoading(false);
    };
    
    loadServices();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'sehatkor_services') {
        loadServices();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user?.id]);

  const filteredServices = useMemo(() => {
    return pharmacyServices.filter(service => {
      return service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             service.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
             service.description.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [pharmacyServices, searchTerm]);

  const getCoordinatesForLocation = (location: string) => {
    const locationCoordinates: Record<string, { lat: number; lng: number }> = {
      "Clifton": { lat: 24.8265, lng: 67.0274 },
      "Defence": { lat: 24.8008, lng: 67.0114 },
      "Gulshan": { lat: 24.9130, lng: 67.0983 },
      "North Nazimabad": { lat: 24.9342, lng: 67.0558 },
      "PECHS": { lat: 24.8760, lng: 67.0647 },
      "Bahadurabad": { lat: 24.8744, lng: 67.0469 },
      "Lahore": { lat: 31.5204, lng: 74.3587 },
      "Islamabad": { lat: 33.6844, lng: 73.0479 },
      "Karachi": { lat: 24.8607, lng: 67.0011 }
    };
    return locationCoordinates[location] || locationCoordinates["Karachi"];
  };

  const getMockAddress = (provider: string, name: string, location: string): string => {
    const street = Math.floor(Math.random() * 100) + 1;
    return `${provider}, ${street} ${location}, ${location}`;
  };

  const currentMapService = showLocationMap
    ? (() => {
        const svc = pharmacyServices.find(s => s.id === showLocationMap);
        if (!svc) return null;
        const coordinates = getCoordinatesForLocation(svc.location || "Karachi");
        const address = getMockAddress(svc.provider || "Provider", svc.name, svc.location || "Karachi");
        return { ...svc, coordinates, address } as any;
      })()
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex flex-col items-center text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">Find Pharmacies</h1>
              <p className="text-lg text-gray-500 max-w-2xl">
                Search from our network of pharmacies and medicine providers
              </p>
            </div>
          </div>
          <ServiceCardSkeleton count={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col items-center text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Find Pharmacies</h1>
            <p className="text-lg text-gray-500 max-w-2xl">
              Search from our network of pharmacies and medicine providers
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="relative w-full max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search pharmacies by name, medicine, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-5 rounded-full shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50"
              />
            </div>
          </div>
          
          {filteredServices.length > 0 && (
            <p className="text-center mt-4 text-gray-400">
              Showing {filteredServices.length} {filteredServices.length === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>

        {/* Results */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className="shadow-md hover:shadow-lg transition-shadow duration-200 rounded-xl border border-gray-200"
            >
              <CardContent className="p-5">
                {/* Image */}
                <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                  {service.image ? (
                    <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-4xl">💊</span>
                  )}
                </div>

                {/* Title and Provider */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {service.name}
                      <Badge className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 border-blue-100">
                        Pharmacy
                      </Badge>
                    </h3>
                    <p className="text-sm text-gray-500">{service.provider}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {service.price === 0
                        ? "Free"
                        : `PKR ${service.price.toLocaleString()}`}
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 border-blue-100"
                    >
                      {service.type}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {service.description}
                </p>

                {/* Rating, Location */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>{service.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{service.location}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button className="flex-1 min-w-[100px]">
                    <Clock className="w-4 h-4 mr-1" /> Order Now
                  </Button>
                  <CompareActions id={service.id} />
                  <Button
                    variant="secondary"
                    onClick={() => (window.location.href = `/service/${service.id}`)}
                    className="flex-1 min-w-[100px]"
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowLocationMap(service.id)}
                    className="flex-1 min-w-[100px]"
                  >
                    View Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground mb-4">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-xl">No pharmacies found</p>
                <p>Try adjusting your search criteria</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Location Map Card */}
      {showLocationMap && currentMapService && (
        <div
          className={`fixed z-50 bg-background shadow-xl rounded-lg border transition-all duration-300
            ${isMapExpanded ?
              'w-[calc(100vw-2rem)] h-[80vh] top-4 left-4 right-4 bottom-auto md:w-[calc(100vw-4rem)] md:left-8 md:right-8 lg:w-[720px] lg:h-[80vh] lg:top-1/2 lg:left-1/2 lg:right-auto lg:bottom-auto lg:-translate-x-1/2 lg:-translate-y-1/2'
              :
              'w-[calc(100vw-2rem)] h-64 bottom-4 left-4 right-4 md:w-80 md:right-4 md:left-auto'
            }
          `}
        >
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-0 right-0 bg-background z-10 p-3 flex justify-between items-center border-b">
              <div className="max-w-[70%]">
                <h3 className="font-semibold truncate">{currentMapService.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{currentMapService.address}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsMapExpanded(!isMapExpanded)} className="h-8 w-8">
                  {isMapExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setShowLocationMap(null); setIsMapExpanded(false); }} className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="absolute top-12 bottom-0 left-0 right-0 bg-muted flex items-center justify-center">
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 bg-gray-200 relative">
                  <MapPin
                    className="w-12 h-12 text-red-500 absolute"
                    style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                  />
                </div>
                <div className="p-4 bg-white border-t">
                  <p className="font-medium">{currentMapService.location}</p>
                  <p className="text-sm text-muted-foreground">{currentMapService.address}</p>
                  <p className="text-xs mt-2">
                    Coordinates: {currentMapService.coordinates.lat.toFixed(4)}, {currentMapService.coordinates.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <CompareTray />
    </div>
  );
};

export default PharmaciesPage; 

const CompareActions = ({ id }: { id: string }) => {
  const { toggle } = useCompare();
  return (
    <Button variant="outline" size="sm" onClick={() => toggle(id)} className="flex-1 min-w-[100px]">
      Compare
    </Button>
  );
};