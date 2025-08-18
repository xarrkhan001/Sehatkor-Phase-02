import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Star, CheckCircle, ArrowRight, Minimize2, Maximize2, X, Search, Sparkles } from "lucide-react";
import { Button as UIButton } from "@/components/ui/button";
import ServiceManager, { Service as RealService } from "@/lib/serviceManager";
import { mockServices, Service as MockService } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

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

const CompareExplorer = () => {
  const navigate = useNavigate();
  const [selectedName, setSelectedName] = useState<string>("");
  const [nameQuery, setNameQuery] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showLocationMap, setShowLocationMap] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const allItems: Unified[] = useMemo(() => {
    const source = (ServiceManager as any).getAllServicesWithVariants
      ? (ServiceManager as any).getAllServicesWithVariants()
      : ServiceManager.getAllServices();
    const real = source.map((s: any) => ({
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
    const mocks = mockServices.map((m: MockService) => ({
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
    return [...real, ...mocks];
  }, []);

  const names = useMemo(() => Array.from(new Set(allItems.map(i => i.name))).sort(), [allItems]);
  const filteredNames = useMemo(() => {
    const q = nameQuery.toLowerCase();
    const subset = names.filter(n => n.toLowerCase().includes(q));
    // Prioritize names that start with the query, then by earliest match position, then alphabetical
    return subset.sort((a, b) => {
      const al = a.toLowerCase();
      const bl = b.toLowerCase();
      const aStarts = al.startsWith(q) ? 0 : 1;
      const bStarts = bl.startsWith(q) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      const ai = al.indexOf(q);
      const bi = bl.indexOf(q);
      if (ai !== bi) return ai - bi;
      return al.localeCompare(bl);
    });
  }, [names, nameQuery]);
  const effectiveSelectedName = useMemo(() => selectedName || (nameQuery ? filteredNames[0] : ""), [selectedName, nameQuery, filteredNames]);
  const offerings = useMemo(() => (effectiveSelectedName ? allItems.filter(i => i.name === effectiveSelectedName) : []), [allItems, effectiveSelectedName]);
  const limitedOfferings = useMemo(() => offerings.slice(0, 6), [offerings]);
  const selected = useMemo(() => offerings.filter(i => selectedIds.includes(i.id)), [offerings, selectedIds]);

  // Newly added products (prefer real services by createdAt, fallback to mocks)
  const newlyAdded = useMemo(() => {
    try {
      const real = ((ServiceManager.getAllServices?.() as any[]) || [])
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
        .map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: s.price,
          rating: (s as any)?.rating ?? 4.6,
          location: (s as any)?.location ?? "Karachi",
          provider: s.providerName,
          image: s.image,
          type: s.providerType === "doctor" ? "Treatment" : s.providerType === "pharmacy" ? "Medicine" : s.providerType === "laboratory" ? "Test" : s.category === "Surgery" ? "Surgery" : "Treatment",
        } as Unified));
      if (real.length === 3) return real;
      const needed = 3 - real.length;
      const mockFill = mockServices.slice(-needed).map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        price: m.price,
        rating: m.rating,
        location: m.location,
        provider: m.provider,
        image: m.image,
        type: m.type,
      } as Unified));
      return [...real, ...mockFill];
    } catch {
      return mockServices.slice(0, 3).map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        price: m.price,
        rating: m.rating,
        location: m.location,
        provider: m.provider,
        image: m.image,
        type: m.type,
      } as Unified));
    }
  }, []);

  // Auto-select when only one match, and support Enter-to-select
  useEffect(() => {
    if (!selectedName && nameQuery && filteredNames.length === 1) {
      setSelectedName(filteredNames[0]);
    }
  }, [filteredNames, nameQuery, selectedName]);

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
    const svc = allItems.find(s => s.id === showLocationMap);
    if (!svc) return null;
    const coordinates = getCoordinatesForLocation(svc.location);
    const address = getMockAddress(svc.provider, svc.name, svc.location);
    return { ...svc, coordinates, address } as any;
  }, [showLocationMap, allItems]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 4 ? prev : [...prev, id]));
  };

  const cheapest = useMemo(() => (selected.length ? [...selected].sort((a, b) => a.price - b.price)[0] : undefined), [selected]);
  const bestRated = useMemo(() => (selected.length ? [...selected].sort((a, b) => b.rating - a.rating)[0] : undefined), [selected]);

  return (
    <section className="mt-12">
      <Card className="border-0 shadow-none bg-gradient-to-b from-white to-muted/40">
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Left: Search & Select */}
            <div className="md:col-span-1">
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Search className="w-4 h-4" />
                  </div>
                  <Input
                    placeholder="Search service name"
                    value={nameQuery}
                    onChange={(e) => { setNameQuery(e.target.value); setIsSuggestionsOpen(true); }}
                    onFocus={() => setIsSuggestionsOpen(true)}
                    onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 150)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && filteredNames.length > 0) {
                        setSelectedName(filteredNames[0]);
                        setNameQuery(filteredNames[0]);
                        setIsSuggestionsOpen(false);
                      }
                    }}
                    className="pl-8"
                  />
                  {isSuggestionsOpen && nameQuery && filteredNames.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-sm max-h-56 overflow-auto">
                      {filteredNames.slice(0, 8).map((n) => (
                        <button
                          key={n}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-muted"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSelectedName(n);
                            setNameQuery(n);
                            setIsSuggestionsOpen(false);
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Select value={effectiveSelectedName} onValueChange={(v) => { setSelectedName(v); setNameQuery(v); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service name" />
                  </SelectTrigger>
                  <SelectContent>
                    {names.map(n => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground">{effectiveSelectedName ? `Showing ${offerings.length} providers` : "Start typing to search a service name, or pick from the list"}</div>
              </div>
            </div>

            {/* Right: Newly Added row (always visible) + Offerings */}
            <div className="md:col-span-2 flex flex-col gap-4">
              {/* Newly Added (hidden when searching or selection active) */}
              {(!nameQuery && !selectedName) && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 justify-center">
                      <Badge variant="outline" className="text-[10px] bg-red-100 text-red-700 border-red-200">Newly Added</Badge>
                      <span className="text-xs rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 text-muted-foreground">Recently added services</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {newlyAdded.map((item) => (
                      <Card key={item.id} className="overflow-hidden group border hover:shadow-md transition">
                        <CardContent className="p-0">
                          <div className="w-full h-24 bg-muted overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                            )}
                          </div>
                          <div className="p-3">
                            <div className="text-sm font-semibold line-clamp-1">{item.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">{item.provider}</div>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="text-xs font-medium text-primary">{item.price === 0 ? "Free" : `PKR ${item.price.toLocaleString()}`}</div>
                              <div className="flex items-center gap-1 text-xs">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                {item.rating}
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {item.location}
                            </div>
                            <div className="mt-2 flex gap-2">
                              <Button size="sm" variant="outline" className="h-7 px-2 flex-1" onClick={() => setShowLocationMap(item.id)}>Location</Button>
                              <Button size="sm" className="h-7 px-2" onClick={() => navigate(`/service/${item.id}`)}>View</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Offerings */}
              {!effectiveSelectedName ? (
                <div className="h-40 rounded-lg border bg-white/50 flex items-center justify-center text-sm text-muted-foreground">
                  Search and select a service to see providers to compare
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {limitedOfferings.map(item => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <Card key={item.id} className={`hover:shadow-md transition ${isSelected ? "ring-2 ring-primary" : ""}`}>
                      <CardContent className="p-4 cursor-pointer" onClick={() => toggleSelect(item.id)}>
                        <div className="w-full h-28 bg-muted rounded mb-3 overflow-hidden flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-muted-foreground text-sm">No Image</span>
                          )}
                        </div>
                        <div className="font-semibold leading-tight line-clamp-1">{item.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">{item.provider}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-primary font-bold">{item.price === 0 ? "Free" : `PKR ${item.price.toLocaleString()}`}</div>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            {item.rating}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {item.location}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button  variant="outline"  className="flex-1 px-1 text-xs" onClick={(e) => { e.stopPropagation(); setShowLocationMap(item.id); }}>
                            View Location
                          </Button>
                          <Button  variant="secondary" className="flex-1 px-1 text-xs" onClick={(e) => { e.stopPropagation(); navigate(`/service/${item.id}`); }}>
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                </div>
              )}
            </div>
          </div>

          {selected.length >= 2 && (
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Comparison</CardTitle>
                  <CardDescription>Side-by-side comparison of your selected services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="p-4 text-left">Field</th>
                          {selected.map(s => (
                            <th key={s.id} className="p-4 text-left min-w-56">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <div className="font-semibold line-clamp-1">{s.name}</div>
                                  <div className="text-xs text-muted-foreground line-clamp-1">{s.provider}</div>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => toggleSelect(s.id)}>Remove</Button>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-4 font-medium">Price</td>
                          {selected.map(s => (
                            <td key={s.id} className="p-4 font-semibold text-primary">{s.price === 0 ? "Free" : `PKR ${s.price.toLocaleString()}`}</td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-4 font-medium">Rating</td>
                          {selected.map(s => (
                            <td key={s.id} className="p-4">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                {s.rating}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-4 font-medium">Location</td>
                          {selected.map(s => (
                            <td key={s.id} className="p-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {s.location}
                                <UIButton size="sm" variant="ghost" className="h-7 px-2 ml-2" onClick={() => setShowLocationMap(s.id)}>
                                  View Location
                                </UIButton>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-4 font-medium">Type</td>
                          {selected.map(s => (
                            <td key={s.id} className="p-4">
                              <Badge variant="outline">{s.type}</Badge>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-4 font-medium">Action</td>
                          {selected.map(s => (
                            <td key={s.id} className="p-4">
                              <Button size="sm" className="w-full" onClick={() => navigate(`/service/${s.id}`)}>
                                View Details
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {bestRated && (
                      <div className="p-3 rounded border bg-green-50">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <div className="font-semibold">Best Overall (Rating)</div>
                        </div>
                        <div className="text-sm mt-1">{bestRated.name} — {bestRated.provider} ({bestRated.location})</div>
                      </div>
                    )}
                    {cheapest && (
                      <div className="p-3 rounded border bg-blue-50">
                        <div className="flex items-center gap-2 text-blue-700">
                          <CheckCircle className="w-4 h-4" />
                          <div className="font-semibold">Cheapest</div>
                        </div>
                        <div className="text-sm mt-1">{cheapest.name} — {cheapest.provider} ({cheapest.location})</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
      {showLocationMap && currentMapService && (
        <div
          className={`fixed z-50 bg-background shadow-xl rounded-lg border transition-all duration-300
            ${isMapExpanded ?
              // Expanded: full-width on small screens; centered modal on large screens
              'w-[calc(100vw-2rem)] h-[80vh] top-4 left-4 right-4 bottom-auto md:w-[calc(100vw-4rem)] md:left-8 md:right-8 lg:w-[720px] lg:h-[80vh] lg:top-1/2 lg:left-1/2 lg:right-auto lg:bottom-auto lg:-translate-x-1/2 lg:-translate-y-1/2'
              :
              // Collapsed (dock bottom-right on desktop)
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
    </section>
  );
};

export default CompareExplorer;


