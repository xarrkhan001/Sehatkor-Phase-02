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
import FullScreenLoader from "@/components/ui/full-screen-loader";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import EditProfileDialog from "@/components/EditProfileDialog";
import ProviderWallet from "@/components/ProviderWallet";
import RegistrationVerification from "@/components/RegistrationVerification";
import { useToast } from "@/hooks/use-toast";
import ServiceManager from "@/lib/serviceManager";
import { uploadFile } from "@/lib/chatApi";
import { listTests as apiList, createTest as apiCreate, updateTest as apiUpdate, deleteTest as apiDelete } from "@/lib/laboratoryApi";
import {
  Microscope,
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
  FlaskConical,
  Activity,
  Plus,
  Trash2,
  DollarSign,
  Heart,
  Shield,
  User,
  Phone,
  Download,
  Wallet,
  Truck
} from "lucide-react";
import CurrencyAmount from "@/components/CurrencyAmount";
import { apiUrl } from '@/config/api';

const LaboratoryDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tests, setTests] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [scheduleDetails, setScheduleDetails] = useState({
    scheduledTime: '',
    communicationChannel: 'SehatKor Chat',
  });
  const [isAddTestOpen, setIsAddTestOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [testImagePreview, setTestImagePreview] = useState('');
  const [testImageFile, setTestImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);

  // Edit Test state
  const [isEditTestOpen, setIsEditTestOpen] = useState(false);
  const [editTestId, setEditTestId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    category: '',
    googleMapLink: '',
    city: '',
    detailAddress: '',
    availability: 'Physical' as 'Physical' | 'Online' | 'Online and Physical',
    serviceType: [] as string[],
    imageUrl: '',
    homeDelivery: false
  });
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [isUpdatingTest, setIsUpdatingTest] = useState(false);

  // Inline validation limits and error states (Lab)
  const LIMITS = {
    name: 32,
    department: 26, // using category as department in Lab context
    description: 60,
    city: 20,
    address: 60,
  } as const;

  const [addErrors, setAddErrors] = useState<{ name?: string; department?: string; description?: string; city?: string; detailAddress?: string; googleMapLink?: string }>({});
  const [editErrors, setEditErrors] = useState<{ name?: string; department?: string; description?: string; city?: string; detailAddress?: string; googleMapLink?: string }>({});

  // Track if location fields are pre-filled from first test
  const [locationPreFilled, setLocationPreFilled] = useState(false);

  const isValidHttpUrl = (value: string): boolean => {
    const v = (value || '').trim();
    if (!v) return true; // optional
    const re = /^(https?:\/\/)[^\s]+$/i;
    return re.test(v);
  };

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

  // Comprehensive validation for all required fields
  const validateRequiredFields = (): { isValid: boolean; missingFields: string[] } => {
    const missingFields: string[] = [];
    const trim = (s?: string) => (s || '').trim();

    // Check required basic fields
    if (!trim(testForm.name)) {
      missingFields.push('Test Name');
    }
    if (!trim(testForm.price)) {
      missingFields.push('Price');
    }
    if (!trim(testForm.category)) {
      missingFields.push('Category');
    }
    if (!trim(testForm.description)) {
      missingFields.push('Description');
    }

    // Check required location fields
    if (!trim(testForm.city)) {
      missingFields.push('City');
    }
    if (!trim(testForm.detailAddress)) {
      missingFields.push('Detailed Address');
    }

    // Check required image field
    if (!testImagePreview && !testImageFile) {
      missingFields.push('Test Image');
    }

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  const validateAddLengths = (): boolean => {
    const trim = (s?: string) => (s || '').trim();
    const name = trim(testForm.name);
    const department = trim(testForm.category);
    const description = trim(testForm.description);
    const city = trim(testForm.city);
    const addr = trim(testForm.detailAddress);
    if (name.length > LIMITS.name) { 
      toast({ title: 'Validation Error', description: `Test Name must be at most ${LIMITS.name} characters.`, variant: 'destructive' }); 
      return false; 
    }
    if (department.length > LIMITS.department) { 
      toast({ title: 'Validation Error', description: `Category must be at most ${LIMITS.department} characters.`, variant: 'destructive' }); 
      return false; 
    }
    if (description.length > LIMITS.description) { 
      toast({ title: 'Validation Error', description: `Description must be at most ${LIMITS.description} characters.`, variant: 'destructive' }); 
      return false; 
    }
    if (city.length > LIMITS.city) { 
      toast({ title: 'Validation Error', description: `City must be at most ${LIMITS.city} characters.`, variant: 'destructive' }); 
      return false; 
    }
    if (addr.length > LIMITS.address) { 
      toast({ title: 'Validation Error', description: `Detailed Address must be at most ${LIMITS.address} characters.`, variant: 'destructive' }); 
      return false; 
    }
    if (!isValidHttpUrl(testForm.googleMapLink)) { 
      toast({ title: 'Validation Error', description: 'Google Map Link must be a valid http(s) URL.', variant: 'destructive' }); 
      return false; 
    }
    return true;
  };

  const validateEditLengths = (): boolean => {
    const trim = (s?: string) => (s || '').trim();
    const name = trim(editForm.name);
    const department = trim(editForm.category);
    const description = trim(editForm.description);
    const city = trim(editForm.city);
    const addr = trim(editForm.detailAddress);
    if (name.length > LIMITS.name) { toast.error(`Test Name must be at most ${LIMITS.name} characters.`); return false; }
    if (department.length > LIMITS.department) { toast.error(`Category must be at most ${LIMITS.department} characters.`); return false; }
    if (description.length > LIMITS.description) { toast.error(`Description must be at most ${LIMITS.description} characters.`); return false; }
    if (city.length > LIMITS.city) { toast.error(`City must be at most ${LIMITS.city} characters.`); return false; }
    if (addr.length > LIMITS.address) { toast.error(`Detailed Address must be at most ${LIMITS.address} characters.`); return false; }
    if (!isValidHttpUrl(editForm.googleMapLink)) { toast.error('Google Map Link must be a valid http(s) URL.'); return false; }
    return true;
  };

  const validateAddLink = (value: string) => {
    setAddErrors(prev => ({ ...prev, googleMapLink: isValidHttpUrl(value) ? undefined : 'Please enter a valid http(s) link.' }));
  };
  const validateEditLink = (value: string) => {
    setEditErrors(prev => ({ ...prev, googleMapLink: isValidHttpUrl(value) ? undefined : 'Please enter a valid http(s) link.' }));
  };

  const [testForm, setTestForm] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    category: '',
    googleMapLink: '',
    city: '',
    detailAddress: '',
    availability: 'Physical',
    serviceType: [] as string[],
    homeDelivery: false
  });

  const testCategories = [
    'Blood Test', 'Urine Test', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound'
  ];

  // Limit address display (match doctor dashboard behavior)
  const formatAddress = (value?: string): string => {
    const v = (value || '').trim();
    if (!v) return 'Address not specified';
    return v.length > 25 ? `${v.slice(0, 25)}…` : v;
  };

  // Get first test location data for pre-filling
  const getFirstTestLocationData = () => {
    if (tests.length === 0) return null;
    
    const firstTest = tests[0] as any;
    return {
      city: firstTest.city || '',
      detailAddress: firstTest.detailAddress || '',
      googleMapLink: firstTest.googleMapLink || ''
    };
  };

  // Pre-fill location fields from first test
  const preFillFromFirstTest = () => {
    const firstTestLocation = getFirstTestLocationData();
    if (!firstTestLocation) return false;
    
    // Only pre-fill if at least one location field has data
    const hasLocationData = firstTestLocation.city || 
                           firstTestLocation.detailAddress || 
                           firstTestLocation.googleMapLink;
    
    if (hasLocationData) {
      setTestForm(prev => ({
        ...prev,
        city: firstTestLocation.city,
        detailAddress: firstTestLocation.detailAddress,
        googleMapLink: firstTestLocation.googleMapLink
      }));
      return true;
    }
    return false;
  };

  // Reset form
  const resetTestForm = () => {
    setTestForm({
      name: '',
      price: '',
      duration: '',
      description: '',
      category: '',
      googleMapLink: '',
      city: '',
      detailAddress: '',
      availability: 'Physical',
      serviceType: [],
      homeDelivery: false
    });
    setTestImagePreview('');
    setTestImageFile(null);
    setAddErrors({});
    setLocationPreFilled(false);
  };

  // Initialize form for new test with location pre-fill
  const initializeNewTestForm = () => {
    resetTestForm();
    
    // Pre-fill location fields from first test if this is not the first test
    if (tests.length > 0) {
      const wasPreFilled = preFillFromFirstTest();
      setLocationPreFilled(wasPreFilled);
    }
  };

  const syncServicesFromBackend = (docs: any[]) => {
    if (!user?.id) return;
    try {
      const all = ServiceManager.getAllServices();
      // Remove existing laboratory services from this user
      const filtered = all.filter((s: any) => !(s.providerType === 'laboratory' && s.providerId === user.id));

      // Add new tests from backend
      const mapped = docs.map((d: any) => ({
        id: String(d._id),
        name: d.name,
        description: d.description || '',
        price: d.price || 0,
        category: (d.category || 'Test') as any,
        providerType: 'laboratory' as const,
        providerId: user.id,
        providerName: d.providerName || (user?.name || 'Laboratory'),
        image: d.imageUrl,
        duration: d.duration || '',
        googleMapLink: d.googleMapLink,
        city: d.city,
        detailAddress: d.detailAddress,
        availability: d.availability,
        serviceType: d.serviceType,
        homeDelivery: Boolean(d.homeDelivery) || false,
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

  const handleDeleteTest = async (id: string) => {
    try {
      await apiDelete(id);
      ServiceManager.deleteService(id);
      await reloadTests();
      toast.success('Test deleted');
    } catch (e: any) {
      console.error('Failed to delete test:', e);
      toast.error(e?.message || 'Failed to delete test');
    }
  };

  const openEditDialog = (t: any) => {
    setEditTestId(t.id);
    setEditForm({
      name: t.name || '',
      price: String(t.price ?? ''),
      duration: t.duration || '',
      description: t.description || '',
      category: t.category || '',
      googleMapLink: t.googleMapLink || '',
      city: t.city || '',
      detailAddress: t.detailAddress || '',
      availability: (t.availability as any) || 'Physical',
      serviceType: Array.isArray(t.serviceType) ? t.serviceType : (t.serviceType ? [t.serviceType] : []),
      imageUrl: t.image || '',
      homeDelivery: Boolean(t.homeDelivery) || false
    });
    setEditImagePreview(t.image || '');
    setEditImageFile(null);
    setIsEditTestOpen(true);
    setEditErrors({});
  };

  const handleUpdateTest = async () => {
    if (!editTestId) return;
    if (!validateEditLengths()) return;
    if (!editForm.name) {
      toast.error('Please fill in required fields');
      return;
    }
    
    // Enforce length constraints
    if (!validateEditLengths()) return;
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User ID is missing",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingTest(true);
    const parsedPrice = editForm.price ? parseFloat(editForm.price) : 0;

    try {
      let imageUrl: string | undefined = editForm.imageUrl || undefined;
      let imagePublicId: string | undefined = undefined;
      if (editImageFile) {
        setIsUploadingImage(true);
        try {
          const result = await uploadFile(editImageFile);
          imageUrl = result?.url;
          imagePublicId = result?.public_id;
        } catch (e) {
          console.error('Image upload failed:', e);
          toast.warning('Image upload failed, keeping previous image');
        } finally {
          setIsUploadingImage(false);
        }
      }

      await apiUpdate(editTestId, {
        name: editForm.name,
        description: editForm.description,
        price: parsedPrice,
        category: editForm.category || 'Test',
        duration: editForm.duration,
        imageUrl,
        imagePublicId,
        googleMapLink: editForm.googleMapLink,
        city: editForm.city,
        detailAddress: editForm.detailAddress,
        availability: editForm.availability as any,
        // send even if empty string so backend can unset
        serviceType: editForm.serviceType as any,
        homeDelivery: editForm.homeDelivery as any,
      } as any);

      setIsEditTestOpen(false);
      setEditTestId(null);
      await reloadTests();
      toast.success('Test updated');
    } catch (e: any) {
      console.error('Error updating test:', e);
      toast.error(e?.message || 'Failed to update test');
    } finally {
      setIsUpdatingTest(false);
    }
  };

  const reloadTests = async () => {
    if (!user?.id) return;
    try {
      console.log('Fetching laboratory tests for user:', user.id);
      const docs = await apiList();
      console.log('Laboratory tests fetched:', docs);

      // Map to UI Test type for table
      const mapped: any[] = docs.map((d: any) => ({
        id: String(d._id),
        name: d.name,
        description: d.description || '',
        price: d.price || 0,
        category: d.category || 'Test',
        duration: d.duration || '',
        image: d.imageUrl,
        providerId: user.id,
        providerName: d.providerName || (user?.name || 'Laboratory'),
        providerType: 'laboratory' as const,
        // Location fields included so Edit dialog pre-fills correctly
        city: d.city || '',
        detailAddress: d.detailAddress || '',
        googleMapLink: d.googleMapLink || '',
        availability: d.availability,
        serviceType: d.serviceType,
        homeDelivery: Boolean(d.homeDelivery) || false,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }));

      setTests(mapped);

      // Sync to local storage for other pages
      syncServicesFromBackend(docs);

    } catch (error) {
      console.error('Error loading tests:', error);
      toast.error('Failed to load tests. Please refresh the page.');
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

  useEffect(() => {
    if (user?.id) {
      reloadTests();
      fetchBookings();
      fetchWalletData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAddTest = async () => {
    // Check all required fields first
    const validation = validateRequiredFields();
    if (!validation.isValid) {
      const fieldList = validation.missingFields.join(', ');
      toast({
        title: "Required Fields Missing",
        description: `Please fill in the following required fields: ${fieldList}`,
        variant: "destructive"
      });
      return;
    }
    
    // Enforce length constraints
    if (!validateAddLengths()) return;
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User ID is missing",
        variant: "destructive"
      });
      return;
    }

    setIsAddingTest(true);
    const parsedPrice = testForm.price ? parseFloat(testForm.price) : 0;

    try {
      let imageUrl: string | undefined = undefined;
      let imagePublicId: string | undefined = undefined;

      if (testImageFile) {
        setIsUploadingImage(true);
        try {
          const result = await uploadFile(testImageFile);
          imageUrl = result?.url;
          imagePublicId = result?.public_id;
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          toast({
            title: "Warning",
            description: "Image upload failed, but test will be added without image",
            variant: "destructive"
          });
        } finally {
          setIsUploadingImage(false);
        }
      }

      // Save to backend
      const created = await apiCreate({
        name: testForm.name,
        description: testForm.description,
        price: parsedPrice,
        category: testForm.category || 'Test',
        duration: testForm.duration,
        imageUrl,
        imagePublicId,
        googleMapLink: testForm.googleMapLink,
        city: testForm.city,
        detailAddress: testForm.detailAddress,
        availability: testForm.availability as any,
        serviceType: (testForm.serviceType as any) || undefined,
        homeDelivery: testForm.homeDelivery as any,
        providerName: user?.name || 'Laboratory',
      });

      // Sync to local storage for other pages
      const newTest = {
        name: created.name,
        description: created.description,
        price: created.price,
        category: created.category,
        image: created.imageUrl,
        providerId: user.id,
        providerName: created.providerName,
        providerType: 'laboratory' as const,
        availability: (created as any)?.availability,
        homeDelivery: Boolean((created as any)?.homeDelivery) || false,
      };

      // Add to local storage
      ServiceManager.addService(newTest);

      // Reset form
      setTestForm({ name: '', price: '', duration: '', description: '', category: '', googleMapLink: '', city: '', detailAddress: '', availability: 'Physical', serviceType: [], homeDelivery: false });
      setAddErrors({});

      setTestImagePreview('');
      setTestImageFile(null);
      setIsAddTestOpen(false);

      // Reload tests from backend
      await reloadTests();

      toast({
        title: "Success",
        description: "Test added successfully and is now available to all users"
      });
    } catch (error: any) {
      console.error('Error adding test:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to add test. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAddingTest(false);
    }
  };

  const handleTypeChange = (type: string) => {
    // Deprecated: specialization is edited via Edit Profile dialog now
    // setLabType(type);
  };



  return (
    <>
      {/* Full Screen Loader */}
      <FullScreenLoader 
        isVisible={isAddingTest || isUpdatingTest} 
        message={isUpdatingTest ? "Updating Test..." : "Adding Test..."} 
      />
      
      <div className="min-h-screen bg-background p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 break-words">{user?.name} Laboratory</h1>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
                Manage diagnostic tests and lab operations
              </p>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
              Manage diagnostic tests and lab operations
            </p>
          </div>
        </div>

        {/* Verification Banner */}
        {user?.role === 'laboratory' &&
         !user?.isVerified &&
         (user as any)?.verificationStatus === 'pending' &&
         Boolean(String((user as any)?.licenseNumber || '').trim().length) && (
          <Card className="mb-8 border-warning bg-warning/5">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-warning mb-1">Laboratory License Verification Pending</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your laboratory license is being verified. You can start processing tests once verified.
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
          {/* Total Tests Card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-blue-100 truncate">Total Tests</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{tests.length}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-blue-400/20 flex-shrink-0">
                  <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-10 sm:translate-x-10"></div>
            </CardContent>
          </Card>

          {/* Total Bookings Card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-emerald-100 truncate">Total Bookings</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">
                    {isLoadingBookings ? '...' : bookings.length}
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-emerald-400/20 flex-shrink-0">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Balance Card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-purple-100 truncate">Available Balance</p>
                  <CurrencyAmount
                    amount={walletData?.availableBalance ?? null}
                    loading={isLoadingWallet}
                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold break-all"
                  />
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-purple-400/20 flex-shrink-0">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Earnings Card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-amber-100 truncate">Total Earnings</p>
                  <CurrencyAmount
                    amount={walletData?.totalEarnings ?? null}
                    loading={isLoadingWallet}
                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold break-all"
                  />
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-amber-400/20 flex-shrink-0">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Edit Test Dialog */}
            <Dialog open={isEditTestOpen} onOpenChange={setIsEditTestOpen}>
              <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 border-slate-700 text-white shadow-2xl mx-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-800/50 [&::-webkit-scrollbar-thumb]:bg-blue-600/70 [&::-webkit-scrollbar-thumb:hover]:bg-blue-500/80">
                <DialogHeader>
                  <DialogTitle className="text-white text-xl font-semibold">Edit Test</DialogTitle>
                  <DialogDescription>
                    Update details for this diagnostic test
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="editTestName" className="text-white">Test Name <span className="text-red-400">*</span></Label>
                    <Input
                      id="editTestName"
                      value={editForm.name}
                      onChange={(e) => { setEditForm({ ...editForm, name: e.target.value }); validateEditField('name', e.target.value); }}
                      placeholder="e.g., Complete Blood Count"
                      className={editErrors.name ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                    />
                    {editErrors.name && (
                      <p className="text-xs text-red-600 mt-1">{editErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-white">Test Image <span className="text-red-400">*</span></Label>
                    <ImageUpload
                      onImageSelect={(file, preview) => {
                        setEditImageFile(file);
                        setEditImagePreview(preview);
                      }}
                      onImageRemove={() => {
                        setEditImageFile(null);
                        setEditImagePreview('');
                        setEditForm({ ...editForm, imageUrl: '' });
                      }}
                      currentImage={editImagePreview || editForm.imageUrl}
                      placeholder="Upload test image"
                      className="max-w-xs"
                      aspectRatio={16 / 9}
                    />
                    <p className="text-[11px] text-gray-100 mt-1">Recommended image ratio: 16:9 (e.g., 1280×720). تصویر کا تناسب 16:9 رکھیں۔</p>
                    <p className="text-[11px] text-blue-300 mt-1">Images are automatically compressed for better performance while maintaining quality. Maximum file size: 5MB.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editTestPrice">Price (PKR) *</Label>
                      <Input
                        id="editTestPrice"
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        placeholder="e.g., 1500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editTestDuration">Duration (hours)</Label>
                      <Input
                        id="editTestDuration"
                        value={editForm.duration}
                        onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                        placeholder="e.g., 2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="editTestCategory">Category</Label>
                    <Select value={editForm.category} onValueChange={(value) => { setEditForm({ ...editForm, category: value }); validateEditField('department', value); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select test category" />
                      </SelectTrigger>
                      <SelectContent>
                        {testCategories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {editErrors.department && (
                      <p className="text-xs text-red-600 mt-1">{editErrors.department}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="editTestDescription">Description</Label>
                    <Textarea
                      id="editTestDescription"
                      value={editForm.description}
                      onChange={(e) => { setEditForm({ ...editForm, description: e.target.value }); validateEditField('description', e.target.value); }}
                      placeholder="Brief description of the test"
                      className={editErrors.description ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                    />
                    {editErrors.description && (
                      <p className="text-xs text-red-600 mt-1">{editErrors.description}</p>
                    )}
                  </div>

                  {/* Location Fields */}
                  <div className="space-y-3 border-t pt-3">
                    <h4 className="font-medium text-sm">Location Information</h4>
                    <div>
                      <Label htmlFor="editTestCity">City</Label>
                      <Input
                        id="editTestCity"
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
                      <Label htmlFor="editTestAddress">Detailed Address</Label>
                      <Textarea
                        id="editTestAddress"
                        value={editForm.detailAddress}
                        onChange={(e) => { setEditForm({ ...editForm, detailAddress: e.target.value }); validateEditField('address', e.target.value); }}
                        placeholder="e.g., Floor 2, Medical Plaza, Main Road"
                        rows={2}
                        className={editErrors.detailAddress ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                      />
                      {editErrors.detailAddress && (
                        <p className="text-xs text-red-600 mt-1">{editErrors.detailAddress}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="editTestMapLink">Google Maps Link (Optional)</Label>
                      <Input
                        id="editTestMapLink"
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

                  {/* Availability */}
                  <div className="space-y-3 border-t pt-3">
                    <h4 className="font-medium text-sm">Service Availability</h4>
                    <div className="space-y-2">
                      <Label>How is this test available? *</Label>
                      <div className="flex flex-col space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="editAvailability"
                            value="Physical"
                            checked={editForm.availability === 'Physical'}
                            onChange={(e) => setEditForm({ ...editForm, availability: e.target.value as any })}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">Physical - In-person sample collection only</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="editAvailability"
                            value="Online"
                            checked={editForm.availability === 'Online'}
                            onChange={(e) => setEditForm({ ...editForm, availability: e.target.value as any })}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">Online - Report review/booking online</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="editAvailability"
                            value="Online and Physical"
                            checked={editForm.availability === 'Online and Physical'}
                            onChange={(e) => setEditForm({ ...editForm, availability: e.target.value as any })}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">Online and Physical - Both options available</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Service Type (Optional) */}
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
                      <Label>What type of service is this? (Select multiple if applicable)</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center space-x-2 cursor-pointer">
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
                          <span className="text-sm">Private</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
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
                          <span className="text-sm">Public</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
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
                          <span className="text-sm">Charity</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
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
                          <span className="text-sm">NGO</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
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
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm">NPO</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
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
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm">Sehat Card</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Home Delivery */}
                  <div className="space-y-2 border-t pt-3">
                    <h4 className="font-medium text-sm">Home Delivery</h4>
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editForm.homeDelivery}
                        onChange={(e) => setEditForm({ ...editForm, homeDelivery: e.target.checked })}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm">🏠 Home Delivery Available</span>
                    </label>
                  </div>

                  <Button onClick={handleUpdateTest}  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg" disabled={isUploadingImage || isUpdatingTest}>
                    {isUpdatingTest ? 'Updating...' : 'Update Test'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Tabs defaultValue="tests">
              <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-100 to-gray-200 p-1 rounded-xl shadow-inner">
                <TabsTrigger
                  value="tests"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium text-xs sm:text-sm md:text-base px-2 py-2 sm:px-3 sm:py-2"
                >
                  Tests
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

              <TabsContent value="tests">
                <div className="space-y-6">
                  {/* Lab Tests Management */}
                  <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-t-lg">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">Lab Tests</CardTitle>
                          <CardDescription className="text-blue-100">Manage your diagnostic tests and pricing</CardDescription>
                        </div>
                        <Dialog open={isAddTestOpen} onOpenChange={setIsAddTestOpen}>
                          <DialogTrigger asChild>
                            <Button onClick={initializeNewTestForm} className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg transition-all duration-300 px-2 py-1 sm:px-3 sm:py-2 h-8 sm:h-10">
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              <span className="text-[10px] sm:text-sm font-medium">Add</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 border-slate-700 text-white shadow-2xl mx-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-800/50 [&::-webkit-scrollbar-thumb]:bg-blue-600/70 [&::-webkit-scrollbar-thumb:hover]:bg-blue-500/80">
                            <DialogHeader>
                              <DialogTitle className="text-white text-xl font-semibold">Add New Test</DialogTitle>
                              <DialogDescription className="text-slate-300">
                                Add a new diagnostic test to your lab
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="testName" className="text-white">Test Name <span className="text-red-400">*</span></Label>
                                <Input
                                  id="testName"
                                  value={testForm.name}
                                  onChange={(e) => { setTestForm({ ...testForm, name: e.target.value }); validateAddField('name', e.target.value); }}
                                  placeholder="e.g., Complete Blood Count"
                                  className={addErrors.name ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                                />
                                {addErrors.name && (
                                  <p className="text-xs text-red-600 mt-1">{addErrors.name}</p>
                                )}
                              </div>

                              <div>
                                <Label className="text-white">Test Image <span className="text-red-400">*</span></Label>
                                <ImageUpload
                                  onImageSelect={(file, preview) => {
                                    setTestImageFile(file);
                                    setTestImagePreview(preview);
                                  }}
                                  onImageRemove={() => {
                                    setTestImageFile(null);
                                    setTestImagePreview('');
                                  }}
                                  currentImage={testImagePreview}
                                  placeholder="Upload test image"
                                  className="max-w-xs"
                                  aspectRatio={16 / 9}
                                />
                                <p className="text-[11px] text-gray-100 mt-1">Recommended image ratio: 16:9 (e.g., 1280×720). تصویر کا تناسب 16:9 رکھیں۔</p>
                                <p className="text-[11px] text-blue-300 mt-1">Images are automatically compressed for better performance while maintaining quality. Maximum file size: 5MB.</p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="testPrice" className="text-white">Price (PKR) <span className="text-red-400">*</span></Label>
                                  <Input
                                    id="testPrice"
                                    type="number"
                                    value={testForm.price}
                                    onChange={(e) => setTestForm({ ...testForm, price: e.target.value })}
                                    placeholder="e.g., 1500"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="testDuration" className="text-white">Duration (hours)</Label>
                                  <Input
                                    id="testDuration"
                                    value={testForm.duration}
                                    onChange={(e) => setTestForm({ ...testForm, duration: e.target.value })}
                                    placeholder="e.g., 2"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="testCategory" className="text-white">Category <span className="text-red-400">*</span></Label>
                                <Select value={testForm.category} onValueChange={(value) => { setTestForm({ ...testForm, category: value }); validateAddField('department', value); }}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select test category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {testCategories.map((category) => (
                                      <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {addErrors.department && (
                                  <p className="text-xs text-red-600 mt-1">{addErrors.department}</p>
                                )}
                              </div>
                              <div>
                                <Label htmlFor="testDescription" className="text-white">Description <span className="text-red-400">*</span></Label>
                                <Textarea
                                  id="testDescription"
                                  value={testForm.description}
                                  onChange={(e) => { setTestForm({ ...testForm, description: e.target.value }); validateAddField('description', e.target.value); }}
                                  placeholder="Brief description of the test"
                                  className={addErrors.description ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                                />
                                {addErrors.description && (
                                  <p className="text-xs text-red-600 mt-1">{addErrors.description}</p>
                                )}
                              </div>

                              {/* Location Fields */}
                              <div className="space-y-3 border-t pt-3">
                                <h4 className="font-medium text-sm text-white">Location Information</h4>
                                <div>
                                  <Label htmlFor="testCity" className="text-white">City <span className="text-red-400">*</span></Label>
                                  <Input
                                    id="testCity"
                                    value={testForm.city}
                                    onChange={(e) => { setTestForm({ ...testForm, city: e.target.value }); validateAddField('city', e.target.value); }}
                                    placeholder="e.g., Karachi"
                                    className={addErrors.city ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                                  />
                                  {addErrors.city && (
                                    <p className="text-xs text-red-600 mt-1">{addErrors.city}</p>
                                  )}
                                </div>

                                <div>
                                  <Label htmlFor="testAddress" className="text-white">Detailed Address <span className="text-red-400">*</span></Label>
                                  <Textarea
                                    id="testAddress"
                                    value={testForm.detailAddress}
                                    onChange={(e) => { setTestForm({ ...testForm, detailAddress: e.target.value }); validateAddField('address', e.target.value); }}
                                    placeholder="e.g., Floor 2, Medical Plaza, Main Road"
                                    rows={2}
                                    className={addErrors.detailAddress ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                                  />
                                  {addErrors.detailAddress && (
                                    <p className="text-xs text-red-600 mt-1">{addErrors.detailAddress}</p>
                                  )}
                                </div>

                                <div>
                                  <Label htmlFor="testMapLink" className="text-white">Google Maps Link (Optional)</Label>
                                  <Input
                                    id="testMapLink"
                                    value={testForm.googleMapLink}
                                    onChange={(e) => { setTestForm({ ...testForm, googleMapLink: e.target.value }); validateAddLink(e.target.value); }}
                                    placeholder="https://maps.google.com/..."
                                    className={addErrors.googleMapLink ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                                  />
                                  {addErrors.googleMapLink && (
                                    <p className="text-xs text-red-600 mt-1">{addErrors.googleMapLink}</p>
                                  )}
                                </div>
                              </div>

                              {/* Availability */}
                              <div className="space-y-3 border-t pt-3">
                                <h4 className="font-medium text-sm text-white">Service Availability</h4>
                                <div className="space-y-2">
                                  <Label className="text-white">How is this test available? <span className="text-red-400">*</span></Label>
                                  <div className="flex flex-col space-y-2">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="availability"
                                        value="Physical"
                                        checked={testForm.availability === 'Physical'}
                                        onChange={(e) => setTestForm({ ...testForm, availability: e.target.value })}
                                        className="text-primary focus:ring-primary"
                                      />
                                      <span className="text-sm text-white">Physical - In-person sample collection only</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="availability"
                                        value="Online"
                                        checked={testForm.availability === 'Online'}
                                        onChange={(e) => setTestForm({ ...testForm, availability: e.target.value })}
                                        className="text-primary focus:ring-primary"
                                      />
                                      <span className="text-sm text-white">Online - Report review/booking online</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="availability"
                                        value="Online and Physical"
                                        checked={testForm.availability === 'Online and Physical'}
                                        onChange={(e) => setTestForm({ ...testForm, availability: e.target.value })}
                                        className="text-primary focus:ring-primary"
                                      />
                                      <span className="text-sm text-white">Online and Physical - Both options available</span>
                                    </label>
                                  </div>
                                </div>
                              </div>

                              {/* Service Type (Optional) */}
                              <div className="space-y-3 border-t pt-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm text-white">Service Type (Optional)</h4>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setTestForm(prev => ({ ...prev, serviceType: [] }))}
                                    className="h-8 px-2 text-xs bg-gray-200 text-gray-600 hover:text-red-600"
                                  >
                                    Clear
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-white">What type of service is this? (Select multiple if applicable)</Label>
                                  <div className="grid grid-cols-2 gap-3">

                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        value="Private"
                                        checked={testForm.serviceType.includes('Private')}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setTestForm(prev => ({
                                            ...prev,
                                            serviceType: e.target.checked
                                              ? [...prev.serviceType, value]
                                              : prev.serviceType.filter(type => type !== value)
                                          }));
                                        }}
                                        className="text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm text-white">Private</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        value="Public"
                                        checked={testForm.serviceType.includes('Public')}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setTestForm(prev => ({
                                            ...prev,
                                            serviceType: e.target.checked
                                              ? [...prev.serviceType, value]
                                              : prev.serviceType.filter(type => type !== value)
                                          }));
                                        }}
                                        className="text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm text-white">Public</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        value="Charity"
                                        checked={testForm.serviceType.includes('Charity')}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setTestForm(prev => ({
                                            ...prev,
                                            serviceType: e.target.checked
                                              ? [...prev.serviceType, value]
                                              : prev.serviceType.filter(type => type !== value)
                                          }));
                                        }}
                                        className="text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm text-white">Charity</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        value="NGO"
                                        checked={testForm.serviceType.includes('NGO')}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setTestForm(prev => ({
                                            ...prev,
                                            serviceType: e.target.checked
                                              ? [...prev.serviceType, value]
                                              : prev.serviceType.filter(type => type !== value)
                                          }));
                                        }}
                                        className="text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm text-white">NGO</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        value="Sehat Card"
                                        checked={testForm.serviceType.includes('Sehat Card')}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setTestForm(prev => ({
                                            ...prev,
                                            serviceType: e.target.checked
                                              ? [...prev.serviceType, value]
                                              : prev.serviceType.filter(type => type !== value)
                                          }));
                                        }}
                                        className="text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm text-white">Sehat Card</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        value="NPO"
                                        checked={testForm.serviceType.includes('NPO')}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setTestForm(prev => ({
                                            ...prev,
                                            serviceType: e.target.checked
                                              ? [...prev.serviceType, value]
                                              : prev.serviceType.filter(type => type !== value)
                                          }));
                                        }}
                                        className="text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm text-white">NPO</span>
                                    </label>
                                  </div>
                                </div>
                              </div>

                              {/* Home Delivery */}
                              <div className="space-y-2 border-t pt-3">
                                <h4 className="font-medium text-sm text-white">Home Delivery</h4>
                                <label className="flex items-center space-x-2 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={testForm.homeDelivery}
                                    onChange={(e) => setTestForm({ ...testForm, homeDelivery: e.target.checked })}
                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                                  />
                                  <span className="text-sm text-white">🏠 Home Delivery Available</span>
                                </label>
                              </div>

                              <div className="flex justify-end">
                                <Button onClick={handleAddTest} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg min-w-[140px]" disabled={isUploadingImage || isAddingTest}>
                                  {isAddingTest ? 'Adding Test...' : 'Add Test'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
</CardHeader>
                    <CardContent className="max-h-[600px] overflow-y-auto">
                      <div className="space-y-4">
                        {tests.length > 0 ? (
                          <>
                            {/* Mobile cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
                              {tests.map((test) => (
                                <div key={test.id} className="p-3 sm:p-4 border rounded-lg shadow-sm">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                      {test.image ? (
                                        <img
                                          src={test.image}
                                          alt={test.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            (target.nextElementSibling as HTMLElement)!.classList.remove('hidden');
                                          }}
                                        />
                                      ) : null}
                                      <span className={`text-gray-400 text-lg ${test.image ? 'hidden' : ''}`}>🔬</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium truncate">{test.name}</div>
                                      <div className="text-xs sm:text-sm text-muted-foreground truncate">{test.description}</div>
                                      <div className="mt-1">
                                        <span className="text-xs text-muted-foreground truncate block">
                                          {formatAddress((test as any).detailAddress || (test as any).city)}
                                        </span>
                                      </div>
                                      <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className="text-xs sm:text-sm">PKR {test.price.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-3 grid grid-cols-2 gap-2">
                                    <Button size="sm" variant="outline" className="w-full" onClick={() => openEditDialog(test)}>
                                      <Edit className="w-4 h-4 mr-1" /> Edit
                                    </Button>
                                    <Button size="sm" variant="destructive" className="w-full" onClick={() => handleDeleteTest(test.id)}>
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
                                  {tests.map((test) => (
                                    <TableRow key={test.id}>
                                      <TableCell>
                                        <div className="flex items-center gap-3">
                                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {test.image ? (
                                              <img
                                                src={test.image}
                                                alt={test.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                  const target = e.target as HTMLImageElement;
                                                  target.style.display = 'none';
                                                  target.nextElementSibling!.classList.remove('hidden');
                                                }}
                                              />
                                            ) : null}
                                            <span className={`text-gray-400 text-lg ${test.image ? 'hidden' : ''}`}>🔬</span>
                                          </div>
                                          <div className="min-w-0">
                                            <p className="font-medium truncate max-w-[240px]">{test.name}</p>
                                            <p className="text-sm text-muted-foreground truncate max-w-[260px]">{test.description}</p>
                                            <div className="space-y-1 mt-1 max-w-[420px]">
                                              <span className="text-xs text-muted-foreground truncate block">
                                                {formatAddress((test as any).detailAddress || (test as any).city)}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>PKR {test.price.toLocaleString()}</TableCell>
                                      <TableCell>
                                        <div className="flex space-x-2">
                                          <Button size="sm" variant="outline" onClick={() => openEditDialog(test)}>
                                            <Edit className="w-4 h-4 mr-1" /> Edit
                                          </Button>
                                          <Button size="sm" variant="destructive" onClick={() => handleDeleteTest(test.id)}>
                                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>

                          </>
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            No tests added yet.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                  <CardContent className="max-h-[600px] overflow-y-auto">
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
                    )}
                  </CardContent>
                </Card>
              </TabsContent>


              <TabsContent value="wallet">
                <ProviderWallet />
              </TabsContent>
            </Tabs>

            <Dialog open={isScheduling} onOpenChange={setIsScheduling}>
              <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto mx-auto">
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
                  <FlaskConical className="w-5 h-5" />
                  Laboratory Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-center mb-6">
                  <div className="mb-4 relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                    <ProfileImageUpload
                      currentImage={user?.avatar}
                      userName={user?.name || 'Laboratory'}
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

            {/* Registration Verification */}
            <RegistrationVerification />

            {/* Edit Profile Dialog */}
            <EditProfileDialog
              open={isEditProfileOpen}
              onOpenChange={setIsEditProfileOpen}
              role={(user?.role as any) || 'laboratory'}
              name={user?.name}
              specialization={user?.specialization}
              avatar={user?.avatar}
            />


          </div>
        </div>
      </div>
    </>
  );
};

export default LaboratoryDashboard;