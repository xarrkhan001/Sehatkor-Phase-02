import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Home, Filter, Search, Clock, X, Maximize2, Minimize2 } from "lucide-react";
import RatingBadge from "@/components/RatingBadge";
import RatingModal from "@/components/RatingModal";
import { Service } from "@/data/mockData";
import ServiceManager, { Service as RealService } from "@/lib/serviceManager";
import { useCompare } from "@/contexts/CompareContext";
import CompareTray from "@/components/CompareTray";
import SearchPageSkeleton from "@/components/skeletons/SearchPageSkeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ServiceWhatsAppButton from "@/components/ServiceWhatsAppButton";

interface SearchService extends Service {
  isReal?: boolean;
  coordinates?: { lat: number; lng: number };
  address?: string;
  providerPhone?: string;
  googleMapLink?: string;
}

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceType, setServiceType] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [minRating, setMinRating] = useState(0);
  const [homeServiceOnly, setHomeServiceOnly] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [highlightedService, setHighlightedService] = useState<string | null>(null);
  const [allServices, setAllServices] = useState<SearchService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, mode } = useAuth();
  const [showLocationMap, setShowLocationMap] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [currentMapService, setCurrentMapService] = useState<SearchService | null>(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedRatingService, setSelectedRatingService] = useState<SearchService | null>(null);
  // Desktop sidebar slide-in animation
  const [sidebarReady, setSidebarReady] = useState(false);
  // Desktop click-to-toggle sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((v) => !v);

  // Helper function to get coordinates based on location
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
      "Faisalabad": { lat: 31.4504, lng: 73.1350 },
      "Karachi": { lat: 24.8607, lng: 67.0011 }
    };

    return locationCoordinates[location] || locationCoordinates["Karachi"];
  };

  // Generate mock address based on provider and type
  const getMockAddress = (provider: string, type: string, location: string): string => {
    const street = Math.floor(Math.random() * 100) + 1;
    
    switch(type) {
      case 'Treatment':
      case 'Surgery':
        return `${street} ${location} Clinic, ${location}, ${location === 'Karachi' ? 'Karachi' : location}`;
      case 'Medicine':
        return `${provider} Pharmacy, ${street} ${location}, ${location === 'Karachi' ? 'Karachi' : location}`;
      case 'Test':
        return `${provider} Lab, ${street} Commercial, ${location}, ${location === 'Karachi' ? 'Karachi' : location}`;
      default:
        return `${street} ${location}, ${location === 'Karachi' ? 'Karachi' : location}`;
    }
  };

  // Map service types from real services to search types
  const mapServiceTypeToSearch = (service: RealService): "Treatment" | "Medicine" | "Test" | "Surgery" => {
    switch (service.providerType) {
      case 'doctor':
        return 'Treatment';
      case 'pharmacy':
        return 'Medicine';
      case 'laboratory':
        return 'Test';
      case 'clinic':
        return service.category === 'Surgery' ? 'Surgery' : 'Treatment';
      default:
        return 'Treatment';
    }
  };

  // Load real services directly from database
  const loadServices = async () => {
    try {
      // Fetch directly from server without saving to local storage
      const serverData = await ServiceManager.fetchPublicServices();
      const realServices = serverData.services;
    
    // Convert real services to search format with proper filtering
    const formattedRealServices: SearchService[] = realServices.map((service: any) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      rating: service.averageRating || service.rating || 0,
      ratingBadge: (service as any).ratingBadge || null,
      provider: service.providerName,
      location: service.city || "Karachi",
      type: mapServiceTypeToSearch(service),
      homeService: service.providerType === 'doctor',
      isReal: true,
      image: service.image,
      coordinates: service?.coordinates ?? getCoordinatesForLocation(service?.location ?? "Karachi"),
      address: service.detailAddress || `${service.providerName}, ${service.city || 'Karachi'}`,
      googleMapLink: service.googleMapLink,
      detailAddress: service.detailAddress,
      createdAt: (service as any).createdAt,
      _providerId: (service as any).providerId,
      _providerType: service.providerType,
      providerPhone: service.providerPhone,
      totalRatings: service.totalRatings || 0,
    }));

    // Sort: own services first, then by rating (highest first), then by creation date
    formattedRealServices.sort((a: any, b: any) => {
      const aOwn = a._providerId && user?.id && a._providerId === user.id;
      const bOwn = b._providerId && user?.id && b._providerId === user.id;
      if (aOwn !== bOwn) return aOwn ? -1 : 1;
      // Sort by rating (highest first)
      if (a.rating !== b.rating) return b.rating - a.rating;
      const ad = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bd = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bd - ad;
    });
    
      setAllServices(formattedRealServices);
      setIsLoading(false);
    } catch (error) {
      console.log('Backend is offline, no services available');
      setAllServices([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [user?.id]);

  // Trigger desktop sidebar slide-in
  useEffect(() => {
    const t = setTimeout(() => setSidebarReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Handle URL parameters on component mount
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    const queryParam = searchParams.get('q');
    
    if (serviceParam) {
      setSearchTerm(serviceParam);
      setHighlightedService(serviceParam);
    } else if (queryParam) {
      setSearchTerm(queryParam);
    }
  }, [searchParams]);

  const filteredServices = useMemo(() => {
    const filtered = allServices.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.provider.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = serviceType === "all" || service.type === serviceType;
      const matchesLocation = location === "all" || service.location?.includes(location);
      const matchesPrice = service.price >= priceRange[0] && service.price <= priceRange[1];
      const matchesRating = service.rating >= minRating;
      const matchesHomeService = !homeServiceOnly || service.homeService;

      return matchesSearch && matchesType && matchesLocation && matchesPrice && matchesRating && matchesHomeService;
    });

    // Sort so that highlighted service appears at the top, then real services before mock services
    if (highlightedService) {
      return filtered.sort((a, b) => {
        const aMatches = a.name.toLowerCase() === highlightedService.toLowerCase();
        const bMatches = b.name.toLowerCase() === highlightedService.toLowerCase();
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        
        // If neither matches highlight, prioritize real services
        if (a.isReal && !b.isReal) return -1;
        if (!a.isReal && b.isReal) return 1;
        return 0;
      });
    }

    // User's own items first (newest first), then other real items (newest), then mock
    return filtered.sort((a: any, b: any) => {
      const aOwn = a._providerId && user?.id && a._providerId === user.id;
      const bOwn = b._providerId && user?.id && b._providerId === user.id;
      if (aOwn !== bOwn) return aOwn ? -1 : 1;
      if (a.isReal !== b.isReal) return a.isReal ? -1 : 1;
      // Sort by rating (highest first)
      if (a.rating !== b.rating) return b.rating - a.rating;
      const ad = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bd = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bd - ad;
    });
  }, [searchTerm, serviceType, location, priceRange, minRating, homeServiceOnly, highlightedService, allServices]);

  const handleBookNow = (service: SearchService) => {
    if (user && user.role !== 'patient' && mode !== 'patient') {
      toast.error('Providers must switch to Patient Mode to book services.', {
        description: 'Click your profile icon and use the toggle to switch modes.',
      });
      return;
    }

    if (user && (service as any)._providerId === user.id) {
      toast.error("You cannot book your own service.");
      return;
    }

    navigate('/payment', {
      state: {
        serviceId: service.id,
        serviceName: service.name,
        providerId: (service as any)._providerId || service.id,
        providerName: service.provider,
        providerType: (service as any)._providerType
      }
    });
  };

  const { toggle: toggleGlobalCompare } = useCompare();
  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices(prev => prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]);
    toggleGlobalCompare(serviceId);
  };

  const handleRateService = (service: SearchService) => {
    if (!user) {
      toast.error('Please login to rate services');
      return;
    }
    if (user.role !== 'patient' && mode !== 'patient') {
      toast.error('Only patients can rate services');
      return;
    }
    setSelectedRatingService(service);
    setRatingModalOpen(true);
  };

  const handleRatingSubmitted = async (serviceId: string, newRatingData: { averageRating: number; totalRatings: number }, serviceType: string) => {
    // Optimistic UI update
    setAllServices(prevServices =>
      prevServices.map(service =>
        service.id === serviceId
          ? {
              ...service,
              rating: newRatingData.averageRating,
              totalRatings: newRatingData.totalRatings,
            }
          : service
      )
    );

    // Fetch the updated service from the backend to get the new ratingBadge
    try {
      const updatedService = await ServiceManager.fetchServiceById(serviceId, serviceType);
      setAllServices(prevServices =>
        prevServices.map(service =>
          service.id === serviceId ? { ...service, ...updatedService, rating: updatedService.averageRating } : service
        )
      );
    } catch (error) {
      console.error('Failed to fetch updated service:', error);
      // Optional: revert optimistic update on error
    }
  };

  const selectedServicesData = allServices.filter(service => 
    selectedServices.includes(service.id)
  );

  const clearFilters = () => {
    setSearchTerm("");
    setServiceType("all");
    setLocation("all");
    setPriceRange([0, 50000]);
    setMinRating(0);
    setHomeServiceOnly(false);
  };

  // Get emoji for service type
  const getServiceEmoji = (type: string): string => {
    switch (type) {
      case 'Treatment':
        return '🩺';
      case 'Medicine':
        return '💊';
      case 'Test':
        return '🔬';
      case 'Surgery':
        return '🏥';
      default:
        return '⚕️';
    }
  };

  // Toggle location map view
  const toggleLocationMap = (serviceId: string) => {
    if (showLocationMap === serviceId) {
      setShowLocationMap(null);
      setIsMapExpanded(false);
    } else {
      setShowLocationMap(serviceId);
      setIsMapExpanded(false);
    }
  };

  // Update current service being shown on map when showLocationMap changes
  useEffect(() => {
    if (showLocationMap) {
      const service = allServices.find(s => s.id === showLocationMap);
      setCurrentMapService(service || null);
    } else {
      setCurrentMapService(null);
    }
  }, [showLocationMap, allServices]);

  if (isLoading) {
    return <SearchPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            {/* Left: Title above + Input below */}
            <div className="w-full md:max-w-[420px]">
              <h1 className="text-3xl font-bold mb-2">Search Healthcare Services</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search for services, providers, or treatments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 h-11 rounded-md border border-gray-300 bg-white/90 text-gray-800 placeholder:text-gray-400 shadow-sm transition focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 hover:border-gray-400"
                />
              </div>
              {/* Mobile: Filters toggle */}
              <div className="flex justify-start mt-2 md:mt-3 lg:hidden">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
            {/* Right: Results count */}
            <div className="w-full md:w-auto md:text-right">
              <span className="text-xs font-light text-gray-700">
                Showing {filteredServices.length} {filteredServices.length === 1 ? 'result' : 'results'}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop: Large Filters icon trigger (click to open/close) */}
        <div className="hidden lg:flex items-center mb-3">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/95 shadow-sm px-4 py-2 text-gray-700 hover:border-primary hover:text-primary transition"
            onClick={toggleSidebar}
            aria-label="Toggle filters"
            aria-pressed={isSidebarOpen}
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filters</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-6 gap-8">
          {/* Filters Sidebar */}
          <div
            className={`${showFilters ? 'block lg:hidden' : 'hidden'} ${isSidebarOpen ? 'lg:block' : 'lg:hidden'} lg:col-span-2 lg:transform lg:transition-all lg:duration-300 lg:ease-out ${sidebarReady ? 'lg:opacity-100 lg:translate-x-0' : 'lg:opacity-0 lg:-translate-x-4'}`}
          >
            <Card className="sticky top-24 z-30 rounded-xl border border-gray-200 shadow-lg bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Type */}
                <div>
                  <Label className="text-base font-medium">Service Type</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Treatment">Treatment</SelectItem>
                      <SelectItem value="Medicine">Medicine</SelectItem>
                      <SelectItem value="Test">Test</SelectItem>
                      <SelectItem value="Surgery">Surgery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <Label className="text-base font-medium">Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {/* Sindh */}
                      <SelectItem value="Karachi">Karachi (Sindh)</SelectItem>
                      <SelectItem value="Hyderabad">Hyderabad (Sindh)</SelectItem>
                      <SelectItem value="Sukkur">Sukkur (Sindh)</SelectItem>
                      <SelectItem value="Larkana">Larkana (Sindh)</SelectItem>
                      <SelectItem value="Nawabshah">Nawabshah (Sindh)</SelectItem>
                      <SelectItem value="Mirpur Khas">Mirpur Khas (Sindh)</SelectItem>
                      {/* Punjab */}
                      <SelectItem value="Lahore">Lahore (Punjab)</SelectItem>
                      <SelectItem value="Faisalabad">Faisalabad (Punjab)</SelectItem>
                      <SelectItem value="Rawalpindi">Rawalpindi (Punjab)</SelectItem>
                      <SelectItem value="Multan">Multan (Punjab)</SelectItem>
                      <SelectItem value="Gujranwala">Gujranwala (Punjab)</SelectItem>
                      <SelectItem value="Sialkot">Sialkot (Punjab)</SelectItem>
                      <SelectItem value="Bahawalpur">Bahawalpur (Punjab)</SelectItem>
                      <SelectItem value="Sargodha">Sargodha (Punjab)</SelectItem>
                      <SelectItem value="Gujrat">Gujrat (Punjab)</SelectItem>
                      <SelectItem value="Sheikhupura">Sheikhupura (Punjab)</SelectItem>
                      {/* Khyber Pakhtunkhwa */}
                      <SelectItem value="Peshawar">Peshawar (KPK)</SelectItem>
                      <SelectItem value="Mardan">Mardan (KPK)</SelectItem>
                      <SelectItem value="Lund Khwar">Lund Khwar (KPK)</SelectItem>
                      <SelectItem value="Shergarh">Shergarh (KPK)</SelectItem>
                      <SelectItem value="Abbottabad">Abbottabad (KPK)</SelectItem>
                      <SelectItem value="Swat">Swat/Mingora (KPK)</SelectItem>
                      <SelectItem value="Kohat">Kohat (KPK)</SelectItem>
                      <SelectItem value="Dera Ismail Khan">Dera Ismail Khan (KPK)</SelectItem>
                      <SelectItem value="Mansehra">Mansehra (KPK)</SelectItem>
                      <SelectItem value="Bannu">Bannu (KPK)</SelectItem>
                      {/* Balochistan */}
                      <SelectItem value="Quetta">Quetta (Balochistan)</SelectItem>
                      <SelectItem value="Gwadar">Gwadar (Balochistan)</SelectItem>
                      <SelectItem value="Khuzdar">Khuzdar (Balochistan)</SelectItem>
                      <SelectItem value="Turbat">Turbat (Balochistan)</SelectItem>
                      <SelectItem value="Chaman">Chaman (Balochistan)</SelectItem>
                      <SelectItem value="Sibi">Sibi (Balochistan)</SelectItem>
                      <SelectItem value="Zhob">Zhob (Balochistan)</SelectItem>
                      <SelectItem value="Hub">Hub (Balochistan)</SelectItem>
                      {/* Capital Territory */}
                      <SelectItem value="Islamabad">Islamabad (ICT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <Label className="text-base font-medium">Price Range</Label>
                  <div className="mt-4 px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={50000}
                      min={0}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>PKR {priceRange[0]}</span>
                      <span>PKR {priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                

                {/* Home Service */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="homeService"
                    checked={homeServiceOnly}
                    onCheckedChange={(checked) => setHomeServiceOnly(checked === true)}
                  />
                  <Label htmlFor="homeService" className="text-base">
                    Home service available
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className={`${isSidebarOpen ? 'lg:col-span-4' : 'lg:col-span-6'}`}>
            <div className="flex items-center justify-between">
              
              {selectedServices.length > 0 && (
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedServices.length} selected for comparison
                </Badge>
              )}
            </div>

            <div className={`grid gap-6 sm:grid-cols-2 ${isSidebarOpen ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
  {filteredServices.map((service) => {
    const isHighlighted =
      highlightedService &&
      service.name.toLowerCase() === highlightedService.toLowerCase();

    return (
      <Card
        key={service.id}
        className={`shadow-md hover:shadow-lg transition-shadow duration-200 rounded-xl border border-gray-200 bg-gray-50 ${
          isHighlighted ? "ring-2 ring-primary bg-primary/5" : ""
        }`}
      >
       <CardContent className="p-5">
  {/* Image */}
  <div className="w-full h-48 md:h-56 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden mb-4">
    {service.image ? (
      <img
        src={service.image}
        alt={service.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null; // prevent infinite loop
          target.style.display = 'none';
          const fallback = document.createElement('span');
          fallback.className = 'text-gray-400 text-4xl';
          fallback.textContent = getServiceEmoji(service.type);
          target.parentElement?.appendChild(fallback);
        }}
      />
    ) : (
      <span className="text-gray-400 text-4xl">{getServiceEmoji(service.type)}</span>
    )}
  </div>

  {/* Title and Provider */}
  <div className="flex justify-between items-start mb-2">
    <div>
      <h3 className="text-lg font-semibold flex items-center gap-2">
        {service.name}
        {service.isReal && (
          <Badge className="text-xs px-1.5 py-0.5 bg-green-50 text-green-600 border-green-100">
            Verified
          </Badge>
        )}
        {isHighlighted && (
          <Badge className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 border-blue-100">
            Selected
          </Badge>
        )}
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
        className="text-xs px-2 py-0.5 bg-rose-50 text-rose-600 border-rose-100"
      >
        {service.type}
      </Badge>
    </div>
  </div>

  {/* Description */}
  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
    {service.description}
  </p>

  {/* Rating Badge, Location, Home Service, WhatsApp */}
  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
    <RatingBadge 
      rating={service.rating} 
      totalRatings={(service as any).totalRatings}
      size="sm"
    />
    <div className="flex items-center gap-1 text-gray-500">
      <MapPin className="w-4 h-4" />
      <span>{service.location}</span>
    </div>
    {service.homeService && (
      <div className="flex items-center gap-1 text-green-600">
        <Home className="w-4 h-4" />
        <span>Home service</span>
      </div>
    )}
    {(service as any).providerPhone && (
      <ServiceWhatsAppButton 
        phoneNumber={(service as any).providerPhone}
        serviceName={service.name}
        providerName={service.provider}
        providerId={(service as any)._providerId}
      />
    )}
  </div>
    {/* Buttons */}
  <div className="flex flex-wrap gap-2">
    <Button 
      className="flex-1 min-w-[100px]"
      onClick={() => handleBookNow(service)}
    >
      <Clock className="w-4 h-4 mr-1" /> Book Now
    </Button>
    <Button
      onClick={() => {
        setCurrentMapService(service);
        setShowLocationMap(service.id);
      }}
      className="flex-1 min-w-[100px]"
    >
      <MapPin className="w-4 h-4 mr-1" /> Location
    </Button>
    <Button
      variant="secondary"
      onClick={() =>
        (window.location.href = `/service/${service.id}`)
      }
      className="flex-1 min-w-[100px]"
    >
      View Details
    </Button>
    {user && (user.role === 'patient' || mode === 'patient') && (user?.id !== (service as any)._providerId) && (
      <Button
        variant="outline"
        onClick={() => handleRateService(service)}
        className="flex-1 min-w-[100px]"
      >
        <Star className="w-4 h-4 mr-1" /> Rate
      </Button>
    )}
  </div>
</CardContent>
      </Card>
    );
  })}
</div>


            {filteredServices.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-muted-foreground mb-4">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-xl">No services found</p>
                    <p>Try adjusting your search criteria</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        {selectedServicesData.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Service Comparison</CardTitle>
              <CardDescription>
                Compare selected services side by side
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Service</th>
                      {selectedServicesData.map((service) => (
                        <th key={service.id} className="text-left p-4 min-w-48">
                          {service.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Provider</td>
                      {selectedServicesData.map((service) => (
                        <td key={service.id} className="p-4">{service.provider}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Price</td>
                      {selectedServicesData.map((service) => (
                        <td key={service.id} className="p-4 font-semibold text-primary">
                          {service.price === 0 ? 'Free' : `PKR ${service.price.toLocaleString()}`}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Rating</td>
                      {selectedServicesData.map((service) => (
                        <td key={service.id} className="p-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {service.rating}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Location</td>
                      {selectedServicesData.map((service) => (
                        <td key={service.id} className="p-4">
                          <div className="flex items-center gap-2">
                            {service.location}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={() => toggleLocationMap(service.id)}
                            >
                              <MapPin className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Home Service</td>
                      {selectedServicesData.map((service) => (
                        <td key={service.id} className="p-4">
                          {service.homeService ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              Not Available
                            </Badge>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Action</td>
                      {selectedServicesData.map((service) => (
                        <td key={service.id} className="p-4">
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleBookNow(service)}
                          >
                            Book Now
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Location Modal */}
      {showLocationMap && currentMapService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{currentMapService.name}</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowLocationMap(null)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Location</p>
                <p className="text-base">{currentMapService.location}</p>
              </div>
              
              {currentMapService.address && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Address</p>
                  <p className="text-base">{currentMapService.address}</p>
                </div>
              )}
              
              {currentMapService.googleMapLink && (
                <Button 
                  className="w-full mt-4"
                  onClick={() => window.open(currentMapService.googleMapLink, '_blank')}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Open in Google Maps
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Rating Modal */}
      {selectedRatingService && (
        <RatingModal
          isOpen={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          serviceId={selectedRatingService.id}
          serviceType={(selectedRatingService as any)._providerType as 'doctor' | 'clinic' | 'laboratory' | 'pharmacy'}
          serviceName={selectedRatingService.name}
          onRatingSubmitted={(newRatingData) => {
            setRatingModalOpen(false);
            if (selectedRatingService) {
              handleRatingSubmitted(selectedRatingService.id, newRatingData, (selectedRatingService as any)._providerType);
            }
            setSelectedRatingService(null);
          }}
        />
      )}
      <CompareTray />
    </div>
  );
};

export default SearchPage;