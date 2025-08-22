import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ImageUpload from "@/components/ui/image-upload";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ServiceManager from "@/lib/serviceManager";
import { uploadFile } from "@/lib/chatApi";
import { listServices as apiList, createService as apiCreate, updateService as apiUpdate, deleteService as apiDelete } from "@/lib/clinicApi";
import { 
  Building, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  LogOut,
  Bell,
  Edit,
  Star,
  FileText,
  Stethoscope,
  Bed,
  Activity,
  Plus,
  Trash2,
  DollarSign,
  Phone
} from "lucide-react";

const ClinicDashboard = () => {
  const { user, logout } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [bookingPrices, setBookingPrices] = useState<Record<string, number>>({});
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [scheduleDetails, setScheduleDetails] = useState({
    scheduledTime: '',
    communicationChannel: 'SehatKor Chat',
  });
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [clinicType, setClinicType] = useState('');
  const [serviceImage, setServiceImage] = useState('');
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);

  const [serviceForm, setServiceForm] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    department: '',
    googleMapLink: '',
    city: '',
    detailAddress: ''
  });

  const clinicTypes = [
    'General Hospital', 'Specialized Hospital', 'Eye Hospital', 
    'Heart Hospital', 'Children Hospital', 'Emergency Center'
  ];

  const syncLocalFromDocs = (docs: any[]) => {
    if (!user?.id) return;
    const all = ServiceManager.getAllServices();
    const filtered = all.filter((s: any) => !(s.providerType === 'clinic' && s.providerId === user.id));
    const mapped = docs.map((d: any) => ({
      id: String(d._id),
      name: d.name,
      description: d.description || '',
      price: d.price || 0,
      category: d.category || d.department || 'Treatment',
      providerType: 'clinic' as const,
      providerId: user.id,
      providerName: d.providerName || (user?.name || 'Clinic'),
      image: d.imageUrl,
      duration: d.duration,
      createdAt: d.createdAt || new Date().toISOString(),
      updatedAt: d.updatedAt || d.createdAt || new Date().toISOString(),
    }));
    const next = [...filtered, ...mapped];
    localStorage.setItem('sehatkor_services', JSON.stringify(next));
    window.dispatchEvent(new StorageEvent('storage', { key: 'sehatkor_services' }));
  };

  const reloadServices = async () => {
    if (!user?.id) return;
    try {
      const docs = await apiList();
      setServices(docs);
      syncLocalFromDocs(docs);
    } catch {
      const fallback = ServiceManager.getServicesByProvider(user.id).filter((s: any) => s.providerType === 'clinic');
      setServices(fallback as any);
    }
  };

  const fetchBookings = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/bookings/provider/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        toast.error('Failed to fetch bookings.');
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('An error occurred while fetching bookings.');
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });
      if (response.ok) {
        setBookings(prev => prev.filter(b => b._id !== bookingId));
        toast.success('Booking deleted successfully');
      } else {
        toast.error('Failed to delete booking');
      }
    } catch (error) {
      toast.error('Failed to delete booking');
    }
  };

  const deleteAllBookings = async () => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });
      if (response.ok) {
        setBookings([]);
        toast.success('All bookings deleted successfully');
      } else {
        toast.error('Failed to delete all bookings');
      }
    } catch (error) {
      toast.error('Failed to delete all bookings');
    }
  };

  const scheduleBooking = async () => {
    if (!selectedBooking || !scheduleDetails.scheduledTime) {
      toast.error("Please select a time for the appointment.");
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${selectedBooking._id}/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
        body: JSON.stringify(scheduleDetails),
      });

      if (response.ok) {
        const updatedBooking = await response.json();
        setBookings(prev => prev.map(b => b._id === selectedBooking._id ? updatedBooking : b));
        toast.success("Booking scheduled successfully");
        setIsScheduling(false);
        setSelectedBooking(null);
      } else {
        throw new Error('Failed to schedule booking');
      }
    } catch (error) {
      toast.error("Failed to schedule booking");
    }
  };

  const completeBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });

      if (response.ok) {
        const updatedBooking = await response.json();
        setBookings(prev => prev.map(b => b._id === bookingId ? updatedBooking : b));
        toast.success("Booking marked as complete");
      } else {
        throw new Error('Failed to complete booking');
      }
    } catch (error) {
      toast.error("Failed to complete booking");
    }
  };

  useEffect(() => {
    if (user?.id) {
      reloadServices();
      fetchBookings();
      const savedType = localStorage.getItem(`clinic_type_${user.id}`);
      if (savedType) setClinicType(savedType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const saveServices = (newServices: any[]) => setServices(newServices);

  // Normalize and resolve booking prices like PatientDashboard
  const getBookingPrice = (booking: any): number => {
    const raw = booking?.amount ?? booking?.price ?? booking?.servicePrice ?? booking?.service?.price ?? booking?.serviceData?.price ?? 0;
    const num = Number(raw);
    return Number.isFinite(num) ? num : 0;
  };

  const resolveBookingPrice = (booking: any): number => {
    const p = getBookingPrice(booking);
    return p > 0 ? p : (bookingPrices[booking._id] ?? 0);
  };

  useEffect(() => {
    const loadMissingPrices = async () => {
      const updates: Record<string, number> = {};
      for (const b of bookings) {
        const localPrice = getBookingPrice(b);
        if (localPrice > 0) continue;
        if (!b?.serviceId || !b?.providerType) continue;
        const normalizeProviderType = (t: string): 'clinic' | 'doctor' | 'laboratory' | 'pharmacy' => {
          const low = (t || '').toString().toLowerCase();
          if (low === 'lab' || low === 'laboratory') return 'laboratory';
          if (low === 'hospital' || low === 'hospitals' || low === 'clinic') return 'clinic';
          if (low === 'doctor' || low === 'doctors') return 'doctor';
          if (low === 'pharmacy' || low === 'pharmacies') return 'pharmacy';
          return 'clinic';
        };
        try {
          const svc = await ServiceManager.fetchServiceById(String(b.serviceId), normalizeProviderType(b.providerType));
          if (svc?.price != null) {
            updates[b._id] = Number(svc.price) || 0;
          }
        } catch {}
      }
      if (Object.keys(updates).length) {
        setBookingPrices(prev => ({ ...prev, ...updates }));
      }
    };
    if (bookings?.length) {
      loadMissingPrices();
    }
  }, [bookings]);

  const handleAddService = async () => {
    if (!serviceForm.name) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsAddingService(true);
    const parsedPrice = serviceForm.price ? parseFloat(serviceForm.price) : 0;

    try {
      let imageUrl: string | undefined = undefined;
      let imagePublicId: string | undefined = undefined;
      if (serviceImageFile) {
        setIsUploadingImage(true);
        try {
          const up = await uploadFile(serviceImageFile);
          imageUrl = up?.url;
          imagePublicId = up?.public_id;
        } catch (e) {
          toast.warning("Image upload failed, adding service without image");
        } finally {
          setIsUploadingImage(false);
        }
      }

      if (editingService) {
        const id = (editingService as any)._id || (editingService as any).id;
        await apiUpdate(String(id), {
          name: serviceForm.name,
          description: serviceForm.description,
          price: parsedPrice,
          department: serviceForm.department || undefined,
          category: serviceForm.department || 'Treatment',
          duration: serviceForm.duration || undefined,
          imageUrl,
          imagePublicId,
          googleMapLink: serviceForm.googleMapLink,
          city: serviceForm.city,
          detailAddress: serviceForm.detailAddress,
          providerName: user?.name || 'Clinic',
        });
        toast.success("Service updated successfully");
      } else {
        await apiCreate({
          name: serviceForm.name,
          description: serviceForm.description,
          price: parsedPrice,
          department: serviceForm.department || undefined,
          category: serviceForm.department || 'Treatment',
          duration: serviceForm.duration || undefined,
          imageUrl,
          imagePublicId,
          googleMapLink: serviceForm.googleMapLink,
          city: serviceForm.city,
          detailAddress: serviceForm.detailAddress,
          providerName: user?.name || 'Clinic',
        });
        toast.success("Service added successfully");
      }

      await reloadServices();
      setServiceForm({
        name: '',
        price: '',
        duration: '',
        description: '',
        department: '',
        googleMapLink: '',
        city: '',
        detailAddress: ''
      });
      setServiceImage('');
      setServiceImageFile(null);
      setEditingService(null);
      setIsAddServiceOpen(false);
    } catch (error) {
      toast.error(editingService ? "Failed to update service" : "Failed to add service");
    } finally {
      setIsAddingService(false);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    const updatedServices = services.filter(service => service.id !== serviceId);
    saveServices(updatedServices);
    toast.success("Service deleted successfully");
  };

  const handleTypeChange = (type: string) => {
    setClinicType(type);
    localStorage.setItem(`clinic_type_${user?.id}`, type);
    toast.success("Clinic type updated successfully");
  };

  return (
    <div className="min-h-screen  p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{user?.name} Clinic</h1>
            <p className="text-muted-foreground">
              Welcome to your clinic management dashboard
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 mt-4 md:mt-0 w-full md:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm" onClick={logout} className="w-full sm:w-auto">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Verification Banner */}
        {!user?.isVerified && (
          <Card className="mb-8 border-warning bg-warning/5">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-warning mb-1">Clinic License Verification Pending</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your clinic license is being verified. Upload documents to complete verification.
                  </p>
                  <Button size="sm" className="bg-warning hover:bg-warning/90">
                    Upload Documents
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-healthcare">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Occupied Beds</p>
                  <p className="text-2xl font-bold text-warning">24/30</p>
                </div>
                <Bed className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Doctors</p>
                  <p className="text-2xl font-bold text-success">12</p>
                </div>
                <Stethoscope className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">PKR 2.4M</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="services">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
              </TabsList>
              <TabsContent value="services">
                {/* Services Management */}
                <Card className="card-healthcare">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Clinic Services</CardTitle>
                        <CardDescription>Manage your clinic services and pricing</CardDescription>
                      </div>
                      <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Service
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                            <DialogDescription>
                              {editingService ? 'Update the service details' : 'Add a new service to your clinic'}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="serviceName">Service Name *</Label>
                              <Input
                                id="serviceName"
                                value={serviceForm.name}
                                onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                                placeholder="e.g., X-Ray Scan"
                              />
                            </div>
                            
                            <div>
                              <Label>Service Image</Label>
                              <ImageUpload
                                onImageSelect={(file, preview) => { setServiceImageFile(file); setServiceImage(preview); }}
                                onImageRemove={() => { setServiceImageFile(null); setServiceImage(''); }}
                                currentImage={serviceImage}
                                placeholder="Upload service image"
                                className="max-w-xs"
                              />
                              {isUploadingImage && (
                                <p className="text-xs text-muted-foreground mt-1">Uploading image...</p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="servicePrice">Price (PKR) *</Label>
                                <Input
                                  id="servicePrice"
                                  type="number"
                                  value={serviceForm.price}
                                  onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                                  placeholder="e.g., 3000"
                                />
                              </div>
                              <div>
                                <Label htmlFor="serviceDuration">Duration (minutes)</Label>
                                <Input
                                  id="serviceDuration"
                                  value={serviceForm.duration}
                                  onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}
                                  placeholder="e.g., 45"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="serviceDepartment">Department</Label>
                              <Input
                                id="serviceDepartment"
                                value={serviceForm.department}
                                onChange={(e) => setServiceForm({...serviceForm, department: e.target.value})}
                                placeholder="e.g., Cardiology"
                              />
                            </div>
                            <div>
                              <Label htmlFor="serviceDescription">Description</Label>
                              <Textarea
                                id="serviceDescription"
                                value={serviceForm.description}
                                onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                                placeholder="Brief description of the service"
                              />
                            </div>
                            
                            {/* Location Fields */}
                            <div className="space-y-3 border-t pt-3">
                              <h4 className="font-medium text-sm">Location Information</h4>
                              <div>
                                <Label htmlFor="serviceCity">City</Label>
                                <Input
                                  id="serviceCity"
                                  value={serviceForm.city}
                                  onChange={(e) => setServiceForm({...serviceForm, city: e.target.value})}
                                  placeholder="e.g., Karachi"
                                />
                              </div>
                              <div>
                                <Label htmlFor="serviceAddress">Detailed Address</Label>
                                <Textarea
                                  id="serviceAddress"
                                  value={serviceForm.detailAddress}
                                  onChange={(e) => setServiceForm({...serviceForm, detailAddress: e.target.value})}
                                  placeholder="Complete address with landmarks"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <Label htmlFor="serviceGoogleMap">Google Maps Link (Optional)</Label>
                                <Input
                                  id="serviceGoogleMap"
                                  value={serviceForm.googleMapLink}
                                  onChange={(e) => setServiceForm({...serviceForm, googleMapLink: e.target.value})}
                                  placeholder="https://maps.google.com/..."
                                />
                              </div>
                            </div>
                            <Button onClick={handleAddService} className="w-full" disabled={isAddingService || isUploadingImage}>
                              {isAddingService ? (editingService ? 'Updating Service...' : 'Adding Service...') : (editingService ? 'Update Service' : 'Add Service')}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground py-4">Services added here will appear in search, services, and hospitals listings.</p>
                    {services.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">No services added yet.</div>
                    ) : (
                      <>
                        {/* Mobile cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                          {services.map((m: any) => {
                            const iid = m._id || m.id;
                            return (
                              <div key={String(iid)} className="border rounded-lg p-4 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                  {m.imageUrl || m.image ? (
                                    <img src={m.imageUrl || m.image} alt={m.name} className="w-12 h-12 rounded-lg object-cover" />
                                  ) : (
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">🏥</div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-semibold truncate">{m.name}</p>
                                    {m.description && (
                                      <p className="text-xs text-muted-foreground truncate">{m.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                  <Badge variant="outline">{m.department || m.category || '-'}</Badge>
                                  <span className="font-medium">PKR {m.price?.toLocaleString?.() ?? m.price ?? 0}</span>
                                  <span className="text-muted-foreground">{m.duration ? `${m.duration} min` : '-'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                                    setEditingService(m);
                                    setServiceForm({
                                      name: m.name || '',
                                      price: m.price != null ? String(m.price) : '',
                                      duration: m.duration || '',
                                      description: m.description || '',
                                      department: m.department || m.category || '',
                                      googleMapLink: m.googleMapLink || '',
                                      city: m.city || '',
                                      detailAddress: m.detailAddress || ''
                                    });
                                    setServiceImage(m.imageUrl || m.image || '');
                                    setIsAddServiceOpen(true);
                                  }}>
                                    <Edit className="w-4 h-4 mr-1" /> Edit
                                  </Button>
                                  <Button size="sm" variant="destructive" className="flex-1" onClick={async () => {
                                    try { await apiDelete(String(iid)); await reloadServices(); toast.success('Service deleted'); } catch (e: any) { toast.error(e?.message || 'Failed to delete'); }
                                  }}>
                                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-20">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Price (PKR)</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {services.map((m: any) => {
                                const iid = m._id || m.id;
                                return (
                                  <TableRow key={String(iid)}>
                                    <TableCell>
                                      {m.imageUrl || m.image ? (
                                        <img src={m.imageUrl || m.image} alt={m.name} className="w-14 h-14 object-cover rounded" />
                                      ) : (
                                        <div className="w-14 h-14 bg-muted rounded flex items-center justify-center">🏥</div>
                                      )}
                                    </TableCell>
                                    <TableCell className="font-medium">{m.name}</TableCell>
                                    <TableCell>{m.department || m.category || '-'}</TableCell>
                                    <TableCell>{m.price ?? 0}</TableCell>
                                    <TableCell>{m.duration ?? '-'}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                      <Button size="sm" variant="outline" onClick={() => {
                                        setEditingService(m);
                                        setServiceForm({
                                          name: m.name || '',
                                          price: m.price != null ? String(m.price) : '',
                                          duration: m.duration || '',
                                          description: m.description || '',
                                          department: m.department || m.category || '',
                                          googleMapLink: m.googleMapLink || '',
                                          city: m.city || '',
                                          detailAddress: m.detailAddress || ''
                                        });
                                        setServiceImage(m.imageUrl || m.image || '');
                                        setIsAddServiceOpen(true);
                                      }}>
                                        <Edit className="w-4 h-4 mr-1" /> Edit
                                      </Button>
                                      <Button size="sm" variant="destructive" onClick={async () => {
                                        try { await apiDelete(String(iid)); await reloadServices(); toast.success('Service deleted'); } catch (e: any) { toast.error(e?.message || 'Failed to delete'); }
                                      }}>
                                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="bookings">
                <Card className="card-healthcare">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <CardTitle>Patient Bookings</CardTitle>
                        <CardDescription>Bookings from patients for your services</CardDescription>
                      </div>
                      {bookings.length > 0 && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={deleteAllBookings}
                          className="shrink-0 self-start sm:self-auto w-full sm:w-auto"
                        >
                          Delete All
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingBookings ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-2">Loading bookings...</p>
                      </div>
                    ) : bookings.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No bookings yet</p>
                        <p className="text-sm text-muted-foreground">Patient bookings will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <div key={booking._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium">{booking.patientName}</h4>
                              <p className="text-sm text-muted-foreground">{booking.serviceName}</p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Booked: {new Date(booking.createdAt).toLocaleDateString()}</span>
                                </div>
                                {booking.status === 'Scheduled' && booking.scheduledTime && (
                                  <div className="flex items-center space-x-1 text-primary font-semibold">
                                    <Clock className="w-4 h-4" />
                                    <span>Scheduled: {new Date(booking.scheduledTime).toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="sm:text-right flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium mt-1">
                                {resolveBookingPrice(booking) === 0
                                  ? 'Free'
                                  : `PKR ${resolveBookingPrice(booking).toLocaleString()}`}
                              </p>
                              <Badge
                                variant={booking.status === "Completed" ? "default" : "secondary"}
                                className={booking.status === "Completed" ? "bg-green-600" : booking.status === 'Scheduled' ? 'bg-blue-500' : 'bg-yellow-500'}
                              >
                                {booking.status}
                              </Badge>
                              {booking.status === 'Confirmed' && (
                                <Button size="sm" className="w-full sm:w-auto" onClick={() => { setSelectedBooking(booking); setIsScheduling(true); }}>Schedule</Button>
                              )}
                              {booking.status === 'Scheduled' && (
                                <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => completeBooking(booking._id)}>Mark as Complete</Button>
                              )}
                              {booking.status === 'Completed' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteBooking(booking._id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Dialog open={isScheduling} onOpenChange={setIsScheduling}>
              <DialogContent className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Schedule Appointment</DialogTitle>
                  <DialogDescription>
                    Set a time and communication channel for '{selectedBooking?.serviceName}' with {selectedBooking?.patientName}.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduleTime">Appointment Time</Label>
                    <Input 
                      id="scheduleTime"
                      type="datetime-local" 
                      value={scheduleDetails.scheduledTime}
                      onChange={(e) => setScheduleDetails(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="communicationChannel">Communication Channel</Label>
                    <Select 
                      value={scheduleDetails.communicationChannel}
                      onValueChange={(value) => setScheduleDetails(prev => ({ ...prev, communicationChannel: value }))}
                    >
                      <SelectTrigger id="communicationChannel">
                        <SelectValue placeholder="Select a channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SehatKor Chat">SehatKor Chat</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Phone Call">Phone Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsScheduling(false)}>Cancel</Button>
                  <Button onClick={scheduleBooking}>Confirm Schedule</Button>
                </div>
              </DialogContent>
            </Dialog>

          </div>

          {/* Profile Sidebar */}
          <div className="space-y-6">
            <Card className="card-healthcare">
              <CardHeader>
                <CardTitle>Clinic Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{user?.name} Clinic</h3>
                  <Badge variant="outline" className="capitalize">{user?.role}</Badge>
                  {clinicType && (
                    <Badge variant="secondary" className="mt-2">{clinicType}</Badge>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">{user?.email}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="clinicType">Clinic Type</Label>
                    <Select value={clinicType} onValueChange={handleTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select clinic type" />
                      </SelectTrigger>
                      <SelectContent>
                        {clinicTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Clinic Info
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-healthcare">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Schedules
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Reports
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Staff Management
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicDashboard;