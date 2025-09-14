import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import ServiceTypeBadge from "@/components/ServiceTypeBadge";
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
import { toast } from "sonner";
import ServiceManager from "@/lib/serviceManager";
import { uploadFile } from "@/lib/chatApi";
import { listMedicines as apiList, createMedicine as apiCreate, updateMedicine as apiUpdate, deleteMedicine as apiDelete } from "@/lib/pharmacyApi";
import {
  ShoppingBag,
  Pill,
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
  Package,
  Activity,
  Plus,
  Trash2,
  DollarSign,
  Heart,
  Shield,
  User,
  Truck,
  Wallet
} from "lucide-react";

const PharmacyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [walletData, setWalletData] = useState<any>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [scheduleDetails, setScheduleDetails] = useState({
    scheduledTime: '',
    communicationChannel: 'SehatKor Chat',
  });
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const [medicineImagePreview, setMedicineImagePreview] = useState('');
  const [medicineImageFile, setMedicineImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isAddingMedicine, setIsAddingMedicine] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMedicineId, setEditingMedicineId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    category: '',
    googleMapLink: '',
    city: '',
    detailAddress: '',
    availability: 'Physical',
    serviceType: [],
    homeDelivery: false
  });
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const [medicineForm, setMedicineForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    category: '',
    googleMapLink: '',
    city: '',
    detailAddress: '',
    availability: 'Physical',
    serviceType: [],
    homeDelivery: false
  });

  const medicineCategories = [
    'Tablets', 'Capsules', 'Syrups', 'Injections', 'Ointments', 'Drops'
  ];

  const LIMITS = {
    name: 32,
    description: 60,
    city: 20,
    address: 60,
  } as const;

  const isValidHttpUrl = (value: string): boolean => {
    const v = (value || '').trim();
    if (!v) return true; // optional field
    const re = /^(https?:\/\/)[^\s]+$/i; // basic http(s) URL check
    return re.test(v);
  };

  const [addErrors, setAddErrors] = useState<{ name?: string; description?: string; city?: string; detailAddress?: string; googleMapLink?: string }>({});
  const [editErrors, setEditErrors] = useState<{ name?: string; description?: string; city?: string; detailAddress?: string; googleMapLink?: string }>({});

  const validateAddField = (key: keyof typeof LIMITS, value: string) => {
    const v = (value || '').trim();
    const limit = LIMITS[key];
    const overBy = Math.max(0, v.length - limit);
    setAddErrors(prev => ({ ...prev, [key === 'address' ? 'detailAddress' : key]: overBy > 0 ? `Allowed ${limit} characters. You are over by ${overBy}.` : undefined }));
  };

  const validateEditField = (key: keyof typeof LIMITS, value: string) => {
    const v = (value || '').trim();
    const limit = LIMITS[key];
    const overBy = Math.max(0, v.length - limit);
    setEditErrors(prev => ({ ...prev, [key === 'address' ? 'detailAddress' : key]: overBy > 0 ? `Allowed ${limit} characters. You are over by ${overBy}.` : undefined }));
  };

  const validateAddLink = (value: string) => {
    setAddErrors(prev => ({ ...prev, googleMapLink: isValidHttpUrl(value) ? undefined : 'Please enter a valid http(s) link.' }));
  };
  const validateEditLink = (value: string) => {
    setEditErrors(prev => ({ ...prev, googleMapLink: isValidHttpUrl(value) ? undefined : 'Please enter a valid http(s) link.' }));
  };

  const validateAddLengths = (): boolean => {
    const trim = (s?: string) => (s || '').trim();
    const name = trim(medicineForm.name);
    const description = trim(medicineForm.description);
    const city = trim(medicineForm.city);
    const addr = trim(medicineForm.detailAddress);
    if (name.length > LIMITS.name) { toast.error(`Medicine Name must be at most ${LIMITS.name} characters.`); return false; }
    if (description.length > LIMITS.description) { toast.error(`Description must be at most ${LIMITS.description} characters.`); return false; }
    if (city.length > LIMITS.city) { toast.error(`City must be at most ${LIMITS.city} characters.`); return false; }
    if (addr.length > LIMITS.address) { toast.error(`Detailed Address must be at most ${LIMITS.address} characters.`); return false; }
    if (!isValidHttpUrl(medicineForm.googleMapLink)) { toast.error('Google Map Link must be a valid http(s) URL.'); return false; }
    return true;
  };

  const validateEditLengths = (): boolean => {
    const trim = (s?: string) => (s || '').trim();
    const name = trim(editForm.name);
    const description = trim(editForm.description);
    const city = trim(editForm.city);
    const addr = trim(editForm.detailAddress);
    if (name.length > LIMITS.name) { toast.error(`Medicine Name must be at most ${LIMITS.name} characters.`); return false; }
    if (description.length > LIMITS.description) { toast.error(`Description must be at most ${LIMITS.description} characters.`); return false; }
    if (city.length > LIMITS.city) { toast.error(`City must be at most ${LIMITS.city} characters.`); return false; }
    if (addr.length > LIMITS.address) { toast.error(`Detailed Address must be at most ${LIMITS.address} characters.`); return false; }
    if (!isValidHttpUrl(editForm.googleMapLink)) { toast.error('Google Map Link must be a valid http(s) URL.'); return false; }
    return true;
  };

  const syncServicesFromBackend = (docs: any[]) => {
    if (!user?.id) return;
    try {
      const all = ServiceManager.getAllServices();
      // Remove existing pharmacy services from this user
      const filtered = all.filter((s: any) => !(s.providerType === 'pharmacy' && s.providerId === user.id));

      // Add new medicines from backend
      const mapped = docs.map((d: any) => ({
        id: String(d._id),
        name: d.name,
        description: d.description || '',
        price: d.price || 0,
        category: (d.category || 'Other') as any,
        providerType: 'pharmacy' as const,
        providerId: user.id,
        providerName: d.providerName || (user?.name || 'Pharmacy'),
        image: d.imageUrl,
        stock: d.stock || 0,
        googleMapLink: d.googleMapLink,
        city: d.city,
        detailAddress: d.detailAddress,
        availability: d.availability || 'Physical',
        serviceType: Array.isArray(d.serviceType) ? d.serviceType : (d.serviceType ? [d.serviceType] : []),
        homeDelivery: d.homeDelivery || false,
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAt || new Date().toISOString(),
      }));

      const next = [...filtered, ...mapped];
      localStorage.setItem('sehatkor_services', JSON.stringify(next));
      window.dispatchEvent(new StorageEvent('storage', { key: 'sehatkor_services' }));
    } catch (error) {
      console.error('Error syncing services from backend:', error);
    }
  };

  const reloadMedicines = async () => {
    if (!user?.id) return;
    try {
      console.log('Fetching pharmacy medicines for user:', user.id);
      const docs = await apiList();
      console.log('Pharmacy medicines fetched:', docs);

      // Map to UI Medicine type for table
      const mapped: any[] = docs.map((d: any) => ({
        id: String(d._id),
        name: d.name,
        description: d.description || '',
        price: d.price || 0,
        category: d.category || 'Other',
        stock: d.stock || 0,
        image: d.imageUrl,
        providerId: user.id,
        providerName: d.providerName || (user?.name || 'Pharmacy'),
        providerType: 'pharmacy' as const,
        // Location fields to prefill edit dialog
        googleMapLink: d.googleMapLink || '',
        city: d.city || '',
        detailAddress: d.detailAddress || '',
        availability: d.availability || 'Physical',
        serviceType: Array.isArray(d.serviceType) ? d.serviceType : (d.serviceType ? [d.serviceType] : []),
        homeDelivery: d.homeDelivery || false,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }));

      setMedicines(mapped);

      // Sync to local storage for other pages
      syncServicesFromBackend(docs);

    } catch (error) {
      console.error('Error loading medicines:', error);
      toast.error("Failed to load medicines", {
        description: "Please refresh the page.",
      });
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
        toast.success("Booking Scheduled", {
          description: `Appointment with ${updatedBooking.patientName} is set for ${new Date(updatedBooking.scheduledTime).toLocaleString()}.`,
        });
        setIsScheduling(false);
        setSelectedBooking(null);
      } else {
        throw new Error('Failed to schedule booking');
      }
    } catch (error) {
      toast.error("Failed to Schedule Booking", {
        description: "An unexpected error occurred. Please try again."
      });
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
        toast.success("Booking Completed", {
          description: `Booking for ${updatedBooking.patientName} has been marked as complete.`
        });
      } else {
        throw new Error('Failed to complete booking');
      }
    } catch (error) {
      toast.error("Failed to Complete Booking", {
        description: "An unexpected error occurred. Please try again."
      });
    }
  };

  // Fetch wallet data
  const fetchWalletData = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`http://localhost:4000/api/payments/wallet/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setWalletData(data.wallet || data);
      } else {
        throw new Error(data.message || 'Failed to fetch wallet data');
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setIsLoadingWallet(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      reloadMedicines();
      fetchBookings();
      fetchWalletData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAddMedicine = async () => {
    if (!validateAddLengths()) return;
    if (!medicineForm.name || !user?.id) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsAddingMedicine(true);
    const parsedPrice = medicineForm.price ? parseFloat(medicineForm.price) : 0;
    const parsedStock = medicineForm.stock ? parseInt(medicineForm.stock) : 0;

    try {
      let imageUrl: string | undefined = undefined;
      let imagePublicId: string | undefined = undefined;

      if (medicineImageFile) {
        setIsUploadingImage(true);
        try {
          const result = await uploadFile(medicineImageFile);
          imageUrl = result?.url;
          imagePublicId = result?.public_id;
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          toast.warning("Image upload failed", { description: "Medicine will be added without an image." });
        } finally {
          setIsUploadingImage(false);
        }
      }

      // Save to backend
      const created = await apiCreate({
        name: medicineForm.name,
        description: medicineForm.description,
        price: parsedPrice,
        category: medicineForm.category || 'Other',
        stock: parsedStock,
        imageUrl,
        imagePublicId,
        googleMapLink: medicineForm.googleMapLink,
        city: medicineForm.city,
        detailAddress: medicineForm.detailAddress,
        availability: medicineForm.availability,
        serviceType: medicineForm.serviceType,
        homeDelivery: medicineForm.homeDelivery,
        providerName: user?.name || 'Pharmacy',
      });

      // Sync to local storage for other pages
      const newMedicine = {
        name: created.name,
        description: created.description,
        price: created.price,
        category: created.category,
        stock: created.stock,
        image: created.imageUrl,
        providerId: user.id,
        providerName: created.providerName,
        providerType: 'pharmacy' as const,
        availability: created.availability,
      };

      // Add to local storage
      ServiceManager.addService(newMedicine);

      // Reset form
      setMedicineForm({ name: '', price: '', stock: '', description: '', category: '', googleMapLink: '', city: '', detailAddress: '', availability: 'Physical', serviceType: [], homeDelivery: false });
      setAddErrors({});
      setMedicineImagePreview('');
      setMedicineImageFile(null);
      setIsAddMedicineOpen(false);

      // Reload medicines from backend
      await reloadMedicines();

      toast.success("Medicine added successfully", {
        description: "The new medicine is now available to all users."
      });
    } catch (error: any) {
      console.error('Error adding medicine:', error);
      toast.error("Failed to add medicine", {
        description: error?.message || "Please try again.",
      });
    } finally {
      setIsAddingMedicine(false);
    }
  };

  const handleDeleteMedicine = async (medicineId: string) => {
    try {
      await apiDelete(medicineId);
      ServiceManager.deleteService(medicineId);
      reloadMedicines();
      toast.success("Medicine deleted successfully");
    } catch (e: any) {
      toast.error("Failed to delete medicine", { description: e?.message });
    }
  };

  const openEdit = (m: any) => {
    const id = m._id || m.id;
    setEditingMedicineId(String(id));
    setEditForm({
      name: m.name || '',
      price: m.price != null ? String(m.price) : '',
      stock: m.stock != null ? String(m.stock) : '',
      description: m.description || '',
      category: m.category || '',
      googleMapLink: m.googleMapLink || '',
      city: m.city || '',
      detailAddress: m.detailAddress || '',
      availability: m.availability || 'Physical',
      serviceType: Array.isArray(m.serviceType) ? m.serviceType : (m.serviceType ? [m.serviceType] : []),
      homeDelivery: m.homeDelivery || false
    });
    setEditImagePreview(m.imageUrl || m.image || '');
    setEditImageFile(null);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMedicineId) return;
    if (!validateEditLengths()) return;
    try {
      let imageUrl: string | undefined = editImagePreview || undefined;
      let imagePublicId: string | undefined = undefined;
      if (editImageFile) {
        setIsUploadingImage(true);
        try {
          const result = await uploadFile(editImageFile);
          imageUrl = result?.url;
          imagePublicId = result?.public_id;
        } finally {
          setIsUploadingImage(false);
        }
      }
      const parsedPrice = editForm.price ? parseFloat(editForm.price) : 0;
      const updated = await apiUpdate(editingMedicineId, {
        name: editForm.name,
        description: editForm.description,
        price: parsedPrice,
        category: editForm.category || 'Other',
        stock: editForm.stock ? parseInt(editForm.stock) : 0,
        imageUrl,
        imagePublicId,
        googleMapLink: editForm.googleMapLink,
        city: editForm.city,
        detailAddress: editForm.detailAddress,
        availability: editForm.availability,
        // Send serviceType even if empty string so backend can $unset when empty
        serviceType: editForm.serviceType,
        homeDelivery: editForm.homeDelivery,
      });
      // refresh from backend and sync ServiceManager
      await reloadMedicines();
      setIsEditOpen(false);
      setEditErrors({});
      setEditingMedicineId(null);
      toast.success("Medicine updated successfully");
    } catch (error: any) {
      toast.error("Failed to update medicine", { description: error?.message });
    }
  };

  const recentOrders = [
    { id: 1, customer: "Ahmad Ali", medicine: "Panadol 500mg", quantity: "20 tablets", status: "Ready" },
    { id: 2, customer: "Sara Khan", medicine: "Amoxicillin 250mg", quantity: "14 capsules", status: "Processing" },
    { id: 3, customer: "Hassan Ahmed", medicine: "Vitamin D3", quantity: "30 tablets", status: "Delivered" },
  ];

  const formatAddress = (value?: string): string => {
    const v = (value || '').trim();
    if (!v) return 'Address not specified';
    return v.length > 25 ? `${v.slice(0, 25)}…` : v;
  };

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 break-words">{user?.name} Pharmacy</h1>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
              Manage medicines, prescriptions, and customer orders
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {/* Total Medicines Card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-blue-100 opacity-90 truncate">Total Medicines</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{medicines.length}</p>
                </div>
                <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0">
                  <Pill className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-10 sm:translate-x-10"></div>
            </CardContent>
          </Card>

          {/* Total Bookings Card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-green-100 opacity-90 truncate">Total Orders</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{bookings.length}</p>
                </div>
                <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Balance Card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-purple-100 opacity-90 truncate">Available Balance</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white break-all">
                    {isLoadingWallet ? '...' : `PKR ${walletData?.availableBalance?.toLocaleString() || '0'}`}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Earnings Card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-amber-100 opacity-90 truncate">Total Earnings</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white break-all">
                    {isLoadingWallet ? '...' : `PKR ${walletData?.totalEarnings?.toLocaleString() || '0'}`}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Main Tabs */}
            <Tabs defaultValue="medicines">
              <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-100 to-gray-200 p-1 rounded-xl shadow-inner">
                <TabsTrigger 
                  value="medicines" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium text-xs sm:text-sm md:text-base px-2 py-2 sm:px-3 sm:py-2"
                >
                  <span className="hidden sm:inline">Medicines</span>
                  <span className="sm:hidden">Meds</span>
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
              
              {/* Medicines Tab */}
              <TabsContent value="medicines" className="mt-6">
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-t-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-white">Medicine Inventory</CardTitle>
                        <CardDescription className="text-blue-100">Manage your pharmacy inventory</CardDescription>
                      </div>
                      <Dialog open={isAddMedicineOpen} onOpenChange={setIsAddMedicineOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg transition-all duration-300 px-2 py-1 sm:px-3 sm:py-2 h-8 sm:h-10">
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="text-[10px] sm:text-sm font-medium">Add</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
                          <DialogHeader>
                            <DialogTitle>Add New Medicine</DialogTitle>
                            <DialogDescription>
                              Add a new medicine to your inventory
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="medicineName">Medicine Name *</Label>
                              <Input
                                id="medicineName"
                                value={medicineForm.name}
                                onChange={(e) => { setMedicineForm({ ...medicineForm, name: e.target.value }); validateAddField('name', e.target.value); }}
                                placeholder="e.g., Panadol 500mg"
                                className={addErrors.name ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                              />
                              {addErrors.name && (
                                <p className="text-xs text-red-600 mt-1">{addErrors.name}</p>
                              )}
                            </div>

                            <div>
                              <Label>Medicine Image</Label>
                              <ImageUpload
                                onImageSelect={(file, preview) => { setMedicineImageFile(file); setMedicineImagePreview(preview); }}
                                onImageRemove={() => { setMedicineImageFile(null); setMedicineImagePreview(''); }}
                                currentImage={medicineImagePreview}
                                placeholder="Upload medicine image"
                                className="max-w-xs"
                              />
                              {isUploadingImage && (
                                <p className="text-xs text-muted-foreground mt-1">Uploading image...</p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="medicinePrice">Price (PKR) *</Label>
                                <Input
                                  id="medicinePrice"
                                  type="number"
                                  value={medicineForm.price}
                                  onChange={(e) => setMedicineForm({ ...medicineForm, price: e.target.value })}
                                  placeholder="e.g., 120"
                                />
                              </div>
                              <div>
                                <Label htmlFor="medicineStock">Stock Quantity</Label>
                                <Input
                                  id="medicineStock"
                                  type="number"
                                  value={medicineForm.stock}
                                  onChange={(e) => setMedicineForm({ ...medicineForm, stock: e.target.value })}
                                  placeholder="e.g., 100"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="medicineCategory">Category</Label>
                              <Select value={medicineForm.category} onValueChange={(value) => setMedicineForm({ ...medicineForm, category: value })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select medicine category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {medicineCategories.map((category) => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="medicineDescription">Description</Label>
                              <Textarea
                                id="medicineDescription"
                                value={medicineForm.description}
                                onChange={(e) => { setMedicineForm({ ...medicineForm, description: e.target.value }); validateAddField('description', e.target.value); }}
                                placeholder="Brief description of the medicine"
                                className={addErrors.description ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                              />
                              {addErrors.description && (
                                <p className="text-xs text-red-600 mt-1">{addErrors.description}</p>
                              )}
                            </div>
                            
                            {/* Availability Selection */}
                            <div className="space-y-3 border-t pt-3">
                              <h4 className="font-medium text-sm">Service Availability</h4>
                              <div className="space-y-2">
                                <Label>How is this medicine available? *</Label>
                                <div className="flex flex-col space-y-2">
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="availability"
                                      value="Physical"
                                      checked={medicineForm.availability === 'Physical'}
                                      onChange={(e) => setMedicineForm({ ...medicineForm, availability: e.target.value })}
                                      className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm">Physical - In-person pickup only</span>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="availability"
                                      value="Online"
                                      checked={medicineForm.availability === 'Online'}
                                      onChange={(e) => setMedicineForm({ ...medicineForm, availability: e.target.value })}
                                      className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm">Online - Delivery/consultation available</span>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="availability"
                                      value="Online and Physical"
                                      checked={medicineForm.availability === 'Online and Physical'}
                                      onChange={(e) => setMedicineForm({ ...medicineForm, availability: e.target.value })}
                                      className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm">Online and Physical - Both options available</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                            
                            {/* Service Type Selection (Optional) */}
                            <div className="space-y-3 border-t pt-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">Service Type (Optional)</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setMedicineForm(prev => ({ ...prev, serviceType: [] }))}
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
                                      checked={medicineForm.serviceType.includes('Private')}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setMedicineForm(prev => ({
                                          ...prev,
                                          serviceType: e.target.checked 
                                            ? [...prev.serviceType, value]
                                            : prev.serviceType.filter(type => type !== value)
                                        }));
                                      }}
                                      className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium">Private</span>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                                    <input
                                      type="checkbox"
                                      value="Public"
                                      checked={medicineForm.serviceType.includes('Public')}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setMedicineForm(prev => ({
                                          ...prev,
                                          serviceType: e.target.checked 
                                            ? [...prev.serviceType, value]
                                            : prev.serviceType.filter(type => type !== value)
                                        }));
                                      }}
                                      className="text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm font-medium">Public</span>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                                    <input
                                      type="checkbox"
                                      value="Charity"
                                      checked={medicineForm.serviceType.includes('Charity')}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setMedicineForm(prev => ({
                                          ...prev,
                                          serviceType: e.target.checked 
                                            ? [...prev.serviceType, value]
                                            : prev.serviceType.filter(type => type !== value)
                                        }));
                                      }}
                                      className="text-orange-600 focus:ring-orange-500"
                                    />
                                    <span className="text-sm font-medium">Charity</span>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                                    <input
                                      type="checkbox"
                                      value="NGO"
                                      checked={medicineForm.serviceType.includes('NGO')}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setMedicineForm(prev => ({
                                          ...prev,
                                          serviceType: e.target.checked 
                                            ? [...prev.serviceType, value]
                                            : prev.serviceType.filter(type => type !== value)
                                        }));
                                      }}
                                      className="text-pink-600 focus:ring-pink-500"
                                    />
                                    <span className="text-sm font-medium">NGO</span>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                                    <input
                                      type="checkbox"
                                      value="Sehat Card"
                                      checked={medicineForm.serviceType.includes('Sehat Card')}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setMedicineForm(prev => ({
                                          ...prev,
                                          serviceType: e.target.checked 
                                            ? [...prev.serviceType, value]
                                            : prev.serviceType.filter(type => type !== value)
                                        }));
                                      }}
                                      className="text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm font-medium">Sehat Card</span>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                                    <input
                                      type="checkbox"
                                      value="NPO"
                                      checked={medicineForm.serviceType.includes('NPO')}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setMedicineForm(prev => ({
                                          ...prev,
                                          serviceType: e.target.checked 
                                            ? [...prev.serviceType, value]
                                            : prev.serviceType.filter(type => type !== value)
                                        }));
                                      }}
                                      className="text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm font-medium">NPO</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                            
                            {/* Home Delivery Option */}
                            <div className="space-y-3 border-t pt-3">
                              <h4 className="font-medium text-sm">Delivery Options</h4>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="homeDelivery"
                                  checked={medicineForm.homeDelivery}
                                  onChange={(e) => setMedicineForm({ ...medicineForm, homeDelivery: e.target.checked })}
                                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                />
                                <Label htmlFor="homeDelivery" className="flex items-center space-x-2 cursor-pointer">
                                  <span>🏠</span>
                                  <span>Home Delivery Available</span>
                                </Label>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Check this if you offer home delivery for this medicine
                              </p>
                            </div>
                            
                            {/* Location Fields */}
                            <div className="space-y-3 border-t pt-3">
                              <h4 className="font-medium text-sm">Location Information</h4>
                              <div>
                                <Label htmlFor="medicineCity">City</Label>
                                <Input
                                  id="medicineCity"
                                  value={medicineForm.city}
                                  onChange={(e) => { setMedicineForm({ ...medicineForm, city: e.target.value }); validateAddField('city', e.target.value); }}
                                  placeholder="e.g., Karachi"
                                  className={addErrors.city ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                                />
                                {addErrors.city && (
                                  <p className="text-xs text-red-600 mt-1">{addErrors.city}</p>
                                )}
                              </div>
                              <div>
                                <Label htmlFor="medicineAddress">Detailed Address</Label>
                                <Textarea
                                  id="medicineAddress"
                                  value={medicineForm.detailAddress}
                                  onChange={(e) => { setMedicineForm({ ...medicineForm, detailAddress: e.target.value }); validateAddField('address', e.target.value); }}
                                  placeholder="e.g., Shop 123, ABC Plaza, Main Road"
                                  rows={2}
                                  className={addErrors.detailAddress ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                                />
                                {addErrors.detailAddress && (
                                  <p className="text-xs text-red-600 mt-1">{addErrors.detailAddress}</p>
                                )}
                              </div>
                              <div>
                                <Label htmlFor="medicineMapLink">Google Maps Link (Optional)</Label>
                                <Input
                                  id="medicineMapLink"
                                  value={medicineForm.googleMapLink}
                                  onChange={(e) => { setMedicineForm({ ...medicineForm, googleMapLink: e.target.value }); validateAddLink(e.target.value); }}
                                  placeholder="https://maps.google.com/..."
                                  className={addErrors.googleMapLink ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                                />
                                {addErrors.googleMapLink && (
                                  <p className="text-xs text-red-600 mt-1">{addErrors.googleMapLink}</p>
                                )}
                              </div>
                            </div>
                            <Button onClick={handleAddMedicine} className="w-full" disabled={isUploadingImage || isAddingMedicine}>
                              {isAddingMedicine ? 'Adding Medicine...' : 'Add Medicine'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent className="max-h-[600px] overflow-y-auto">
                    <p className="text-muted-foreground py-4">
                      Medicines added here will appear in search, services, and pharmacies listings.
                    </p>

                    {medicines.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">No medicines added yet.</div>
                    ) : (
                      <>
                        {/* Mobile cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                          {medicines.map((m) => {
                            const iid = m._id || m.id;
                            return (
                              <div key={String(iid)} className="border rounded-lg p-4 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                  {m.imageUrl || m.image ? (
                                    <img src={m.imageUrl || m.image} alt={m.name} className="w-12 h-12 rounded-lg object-cover" />
                                  ) : (
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">💊</div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-semibold truncate">{m.name}</p>
                                    {m.description && (
                                      <p className="text-xs text-muted-foreground truncate">{m.description}</p>
                                    )}
                                    <span className="text-[11px] text-muted-foreground truncate block mt-1">
                                      {formatAddress((m as any).detailAddress || (m as any).city)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                                  <span className="font-medium">PKR {m.price?.toLocaleString?.() ?? m.price ?? 0}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(m)}>
                                    <Edit className="w-4 h-4 mr-1" /> Edit
                                  </Button>
                                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDeleteMedicine(String(iid))}>
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
                                <TableHead>Service</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {medicines.map((m) => {
                                const iid = m._id || m.id;
                                return (
                                  <TableRow key={String(iid)}>
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                                          {m.imageUrl || m.image ? (
                                            <img src={m.imageUrl || m.image} alt={m.name} className="w-full h-full object-cover" />
                                          ) : (
                                            <span>💊</span>
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="font-medium truncate max-w-[240px]">{m.name}</p>
                                          {m.description && (
                                            <p className="text-sm text-muted-foreground truncate max-w-[260px]">{m.description}</p>
                                          )}
                                          <span className="text-xs text-muted-foreground truncate block">
                                            {formatAddress((m as any).detailAddress || (m as any).city)}
                                          </span>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>PKR {m.price?.toLocaleString?.() ?? m.price ?? 0}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                      <Button size="sm" variant="outline" onClick={() => openEdit(m)}>
                                        <Edit className="w-4 h-4 mr-1" /> Edit
                                      </Button>
                                      <Button size="sm" variant="destructive" onClick={() => handleDeleteMedicine(String(iid))}>
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
              {/* Bookings Tab */}
              <TabsContent value="bookings" className="mt-6">
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5" />
                          Medicine Orders
                        </CardTitle>
                        <CardDescription className="text-orange-100">Manage and track customer medicine orders</CardDescription>
                      </div>
                      {bookings.length > 0 && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={deleteAllBookings}
                            className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Clear All Orders
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="max-h-[600px] overflow-y-auto">
                    <p className="text-muted-foreground py-4">
                      Medicine orders from patients will appear here. You can manage order status and track deliveries.
                    </p>
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
                      <>
                        {/* Mobile cards */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                          {bookings.map((booking) => (
                            <div key={booking._id} className="border rounded-lg p-4 space-y-3 bg-white shadow-sm hover:shadow-md transition-shadow">
                              {/* Patient Info */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 
                                    className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer hover:underline transition-colors truncate"
                                    onClick={() => navigate(`/patient/${booking.patientId}`)}
                                  >
                                    {booking.patientName}
                                  </h4>
                                  <p className="text-sm text-muted-foreground truncate mt-1">{booking.serviceName}</p>
                                </div>
                                <Badge
                                  variant={booking.status === "Completed" ? "default" : "secondary"}
                                  className={`ml-2 text-xs ${
                                    booking.status === "Completed" 
                                      ? "bg-green-600 text-white" 
                                      : booking.status === 'Scheduled' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-yellow-500 text-white'
                                  }`}
                                >
                                  {booking.status}
                                </Badge>
                              </div>

                              {/* Booking Details */}
                              <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">Booked: {new Date(booking.createdAt).toLocaleDateString()}</span>
                                </div>
                                {booking.status === 'Scheduled' && booking.scheduledTime && (
                                  <div className="flex items-center gap-2 text-primary font-medium">
                                    <Clock className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">Scheduled: {new Date(booking.scheduledTime).toLocaleString()}</span>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col gap-2 pt-2 border-t">
                                {booking.status === 'Confirmed' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => { setSelectedBooking(booking); setIsScheduling(true); }} 
                                    className="w-full"
                                  >
                                    <Clock className="w-4 h-4 mr-2" />
                                    Schedule Appointment
                                  </Button>
                                )}
                                {booking.status === 'Scheduled' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => completeBooking(booking._id)} 
                                    className="w-full"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark as Complete
                                  </Button>
                                )}
                                {booking.status === 'Completed' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteBooking(booking._id)}
                                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Booking
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden md:block">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[200px]">Patient</TableHead>
                                <TableHead className="w-[250px]">Service</TableHead>
                                <TableHead className="w-[120px]">Status</TableHead>
                                <TableHead className="w-[150px]">Booked Date</TableHead>
                                <TableHead className="w-[180px]">Scheduled Time</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {bookings.map((booking) => (
                                <TableRow key={booking._id} className="hover:bg-muted/50">
                                  <TableCell>
                                    <div className="font-medium">
                                      <span 
                                        className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline transition-colors"
                                        onClick={() => navigate(`/patient/${booking.patientId}`)}
                                      >
                                        {booking.patientName}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="max-w-[200px]">
                                      <p className="font-medium truncate">{booking.serviceName}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={booking.status === "Completed" ? "default" : "secondary"}
                                      className={
                                        booking.status === "Completed" 
                                          ? "bg-green-600 text-white" 
                                          : booking.status === 'Scheduled' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-yellow-500 text-white'
                                      }
                                    >
                                      {booking.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Calendar className="w-4 h-4" />
                                      {new Date(booking.createdAt).toLocaleDateString()}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {booking.status === 'Scheduled' && booking.scheduledTime ? (
                                      <div className="flex items-center gap-2 text-sm text-primary font-medium">
                                        <Clock className="w-4 h-4" />
                                        {new Date(booking.scheduledTime).toLocaleString()}
                                      </div>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">—</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {booking.status === 'Confirmed' && (
                                        <Button 
                                          size="sm" 
                                          onClick={() => { setSelectedBooking(booking); setIsScheduling(true); }}
                                        >
                                          <Clock className="w-4 h-4 mr-1" />
                                          Schedule
                                        </Button>
                                      )}
                                      {booking.status === 'Scheduled' && (
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          onClick={() => completeBooking(booking._id)}
                                        >
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          Complete
                                        </Button>
                                      )}
                                      {booking.status === 'Completed' && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => deleteBooking(booking._id)}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="w-4 h-4 mr-1" />
                                          Delete
                                        </Button>
                                      )}
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

              {/* Wallet Tab */}
              <TabsContent value="wallet" className="mt-6">
                {isLoadingWallet ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <ProviderWallet />
                )}
              </TabsContent>
            </Tabs>

            {/* Edit Medicine Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
                <DialogHeader>
                  <DialogTitle>Edit Medicine</DialogTitle>
                  <DialogDescription>
                    Update the medicine details
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="editMedicineName">Medicine Name *</Label>
                    <Input
                      id="editMedicineName"
                      value={editForm.name}
                      onChange={(e) => { setEditForm({ ...editForm, name: e.target.value }); validateEditField('name', e.target.value); }}
                      placeholder="e.g., Panadol 500mg"
                      className={editErrors.name ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                    />
                    {editErrors.name && (
                      <p className="text-xs text-red-600 mt-1">{editErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label>Medicine Image</Label>
                    <ImageUpload
                      onImageSelect={(file, preview) => { setEditImageFile(file); setEditImagePreview(preview); }}
                      onImageRemove={() => { setEditImageFile(null); setEditImagePreview(''); }}
                      currentImage={editImagePreview}
                      placeholder="Upload medicine image"
                      className="max-w-xs"
                    />
                    {isUploadingImage && (
                      <p className="text-xs text-muted-foreground mt-1">Uploading image...</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editMedicinePrice">Price (PKR) *</Label>
                      <Input
                        id="editMedicinePrice"
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        placeholder="e.g., 120"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editMedicineStock">Stock Quantity</Label>
                      <Input
                        id="editMedicineStock"
                        type="number"
                        value={editForm.stock}
                        onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                        placeholder="e.g., 100"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="editMedicineDescription">Description</Label>
                    <Textarea
                      id="editMedicineDescription"
                      value={editForm.description}
                      onChange={(e) => { setEditForm({ ...editForm, description: e.target.value }); validateEditField('description', e.target.value); }}
                      placeholder="Brief description of the medicine"
                      className={editErrors.description ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                    />
                    {editErrors.description && (
                      <p className="text-xs text-red-600 mt-1">{editErrors.description}</p>
                    )}
                  </div>
                  {/* Availability Selection --> Newly Added Section */}
                  <div className="space-y-3 border-t pt-3">
                    <h4 className="font-medium text-sm">Service Availability</h4>
                    <div className="space-y-2">
                      <Label>How is this medicine available? *</Label>
                      <div className="flex flex-col space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="editAvailability"
                            value="Physical"
                            checked={editForm.availability === 'Physical'}
                            onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">Physical - In-person pickup only</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="editAvailability"
                            value="Online"
                            checked={editForm.availability === 'Online'}
                            onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">Online - Delivery/consultation available</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="editAvailability"
                            value="Online and Physical"
                            checked={editForm.availability === 'Online and Physical'}
                            onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">Online and Physical - Both options available</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Service Type Selection */}
                  <div className="space-y-3 border-t pt-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Service Type (Optional)</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditForm(prev => ({ ...prev, serviceType: [] }))}
                        className="h-8 px-2 text-xs text-gray-600 hover:text-red-600"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>What type of service is this?</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            value="Private"
                            checked={editForm.serviceType.includes('Private')}
                            onChange={(e) => {
                              const value = e.target.value;
                              setEditForm(prev => ({
                                ...prev,
                                serviceType: e.target.checked 
                                  ? [...prev.serviceType, value]
                                  : prev.serviceType.filter(type => type !== value)
                              }));
                            }}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">Private</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            value="Public"
                            checked={editForm.serviceType.includes('Public')}
                            onChange={(e) => {
                              const value = e.target.value;
                              setEditForm(prev => ({
                                ...prev,
                                serviceType: e.target.checked 
                                  ? [...prev.serviceType, value]
                                  : prev.serviceType.filter(type => type !== value)
                              }));
                            }}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm font-medium">Public</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            value="Charity"
                            checked={editForm.serviceType.includes('Charity')}
                            onChange={(e) => {
                              const value = e.target.value;
                              setEditForm(prev => ({
                                ...prev,
                                serviceType: e.target.checked 
                                  ? [...prev.serviceType, value]
                                  : prev.serviceType.filter(type => type !== value)
                              }));
                            }}
                            className="text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-sm font-medium">Charity</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            value="NGO"
                            checked={editForm.serviceType.includes('NGO')}
                            onChange={(e) => {
                              const value = e.target.value;
                              setEditForm(prev => ({
                                ...prev,
                                serviceType: e.target.checked 
                                  ? [...prev.serviceType, value]
                                  : prev.serviceType.filter(type => type !== value)
                              }));
                            }}
                            className="text-pink-600 focus:ring-pink-500"
                          />
                          <span className="text-sm font-medium">NGO</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            value="Sehat Card"
                            checked={editForm.serviceType.includes('Sehat Card')}
                            onChange={(e) => {
                              const value = e.target.value;
                              setEditForm(prev => ({
                                ...prev,
                                serviceType: e.target.checked 
                                  ? [...prev.serviceType, value]
                                  : prev.serviceType.filter(type => type !== value)
                              }));
                            }}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm font-medium">Sehat Card</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            name="editServiceType"
                            value="NPO"
                            checked={editForm.serviceType.includes('NPO')}
                            onChange={(e) => {
                              const value = e.target.value;
                              setEditForm(prev => ({
                                ...prev,
                                serviceType: e.target.checked 
                                  ? [...prev.serviceType, value]
                                  : prev.serviceType.filter(type => type !== value)
                              }));
                            }}
                            className="text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-sm font-medium">NPO</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Home Delivery Option */}
                  <div className="space-y-3 border-t pt-3">
                    <h4 className="font-medium text-sm">Delivery Options</h4>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="editHomeDelivery"
                        checked={editForm.homeDelivery}
                        onChange={(e) => setEditForm({ ...editForm, homeDelivery: e.target.checked })}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <Label htmlFor="editHomeDelivery" className="flex items-center space-x-2 cursor-pointer">
                        <span>🏠</span>
                        <span>Home Delivery Available</span>
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Check this if you offer home delivery for this medicine
                    </p>
                  </div>
                  
                  <div className="space-y-3 border-t pt-3">
                    <h4 className="font-medium text-sm">Location Information</h4>
                    <div>
                      <Label htmlFor="editMedicineCity">City</Label>
                      <Input
                        id="editMedicineCity"
                        value={editForm.city}
                        onChange={(e) => { setEditForm({ ...editForm, city: e.target.value }); validateEditField('city', e.target.value); }}
                        placeholder="e.g., Karachi"
                        className={editErrors.city ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                      />
                      {editErrors.city && (
                        <p className="text-xs text-red-600 mt-1">{editErrors.city}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="editMedicineAddress">Detailed Address</Label>
                      <Textarea
                        id="editMedicineAddress"
                        value={editForm.detailAddress}
                        onChange={(e) => { setEditForm({ ...editForm, detailAddress: e.target.value }); validateEditField('address', e.target.value); }}
                        placeholder="e.g., Shop 123, ABC Plaza, Main Road"
                        rows={2}
                        className={editErrors.detailAddress ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                      />
                      {editErrors.detailAddress && (
                        <p className="text-xs text-red-600 mt-1">{editErrors.detailAddress}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="editMedicineMapLink">Google Maps Link (Optional)</Label>
                      <Input
                        id="editMedicineMapLink"
                        value={editForm.googleMapLink}
                        onChange={(e) => { setEditForm({ ...editForm, googleMapLink: e.target.value }); validateEditLink(e.target.value); }}
                        placeholder="https://maps.google.com/..."
                        className={editErrors.googleMapLink ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                      />
                      {editErrors.googleMapLink && (
                        <p className="text-xs text-red-600 mt-1">{editErrors.googleMapLink}</p>
                      )}
                    </div>
                  </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                    <Button variant="outline" onClick={() => setIsEditOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                    <Button onClick={handleSaveEdit} className="w-full sm:w-auto" disabled={isUploadingImage}>
                      {isUploadingImage ? 'Updating...' : 'Update Medicine'}
                    </Button>
                  </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isScheduling} onOpenChange={setIsScheduling}>
              <DialogContent className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
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
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2">
                  <Button variant="outline" onClick={() => setIsScheduling(false)} className="w-full sm:w-auto">Cancel</Button>
                  <Button onClick={scheduleBooking} className="w-full sm:w-auto">Confirm Schedule</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-white shadow-xl">
              <CardHeader className="relative z-10">
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Pharmacy Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-center mb-6">
                  <div className="mb-4 relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                    <ProfileImageUpload
                      currentImage={user?.avatar}
                      userName={user?.name || 'Pharmacy'}
                      size="lg"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{user?.name}</h3>
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
              role={(user?.role as any) || 'pharmacy'}
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

export default PharmacyDashboard;