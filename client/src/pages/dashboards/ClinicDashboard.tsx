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
  DollarSign
} from "lucide-react";

const ClinicDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<any[]>([]);
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

  useEffect(() => {
    reloadServices();
    const savedType = localStorage.getItem(`clinic_type_${user?.id}`);
    if (savedType) setClinicType(savedType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const saveServices = (newServices: any[]) => setServices(newServices);

  const handleAddService = async () => {
    if (!serviceForm.name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsAddingService(true);
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

      if (editingService) {
        // Update existing service
        await apiUpdate(String(editingService._id || editingService.id), {
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
        });
        toast({
          title: "Success",
          description: "Service updated successfully"
        });
      } else {
        // Create new service
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
        toast({
          title: "Success",
          description: "Service added successfully"
        });
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
      setServiceImage(''); setServiceImageFile(null);
      setEditingService(null);
      setIsAddServiceOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: editingService ? "Failed to update service" : "Failed to add service",
        variant: "destructive"
      });
    } finally {
      setIsAddingService(false);
    }
  };

  const handleDeleteService = (serviceId) => {
    const updatedServices = services.filter(service => service.id !== serviceId);
    saveServices(updatedServices);
    
    toast({
      title: "Success",
      description: "Service deleted successfully"
    });
  };

  const handleTypeChange = (type) => {
    setClinicType(type);
    localStorage.setItem(`clinic_type_${user?.id}`, type);
    
    toast({
      title: "Success",
      description: "Clinic type updated successfully"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{user?.name} Clinic</h1>
            <p className="text-muted-foreground">
              Welcome to your clinic management dashboard
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
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                  <div className="overflow-x-auto">
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