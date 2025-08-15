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
import { useToast } from "@/hooks/use-toast";
import ServiceManager from "@/lib/serviceManager";
import { uploadFile } from "@/lib/chatApi";
import { listMedicines as apiList, createMedicine as apiCreate, updateMedicine as apiUpdate, deleteMedicine as apiDelete } from "@/lib/pharmacyApi";
import { 
  ShoppingBag, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  LogOut,
  Bell,
  Edit,
  FileText,
  Package,
  Truck,
  Activity,
  Pill,
  Plus,
  Trash2
} from "lucide-react";

const PharmacyDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);
  const [pharmacyType, setPharmacyType] = useState('');
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
    category: ''
  });
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const [medicineForm, setMedicineForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    category: ''
  });

  const pharmacyTypes = [
    'Retail Pharmacy', 'Hospital Pharmacy', 'Online Pharmacy', 
    'Compounding Pharmacy', 'Clinical Pharmacy', 'Chain Pharmacy'
  ];

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
      toast({
        title: "Error",
        description: "Failed to load medicines. Please refresh the page.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    // initial load and pharmacy type from localStorage
    reloadMedicines();
    const savedType = localStorage.getItem(`pharmacy_type_${user?.id}`);
    if (savedType) setPharmacyType(savedType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAddMedicine = async () => {
    if (!medicineForm.name || !user?.id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
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
          toast({
            title: "Warning",
            description: "Image upload failed, but medicine will be added without image",
            variant: "destructive"
          });
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
      setMedicineForm({ name: '', price: '', stock: '', description: '', category: '' });
      setMedicineImagePreview('');
      setMedicineImageFile(null);
      setIsAddMedicineOpen(false);
      
      // Reload medicines from backend
      await reloadMedicines();
      
      toast({ 
        title: "Success", 
        description: "Medicine added successfully and is now available to all users" 
      });
    } catch (error: any) {
      console.error('Error adding medicine:', error);
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to add medicine. Please try again.", 
        variant: "destructive" 
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
      toast({ title: "Success", description: "Medicine deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to delete medicine", variant: "destructive" });
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
      category: m.category || ''
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
      });
      // refresh from backend and sync ServiceManager
      await reloadMedicines();
      setIsEditOpen(false);
      setEditingMedicineId(null);
      toast({ title: "Updated", description: "Medicine updated successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || 'Failed to update', variant: 'destructive' });
    }
  };

  const handleTypeChange = (type) => {
    setPharmacyType(type);
    localStorage.setItem(`pharmacy_type_${user?.id}`, type);
    
    toast({
      title: "Success",
      description: "Pharmacy type updated successfully"
    });
  };

  const recentOrders = [
    { id: 1, customer: "Ahmad Ali", medicine: "Panadol 500mg", quantity: "20 tablets", status: "Ready" },
    { id: 2, customer: "Sara Khan", medicine: "Amoxicillin 250mg", quantity: "14 capsules", status: "Processing" },
    { id: 3, customer: "Hassan Ahmed", medicine: "Vitamin D3", quantity: "30 tablets", status: "Delivered" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{user?.name} Pharmacy</h1>
            <p className="text-muted-foreground">
              Manage medicines, prescriptions, and customer orders
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
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
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Medicines Management */}
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
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                  <div className="overflow-x-auto">
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
                )}
              </CardContent>
            </Card>

            {/* Edit Medicine Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Medicine</DialogTitle>
                  <DialogDescription>Update medicine details and image</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="editName">Medicine Name *</Label>
                    <Input id="editName" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
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
                      <Label htmlFor="editPrice">Price (PKR) *</Label>
                      <Input id="editPrice" type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="editStock">Stock Quantity</Label>
                      <Input id="editStock" type="number" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="editCategory">Category</Label>
                    <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select medicine category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(['Tablets','Capsules','Syrups','Injections','Ointments','Drops','Other'] as const).map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editDesc">Description</Label>
                    <Textarea id="editDesc" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={handleSaveEdit} disabled={isUploadingImage}>Save</Button>
                    <Button className="flex-1" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                  </div>
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
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{user?.name}</h3>
                  <Badge variant="outline" className="capitalize">{user?.role}</Badge>
                  {pharmacyType && (
                    <Badge variant="secondary" className="mt-2">{pharmacyType}</Badge>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">{user?.email}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pharmacyType">Pharmacy Type</Label>
                    <Select value={pharmacyType} onValueChange={handleTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pharmacy type" />
                      </SelectTrigger>
                      <SelectContent>
                        {pharmacyTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Pharmacy Info
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