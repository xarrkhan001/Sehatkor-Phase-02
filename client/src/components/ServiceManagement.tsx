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
import ImageUpload from "@/components/ui/image-upload";
import ServiceManager, { Service } from "@/lib/serviceManager";
import { uploadFile } from "@/lib/chatApi";
import { createService as doctorCreate, updateService as doctorUpdate, deleteService as doctorDelete } from "@/lib/doctorApi";
import { Plus, Edit, Trash2, Stethoscope } from "lucide-react";
import { toast } from "sonner";

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
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceImage, setServiceImage] = useState<string>('');
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
  };

  const handleAddService = async () => {
    if (!serviceForm.name || !userId) {
      toast.error("Please fill in all required fields");
      return;
    }

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
          });
          const updatedLocal = ServiceManager.updateService(editingService.id, {
            name: updated.name,
            description: updated.description,
            price: updated.price,
            category: updated.category,
            image: updated.imageUrl,
            duration: updated.duration,
          } as any);
          const list = services.map(s => s.id === editingService.id ? (updatedLocal as any) : s);
          onServicesUpdate(list);
          toast.success('Service updated successfully');
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
          } as any);
          onServicesUpdate([...services, added]);
          toast.success('Service added successfully');
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
            toast.success('Service updated successfully');
          }
        } else {
          const newService = ServiceManager.addService(serviceData);
          onServicesUpdate([...services, newService]);
          toast.success('Service added successfully');
        }
      }
    } catch (e: any) {
      console.error('Error in handleAddService:', e);
      toast.error(e?.message || 'Failed to save service. Please check your connection and try again.');
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
    setIsAddServiceOpen(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      if (userRole === 'doctor') await doctorDelete(serviceId);
      const success = ServiceManager.deleteService(serviceId);
      if (success) {
        const updatedServices = services.filter(service => service.id !== serviceId);
        onServicesUpdate(updatedServices);
        toast.success('Service deleted successfully');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete');
    }
  };

  return (
    <Card className="card-healthcare">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>My Services</CardTitle>
            <CardDescription>Manage your services and pricing</CardDescription>
          </div>
          <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
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
                    className="max-w-xs"
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

                <Button onClick={handleAddService} className="w-full">
                  {editingService ? 'Update Service' : 'Add Service'}
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
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
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
                        <div className="flex items-center space-x-3">
                          {service.image ? (
                            <img 
                              src={service.image} 
                              alt={service.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Stethoscope className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{service.category}</Badge>
                      </TableCell>
                      <TableCell>PKR {service.price?.toLocaleString() || 0}</TableCell>
                      <TableCell>
                        {userRole === 'pharmacy' && 'stock' in service ? 
                          service.stock || 'N/A' : 
                          service.duration ? `${service.duration} min` : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
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

            {/* Mobile Card List */}
            <div className="lg:hidden space-y-4">
              {services.map((service) => (
                <Card key={service.id} className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {service.image ? (
                        <img src={service.image} alt={service.name} className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Stethoscope className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{service.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{service.category}</Badge>
                        <span>PKR {service.price?.toLocaleString() || 0}</span>
                        {userRole === 'pharmacy' && 'stock' in service ? (
                          <span>Stock: {service.stock || 'N/A'}</span>
                        ) : (
                          <span>{service.duration ? `${service.duration} min` : 'N/A'}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1 min-w-0" onClick={() => handleEditService(service)}>
                          <Edit className="w-4 h-4 mr-1" />
                          <span className="hidden xs:inline">Edit</span>
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1 min-w-0" onClick={() => handleDeleteService(service.id)}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          <span className="hidden xs:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceManagement;