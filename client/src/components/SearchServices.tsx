import { useState, useRef, useEffect } from "react";
import { SearchIcon, MapPin, Star, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ServiceManager, { Service } from "@/lib/serviceManager";

interface SearchService {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  providers: number;
  avgRating: number;
  image?: string;
}

const fallbackServices: SearchService[] = [
  { id: "1", name: "General Physician", category: "Doctor", description: "Primary healthcare consultation", icon: "🩺", providers: 450, avgRating: 4.5 },
  { id: "2", name: "Cardiologist", category: "Doctor", description: "Heart specialist", icon: "❤️", providers: 89, avgRating: 4.7 },
  { id: "3", name: "Dermatologist", category: "Doctor", description: "Skin specialist", icon: "🧴", providers: 67, avgRating: 4.6 },
  { id: "4", name: "Pediatrician", category: "Doctor", description: "Child specialist", icon: "👶", providers: 123, avgRating: 4.8 },
  { id: "16", name: "Blood Test Complete", category: "Lab Test", description: "Complete blood count and analysis", icon: "🩸", providers: 234, avgRating: 4.3 },
  { id: "17", name: "X-Ray", category: "Lab Test", description: "Digital X-ray imaging", icon: "📷", providers: 189, avgRating: 4.4 },
  { id: "18", name: "MRI Scan", category: "Lab Test", description: "Magnetic resonance imaging", icon: "🔍", providers: 45, avgRating: 4.6 },
  { id: "30", name: "Panadol", category: "Medicine", description: "Pain relief and fever reducer", icon: "💊", providers: 567, avgRating: 4.2 },
  { id: "31", name: "Antibiotics", category: "Medicine", description: "Infection treatment medicines", icon: "🧬", providers: 445, avgRating: 4.4 },
  { id: "42", name: "Appendix Surgery", category: "Surgery", description: "Appendectomy procedure", icon: "🏥", providers: 23, avgRating: 4.8 },
];

const SearchServices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [realServices, setRealServices] = useState<SearchService[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const categories = ["All Categories", "Doctor", "Lab Test", "Medicine", "Surgery"];

  useEffect(() => {
    const loadServices = () => {
      const allServices = (ServiceManager as any).getAllServicesWithVariants
        ? (ServiceManager as any).getAllServicesWithVariants()
        : ServiceManager.getAllServices();
      const searchServices: SearchService[] = allServices.map(service => ({
        id: service.id,
        name: service.name,
        category: mapServiceToSearchCategory(service),
        description: service.description,
        icon: getServiceIcon(service),
        providers: 1,
        avgRating: 4.5,
        image: service.image
      }));
      setRealServices(searchServices);
    };

    loadServices();
    window.addEventListener('storage', loadServices);
    return () => window.removeEventListener('storage', loadServices);
  }, []);

  const mapServiceToSearchCategory = (service: Service): string => {
    switch (service.providerType) {
      case 'doctor':
        return 'Doctor';
      case 'laboratory':
        return 'Lab Test';
      case 'pharmacy':
        return 'Medicine';
      case 'clinic':
        return 'Surgery';
      default:
        return 'Other';
    }
  };

  const getServiceIcon = (service: Service): string => {
    switch (service.providerType) {
      case 'doctor':
        return '🩺';
      case 'laboratory':
        return '🔬';
      case 'pharmacy':
        return '💊';
      case 'clinic':
        return '🏥';
      default:
        return '⚕️';
    }
  };

  const allServices = [...realServices, ...fallbackServices];

  const filteredServices = allServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleServiceClick = (service: SearchService) => {
    setSearchTerm(service.name);
    setIsOpen(false);
    window.location.href = `/search?service=${encodeURIComponent(service.name)}`;
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <div className="relative w-full max-w-[1100px] mx-auto z-[100000]" ref={searchRef}>
  {/* Search Bar */}
  <Card className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-md shadow-lg border border-white/20 relative z-[100000]">
    <div className="flex flex-row lg:flex-row gap-1.5 sm:gap-0 sm:items-center sm:space-x-1.5">
      {/* Category Dropdown */}
      <div className="relative hidden sm:block">
        <Button
          variant="ghost"
          className="h-9 px-3 text-gray-600 hover:text-gray-900 border-r border-gray-200 text-sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedCategory}
          <ChevronDown className="w-4 h-4 ml-1.5" />
        </Button>
      </div>

      {/* Search Input */}
      <div className="flex-1 relative">
        <Input
          type="text"
          placeholder="Search doctors, medicines, lab tests..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="h-9 sm:h-10 pl-3 pr-9 border border-gray-200 sm:border-0 focus:ring-0 text-sm sm:text-base bg-transparent rounded-md sm:rounded-none"
        />
        <MapPin className="absolute right-2 sm:right-14 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {/* Search Button */}
      <Button 
        onClick={handleSearch}
        className="h-9 sm:h-10 px-3 sm:px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-md transition-all duration-300 text-sm"
      >
        <SearchIcon className="w-4 h-4 sm:mr-1" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    </div>
  </Card>

  {/* Dropdown Results */}
  {isOpen && (searchTerm || selectedCategory !== "All Categories") && (
    <Card className="absolute top-full left-0 right-0 mt-1.5 bg-white shadow-xl border border-gray-200 rounded-lg max-h-80 overflow-y-auto z-[100000]">
      <div className="max-h-72 overflow-y-auto">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className="p-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0 text-sm"
            >
              <div className="flex items-center space-x-2.5">
                {service.image ? (
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-9 h-9 rounded-md object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 bg-gray-100 rounded-md flex items-center justify-center text-base">
                    {service.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-xs truncate">{service.name}</h4>
                  <p className="text-xs text-gray-600 truncate">{service.description}</p>
                  <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-gray-500">
                    <span className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 mr-0.5" />
                      {service.avgRating}
                    </span>
                    <span>{service.providers} providers</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500 text-sm">
            <SearchIcon className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No services found for "{searchTerm}"</p>
          </div>
        )}
      </div>
    </Card>
  )}
</div>

  );
};

export default SearchServices;

