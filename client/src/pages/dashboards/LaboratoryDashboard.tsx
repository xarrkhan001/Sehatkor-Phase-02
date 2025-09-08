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
  TestTube,
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

const LaboratoryDashboard = () => {
  const { user, logout } = useAuth();
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
    serviceType: '' as '' | 'Private' | 'Public' | 'Charity' | 'NGO' | 'NPO' | 'Sehat Card',
    imageUrl: '',
    homeDelivery: false
  });
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [isUpdatingTest, setIsUpdatingTest] = useState(false);

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
    serviceType: '',
    homeDelivery: false
  });

  const testCategories = [
    'Blood Test', 'Urine Test', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound'
  ];

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
      serviceType: (t.serviceType as any) || '',
      imageUrl: t.image || '',
      homeDelivery: Boolean(t.homeDelivery) || false
    });
    setEditImagePreview(t.image || '');
    setEditImageFile(null);
    setIsEditTestOpen(true);
  };

  const handleUpdateTest = async () => {
    if (!editTestId) return;
    if (!editForm.name) {
      toast.error('Please fill in required fields');
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
      const response = await fetch(`http://localhost:4000/api/payments/wallet/${user.id}`, {
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
    if (!testForm.name || !user?.id) {
      toast.error("Please fill in all required fields");
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
          toast.warning("Image upload failed, but test will be added without image");
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
      setTestForm({ name: '', price: '', duration: '', description: '', category: '', googleMapLink: '', city: '', detailAddress: '', availability: 'Physical', serviceType: '', homeDelivery: false });

      setTestImagePreview('');
      setTestImageFile(null);
      setIsAddTestOpen(false);

      // Reload tests from backend
      await reloadTests();

      toast.success("Test added successfully and is now available to all users");
    } catch (error: any) {
      console.error('Error adding test:', error);
      toast.error(error?.message || "Failed to add test. Please try again.");
    } finally {
      setIsAddingTest(false);
    }
  };

  const handleTypeChange = (type: string) => {
    // Deprecated: specialization is edited via Edit Profile dialog now
    // setLabType(type);
  };

  const pendingTests = [
    { id: 1, patient: "Ahmad Ali", test: "Blood Test Complete", time: "9:00 AM", status: "Processing" },
    { id: 2, patient: "Sara Khan", test: "Urine Analysis", time: "10:30 AM", status: "Pending" },
    { id: 3, patient: "Hassan Ahmed", test: "X-Ray Chest", time: "11:00 AM", status: "Ready" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{user?.name} Laboratory</h1>
            <p className="text-muted-foreground">
              Manage diagnostic tests and lab operations
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Tests Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Total Tests</p>
                  <p className="text-2xl font-bold">{tests.length}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-400/20">
                  <TestTube className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Bookings Card */}
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-100">Total Bookings</p>
                  <p className="text-2xl font-bold">
                    {isLoadingBookings ? '...' : bookings.length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-emerald-400/20">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Balance Card */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">Available Balance</p>
                  <CurrencyAmount
                    amount={walletData?.availableBalance ?? null}
                    loading={isLoadingWallet}
                    className="text-2xl font-bold"
                  />
                </div>
                <div className="p-3 rounded-full bg-purple-400/20">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Earnings Card */}
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-100">Total Earnings</p>
                  <CurrencyAmount
                    amount={walletData?.totalEarnings ?? null}
                    loading={isLoadingWallet}
                    className="text-2xl font-bold"
                  />
                </div>
                <div className="p-3 rounded-full bg-amber-400/20">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Test Dialog */}
            <Dialog open={isEditTestOpen} onOpenChange={setIsEditTestOpen}>
              <DialogContent className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Test</DialogTitle>
                  <DialogDescription>
                    Update details for this diagnostic test
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="editTestName">Test Name *</Label>
                    <Input
                      id="editTestName"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="e.g., Complete Blood Count"
                    />
                  </div>

                  <div>
                    <Label>Test Image</Label>
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
                    />
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
                    <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select test category" />
                      </SelectTrigger>
                      <SelectContent>
                        {testCategories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="editTestDescription">Description</Label>
                    <Textarea
                      id="editTestDescription"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Brief description of the test"
                    />
                  </div>

                  {/* Location Fields */}
                  <div className="space-y-3 border-t pt-3">
                    <h4 className="font-medium text-sm">Location Information</h4>
                    <div>
                      <Label htmlFor="editTestCity">City</Label>
                      <Input
                        id="editTestCity"
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        placeholder="e.g., Karachi"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editTestAddress">Detailed Address</Label>
                      <Textarea
                        id="editTestAddress"
                        value={editForm.detailAddress}
                        onChange={(e) => setEditForm({ ...editForm, detailAddress: e.target.value })}
                        placeholder="e.g., Floor 2, Medical Plaza, Main Road"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editTestMapLink">Google Maps Link (Optional)</Label>
                      <Input
                        id="editTestMapLink"
                        value={editForm.googleMapLink}
                        onChange={(e) => setEditForm({ ...editForm, googleMapLink: e.target.value })}
                        placeholder="https://maps.google.com/..."
                      />
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
                        onClick={() => setEditForm(prev => ({ ...prev, serviceType: '' }))}
                        className="h-8 px-2 text-xs text-gray-600 hover:text-red-600"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>What type of service is this?</Label>
                      <div className="grid grid-cols-2 gap-3">

                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="editServiceType"
                            value="Private"
                            checked={editForm.serviceType === 'Private'}
                            onChange={(e) => setEditForm({ ...editForm, serviceType: e.target.value as any })}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">Private</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="editServiceType"
                            value="Public"
                            checked={editForm.serviceType === 'Public'}
                            onChange={(e) => setEditForm({ ...editForm, serviceType: e.target.value as any })}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">Public</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="editServiceType"
                            value="Charity"
                            checked={editForm.serviceType === 'Charity'}
                            onChange={(e) => setEditForm({ ...editForm, serviceType: e.target.value as any })}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">Charity</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="editServiceType"
                            value="NGO"
                            checked={editForm.serviceType === 'NGO'}
                            onChange={(e) => setEditForm({ ...editForm, serviceType: e.target.value as any })}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">NGO</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="editServiceType"
                            value="Sehat Card"
                            checked={editForm.serviceType === 'Sehat Card'}
                            onChange={(e) => setEditForm({ ...editForm, serviceType: e.target.value as any })}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">Sehat Card</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="editServiceType"
                            value="NPO"
                            checked={editForm.serviceType === 'NPO'}
                            onChange={(e) => setEditForm({ ...editForm, serviceType: e.target.value as any })}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm">NPO</span>
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

                  <Button onClick={handleUpdateTest} className="w-full" disabled={isUploadingImage || isUpdatingTest}>
                    {isUpdatingTest ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Tabs defaultValue="tests">
              <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-100 to-gray-200 p-1 rounded-xl shadow-inner">
                <TabsTrigger 
                  value="tests"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium"
                >
                  Tests
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
              
              <TabsContent value="tests">
                <div className="space-y-6">
                  {/* Lab Tests Management */}
                  <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-t-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">Lab Tests</CardTitle>
                          <CardDescription className="text-blue-100">Manage your diagnostic tests and pricing</CardDescription>
                        </div>
                        <Dialog open={isAddTestOpen} onOpenChange={setIsAddTestOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 shadow-lg transition-all duration-300">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Test
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Add New Test</DialogTitle>
                              <DialogDescription>
                                Add a new diagnostic test to your lab
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="testName">Test Name *</Label>
                                <Input
                                  id="testName"
                                  value={testForm.name}
                                  onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                                  placeholder="e.g., Complete Blood Count"
                                />
                              </div>

                              <div>
                                <Label>Test Image</Label>
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
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="testPrice">Price (PKR) *</Label>
                                  <Input
                                    id="testPrice"
                                    type="number"
                                    value={testForm.price}
                                    onChange={(e) => setTestForm({ ...testForm, price: e.target.value })}
                                    placeholder="e.g., 1500"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="testDuration">Duration (hours)</Label>
                                  <Input
                                    id="testDuration"
                                    value={testForm.duration}
                                    onChange={(e) => setTestForm({ ...testForm, duration: e.target.value })}
                                    placeholder="e.g., 2"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="testCategory">Category</Label>
                                <Select value={testForm.category} onValueChange={(value) => setTestForm({ ...testForm, category: value })}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select test category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {testCategories.map((category) => (
                                      <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="testDescription">Description</Label>
                                <Textarea
                                  id="testDescription"
                                  value={testForm.description}
                                  onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                                  placeholder="Brief description of the test"
                                />
                              </div>

                              {/* Location Fields */}
                              <div className="space-y-3 border-t pt-3">
                                <h4 className="font-medium text-sm">Location Information</h4>
                                <div>
                                  <Label htmlFor="testCity">City</Label>
                                  <Input
                                    id="testCity"
                                    value={testForm.city}
                                    onChange={(e) => setTestForm({ ...testForm, city: e.target.value })}
                                    placeholder="e.g., Karachi"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="testAddress">Detailed Address</Label>
                                  <Textarea
                                    id="testAddress"
                                    value={testForm.detailAddress}
                                    onChange={(e) => setTestForm({ ...testForm, detailAddress: e.target.value })}
                                    placeholder="e.g., Floor 2, Medical Plaza, Main Road"
                                    rows={2}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="testMapLink">Google Maps Link (Optional)</Label>
                                  <Input
                                    id="testMapLink"
                                    value={testForm.googleMapLink}
                                    onChange={(e) => setTestForm({ ...testForm, googleMapLink: e.target.value })}
                                    placeholder="https://maps.google.com/..."
                                  />
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
                                        name="availability"
                                        value="Physical"
                                        checked={testForm.availability === 'Physical'}
                                        onChange={(e) => setTestForm({ ...testForm, availability: e.target.value })}
                                        className="text-primary focus:ring-primary"
                                      />
                                      <span className="text-sm">Physical - In-person sample collection only</span>
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
                                      <span className="text-sm">Online - Report review/booking online</span>
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
                                    onClick={() => setTestForm(prev => ({ ...prev, serviceType: '' }))}
                                    className="h-8 px-2 text-xs text-gray-600 hover:text-red-600"
                                  >
                                    Clear
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  <Label>What type of service is this?</Label>
                                  <div className="grid grid-cols-2 gap-3">

                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="serviceType"
                                        value="Private"
                                        checked={testForm.serviceType === 'Private'}
                                        onChange={(e) => setTestForm({ ...testForm, serviceType: e.target.value })}
                                        className="text-primary focus:ring-primary"
                                      />
                                      <span className="text-sm">Private</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="serviceType"
                                        value="Public"
                                        checked={testForm.serviceType === 'Public'}
                                        onChange={(e) => setTestForm({ ...testForm, serviceType: e.target.value })}
                                        className="text-primary focus:ring-primary"
                                      />
                                      <span className="text-sm">Public</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="serviceType"
                                        value="Charity"
                                        checked={testForm.serviceType === 'Charity'}
                                        onChange={(e) => setTestForm({ ...testForm, serviceType: e.target.value })}
                                        className="text-primary focus:ring-primary"
                                      />
                                      <span className="text-sm">Charity</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="serviceType"
                                        value="NGO"
                                        checked={testForm.serviceType === 'NGO'}
                                        onChange={(e) => setTestForm({ ...testForm, serviceType: e.target.value })}
                                        className="text-primary focus:ring-primary"
                                      />
                                      <span className="text-sm">NGO</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="serviceType"
                                        value="Sehat Card"
                                        checked={testForm.serviceType === 'Sehat Card'}
                                        onChange={(e) => setTestForm({ ...testForm, serviceType: e.target.value })}
                                        className="text-primary focus:ring-primary"
                                      />
                                      <span className="text-sm">Sehat Card</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="serviceType"
                                        value="NPO"
                                        checked={testForm.serviceType === 'NPO'}
                                        onChange={(e) => setTestForm({ ...testForm, serviceType: e.target.value })}
                                        className="text-primary focus:ring-primary"
                                      />
                                      <span className="text-sm">NPO</span>
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
                                    checked={testForm.homeDelivery}
                                    onChange={(e) => setTestForm({ ...testForm, homeDelivery: e.target.checked })}
                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                                  />
                                  <span className="text-sm">🏠 Home Delivery Available</span>
                                </label>
                              </div>

                              <Button onClick={handleAddTest} className="w-full" disabled={isUploadingImage || isAddingTest}>
                                {isAddingTest ? 'Adding Test...' : 'Add Test'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {tests.length > 0 ? (
                          <>
                            {/* Mobile cards */}
                            <div className="grid gap-4 md:hidden">
                              {tests.map((test) => (
                                <div key={test.id} className="p-4 border rounded-lg shadow-sm">
                                  <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
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
                                    <div className="flex-1">
                                      <div className="font-medium">{test.name}</div>
                                      <div className="text-sm text-muted-foreground line-clamp-2">{test.description}</div>
                                      <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[11px] leading-none whitespace-nowrap">{test.category}</Badge>
                                        <span className="text-sm">PKR {test.price.toLocaleString()}</span>
                                        <span className="text-xs text-muted-foreground">{test.duration || 'N/A'}</span>
                                        <AvailabilityBadge availability={test.availability || 'Physical'} size="sm" />
                                        {test.serviceType && (
                                          <ServiceTypeBadge serviceType={test.serviceType} size="sm" />
                                        )}

                                        {test.homeDelivery ? (
                                          <Badge className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[11px]">🏠 Home Delivery</Badge>
                                        ) : null}
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
                                    <TableHead>Image</TableHead>
                                    <TableHead>Test Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price (PKR)</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Availability</TableHead>
                                    <TableHead>Service Type</TableHead>
                                    <TableHead>Home Delivery</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {tests.map((test) => (
                                    <TableRow key={test.id}>
                                      <TableCell>

                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
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
                                      </TableCell>
                                      <TableCell className="font-medium">{test.name}</TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[11px] leading-none whitespace-nowrap">
                                          {test.category}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>PKR {test.price.toLocaleString()}</TableCell>
                                      <TableCell>{test.duration || 'N/A'}</TableCell>
                                      <TableCell>
                                        <AvailabilityBadge availability={test.availability || 'Physical'} size="md" />
                                      </TableCell>
                                      <TableCell>
                                        {test.serviceType && (
                                          <ServiceTypeBadge serviceType={test.serviceType} size="md" />
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {test.homeDelivery ? (
                                          <Badge className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-emerald-500 text-white whitespace-nowrap">🏠 Available</Badge>
                                        ) : (
                                          <Badge variant="secondary" className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 whitespace-nowrap">Not Available</Badge>
                                        )}
                                      </TableCell>
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
                  <TestTube className="w-5 h-5" />
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
    </div>
  );
};

export default LaboratoryDashboard;