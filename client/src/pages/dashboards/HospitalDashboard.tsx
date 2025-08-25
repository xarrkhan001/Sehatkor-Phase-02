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

  const [serviceForm, setServiceForm] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    department: ''
  });

  const hospitalTypes = [
    'General Hospital', 'Specialized Hospital', 'Teaching Hospital',
    'Children Hospital', 'Cardiac Hospital', 'Cancer Hospital',
    'Emergency Hospital', 'Rehabilitation Center', 'Mental Health Hospital'
  ];

  const hospitalDepartments = [
    'Emergency', 'Cardiology', 'Neurology', 'Orthopedics', 
    'Oncology', 'Pediatrics', 'Surgery', 'ICU', 'Radiology'
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

  useEffect(() => {
    if (user?.id) {
      reloadServices();
      const savedType = localStorage.getItem(`hospital_type_${user?.id}`);
      if (savedType) setHospitalType(savedType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAddService = async () => {
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
        category: serviceForm.department || 'Treatment',
        duration: serviceForm.duration || undefined,
        imageUrl,
        imagePublicId,
        providerName: user?.name || 'Hospital',
      });
      await reloadServices();
      setServiceForm({
        name: '',
        price: '',
        duration: '',
        description: '',
        department: ''
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
          <Card className="card-healthcare">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold">1,247</p>
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
                  <p className="text-2xl font-bold text-warning">89/120</p>
                </div>
                <Bed className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Staff</p>
                  <p className="text-2xl font-bold text-success">156</p>
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
                  <p className="text-2xl font-bold">PKR 12.5M</p>
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
                            onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                            placeholder="e.g., Cardiac Surgery"
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
                        <div>
                          <Label htmlFor="serviceDepartment">Department</Label>
                          <Select value={serviceForm.department} onValueChange={(value) => setServiceForm({...serviceForm, department: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              {hospitalDepartments.map((dept) => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
