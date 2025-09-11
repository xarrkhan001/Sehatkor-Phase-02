import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import ServiceTypeBadge from "@/components/ServiceTypeBadge";
import ImageUpload from "@/components/ui/image-upload";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ServiceManager from "@/lib/serviceManager";
import { uploadFile } from "@/lib/chatApi";
import { listServices as apiList, createService as apiCreate, updateService as apiUpdate, deleteService as apiDelete } from "@/lib/clinicApi";
import { 
  Building2, 
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
  Heart,
  Shield,
  User
} from "lucide-react";

const HospitalDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<any[]>([]);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [hospitalType, setHospitalType] = useState('');
  const [serviceImage, setServiceImage] = useState('');
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [scheduleDetails, setScheduleDetails] = useState({
    scheduledTime: '',
    communicationChannel: 'SehatKor Chat',
  });

  const [serviceForm, setServiceForm] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    category: '',
    department: '',
    city: '',
    detailAddress: ''
  });

  // Inline validation limits and errors
  const LIMITS = {
    name: 32,
    department: 26,
    description: 60,
    city: 20,
    address: 60,
  } as const;

  const [formErrors, setFormErrors] = useState<{ name?: string; department?: string; description?: string; city?: string; detailAddress?: string }>({});

  const validateField = (key: keyof typeof LIMITS, value: string) => {
    const v = (value || '').trim();
    const limit = LIMITS[key];
    const overBy = Math.max(0, v.length - limit);
    setFormErrors(prev => ({ ...prev, [key === 'address' ? 'detailAddress' : key]: overBy > 0 ? `Allowed ${limit} characters. You are over by ${overBy}.` : undefined }));
  };

  const validateLengths = (): boolean => {
    const trim = (s?: string) => (s || '').trim();
    const name = trim(serviceForm.name);
    const department = trim(serviceForm.department);
    const description = trim(serviceForm.description);
    const city = trim(serviceForm.city);
    const addr = trim(serviceForm.detailAddress);
    if (name.length > LIMITS.name) { toast({ title: 'Validation', description: `Service Name must be at most ${LIMITS.name} characters.`, variant: 'destructive' }); return false; }
    if (department.length > LIMITS.department) { toast({ title: 'Validation', description: `Department must be at most ${LIMITS.department} characters.`, variant: 'destructive' }); return false; }
    if (description.length > LIMITS.description) { toast({ title: 'Validation', description: `Description must be at most ${LIMITS.description} characters.`, variant: 'destructive' }); return false; }
    if (city.length > LIMITS.city) { toast({ title: 'Validation', description: `City must be at most ${LIMITS.city} characters.`, variant: 'destructive' }); return false; }
    if (addr.length > LIMITS.address) { toast({ title: 'Validation', description: `Detailed Address must be at most ${LIMITS.address} characters.`, variant: 'destructive' }); return false; }
    return true;
  };

  const hospitalTypes = [
    'General Hospital', 'Specialized Hospital', 'Teaching Hospital',
    'Children Hospital', 'Cardiac Hospital', 'Cancer Hospital',
    'Emergency Hospital', 'Rehabilitation Center', 'Mental Health Hospital'
  ];

  const hospitalDepartments = [
    'Emergency', 'Cardiology', 'Neurology', 'Orthopedics', 
    'Oncology', 'Pediatrics', 'Surgery', 'ICU', 'Radiology'
  ];

  // Hospital/Clinic service categories (aligned with ClinicDashboard, excluding lab/imaging/cardiac diagnostics per user request)
  const hospitalCategories = [
    'Consultation (OPD)',
    'Emergency Care',
    'Follow-up Visit',
    'Diagnosis/Assessment',
    'Minor Procedures (OPD)',
    'Surgery (Daycare)',
    'Surgery (Inpatient)',
    'Maternity & Obstetrics',
    'Pediatrics',
    'Physiotherapy & Rehabilitation',
    'Dental Care',
    'Mental Health & Counseling',
    'Vaccination & Immunization',
    'Telemedicine',
    'Home Visit / Home Care',
    'Wound Care & Dressings',
    'Endoscopy/Scopes',
    'Blood Bank',
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
      providerName: d.providerName || (user?.name || 'Hospital'),
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
        toast({ title: 'Error', description: 'Failed to fetch bookings', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred while fetching bookings', variant: 'destructive' });
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
        toast({ title: 'Success', description: 'Booking deleted successfully' });
      } else {
        toast({ title: 'Error', description: 'Failed to delete booking', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete booking', variant: 'destructive' });
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
        toast({ title: 'Success', description: 'All bookings deleted successfully' });
      } else {
        toast({ title: 'Error', description: 'Failed to delete all bookings', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete all bookings', variant: 'destructive' });
    }
  };

  const scheduleBooking = async () => {
    if (!selectedBooking || !scheduleDetails.scheduledTime) {
      toast({ title: 'Error', description: 'Please select a time for the appointment', variant: 'destructive' });
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
        const updated = await response.json();
        setBookings(prev => prev.map(b => b._id === selectedBooking._id ? updated : b));
        toast({ title: 'Success', description: 'Booking scheduled successfully' });
        setIsScheduling(false);
        setSelectedBooking(null);
      } else {
        throw new Error('Failed');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to schedule booking', variant: 'destructive' });
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
        const updated = await response.json();
        setBookings(prev => prev.map(b => b._id === bookingId ? updated : b));
        toast({ title: 'Success', description: 'Booking marked as complete' });
      } else {
        throw new Error('Failed');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to complete booking', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (user?.id) {
      reloadServices();
      fetchBookings();
      const savedType = localStorage.getItem(`hospital_type_${user?.id}`);
      if (savedType) setHospitalType(savedType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAddService = async () => {
    if (!validateLengths()) return;
    if (!serviceForm.name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const parsedPrice = serviceForm.price ? parseFloat(serviceForm.price) : 0;

    try {
      let imageUrl: string | undefined;
      let imagePublicId: string | undefined;
      if (serviceImageFile) {
        setIsUploadingImage(true);
        try {
          const up = await uploadFile(serviceImageFile);
          imageUrl = up?.url; imagePublicId = up?.public_id;
        } finally { setIsUploadingImage(false); }
      }

      const created = await apiCreate({
        name: serviceForm.name,
        description: serviceForm.description,
        price: parsedPrice,
        department: serviceForm.department || undefined,
        category: serviceForm.category || serviceForm.department || 'Treatment',
        duration: serviceForm.duration || undefined,
        imageUrl,
        imagePublicId,
        city: serviceForm.city,
        detailAddress: serviceForm.detailAddress,
        providerName: user?.name || 'Hospital',
      });
      await reloadServices();
      setServiceForm({
        name: '',
        price: '',
        duration: '',
        description: '',
        category: '',
        department: '',
        city: '',
        detailAddress: ''
      });
      setServiceImage(''); setServiceImageFile(null);
      setIsAddServiceOpen(false);
      toast({
        title: "Success",
        description: "Service added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add service",
        variant: "destructive"
      });
    }
  };

  const handleTypeChange = (type: string) => {
    setHospitalType(type);
    localStorage.setItem(`hospital_type_${user?.id}`, type);
    
    toast({
      title: "Success",
      description: "Hospital type updated successfully"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{user?.name} Hospital</h1>
            <p className="text-muted-foreground">
              Comprehensive healthcare management dashboard
            </p>
          </div>
        </div>

        {/* Verification Banner */}
        {!user?.isVerified && (
          <Card className="mb-8 border-warning bg-warning/5">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-warning mb-1">Hospital License Verification Pending</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your hospital license is being verified. Upload documents to complete verification.
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
          {/* Total Patients - Blue gradient */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100 opacity-90">Total Patients</p>
                  <p className="text-3xl font-bold text-white">1,247</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            </CardContent>
          </Card>

          {/* Occupied Beds - Orange to Red gradient */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-100 opacity-90">Occupied Beds</p>
                  <p className="text-3xl font-bold text-white">89/120</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <Bed className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            </CardContent>
          </Card>

          {/* Active Staff - Emerald/Teal gradient */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-100 opacity-90">Active Staff</p>
                  <p className="text-3xl font-bold text-white">156</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            </CardContent>
          </Card>

          {/* Monthly Revenue - Amber gradient (matches Pharmacy Total Earnings) */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-100 opacity-90">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-white">PKR 12.5M</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Main Tabs - Pharmacy/Lab style */}
            <Tabs defaultValue="services">
              <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-100 to-gray-200 p-1 rounded-xl shadow-inner">
                <TabsTrigger 
                  value="services" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium"
                >
                  Services
                </TabsTrigger>
                <TabsTrigger 
                  value="bookings" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium"
                >
                  Bookings
                </TabsTrigger>
                <TabsTrigger 
                  value="wallet" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium"
                >
                  Wallet
                </TabsTrigger>
              </TabsList>

              {/* Services Tab */}
              <TabsContent value="services">
                {/* Services Management */}
                <Card className="card-healthcare">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Hospital Services</CardTitle>
                        <CardDescription>Manage your hospital services and departments</CardDescription>
                      </div>
                      <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Service
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Add New Service</DialogTitle>
                            <DialogDescription>
                              Add a new service to your hospital
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="serviceName">Service Name *</Label>
                              <Input
                                id="serviceName"
                                value={serviceForm.name}
                                onChange={(e) => { setServiceForm({...serviceForm, name: e.target.value}); validateField('name', e.target.value); }}
                                placeholder="e.g., Cardiac Surgery"
                                className={formErrors.name ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                              />
                              {formErrors.name && (
                                <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
                              )}
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
                                  placeholder="e.g., 50000"
                                />
                              </div>
                              <div>
                                <Label htmlFor="serviceDuration">Duration (hours)</Label>
                                <Input
                                  id="serviceDuration"
                                  value={serviceForm.duration}
                                  onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}
                                  placeholder="e.g., 4"
                                />
                              </div>
                            </div>
                            {/* Category Dropdown */}
                            <div>
                              <Label htmlFor="serviceCategory">Category</Label>
                              <Select value={serviceForm.category} onValueChange={(value) => setServiceForm({ ...serviceForm, category: value })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select service category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {hospitalCategories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="serviceDepartment">Department</Label>
                              <Select value={serviceForm.department} onValueChange={(value) => { setServiceForm({...serviceForm, department: value}); validateField('department', value); }}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                  {hospitalDepartments.map((dept) => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {formErrors.department && (
                                <p className="text-xs text-red-600 mt-1">{formErrors.department}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="serviceDescription">Description</Label>
                              <Textarea
                                id="serviceDescription"
                                value={serviceForm.description}
                                onChange={(e) => { setServiceForm({...serviceForm, description: e.target.value}); validateField('description', e.target.value); }}
                                placeholder="Brief description of the service"
                                className={formErrors.description ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                              />
                              {formErrors.description && (
                                <p className="text-xs text-red-600 mt-1">{formErrors.description}</p>
                              )}
                            </div>

                            {/* Location Fields */}
                            <div className="space-y-3 border-t pt-3">
                              <h4 className="font-medium text-sm">Location Information</h4>
                              <div>
                                <Label htmlFor="serviceCity">City</Label>
                                <Input
                                  id="serviceCity"
                                  value={serviceForm.city}
                                  onChange={(e) => { setServiceForm({ ...serviceForm, city: e.target.value }); validateField('city', e.target.value); }}
                                  placeholder="e.g., Karachi"
                                  className={formErrors.city ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                                />
                                {formErrors.city && <p className="text-xs text-red-600 mt-1">{formErrors.city}</p>}
                              </div>
                              <div>
                                <Label htmlFor="serviceAddress">Detailed Address</Label>
                                <Textarea
                                  id="serviceAddress"
                                  value={serviceForm.detailAddress}
                                  onChange={(e) => { setServiceForm({ ...serviceForm, detailAddress: e.target.value }); validateField('address', e.target.value); }}
                                  placeholder="Complete address with landmarks"
                                  rows={2}
                                  className={formErrors.detailAddress ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                                />
                                {formErrors.detailAddress && <p className="text-xs text-red-600 mt-1">{formErrors.detailAddress}</p>}
                              </div>
                            </div>
                            <Button onClick={handleAddService} className="w-full">
                              Add Service
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
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-20">Image</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Department</TableHead>
                              <TableHead>Price (PKR)</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Availability</TableHead>
                              <TableHead>Service Type</TableHead>
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
                                <TableCell>{m.category || '-'}</TableCell>
                                <TableCell>{m.department || m.category || '-'}</TableCell>
                                <TableCell>{m.price ?? 0}</TableCell>
                                <TableCell>{m.duration ?? '-'}</TableCell>
                                <TableCell>
                                  {m.availability && (
                                    <AvailabilityBadge availability={m.availability} size="sm" />
                                  )}
                                </TableCell>
                                <TableCell>
                                  {m.serviceType && (
                                    <ServiceTypeBadge serviceType={m.serviceType} size="sm" />
                                  )}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Edit className="w-4 h-4 mr-1" /> Edit
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={async () => {
                                    try { await apiDelete(String(iid)); await reloadServices(); toast({ title: 'Success', description: 'Service deleted' }); } catch (e: any) { toast({ title: 'Error', description: e?.message || 'Failed', variant: 'destructive' }); }
                                  }}>
                                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )})}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bookings Tab */}
              <TabsContent value="bookings">
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Hospital Bookings
                        </CardTitle>
                        <CardDescription className="text-orange-100">Manage and track patient bookings</CardDescription>
                      </div>
                      {bookings.length > 0 && (
                        <Button
                          className="bg-white text-red-600 hover:bg-red-50 shadow-lg transition-all duration-300 shrink-0 self-start sm:self-auto w-full sm:w-auto"
                          size="sm"
                          onClick={deleteAllBookings}
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
                          <div key={booking._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
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
                              <Badge
                                variant={booking.status === 'Completed' ? 'default' : 'secondary'}
                                className={booking.status === 'Completed' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : booking.status === 'Scheduled' ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white' : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'}
                              >
                                {booking.status}
                              </Badge>
                              {booking.status === 'Confirmed' && (
                                <Button size="sm" className="w-full sm:w-auto bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white shadow-md" onClick={() => { setSelectedBooking(booking); setIsScheduling(true); }}>Schedule</Button>
                              )}
                              {booking.status === 'Scheduled' && (
                                <Button size="sm" className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md" onClick={() => completeBooking(booking._id)}>Mark as Complete</Button>
                              )}
                              {booking.status === 'Completed' && (
                                <Button
                                  size="sm"
                                  onClick={() => deleteBooking(booking._id)}
                                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-md"
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

              {/* Wallet Tab */}
              <TabsContent value="wallet">
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Wallet
                    </CardTitle>
                    <CardDescription className="text-emerald-100">Earnings and balances</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Wallet details will be shown here.</p>
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
                <CardTitle>Hospital Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{user?.name} Hospital</h3>
                  <Badge variant="outline" className="capitalize">{user?.role}</Badge>
                  {hospitalType && (
                    <Badge variant="secondary" className="mt-2">{hospitalType}</Badge>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">{user?.email}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hospitalType">Hospital Type</Label>
                    <Select value={hospitalType} onValueChange={handleTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hospital type" />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitalTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Hospital Info
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="secondary"
                      onClick={() => navigate(`/provider/${user?.id}`)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      See Public Profile
                    </Button>
                  </div>
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
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Emergency Protocols
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
