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
import ImageUpload from "@/components/ui/image-upload";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import EditProfileDialog from "@/components/EditProfileDialog";
import ProviderWallet from "@/components/ProviderWallet";
import ServiceTypeBadge from '@/components/ServiceTypeBadge';
import AvailabilityBadge from '@/components/AvailabilityBadge';

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
  Phone,
  User,
  Wallet
} from "lucide-react";
import { apiUrl } from '@/config/api';

const ClinicDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [bookingPrices, setBookingPrices] = useState<Record<string, number>>({});
  const [walletData, setWalletData] = useState<any>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [scheduleDetails, setScheduleDetails] = useState({
    scheduledTime: '',
    communicationChannel: 'SehatKor Chat',
  });
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
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
    category: '',
    department: '',
    googleMapLink: '',
    city: '',
    detailAddress: '',
    availability: 'Physical',
    serviceType: [],
    homeDelivery: false
  });

  // Inline validation limits
  const LIMITS = {
    name: 32,
    department: 26,
    description: 60,
    city: 20,
    address: 60,
  } as const;

  const [formErrors, setFormErrors] = useState<{ name?: string; department?: string; description?: string; city?: string; detailAddress?: string; googleMapLink?: string }>({});
  
  // Track if location fields are pre-filled from first service
  const [locationPreFilled, setLocationPreFilled] = useState(false);

  const validateField = (key: keyof typeof LIMITS, value: string) => {
    const v = (value || '').trim();
    const limit = LIMITS[key];
    const overBy = Math.max(0, v.length - limit);
    setFormErrors(prev => ({ ...prev, [key === 'address' ? 'detailAddress' : key]: overBy > 0 ? `Allowed ${limit} characters. You are over by ${overBy}.` : undefined }));
  };

  const isValidHttpUrl = (value: string): boolean => {
    const v = (value || '').trim();
    if (!v) return true; // optional
    const re = /^(https?:\/\/)[^\s]+$/i;
    return re.test(v);
  };

  const validateTopLink = (value: string) => {
    setFormErrors(prev => ({ ...prev, googleMapLink: isValidHttpUrl(value) ? undefined : 'Please enter a valid http(s) link.' }));
  };

  // Limit address display length in lists
  const formatAddress = (value?: string): string => {
    const v = (value || '').trim();
    if (!v) return 'Address not specified';
    return v.length > 25 ? `${v.slice(0, 25)}…` : v;
  };

  // Get first service location data for pre-filling
  const getFirstServiceLocationData = () => {
    if (services.length === 0) return null;
    
    const firstService = services[0] as any;
    return {
      city: firstService.city || '',
      detailAddress: firstService.detailAddress || '',
      googleMapLink: firstService.googleMapLink || ''
    };
  };

  // Pre-fill location fields from first service
  const preFillFromFirstService = () => {
    const firstServiceLocation = getFirstServiceLocationData();
    if (!firstServiceLocation) return false;
    
    // Only pre-fill if at least one location field has data
    const hasLocationData = firstServiceLocation.city || 
                           firstServiceLocation.detailAddress || 
                           firstServiceLocation.googleMapLink;
    
    if (hasLocationData) {
      setServiceForm(prev => ({
        ...prev,
        city: firstServiceLocation.city,
        detailAddress: firstServiceLocation.detailAddress,
        googleMapLink: firstServiceLocation.googleMapLink
      }));
      return true;
    }
    return false;
  };

  // Reset form
  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      price: '',
      duration: '',
      description: '',
      category: '',
      department: '',
      googleMapLink: '',
      city: '',
      detailAddress: '',
      availability: 'Physical',
      serviceType: [],
      homeDelivery: false
    });
    setServiceImage('');
    setServiceImageFile(null);
    setEditingService(null);
    setFormErrors({});
    setLocationPreFilled(false);
  };

  // Initialize form for new service with location pre-fill
  const initializeNewServiceForm = () => {
    resetServiceForm();
    
    // Pre-fill location fields from first service if this is not the first service
    if (services.length > 0 && !editingService) {
      const wasPreFilled = preFillFromFirstService();
      setLocationPreFilled(wasPreFilled);
    }
  };

  const validateLengths = (): boolean => {
    const trim = (s?: string) => (s || '').trim();
    const name = trim(serviceForm.name);
    const department = trim(serviceForm.department);
    const description = trim(serviceForm.description);
    const city = trim(serviceForm.city);
    const addr = trim(serviceForm.detailAddress);

    if (name.length > LIMITS.name) { toast.error(`Service Name must be at most ${LIMITS.name} characters.`); return false; }
    if (department.length > LIMITS.department) { toast.error(`Department must be at most ${LIMITS.department} characters.`); return false; }
    if (description.length > LIMITS.description) { toast.error(`Description must be at most ${LIMITS.description} characters.`); return false; }
    if (city.length > LIMITS.city) { toast.error(`City must be at most ${LIMITS.city} characters.`); return false; }
    if (addr.length > LIMITS.address) { toast.error(`Detailed Address must be at most ${LIMITS.address} characters.`); return false; }
    if (!isValidHttpUrl(serviceForm.googleMapLink)) { toast.error('Google Map Link must be a valid http(s) URL.'); return false; }
    return true;
  };

  const clinicTypes = [
    'General Hospital', 'Specialized Hospital', 'Eye Hospital',
    'Heart Hospital', 'Children Hospital', 'Emergency Center'
  ];

  const clinicCategories = [
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
      department: d.department || null,
      providerType: 'clinic' as const,
      providerId: user.id,
      providerName: d.providerName || (user?.name || 'Clinic'),
      image: d.imageUrl,
      duration: d.duration,
      // Include location details for consistency across pages
      city: d.city || '',
      detailAddress: d.detailAddress || '',
      googleMapLink: d.googleMapLink || '',
      availability: d.availability,
      serviceType: Array.isArray(d.serviceType) ? d.serviceType : (d.serviceType ? [d.serviceType] : []),
      homeDelivery: Boolean(d.homeDelivery) || false,
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
      // Normalize docs so UI always has consistent fields (including location)
      const mapped = docs.map((d: any) => ({
        id: String(d._id),
        name: d.name,
        description: d.description || '',
        price: d.price || 0,
        category: d.category || d.department || 'Treatment',
        department: d.department || '',
        imageUrl: d.imageUrl,
        image: d.imageUrl,
        duration: d.duration || '',
        city: d.city || '',
        detailAddress: d.detailAddress || '',
        googleMapLink: d.googleMapLink || '',
        availability: d.availability || 'Physical',
        serviceType: Array.isArray(d.serviceType) ? d.serviceType : (d.serviceType ? [d.serviceType] : []),
        homeDelivery: Boolean(d.homeDelivery) || false,
        providerId: user.id,
        providerName: d.providerName || (user?.name || 'Clinic'),
        providerType: 'clinic' as const,
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAt || d.createdAt || new Date().toISOString(),
      }));
      setServices(mapped);
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

  const fetchWalletData = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(apiUrl(`/api/payments/wallet/${user.id}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWalletData(data.wallet);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setIsLoadingWallet(false);
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
      fetchWalletData();
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
        } catch { }
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
    if (!validateLengths()) return;
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
          category: serviceForm.category || serviceForm.department || 'Treatment',
          duration: serviceForm.duration || undefined,
          imageUrl,
          imagePublicId,
          googleMapLink: serviceForm.googleMapLink,
          city: serviceForm.city,
          detailAddress: serviceForm.detailAddress,
          availability: serviceForm.availability,
          // Send even if empty string to allow backend to unset default
          serviceType: serviceForm.serviceType,
          homeDelivery: serviceForm.homeDelivery,
          providerName: user?.name || 'Clinic',
        });
        toast.success("Service updated successfully");
      } else {
        await apiCreate({
          name: serviceForm.name,
          description: serviceForm.description,
          price: parsedPrice,
          department: serviceForm.department || undefined,
          category: serviceForm.category || serviceForm.department || 'Treatment',
          duration: serviceForm.duration || undefined,
          imageUrl,
          imagePublicId,
          googleMapLink: serviceForm.googleMapLink,
          city: serviceForm.city,
          detailAddress: serviceForm.detailAddress,
          availability: serviceForm.availability,
          serviceType: (Array.isArray(serviceForm.serviceType) && serviceForm.serviceType.length > 0) ? serviceForm.serviceType : undefined,
          homeDelivery: serviceForm.homeDelivery,
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
        category: '',
        department: '',
        googleMapLink: '',
        city: '',
        detailAddress: '',
        availability: 'Physical',
        serviceType: [],
        homeDelivery: false
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

  // Calculate statistics
  const totalServices = services.length;
  const totalBookings = bookings.length;
  const availableBalance = walletData?.availableBalance || 0;
  const totalEarnings = walletData?.totalEarnings || 0;

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 break-words">{user?.name} Clinic</h1>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
              Welcome to your clinic management dashboard
            </p>
          </div>
        </div>

        {/* Verification Banner */}
        {user?.role === 'clinic/hospital' &&
         !user?.isVerified &&
         user?.verificationStatus === 'pending' &&
         Boolean(user?.licenseNumber && String(user.licenseNumber).trim().length > 0) && (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-blue-100 opacity-90 truncate">Total Services</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{totalServices}</p>
                </div>
                <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-green-100 opacity-90 truncate">Total Bookings</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{totalBookings}</p>
                </div>
                <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-purple-100 opacity-90 truncate">Available Balance</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white break-all">
                    {isLoadingWallet ? '...' : `PKR ${availableBalance.toLocaleString()}`}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-amber-100 opacity-90 truncate">Total Earnings</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white break-all">
                    {isLoadingWallet ? '...' : `PKR ${totalEarnings.toLocaleString()}`}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Tabs defaultValue="services">
              {/* ... */}
              <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-100 to-gray-200 p-1 rounded-xl shadow-inner">
                <TabsTrigger 
                  value="services" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium text-xs sm:text-sm md:text-base px-2 py-2 sm:px-3 sm:py-2"
                >
                  Services
                </TabsTrigger>
                <TabsTrigger 
                  value="bookings" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium text-xs sm:text-sm md:text-base px-2 py-2 sm:px-3 sm:py-2"
                >
                  <span className="hidden sm:inline">Bookings</span>
                  <span className="sm:hidden">Orders</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="wallet" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium text-xs sm:text-sm md:text-base px-2 py-2 sm:px-3 sm:py-2"
                >
                  Wallet
                </TabsTrigger>
              </TabsList>
              <TabsContent value="services">
                {/* Services Management */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-t-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Activity className="w-5 h-5" />
                          Clinic Services
                        </CardTitle>
                        <CardDescription className="text-blue-100">Manage your clinic services and pricing</CardDescription>
                      </div>
                      <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={initializeNewServiceForm} className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg transition-all duration-300 px-2 py-1 sm:px-3 sm:py-2 h-8 sm:h-10">
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="text-[10px] sm:text-sm font-medium">Add</span>
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
                                onChange={(e) => { setServiceForm({ ...serviceForm, name: e.target.value }); validateField('name', e.target.value); }}
                                placeholder="e.g., X-Ray Scan"
                                className={formErrors.name ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                              />
                              {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
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
                                  onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                                  placeholder="e.g., 3000"
                                />
                              </div>
                              <div>
                                <Label htmlFor="serviceDuration">Duration (minutes)</Label>
                                <Input
                                  id="serviceDuration"
                                  value={serviceForm.duration}
                                  onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                                  placeholder="e.g., 45"
                                />
                              </div>
                            </div>
                            {/* Category Dropdown */}
                            <div>
                              <Label htmlFor="serviceCategory">Category</Label>
                              <Select value={serviceForm.category} onValueChange={(value) => setServiceForm({ ...serviceForm, category: value })}>
                                <SelectTrigger id="serviceCategory">
                                  <SelectValue placeholder="Select service category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {clinicCategories.map((category) => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="serviceDepartment">Department</Label>
                              <Input
                                id="serviceDepartment"
                                value={serviceForm.department}
                                onChange={(e) => { setServiceForm({ ...serviceForm, department: e.target.value }); validateField('department', e.target.value); }}
                                placeholder="e.g., Cardiology"
                                className={formErrors.department ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                              />
                              {formErrors.department && <p className="text-xs text-red-600 mt-1">{formErrors.department}</p>}
                            </div>
                            <div>
                              <Label htmlFor="serviceDescription">Description</Label>
                              <Textarea
                                id="serviceDescription"
                                value={serviceForm.description}
                                onChange={(e) => { setServiceForm({ ...serviceForm, description: e.target.value }); validateField('description', e.target.value); }}
                                placeholder="Brief description of the service"
                                className={formErrors.description ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                              />
                              {formErrors.description && <p className="text-xs text-red-600 mt-1">{formErrors.description}</p>}
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

                              <div>
                                <Label htmlFor="serviceGoogleMap">Google Maps Link (Optional)</Label>
                                <Input
                                  id="serviceGoogleMap"
                                  value={serviceForm.googleMapLink}
                                  onChange={(e) => { setServiceForm({ ...serviceForm, googleMapLink: e.target.value }); validateTopLink(e.target.value); }}
                                  placeholder="https://maps.google.com/..."
                                  className={formErrors.googleMapLink ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                                />
                                {formErrors.googleMapLink && (
                                  <p className="text-xs text-red-600 mt-1">{formErrors.googleMapLink}</p>
                                )}
                              </div>
                            </div>

                            {/* Availability */}
                            <div className="space-y-3 border-t pt-3">
                              <h4 className="font-medium text-sm">Service Availability</h4>
                              <div className="space-y-2">
                                <Label>How is this service available? *</Label>
                                <div className="flex flex-col space-y-2">
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="availability"
                                      value="Physical"
                                      checked={serviceForm.availability === 'Physical'}
                                      onChange={(e) => setServiceForm({ ...serviceForm, availability: e.target.value })}
                                      className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm">Physical - In-person consultation only</span>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="availability"
                                      value="Online"
                                      checked={serviceForm.availability === 'Online'}
                                      onChange={(e) => setServiceForm({ ...serviceForm, availability: e.target.value })}
                                      className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm">Online - Telemedicine/consultation available</span>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="availability"
                                      value="Online and Physical"
                                      checked={serviceForm.availability === 'Online and Physical'}
                                      onChange={(e) => setServiceForm({ ...serviceForm, availability: e.target.value })}
                                      className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm">Online and Physical - Both options available</span>
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3 border-t pt-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">Service Type (Optional)</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setServiceForm({ ...serviceForm, serviceType: [] })}
                                  className="h-8 px-2 text-xs text-gray-600 hover:text-red-600"
                                >
                                  Clear
                                </Button>
                              </div>
                              <div className="space-y-2">
                                <Label>What type of service is this? (Select multiple if applicable)</Label>
                                <div className="grid grid-cols-2 gap-2">
                                  <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                                    <input
                                      type="checkbox"
                                      value="Private"
                                      checked={serviceForm.serviceType.includes('Private')}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setServiceForm(prev => ({
                                          ...prev,
                                          serviceType: e.target.checked 
                                            ? [...prev.serviceType, value]
                                            : prev.serviceType.filter(type => type !== value)
                                        }));
                                      }}
                                      className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm">Private</span>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                                    <input
                                      type="checkbox"
                                      value="Public"
                                      checked={serviceForm.serviceType.includes('Public')}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setServiceForm(prev => ({
                                          ...prev,
                                          serviceType: e.target.checked 
                                            ? [...prev.serviceType, value]
                                            : prev.serviceType.filter(type => type !== value)
                                        }));
                                      }}
                                      className="text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm">Public</span>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                                    <input
                                      type="checkbox"
                                      value="Charity"
                                      checked={serviceForm.serviceType.includes('Charity')}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setServiceForm(prev => ({
                                          ...prev,
                                          serviceType: e.target.checked 
                                            ? [...prev.serviceType, value]
                                            : prev.serviceType.filter(type => type !== value)
                                        }));
                                      }}
                                      className="text-orange-600 focus:ring-orange-500"
                                    />
                                    <span className="text-sm">Charity</span>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                                    <input
                                      type="checkbox"
                                      value="NGO"
                                      checked={serviceForm.serviceType.includes('NGO')}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setServiceForm(prev => ({
                                          ...prev,
                                          serviceType: e.target.checked 
                                            ? [...prev.serviceType, value]
                                            : prev.serviceType.filter(type => type !== value)
                                        }));
                                      }}
                                      className="text-pink-600 focus:ring-pink-500"
                                    />
                                    <span className="text-sm">NGO</span>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                                    <input
                                      type="checkbox"
                                      value="NPO"
                                      checked={serviceForm.serviceType.includes('NPO')}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setServiceForm(prev => ({
                                          ...prev,
                                          serviceType: e.target.checked 
                                            ? [...prev.serviceType, value]
                                            : prev.serviceType.filter(type => type !== value)
                                        }));
                                      }}
                                      className="text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm">NPO</span>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                                    <input
                                      type="checkbox"
                                      value="Sehat Card"
                                      checked={serviceForm.serviceType.includes('Sehat Card')}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setServiceForm(prev => ({
                                          ...prev,
                                          serviceType: e.target.checked 
                                            ? [...prev.serviceType, value]
                                            : prev.serviceType.filter(type => type !== value)
                                        }));
                                      }}
                                      className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm">Sehat Card</span>
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3 border-t pt-3">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="homeDelivery"
                                  checked={serviceForm.homeDelivery}
                                  onChange={(e) => setServiceForm({ ...serviceForm, homeDelivery: e.target.checked })}
                                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <Label htmlFor="homeDelivery" className="flex items-center gap-2 cursor-pointer">
                                  🏠 Home Delivery Available
                                </Label>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Check this if you offer home delivery for this service
                              </p>
                            </div>

                            <Button onClick={handleAddService} className="w-full" disabled={isAddingService || isUploadingImage}>
                              {isAddingService ? (editingService ? 'Updating Service...' : 'Adding Service...') : (editingService ? 'Update Service' : 'Add Service')}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent className="max-h-[600px] overflow-y-auto">
                    {services.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">No services added yet.</div>
                    ) : (
                      <>
                        {/* Mobile cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                          {services.map((service) => (
                            <div key={service.id} className="border rounded-lg p-4 flex flex-col gap-3">
                              <div className="flex items-center gap-3">
                                {service.image ? (
                                  <img src={service.image} alt={service.name} className="w-12 h-12 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Building className="w-6 h-6 text-primary" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold truncate">{service.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{service.description}</p>
                                  <div className="space-y-1 mt-1">
                                    <span className="text-[11px] text-muted-foreground truncate block">
                                      {formatAddress((service as any).detailAddress || (service as any).city)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium">PKR {service.price?.toLocaleString() || 0}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                                  const m = service as any;
                                  setEditingService(m);
                                  setServiceForm({
                                    name: m.name || '',
                                    price: m.price != null ? String(m.price) : '',
                                    duration: m.duration || '',
                                    description: m.description || '',
                                    category: m.category || '',
                                    department: m.department || m.category || '',
                                    googleMapLink: m.googleMapLink || '',
                                    city: m.city || '',
                                    detailAddress: m.detailAddress || '',
                                    availability: m.availability || 'Physical',
                                    serviceType: Array.isArray(m.serviceType) ? m.serviceType : (m.serviceType ? [m.serviceType] : []),
                                    homeDelivery: Boolean(m.homeDelivery) || false
                                  });
                                  setServiceImage(m.imageUrl || m.image || '');
                                  setIsAddServiceOpen(true);
                                }}>
                                  <Edit className="w-4 h-4 mr-1" /> Edit
                                </Button>
                                <Button size="sm" variant="destructive" className="flex-1" onClick={async () => {
                                  try { await apiDelete(String(service.id)); await reloadServices(); toast.success('Service deleted'); } catch (e: any) { toast.error(e?.message || 'Failed to delete'); }
                                }}>
                                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Service</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {services.map((service) => (
                                <TableRow key={service.id}>
                                  <TableCell>
                                    <div className="flex items-center space-x-3 min-w-0">
                                      {service.image ? (
                                        <img 
                                          src={service.image} 
                                          alt={service.name}
                                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                        />
                                      ) : (
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                          <Building className="w-5 h-5 text-primary" />
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        <p className="font-medium truncate max-w-[240px]">{service.name}</p>
                                        <p className="text-sm text-muted-foreground truncate max-w-[260px]">{service.description}</p>
                                        <div className="space-y-1 mt-1 max-w-[420px]">
                                          <span className="text-xs text-muted-foreground truncate block">
                                            {formatAddress((service as any).detailAddress || (service as any).city)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>PKR {service.price?.toLocaleString() || 0}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => {
                                          const m = service as any;
                                          setEditingService(m);
                                          setServiceForm({
                                            name: m.name || '',
                                            price: m.price != null ? String(m.price) : '',
                                            duration: m.duration || '',
                                            description: m.description || '',
                                            category: m.category || '',
                                            department: m.department || m.category || '',
                                            googleMapLink: m.googleMapLink || '',
                                            city: m.city || '',
                                            detailAddress: m.detailAddress || '',
                                            availability: m.availability || 'Physical',
                                            serviceType: Array.isArray(m.serviceType) ? m.serviceType : (m.serviceType ? [m.serviceType] : []),
                                            homeDelivery: Boolean(m.homeDelivery) || false
                                          });
                                          setServiceImage(m.imageUrl || m.image || '');
                                          setIsAddServiceOpen(true);
                                        }}
                                      >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="destructive"
                                        onClick={async () => {
                                          try { await apiDelete(String(service.id)); await reloadServices(); toast.success('Service deleted'); } catch (e: any) { toast.error(e?.message || 'Failed to delete'); }
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="bookings">
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Patient Bookings
                        </CardTitle>
                        <CardDescription className="text-orange-100">Bookings from patients for your services</CardDescription>
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
                  <CardContent className="max-h-[600px] overflow-y-scroll">
                    {isLoadingBookings ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground">Patient bookings will appear here</p>
                      </div>
                    ) : (
                      bookings.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                          <p className="text-sm font-medium">No bookings yet.</p>
                          <p className="text-xs">When patients book your services, they will appear here.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bookings.map((booking) => (
                            <div key={booking._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                              <div className="flex-1 min-w-0">
                                <h4 
                                  className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline transition-colors"
                                  onClick={() => navigate(`/patient/${booking.patientId}`)}
                                >
                                  {booking.patientName}
                                </h4>
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
                                  className={booking.status === "Completed" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" : booking.status === 'Scheduled' ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white' : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'}
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
                      )
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="wallet">
                <ProviderWallet />
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
          <div className="lg:col-span-1 space-y-4">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-white shadow-xl">
              <CardHeader className="relative z-10">
                <CardTitle className="text-white flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Clinic Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-center mb-6">
                  <div className="mb-4 relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                    <ProfileImageUpload
                      currentImage={user?.avatar}
                      userName={user?.name || 'Clinic'}
                      size="lg"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{user?.name} Clinic</h3>
                  <Badge variant="outline" className="capitalize bg-white/20 text-white border-white/30 hover:bg-white/30">
                    {user?.role}
                  </Badge>
                  {user?.specialization && (
                    <Badge variant="secondary" className="mt-2 bg-white/10 text-white border-white/20">
                      {user?.specialization}
                    </Badge>
                  )}
                  <p className="text-sm text-gray-300 mt-3">{user?.email}</p>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300" 
                    variant="outline" 
                    onClick={() => setIsEditProfileOpen(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white border-0 shadow-lg transition-all duration-300"
                    onClick={() => navigate(`/provider/${user?.id}`)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    See Public Profile
                  </Button>
                </div>
              </CardContent>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
            </Card>

            {/* Edit Profile Dialog */}
            <EditProfileDialog
              open={isEditProfileOpen}
              onOpenChange={setIsEditProfileOpen}
              role={(user?.role as any) || 'clinic/hospital'}
              name={user?.name}
              specialization={user?.specialization}
              avatar={user?.avatar}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicDashboard;