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
  Truck
} from "lucide-react";

const PharmacyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
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
    detailAddress: ''
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
    detailAddress: ''
  });

  const medicineCategories = [
    'Tablets', 'Capsules', 'Syrups', 'Injections', 'Ointments', 'Drops'
  ];

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

  useEffect(() => {
    if (user?.id) {
      reloadMedicines();
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAddMedicine = async () => {
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
      };

      // Add to local storage
      ServiceManager.addService(newMedicine);

      // Reset form
      setMedicineForm({ name: '', price: '', stock: '', description: '', category: '', googleMapLink: '', city: '', detailAddress: '' });
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
      detailAddress: m.detailAddress || ''
    });
    setEditImagePreview(m.imageUrl || m.image || '');
    setEditImageFile(null);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMedicineId) return;
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
      });
      // refresh from backend and sync ServiceManager
      await reloadMedicines();
      setIsEditOpen(false);
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

  return (
    <div className="min-h-screen  p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{user?.name} Pharmacy</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage medicines, prescriptions, and customer orders
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-healthcare">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Orders</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-success">18</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-warning">6</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Today</p>
                  <p className="text-2xl font-bold">PKR 32,000</p>
                </div>
                <Activity className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Medicines Management */}
            <Tabs defaultValue="medicines">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="medicines">Medicines</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
              </TabsList>
              <TabsContent value="medicines">
                <Card className="card-healthcare">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Medicine Inventory</CardTitle>
                        <CardDescription>Manage your pharmacy inventory</CardDescription>
                      </div>
                      <Dialog open={isAddMedicineOpen} onOpenChange={setIsAddMedicineOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Medicine
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
                                onChange={(e) => setMedicineForm({...medicineForm, name: e.target.value})}
                                placeholder="e.g., Panadol 500mg"
                              />
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
                                  onChange={(e) => setMedicineForm({...medicineForm, price: e.target.value})}
                                  placeholder="e.g., 120"
                                />
                              </div>
                              <div>
                                <Label htmlFor="medicineStock">Stock Quantity</Label>
                                <Input
                                  id="medicineStock"
                                  type="number"
                                  value={medicineForm.stock}
                                  onChange={(e) => setMedicineForm({...medicineForm, stock: e.target.value})}
                                  placeholder="e.g., 100"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="medicineCategory">Category</Label>
                              <Select value={medicineForm.category} onValueChange={(value) => setMedicineForm({...medicineForm, category: value})}>
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
                                onChange={(e) => setMedicineForm({...medicineForm, description: e.target.value})}
                                placeholder="Brief description of the medicine"
                              />
                            </div>
                            {/* Location Fields */}
                            <div className="space-y-3 border-t pt-3">
                              <h4 className="font-medium text-sm">Location Information</h4>
                              <div>
                                <Label htmlFor="medicineCity">City</Label>
                                <Input
                                  id="medicineCity"
                                  value={medicineForm.city}
                                  onChange={(e) => setMedicineForm({...medicineForm, city: e.target.value})}
                                  placeholder="e.g., Karachi"
                                />
                              </div>
                              <div>
                                <Label htmlFor="medicineAddress">Detailed Address</Label>
                                <Textarea
                                  id="medicineAddress"
                                  value={medicineForm.detailAddress}
                                  onChange={(e) => setMedicineForm({...medicineForm, detailAddress: e.target.value})}
                                  placeholder="e.g., Shop 123, ABC Plaza, Main Road"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <Label htmlFor="medicineMapLink">Google Maps Link (Optional)</Label>
                                <Input
                                  id="medicineMapLink"
                                  value={medicineForm.googleMapLink}
                                  onChange={(e) => setMedicineForm({...medicineForm, googleMapLink: e.target.value})}
                                  placeholder="https://maps.google.com/..."
                                />
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
                  <CardContent>
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
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                  <Badge variant="outline">{m.category || '-'}</Badge>
                                  <span className="font-medium">PKR {m.price?.toLocaleString?.() ?? m.price ?? 0}</span>
                                  <span className="text-muted-foreground">Stock: {m.stock ?? '-'}</span>
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
                                <TableHead className="w-20">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price (PKR)</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {medicines.map((m) => {
                                const iid = m._id || m.id;
                                return (
                                <TableRow key={String(iid)}>
                                  <TableCell>
                                    {m.imageUrl || m.image ? (
                                      <img src={m.imageUrl || m.image} alt={m.name} className="w-14 h-14 object-cover rounded" />
                                    ) : (
                                      <div className="w-14 h-14 bg-muted rounded flex items-center justify-center">💊</div>
                                    )}
                                  </TableCell>
                                  <TableCell className="font-medium">{m.name}</TableCell>
                                  <TableCell>{m.category || '-'}</TableCell>
                                  <TableCell>{m.price ?? 0}</TableCell>
                                  <TableCell>{m.stock ?? '-'}</TableCell>
                                  <TableCell className="text-right space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => openEdit(m)}>
                                      <Edit className="w-4 h-4 mr-1" /> Edit
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDeleteMedicine(String(iid))}>
                                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )})}
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
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 sm:text-right">
                              <Badge
                                variant={booking.status === "Completed" ? "default" : "secondary"}
                                className={booking.status === "Completed" ? "bg-green-600" : booking.status === 'Scheduled' ? 'bg-blue-500' : 'bg-yellow-500'}
                              >
                                {booking.status}
                              </Badge>
                              {booking.status === 'Confirmed' && (
                                <Button size="sm" onClick={() => { setSelectedBooking(booking); setIsScheduling(true); }} className="w-full sm:w-auto">Schedule</Button>
                              )}
                              {booking.status === 'Scheduled' && (
                                <Button size="sm" variant="outline" onClick={() => completeBooking(booking._id)} className="w-full sm:w-auto">Mark as Complete</Button>
                              )}
                              {booking.status === 'Completed' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteBooking(booking._id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
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
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      placeholder="e.g., Panadol 500mg"
                    />
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
                        onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                        placeholder="e.g., 120"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editMedicineStock">Stock Quantity</Label>
                      <Input
                        id="editMedicineStock"
                        type="number"
                        value={editForm.stock}
                        onChange={(e) => setEditForm({...editForm, stock: e.target.value})}
                        placeholder="e.g., 100"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="editMedicineCategory">Category</Label>
                    <Select value={editForm.category} onValueChange={(value) => setEditForm({...editForm, category: value})}>
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
                    <Label htmlFor="editMedicineDescription">Description</Label>
                    <Textarea
                      id="editMedicineDescription"
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      placeholder="Brief description of the medicine"
                    />
                  </div>
                  {/* Location Fields */}
                  <div className="space-y-3 border-t pt-3">
                    <h4 className="font-medium text-sm">Location Information</h4>
                    <div>
                      <Label htmlFor="editMedicineCity">City</Label>
                      <Input
                        id="editMedicineCity"
                        value={editForm.city}
                        onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                        placeholder="e.g., Karachi"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editMedicineAddress">Detailed Address</Label>
                      <Textarea
                        id="editMedicineAddress"
                        value={editForm.detailAddress}
                        onChange={(e) => setEditForm({...editForm, detailAddress: e.target.value})}
                        placeholder="e.g., Shop 123, ABC Plaza, Main Road"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editMedicineMapLink">Google Maps Link (Optional)</Label>
                      <Input
                        id="editMedicineMapLink"
                        value={editForm.googleMapLink}
                        onChange={(e) => setEditForm({...editForm, googleMapLink: e.target.value})}
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                    <Button variant="outline" onClick={() => setIsEditOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                    <Button onClick={handleSaveEdit} className="w-full sm:w-auto" disabled={isUploadingImage}>
                      {isUploadingImage ? 'Updating...' : 'Update Medicine'}
                    </Button>
                  </div>
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
          <div className="space-y-6">
            <Card className="card-healthcare">
              <CardHeader>
                <CardTitle>Pharmacy Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="mb-4">
                    <ProfileImageUpload 
                      currentImage={user?.avatar}
                      userName={user?.name || 'Pharmacy'}
                      size="lg"
                    />
                  </div>
                  <h3 className="text-lg font-semibold">{user?.name}</h3>
                  <Badge variant="outline" className="capitalize">{user?.role}</Badge>
                  {user?.specialization && (
                    <Badge variant="secondary" className="mt-2">{user?.specialization}</Badge>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">{user?.email}</p>
                </div>

                <div className="space-y-4">
                  {/* Specialization now managed via Edit Profile dialog */}

                  <div className="space-y-2">
                    <Button className="w-full" variant="outline" onClick={() => setIsEditProfileOpen(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
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

            {/* Edit Profile Dialog */}
            <EditProfileDialog 
              open={isEditProfileOpen}
              onOpenChange={setIsEditProfileOpen}
              role={(user?.role as any) || 'pharmacy'}
              name={user?.name}
              specialization={user?.specialization}
              avatar={user?.avatar}
            />

            <Card className="card-healthcare">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Process Prescription
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Truck className="w-4 h-4 mr-2" />
                  Delivery Schedule
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  Sales Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;