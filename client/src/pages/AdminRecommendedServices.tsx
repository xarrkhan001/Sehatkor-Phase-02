import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  StarOff,
  Search,
  Filter,
  ArrowLeft,
  Stethoscope,
  Building,
  FlaskConical,
  Pill,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";

interface Service {
  _id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  providerName: string;
  providerType: 'doctor' | 'clinic' | 'pharmacy' | 'laboratory';
  recommended: boolean;
  createdAt: string;
  category?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalServices: number;
  hasMore: boolean;
}

const AdminRecommendedServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [providerTypeFilter, setProviderTypeFilter] = useState("all");
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalServices: 0,
    hasMore: false
  });
  const [recommendedCount, setRecommendedCount] = useState({
    total: 0,
    byType: { doctor: 0, clinic: 0, pharmacy: 0, laboratory: 0 }
  });
  const { toast } = useToast();

  // Guard: redirect to /admin (gate) if not admin-authenticated
  useEffect(() => {
    const hasAdmin = localStorage.getItem('sehatkor_admin_auth');
    if (!hasAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const fetchServices = async (page = 1, search = "", providerType = "all") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(providerType !== "all" && { providerType })
      });

      const response = await fetch(`http://localhost:4000/api/admin/services?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      setServices(data.services);
      setPagination(data.pagination);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch services",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedCount = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/recommended-services-count', {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendedCount(data);
      }
    } catch (error) {
      console.error('Failed to fetch recommended count:', error);
    }
  };

  const toggleRecommendation = async (serviceId: string, providerType: string, currentRecommended: boolean) => {
    try {
      const response = await fetch(`http://localhost:4000/api/admin/services/${serviceId}/${providerType}/recommend`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recommended: !currentRecommended })
      });

      if (!response.ok) {
        throw new Error('Failed to update recommendation');
      }

      const data = await response.json();
      
      // Update the service in the local state
      setServices(prev => prev.map(service => 
        service._id === serviceId 
          ? { ...service, recommended: !currentRecommended }
          : service
      ));

      // Refresh recommended count
      fetchRecommendedCount();

      toast({
        title: "Success",
        description: data.message,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update recommendation status",
        variant: "destructive"
      });
    }
  };

  const handleSearch = () => {
    fetchServices(1, searchTerm, providerTypeFilter);
  };

  const handlePageChange = (newPage: number) => {
    fetchServices(newPage, searchTerm, providerTypeFilter);
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'doctor':
        return <Stethoscope className="w-4 h-4" />;
      case 'clinic':
        return <Building className="w-4 h-4" />;
      case 'laboratory':
        return <FlaskConical className="w-4 h-4" />;
      case 'pharmacy':
        return <Pill className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getProviderColor = (type: string) => {
    switch (type) {
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'clinic':
        return 'bg-green-100 text-green-800';
      case 'laboratory':
        return 'bg-purple-100 text-purple-800';
      case 'pharmacy':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    fetchServices();
    fetchRecommendedCount();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/admin'); }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Recommended Services Management</h1>
            <p className="text-muted-foreground">
              Mark services as recommended by SehatKor to highlight them on the public website
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {/* Total */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Recommended</p>
                  <p className="text-2xl font-bold text-yellow-600">{recommendedCount.total}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          {/* Doctors */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Doctors</p>
                  <p className="text-2xl font-bold text-blue-600">{recommendedCount.byType.doctor}</p>
                </div>
                <Stethoscope className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          {/* Clinics */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clinics</p>
                  <p className="text-2xl font-bold text-green-600">{recommendedCount.byType.clinic}</p>
                </div>
                <Building className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          {/* Labs */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Labs</p>
                  <p className="text-2xl font-bold text-purple-600">{recommendedCount.byType.laboratory}</p>
                </div>
                <FlaskConical className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          {/* Pharmacies */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pharmacies</p>
                  <p className="text-2xl font-bold text-orange-600">{recommendedCount.byType.pharmacy}</p>
                </div>
                <Pill className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search services or providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Select value={providerTypeFilter} onValueChange={setProviderTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Provider Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="doctor">Doctors</SelectItem>
                  <SelectItem value="clinic">Clinics</SelectItem>
                  <SelectItem value="laboratory">Laboratories</SelectItem>
                  <SelectItem value="pharmacy">Pharmacies</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Services Table */}
        <Card>
          <CardHeader>
            <CardTitle>Services ({pagination.totalServices})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading services...</span>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {service.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{service.providerName}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getProviderColor(service.providerType)}>
                            <div className="flex items-center gap-1">
                              {getProviderIcon(service.providerType)}
                              {service.providerType.charAt(0).toUpperCase() + service.providerType.slice(1)}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">PKR {service.price.toLocaleString()}</p>
                        </TableCell>
                        <TableCell>
                          {service.recommended ? (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Recommended
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600">
                              <StarOff className="w-3 h-3 mr-1" />
                              Not Recommended
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={service.recommended ? "outline" : "default"}
                            onClick={() => toggleRecommendation(service._id, service.providerType, service.recommended)}
                            className={service.recommended 
                              ? "text-red-600 border-red-200 hover:bg-red-50" 
                              : "bg-yellow-500 hover:bg-yellow-600 text-white"
                            }
                          >
                            {service.recommended ? (
                              <>
                                <XCircle className="w-4 h-4 mr-1" />
                                Remove
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Recommend
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-muted-foreground">
                      Page {pagination.currentPage} of {pagination.totalPages} 
                      ({pagination.totalServices} total services)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRecommendedServices;
