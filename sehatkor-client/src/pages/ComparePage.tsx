import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ArrowUpDown, Trash2, Minimize2, Maximize2, X } from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";

type SortKey = "price" | "rating" | "location";

const ComparePage = () => {
  const { items, remove, clear } = useCompare();
  const [sortKey, setSortKey] = useState<SortKey>("price");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [showLocationMap, setShowLocationMap] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const sorted = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => {
      if (sortKey === "location") {
        return (a.location || "").localeCompare(b.location || "");
      }
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return av - bv;
    });
    return sortAsc ? copy : copy.reverse();
  }, [items, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc(prev => !prev);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

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

  const currentMapService = useMemo(() => {
    if (!showLocationMap) return null;
    const svc = items.find(s => s.id === showLocationMap);
    if (!svc) return null;
    const loc = (svc as any).location || "Karachi";
    const provider = (svc as any).provider || "Provider";
    const coordinates = getCoordinatesForLocation(loc);
    const address = getMockAddress(provider, (svc as any).name || "Service", loc);
    return { ...svc, location: loc, provider, coordinates, address } as any;
  }, [showLocationMap, items]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle>Compare Services</CardTitle>
              <CardDescription>Select up to 4 services to compare side-by-side</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => toggleSort("price")} className="gap-1">
                Price
                <ArrowUpDown className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => toggleSort("rating")} className="gap-1">
                Rating
                <ArrowUpDown className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => toggleSort("location")} className="gap-1">
                Location
                <ArrowUpDown className="w-4 h-4" />
              </Button>
              <Button variant="destructive" onClick={clear} className="gap-1">
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sorted.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">No items selected for comparison.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left">Field</th>
                      {sorted.map(item => (
                        <th key={item.id} className="p-4 text-left min-w-56">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold leading-tight">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.provider}</div>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => remove(item.id)}>Remove</Button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Price</td>
                      {sorted.map(item => (
                        <td key={item.id} className="p-4 font-semibold text-primary">
                          {item.price === 0 ? "Free" : `PKR ${item.price.toLocaleString()}`}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Rating</td>
                      {sorted.map(item => (
                        <td key={item.id} className="p-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            {item.rating}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Location</td>
                      {sorted.map(item => (
                        <td key={item.id} className="p-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {item.location}
                            <Button size="sm" variant="ghost" className="h-7 px-2 ml-1" onClick={() => setShowLocationMap(item.id)}>View Location</Button>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Type</td>
                      {sorted.map(item => (
                        <td key={item.id} className="p-4">
                          <Badge variant="outline">{item.type}</Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Home Service</td>
                      {sorted.map(item => (
                        <td key={item.id} className="p-4">
                          {item.homeService ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">Available</Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-600">Not Available</Badge>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Action</td>
                      {sorted.map(item => (
                        <td key={item.id} className="p-4">
                          <Button size="sm" className="w-full">Book Now</Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
                <h3 className="font-semibold truncate">{(currentMapService as any).name}</h3>
                <p className="text-sm text-muted-foreground truncate">{(currentMapService as any).address}</p>
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
                  <p className="font-medium">{(currentMapService as any).location}</p>
                  <p className="text-sm text-muted-foreground">{(currentMapService as any).address}</p>
                  <p className="text-xs mt-2">
                    Coordinates: {(currentMapService as any).coordinates.lat.toFixed(4)}, {(currentMapService as any).coordinates.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparePage;


