import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ui/image-upload";
import ServiceManager, { Service } from "@/lib/serviceManager";
import { uploadFile } from "@/lib/chatApi";
import { createService as doctorCreate, updateService as doctorUpdate, deleteService as doctorDelete } from "@/lib/doctorApi";
import { Plus, Edit, Trash2, Stethoscope } from "lucide-react";
import { DISEASE_OPTIONS } from "@/config/diseasesData";

interface ServiceManagementProps {
  userId: string;
  userRole: 'doctor' | 'clinic' | 'laboratory' | 'pharmacy';
  userName: string;
  services: Service[];
  onServicesUpdate: (services: Service[]) => void;
}

const ServiceManagement: React.FC<ServiceManagementProps> = ({
  userId,
  userRole,
  userName,
  services,
  onServicesUpdate
}) => {
  const { toast } = useToast();
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceImage, setServiceImage] = useState<string>('');
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Disease state (single-select at service level)
  const [disease, setDisease] = useState<string>('');

  // Variants state (doctor only)
  const [variants, setVariants] = useState<Array<{
    id: string;
    timeLabel?: string;
    startTime?: string;
    endTime?: string;
    days?: string;
    price?: string;
    city?: string;
    detailAddress?: string;
    googleMapLink?: string;
    isActive?: boolean;
    imageUrl?: string;
    imagePublicId?: string;
    imageFile?: File | null;
  }>>([]);

  const [serviceForm, setServiceForm] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    category: '',
    stock: '',
    googleMapLink: '',
    city: '',
    detailAddress: ''
  });

  const getServiceCategories = () => {
    switch (userRole) {
      case 'doctor':
      case 'clinic':
        return ['Consultation', 'Check-up', 'Treatment', 'Surgery', 'Therapy', 'Diagnosis'];
      case 'laboratory':
        return ['Blood Test', 'Urine Test', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'Other'];
      case 'pharmacy':
        return ['Tablets', 'Capsules', 'Syrups', 'Injections', 'Ointments', 'Drops', 'Other'];
      default:
        return ['General Service'];
    }
  };

  const resetForm = () => {
    setServiceForm({
      name: '',
      price: '',
      duration: '',
      description: '',
      category: '',
      stock: '',
      googleMapLink: '',
      city: '',
      detailAddress: ''
    });
    setServiceImage('');
    setEditingService(null);
    setVariants([]);
    setDisease('');
  };

  const handleAddService = async () => {
    if (isSaving) return;
    if (!serviceForm.name || !userId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    const parsedPrice = serviceForm.price ? parseFloat(serviceForm.price) : 0;
    const parsedStock = serviceForm.stock ? parseInt(serviceForm.stock) : undefined;

    const serviceData: any = {
      name: serviceForm.name,
      description: serviceForm.description,
      price: parsedPrice,
      category: serviceForm.category,
      providerId: userId,
      providerName: userName,
      providerType: userRole,
      image: serviceImage,
      duration: serviceForm.duration,
      googleMapLink: serviceForm.googleMapLink,
      city: serviceForm.city,
      detailAddress: serviceForm.detailAddress,
      ...(userRole === 'pharmacy' && { stock: parsedStock })
    };

    try {
      let imageUrl: string | undefined;
      let imagePublicId: string | undefined;
      if (serviceImageFile) {
        setIsUploadingImage(true);
        try {
          const res = await uploadFile(serviceImageFile);
          imageUrl = res?.url; imagePublicId = res?.public_id;
        } finally { setIsUploadingImage(false); }
      }

      if (userRole === 'doctor') {
        console.log('Creating doctor service with payload:', {
          name: serviceForm.name,
          description: serviceForm.description,
          price: parsedPrice,
          category: serviceForm.category || 'Treatment',
          duration: serviceForm.duration || undefined,
          imageUrl,
          imagePublicId,
          providerName: userName,
        });
        
        // Upload variant images if any and build payload variants
        let payloadVariants: any[] | undefined = undefined;
        if (variants.length > 0) {
          setIsUploadingImage(true);
          try {
            const processed: any[] = [];
            for (const v of variants) {
              let vImageUrl = v.imageUrl;
              let vImagePublicId = v.imagePublicId;
              if (v.imageFile) {
                const r = await uploadFile(v.imageFile);
                vImageUrl = r?.url;
                vImagePublicId = r?.public_id;
              }
              processed.push({
                timeLabel: v.timeLabel,
                startTime: v.startTime,
                endTime: v.endTime,
                days: v.days ? v.days.split(',').map(s => s.trim()) : undefined,
                price: v.price ? parseFloat(v.price) : undefined,
                city: v.city,
                detailAddress: v.detailAddress,
                googleMapLink: v.googleMapLink,
                isActive: v.isActive ?? true,
                imageUrl: vImageUrl,
                imagePublicId: vImagePublicId,
              });
            }
            payloadVariants = processed;
          } finally {
            setIsUploadingImage(false);
          }
        }

        if (editingService) {
          const updated = await doctorUpdate(editingService.id, {
            name: serviceForm.name,
            description: serviceForm.description,
            price: parsedPrice,
            category: serviceForm.category || 'Treatment',
            duration: serviceForm.duration || undefined,
            imageUrl,
            imagePublicId,
            googleMapLink: serviceForm.googleMapLink,
            city: serviceForm.city,
            detailAddress: serviceForm.detailAddress,
            diseases: disease ? [disease] : [],
            ...(payloadVariants ? { variants: payloadVariants } : {}),
          });
          const updatedLocal = ServiceManager.updateService(editingService.id, {
            name: updated.name,
            description: updated.description,
            price: updated.price,
            category: updated.category,
            image: updated.imageUrl,
            duration: updated.duration,
            diseases: Array.isArray(updated.diseases) ? updated.diseases : (disease ? [disease] : []),
            // variants kept in sync on next fetch, optional local update skipped for brevity
          } as any);
          const list = services.map(s => s.id === editingService.id ? (updatedLocal as any) : s);
          onServicesUpdate(list);
          toast({ title: 'Success', description: 'Service updated successfully' });
        } else {
          const created = await doctorCreate({
            name: serviceForm.name,
            description: serviceForm.description,
            price: parsedPrice,
            category: serviceForm.category || 'Treatment',
            duration: serviceForm.duration || undefined,
            imageUrl,
            imagePublicId,
            googleMapLink: serviceForm.googleMapLink,
            city: serviceForm.city,
            detailAddress: serviceForm.detailAddress,
            providerName: userName,
            diseases: disease ? [disease] : [],
            ...(payloadVariants ? { variants: payloadVariants } : {}),
          });
          console.log('Doctor service created:', created);
          
          const added = ServiceManager.addService({
            id: created._id as any,
            name: created.name,
            description: created.description || '',
            price: created.price || 0,
            category: created.category || 'Treatment',
            providerType: 'doctor',
            providerId: userId,
            providerName: created.providerName,
            image: created.imageUrl,
            duration: created.duration,
            diseases: created.diseases || (disease ? [disease] : []),
          } as any);
          onServicesUpdate([...services, added]);
          toast({ title: 'Success', description: 'Service added successfully' });
        }
      } else {
        if (editingService) {
          // Include location fields for lab and pharmacy services
          const updateData = {
            ...serviceData,
            googleMapLink: serviceForm.googleMapLink,
            city: serviceForm.city,
            detailAddress: serviceForm.detailAddress
          };
          const updatedService = ServiceManager.updateService(editingService.id, updateData);
          if (updatedService) {
            const updatedServices = services.map(service => service.id === editingService.id ? updatedService : service);
            onServicesUpdate(updatedServices);
            toast({ title: 'Success', description: 'Service updated successfully' });
          }
        } else {
          const newService = ServiceManager.addService(serviceData);
          onServicesUpdate([...services, newService]);
          toast({ title: 'Success', description: 'Service added successfully' });
        }
      }
    } catch (e: any) {
      console.error('Error in handleAddService:', e);
      toast({ 
        title: 'Error', 
        description: e?.message || 'Failed to save service. Please check your connection and try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
    }

    resetForm();
    setIsAddServiceOpen(false);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      price: service.price.toString(),
      duration: service.duration || '',
      description: service.description,
      category: service.category,
      stock: 'stock' in service ? service.stock?.toString() || '' : '',
      googleMapLink: (service as any).googleMapLink || '',
      city: (service as any).city || '',
      detailAddress: (service as any).detailAddress || ''
    });
    setServiceImage(service.image || '');
    setDisease((((service as any).diseases as string[]) || [])[0] || '');
    // Load variants if any
    const svc: any = service as any;
    if (Array.isArray(svc.variants)) {
      setVariants(
        svc.variants.map((v: any) => ({
          id: v.id || v._id || Math.random().toString(36).slice(2),
          timeLabel: v.timeLabel,
          startTime: v.startTime,
          endTime: v.endTime,
          days: Array.isArray(v.days) ? v.days.join(', ') : v.days,
          price: v.price != null ? String(v.price) : '',
          city: v.city,
          detailAddress: v.detailAddress,
          googleMapLink: v.googleMapLink,
          isActive: v.isActive,
          imageUrl: v.imageUrl,
          imagePublicId: v.imagePublicId,
          imageFile: null,
        }))
      );
    } else {
      setVariants([]);
    }
    setIsAddServiceOpen(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      if (userRole === 'doctor') await doctorDelete(serviceId);
      const success = ServiceManager.deleteService(serviceId);
      if (success) {
        const updatedServices = services.filter(service => service.id !== serviceId);
        onServicesUpdate(updatedServices);
        toast({ title: 'Success', description: 'Service deleted successfully' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to delete', variant: 'destructive' });
    }
  };

  // Render up to 6 disease badges and a "+N more" indicator
  const renderDiseaseBadges = (arr?: string[]) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const shown = arr.slice(0, 6);
    const extra = arr.length - shown.length;
    return (
      <div className="mt-1 flex flex-wrap gap-1">
        {shown.map((d) => (
          <Badge key={d} variant="secondary" className="text-[10px] px-1.5 py-0.5">
            {d}
          </Badge>
        ))}
        {extra > 0 && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800">
            +{extra} more
          </Badge>
        )}
      </div>
    );
  };

  return (
    <Card className="card-healthcare">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>My Services</CardTitle>
            <CardDescription>Manage your services and pricing</CardDescription>
          </div>
          <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="shrink-0 self-start sm:self-auto w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                <DialogDescription>
                  {editingService ? 'Update your service details' : 'Add a new service to your practice'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="serviceName">Service Name *</Label>
                  <Input
                    id="serviceName"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                    placeholder="e.g., Consultation"
                  />
                </div>
                
                <div>
                  <Label>Service Image</Label>
                  <ImageUpload
                    onImageSelect={(file, preview) => { setServiceImageFile(file); setServiceImage(preview); }}
                    onImageRemove={() => { setServiceImageFile(null); setServiceImage(''); }}
                    currentImage={serviceImage}
                    placeholder="Upload service image"
                    className="w-full sm:max-w-xs"
                  />
                  {isUploadingImage && (
                    <p className="text-xs text-muted-foreground mt-1">Uploading image...</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="servicePrice">Price (PKR) *</Label>
                    <Input
                      id="servicePrice"
                      type="number"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                      placeholder="e.g., 2000"
                    />
                  </div>
                  {userRole === 'pharmacy' ? (
                    <div>
                      <Label htmlFor="serviceStock">Stock</Label>
                      <Input
                        id="serviceStock"
                        type="number"
                        value={serviceForm.stock}
                        onChange={(e) => setServiceForm({...serviceForm, stock: e.target.value})}
                        placeholder="e.g., 100"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="serviceDuration">Duration (minutes)</Label>
                      <Input
                        id="serviceDuration"
                        value={serviceForm.duration}
                        onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}
                        placeholder="e.g., 30"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="serviceCategory">Category</Label>
                  <Select value={serviceForm.category} onValueChange={(value) => setServiceForm({...serviceForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service category" />
                    </SelectTrigger>
                    <SelectContent>
                      {getServiceCategories().map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
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

                {/* Location Fields */}
                <div className="space-y-3 border-t pt-3">
                  <h4 className="font-medium text-sm">Location Information</h4>
                  
                  <div>
                    <Label htmlFor="serviceCity">City</Label>
                    <Input
                      id="serviceCity"
                      value={serviceForm.city}
                      onChange={(e) => setServiceForm({...serviceForm, city: e.target.value})}
                      placeholder="e.g., Karachi, Lahore"
                    />
                  </div>

                  <div>
                    <Label htmlFor="serviceAddress">Detailed Address</Label>
                    <Textarea
                      id="serviceAddress"
                      value={serviceForm.detailAddress}
                      onChange={(e) => setServiceForm({...serviceForm, detailAddress: e.target.value})}
                      placeholder="Complete address where service is provided"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="serviceMapLink">Google Maps Link (Optional)</Label>
                    <Input
                      id="serviceMapLink"
                      value={serviceForm.googleMapLink}
                      onChange={(e) => setServiceForm({...serviceForm, googleMapLink: e.target.value})}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </div>

                {/* Disease Single-Select - Doctors only */}
                {userRole === 'doctor' && (
                  <div className="space-y-2 border-t pt-3">
                    <h4 className="font-medium text-sm">Disease</h4>
                    <div className="max-w-xs">
                      <Label className="sr-only">Disease</Label>
                      <Select value={disease} onValueChange={(v) => setDisease(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a disease" />
                        </SelectTrigger>
                        <SelectContent>
                          {DISEASE_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">Select a single disease associated with this service.</p>
                  </div>
                )}

                {/* Variants Editor - Doctors only */}
                {userRole === 'doctor' && (
                  <div className="space-y-3 border-t pt-3">
                    <h4 className="font-medium text-sm">Time/Location Variants</h4>
                    <p className="text-xs text-muted-foreground">Add multiple time/location entries. Leave empty if this service has a single default time/location.</p>

                    <div className="space-y-3">
                      {variants.map((v, idx) => (
                        <div key={v.id} className="border rounded-md p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Variant #{idx + 1}</span>
                            <Button type="button" size="sm" variant="destructive" onClick={() => setVariants(variants.filter(x => x.id !== v.id))}>Remove</Button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label>Time Label</Label>
                              <Input value={v.timeLabel || ''} onChange={(e) => {
                                const nv = [...variants]; nv[idx] = { ...v, timeLabel: e.target.value }; setVariants(nv);
                              }} placeholder="Morning / Evening" />
                            </div>
                            <div>
                              <Label>Days</Label>
                              <Input value={v.days || ''} onChange={(e) => {
                                const nv = [...variants]; nv[idx] = { ...v, days: e.target.value }; setVariants(nv);
                              }} placeholder="Mon, Wed, Fri" />
                            </div>
                            <div>
                              <Label>Start Time</Label>
                              <Input value={v.startTime || ''} onChange={(e) => {
                                const nv = [...variants]; nv[idx] = { ...v, startTime: e.target.value }; setVariants(nv);
                              }} placeholder="09:00" />
                            </div>
                            <div>
                              <Label>End Time</Label>
                              <Input value={v.endTime || ''} onChange={(e) => {
                                const nv = [...variants]; nv[idx] = { ...v, endTime: e.target.value }; setVariants(nv);
                              }} placeholder="12:00" />
                            </div>
                            <div>
                              <Label>Price (optional override)</Label>
                              <Input value={v.price || ''} onChange={(e) => {
                                const nv = [...variants]; nv[idx] = { ...v, price: e.target.value }; setVariants(nv);
                              }} placeholder="e.g., 2500" />
                            </div>
                            <div>
                              <Label>City</Label>
                              <Input value={v.city || ''} onChange={(e) => {
                                const nv = [...variants]; nv[idx] = { ...v, city: e.target.value }; setVariants(nv);
                              }} placeholder="e.g., Karachi" />
                            </div>
                            <div className="sm:col-span-2">
                              <Label>Detailed Address</Label>
                              <Textarea value={v.detailAddress || ''} onChange={(e) => {
                                const nv = [...variants]; nv[idx] = { ...v, detailAddress: e.target.value }; setVariants(nv);
                              }} rows={2} placeholder="Complete address" />
                            </div>
                            <div className="sm:col-span-2">
                              <Label>Google Maps Link</Label>
                              <Input value={v.googleMapLink || ''} onChange={(e) => {
                                const nv = [...variants]; nv[idx] = { ...v, googleMapLink: e.target.value }; setVariants(nv);
                              }} placeholder="https://maps.google.com/..." />
                            </div>
                            <div className="sm:col-span-2">
                              <Label>Variant Image</Label>
                              <ImageUpload
                                onImageSelect={(file, preview) => {
                                  const nv = [...variants]; nv[idx] = { ...v, imageFile: file, imageUrl: preview };
                                  setVariants(nv);
                                }}
                                onImageRemove={() => {
                                  const nv = [...variants]; nv[idx] = { ...v, imageFile: null, imageUrl: '', imagePublicId: undefined };
                                  setVariants(nv);
                                }}
                                currentImage={v.imageUrl || ''}
                                placeholder="Upload variant image"
                                className="w-full sm:max-w-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button type="button" variant="outline" onClick={() => setVariants([
                      ...variants,
                      { id: Math.random().toString(36).slice(2), isActive: true, imageFile: null }
                    ])}>
                      <Plus className="w-4 h-4 mr-2" /> Add Variant
                    </Button>
                  </div>
                )}

                <Button onClick={handleAddService} className="w-full" disabled={isSaving || isUploadingImage}>
                  {isSaving ? (
                    <span className="inline-flex items-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      {editingService ? 'Updating...' : 'Adding...'}
                    </span>
                  ) : (
                    editingService ? 'Update Service' : 'Add Service'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No services added yet. Click "Add Service" to get started.
          </p>
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
                        <Stethoscope className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{service.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{service.description}</p>
                      {userRole === 'doctor' && (
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span className="text-[11px] text-muted-foreground truncate">
                            {(service as any).detailAddress || (service as any).city || 'Address not specified'}
                          </span>
                          {Array.isArray((service as any).diseases) && (service as any).diseases.length > 0 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 whitespace-nowrap">
                              {((service as any).diseases as string[])[0]}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{service.category}</Badge>
                    <span className="text-sm font-medium">PKR {service.price?.toLocaleString() || 0}</span>
                    <span className="text-sm text-muted-foreground">
                      {userRole === 'pharmacy' && 'stock' in service ? (
                        <>{(service as any).stock || 'N/A'} in stock</>
                      ) : (
                        <>{service.duration ? `${service.duration} min` : 'N/A'}</>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditService(service)}>
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDeleteService(service.id)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[700px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      {userRole === 'doctor' && (<TableHead>Variants</TableHead>)}
                      {userRole === 'pharmacy' ? (
                        <TableHead>Stock</TableHead>
                      ) : (
                        <TableHead>Duration</TableHead>
                      )}
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
                                <Stethoscope className="w-5 h-5 text-primary" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-[240px]">{service.name}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-[260px]">{service.description}</p>
                              {userRole === 'doctor' && (
                                <div className="flex items-center justify-between gap-2 mt-1 max-w-[420px]">
                                  <span className="text-xs text-muted-foreground truncate">
                                    {(service as any).detailAddress || (service as any).city || 'Address not specified'}
                                  </span>
                                  {Array.isArray((service as any).diseases) && (service as any).diseases.length > 0 && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 whitespace-nowrap">
                                      {((service as any).diseases as string[])[0]}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{service.category}</Badge>
                        </TableCell>
                        <TableCell>PKR {service.price?.toLocaleString() || 0}</TableCell>
                        {userRole === 'doctor' && (
                          <TableCell>
                            {(service as any).variants?.length ? (service as any).variants.length : (editingService && editingService.id === service.id ? variants.length : 0)}
                          </TableCell>
                        )}
                        <TableCell>
                          {userRole === 'pharmacy' && 'stock' in service ? 
                            (service as any).stock || 'N/A' : 
                            service.duration ? `${service.duration} min` : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditService(service)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteService(service.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceManagement;