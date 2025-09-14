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
import ServiceTypeBadge from "@/components/ServiceTypeBadge";
import AvailabilityBadge from "@/components/AvailabilityBadge";

interface ServiceManagementProps {
  userId: string;
  userRole: 'doctor' | 'clinic' | 'laboratory' | 'pharmacy';
  userName: string;
  services: Service[];
  onServicesUpdate: (services: Service[]) => void;
  onReloadServices?: () => Promise<void>;
}

const ServiceManagement: React.FC<ServiceManagementProps> = ({
  userId,
  userRole,
  userName,
  services,
  onServicesUpdate,
  onReloadServices
}) => {
  const { toast } = useToast();
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceImage, setServiceImage] = useState<string>('');
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Disease state (multi-select up to 4 for doctor)
  const [diseases, setDiseases] = useState<string[]>([]);
  const [diseaseInput, setDiseaseInput] = useState<string>('');

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
    hospitalClinicName?: string;
    googleMapLink?: string;
    availability?: string;
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
    detailAddress: '',
    hospitalClinicName: '',
    availability: 'Physical',
    serviceType: [] as string[],
    homeDelivery: false,
    // Default schedule (used when no variants are added)
    baseTimeLabel: '',
    baseDays: '',
    baseStartTime: '',
    baseEndTime: '',
  });

  // Validation limits
  const LIMITS = {
    name: 32,
    hospital: 26,
    city: 20,
    address: 60,
  } as const;

  // Error states for inline feedback
  const [serviceErrors, setServiceErrors] = useState<{ name?: string; hospitalClinicName?: string; city?: string; detailAddress?: string; googleMapLink?: string }>({});
  const [variantErrors, setVariantErrors] = useState<Array<{ hospitalClinicName?: string; city?: string; detailAddress?: string }>>([]);

  const ensureVariantErrorsSize = (size: number) => {
    setVariantErrors(prev => {
      const next = [...prev];
      while (next.length < size) next.push({});
      while (next.length > size) next.pop();
      return next;
    });
  };

  // Top-level field live validator
  const validateTopField = (key: 'name' | 'hospitalClinicName' | 'city' | 'detailAddress', value: string) => {
    const val = (value || '').trim();
    let limit = 0;
    if (key === 'name') limit = LIMITS.name;
    if (key === 'hospitalClinicName') limit = LIMITS.hospital;
    if (key === 'city') limit = LIMITS.city;
    if (key === 'detailAddress') limit = LIMITS.address;
    const overBy = Math.max(0, val.length - limit);
    setServiceErrors(prev => ({
      ...prev,
      [key]: overBy > 0 ? `Allowed ${limit} characters. You are over by ${overBy}.` : undefined,
    }));
  };

  const isValidHttpUrl = (value: string): boolean => {
    const v = (value || '').trim();
    if (!v) return true; // optional field
    const re = /^(https?:\/\/)[^\s]+$/i;
    return re.test(v);
  };

  const validateTopLink = (value: string) => {
    setServiceErrors(prev => ({ ...prev, googleMapLink: isValidHttpUrl(value) ? undefined : 'Please enter a valid http(s) link.' }));
  };

  // Variant field live validator
  const validateVariantField = (index: number, key: 'hospitalClinicName' | 'city' | 'detailAddress', value: string) => {
    const val = (value || '').trim();
    let limit = key === 'hospitalClinicName' ? LIMITS.hospital : key === 'city' ? LIMITS.city : LIMITS.address;
    const overBy = Math.max(0, val.length - limit);
    setVariantErrors(prev => {
      const next = [...prev];
      if (!next[index]) next[index] = {};
      next[index] = {
        ...next[index],
        [key]: overBy > 0 ? `Allowed ${limit} characters. You are over by ${overBy}.` : undefined,
      };
      return next;
    });
  };

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

  // Handlers for disease multi-select (doctor)
  const addDisease = (raw: string) => {
    const value = (raw || '').trim();
    if (!value) return;
    if (diseases.includes(value)) return;
    if (diseases.length >= 4) {
      toast({ title: 'Limit reached', description: 'You can select up to 4 diseases for one service.', variant: 'destructive' });
      return;
    }
    setDiseases([...diseases, value]);
    setDiseaseInput('');
  };

  const removeDisease = (value: string) => {
    setDiseases(diseases.filter(d => d !== value));
  };

  const filteredDiseaseSuggestions = DISEASE_OPTIONS
    .filter(opt => !diseases.includes(opt))
    .filter(opt => opt.toLowerCase().includes((diseaseInput || '').toLowerCase()))
    .slice(0, 6);

  // Format address to a compact string for dashboard lists
  const formatAddress = (value?: string): string => {
    const v = (value || '').trim();
    if (!v) return 'Address not specified';
    return v.length > 25 ? `${v.slice(0, 25)}…` : v;
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
      detailAddress: '',
      hospitalClinicName: '',
      availability: 'Physical',
      serviceType: [],
      homeDelivery: false,
      baseTimeLabel: '',
      baseDays: '',
      baseStartTime: '',
      baseEndTime: '',
    });

    setServiceImage('');
    setEditingService(null);
    setVariants([]);
    setDiseases([]);
    setDiseaseInput('');
    setServiceErrors({});
    setVariantErrors([]);
  };

  // Simple length validation (requested constraints)
  // Service Name: max 32
  // Hospital/Clinic Name: max 26
  // City: max 20
  // Detailed Address: max 60
  const validateLengths = (): boolean => {
    const trim = (s?: string) => (s || '').trim();
    const name = trim(serviceForm.name);
    const city = trim(serviceForm.city);
    const detailAddress = trim(serviceForm.detailAddress);
    const hospitalClinicName = trim(serviceForm.hospitalClinicName);

    if (name.length > LIMITS.name) {
      toast({ title: 'Validation', description: `Service Name must be at most ${LIMITS.name} characters.`, variant: 'destructive' });
      return false;
    }
    if (hospitalClinicName.length > LIMITS.hospital) {
      toast({ title: 'Validation', description: `Hospital/Clinic Name must be at most ${LIMITS.hospital} characters.`, variant: 'destructive' });
      return false;
    }
    if (city.length > LIMITS.city) {
      toast({ title: 'Validation', description: `City must be at most ${LIMITS.city} characters.`, variant: 'destructive' });
      return false;
    }
    if (detailAddress.length > LIMITS.address) {
      toast({ title: 'Validation', description: `Detailed Address must be at most ${LIMITS.address} characters.`, variant: 'destructive' });
      return false;
    }
    if (!isValidHttpUrl(serviceForm.googleMapLink)) {
      toast({ title: 'Validation', description: 'Google Map Link must be a valid http(s) URL.', variant: 'destructive' });
      return false;
    }

    // Validate variants (doctor only)
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const vCity = trim(v.city);
      const vDetailAddress = trim(v.detailAddress);
      const vHospital = trim(v.hospitalClinicName);
      if (vHospital.length > LIMITS.hospital) {
        toast({ title: 'Validation', description: `Variant #${i + 1}: Hospital/Clinic Name must be at most ${LIMITS.hospital} characters.`, variant: 'destructive' });
        return false;
      }
      if (vCity.length > LIMITS.city) {
        toast({ title: 'Validation', description: `Variant #${i + 1}: City must be at most ${LIMITS.city} characters.`, variant: 'destructive' });
        return false;
      }
      if (vDetailAddress.length > LIMITS.address) {
        toast({ title: 'Validation', description: `Variant #${i + 1}: Detailed Address must be at most ${LIMITS.address} characters.`, variant: 'destructive' });
        return false;
      }
    }
    return true;
  };

  const handleAddService = async () => {
    if (isSaving) return;
    // Enforce requested length constraints before any processing
    if (!validateLengths()) return;
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
      hospitalClinicName: serviceForm.hospitalClinicName,
      availability: serviceForm.availability,
      serviceType: serviceForm.serviceType,
      ...(userRole === 'doctor' ? { homeDelivery: serviceForm.homeDelivery } : {}),
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
        // Upload variant images if any and build payload variants FIRST
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
              // Only include _id for variants when editing an existing service AND when id is a valid ObjectId
              const maybeObjectId = (val?: string) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);
              const baseVariant = {
                timeLabel: v.timeLabel,
                startTime: v.startTime,
                endTime: v.endTime,
                days: v.days ? v.days.split(',').map(s => s.trim()) : undefined,
                price: v.price ? parseFloat(v.price) : undefined,
                city: v.city,
                detailAddress: v.detailAddress,
                hospitalClinicName: v.hospitalClinicName,
                googleMapLink: v.googleMapLink,
                availability: v.availability || 'Physical',
                isActive: v.isActive ?? true,
                imageUrl: vImageUrl,
                imagePublicId: vImagePublicId,
              } as any;
              if (editingService && maybeObjectId(v.id)) {
                baseVariant._id = v.id;
              }
              processed.push(baseVariant);
            }
            payloadVariants = processed;
          } finally {
            setIsUploadingImage(false);
          }
        }

        // Auto-copy first variant schedule to main service if Default Schedule is empty
        const hasExplicitBaseSchedule = serviceForm.baseTimeLabel || serviceForm.baseDays || serviceForm.baseStartTime || serviceForm.baseEndTime;
        // Always use explicit base schedule for main service; do not auto-copy from variants
        const mainScheduleFields = hasExplicitBaseSchedule 
          ? {
              ...(serviceForm.baseTimeLabel ? { timeLabel: serviceForm.baseTimeLabel } : {}),
              ...(serviceForm.baseStartTime ? { startTime: serviceForm.baseStartTime } : {}),
              ...(serviceForm.baseEndTime ? { endTime: serviceForm.baseEndTime } : {}),
              ...(serviceForm.baseDays ? { days: serviceForm.baseDays.split(',').map(s => s.trim()).filter(Boolean) } : {}),
            }
          : {};

        // Now safe to log with payloadVariants
        console.log('🔧 Main schedule fields computed:', mainScheduleFields);
        console.log('Creating doctor service with payload:', {
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
          availability: serviceForm.availability,
          serviceType: serviceForm.serviceType,
          homeDelivery: serviceForm.homeDelivery,
          diseases,
          ...(payloadVariants ? { variants: payloadVariants } : {}),
        });

        if (editingService) {
          const updatePayload: any = {
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
            hospitalClinicName: serviceForm.hospitalClinicName,
            availability: serviceForm.availability,
            serviceType: serviceForm.serviceType,
            homeDelivery: serviceForm.homeDelivery,
            diseases,
            // Top-level base schedule fields for main service (explicit or auto-copied from first variant)
            ...mainScheduleFields,
            // IMPORTANT: If user removed all variants, send an empty array to clear on server
            variants: Array.isArray(payloadVariants) ? payloadVariants : [],
          };
          const updated = await doctorUpdate(editingService.id, updatePayload);
          const updatedLocal = ServiceManager.updateService(editingService.id, {
            name: updated.name,
            description: updated.description,
            price: updated.price,
            category: updated.category,
            image: updated.imageUrl,
            duration: updated.duration,
            availability: updated.availability as any,
            serviceType: updated.serviceType as any,
            homeDelivery: Boolean((updated as any).homeDelivery),
            diseases: Array.isArray(updated.diseases) ? updated.diseases : diseases,
            variants: updated.variants || [],
            // Store base schedule at top-level for main card display
            ...(serviceForm.baseTimeLabel ? { timeLabel: serviceForm.baseTimeLabel } : {}),
            ...(serviceForm.baseStartTime ? { startTime: serviceForm.baseStartTime } : {}),
            ...(serviceForm.baseEndTime ? { endTime: serviceForm.baseEndTime } : {}),
            ...(serviceForm.baseDays ? { days: serviceForm.baseDays } : {}),
          } as any);

          const list = services.map(s => s.id === editingService.id ? (updatedLocal as any) : s);
          onServicesUpdate(list);
          toast({ title: 'Success', description: 'Service updated successfully' });
          // Reload services to get latest data from server
          if (onReloadServices) {
            await onReloadServices();
          }
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
            hospitalClinicName: serviceForm.hospitalClinicName,
            availability: serviceForm.availability,
            serviceType: serviceForm.serviceType,
            homeDelivery: serviceForm.homeDelivery,
            providerName: userName,
            diseases,
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
            // Ensure badges render immediately in dashboard list
            availability: created.availability || serviceForm.availability,
            serviceType: created.serviceType || serviceForm.serviceType,
            homeDelivery: Boolean((created as any).homeDelivery ?? serviceForm.homeDelivery),
            // Preserve optional location fields for immediate UI
            city: created.city ?? serviceForm.city,
            detailAddress: created.detailAddress ?? serviceForm.detailAddress,
            googleMapLink: created.googleMapLink ?? serviceForm.googleMapLink,
            diseases: created.diseases || diseases,
            // Include variants array if API returned it
            variants: Array.isArray((created as any).variants) ? (created as any).variants : [],
            // Store base schedule at top-level for main card display
            ...(serviceForm.baseTimeLabel ? { timeLabel: serviceForm.baseTimeLabel } : {}),
            ...(serviceForm.baseStartTime ? { startTime: serviceForm.baseStartTime } : {}),
            ...(serviceForm.baseEndTime ? { endTime: serviceForm.baseEndTime } : {}),
            ...(serviceForm.baseDays ? { days: serviceForm.baseDays } : {}),
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
            detailAddress: serviceForm.detailAddress,
            availability: serviceForm.availability
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

    if (!editingService) {
      resetForm();
      setIsAddServiceOpen(false);
    } else {
      // For edits, close dialog but don't reset form immediately to allow reload
      setIsAddServiceOpen(false);
      setTimeout(() => {
        resetForm();
      }, 500);
    }
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
      detailAddress: (service as any).detailAddress || '',
      hospitalClinicName: (service as any).hospitalClinicName || '',
      availability: (service as any).availability || 'Physical',
      serviceType: Array.isArray((service as any).serviceType) ? (service as any).serviceType : ((service as any).serviceType ? [(service as any).serviceType] : []),
      homeDelivery: Boolean((service as any).homeDelivery) || false,
      // Prefer top-level base schedule fields if present; fallback to first variant
      baseTimeLabel: (service as any).timeLabel
        || (Array.isArray((service as any).variants) && (service as any).variants[0]?.timeLabel ? (service as any).variants[0].timeLabel : ''),
      baseDays: (service as any).days
        ? Array.isArray((service as any).days) ? ((service as any).days as string[]).join(', ') : String((service as any).days)
        : (Array.isArray((service as any).variants) && (service as any).variants[0]?.days ? ((service as any).variants[0].days as string[]).join(', ') : ''),
      baseStartTime: (service as any).startTime
        || (Array.isArray((service as any).variants) && (service as any).variants[0]?.startTime ? (service as any).variants[0].startTime : ''),
      baseEndTime: (service as any).endTime
        || (Array.isArray((service as any).variants) && (service as any).variants[0]?.endTime ? (service as any).variants[0].endTime : ''),
    });

    setServiceImage(service.image || '');
    setDiseases(Array.isArray((service as any).diseases) ? ((service as any).diseases as string[]) : []);
    setDiseaseInput('');
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
          hospitalClinicName: v.hospitalClinicName,
          googleMapLink: v.googleMapLink,
          availability: v.availability || 'Physical',
          isActive: v.isActive,
          imageUrl: v.imageUrl,
          imagePublicId: v.imagePublicId,
          imageFile: null,
        }))
      );
      ensureVariantErrorsSize(svc.variants.length);
    } else {
      setVariants([]);
      setVariantErrors([]);
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
    console.log('🔍 renderDiseaseBadges called with:', arr);
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const shown = arr.slice(0, 6);
    const extra = arr.length - shown.length;
    console.log('🔍 Showing diseases:', shown, 'Extra:', extra);
    return (
      <div className="mt-1 flex flex-wrap gap-1">
        {shown.map((d, index) => (
          <Badge key={`${d}-${index}`} variant="secondary" className="text-[10px] px-1.5 py-0.5">
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
    <Card className={userRole === 'doctor' ? "relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl" : "card-healthcare"}>
      <CardHeader className={userRole === 'doctor' ? "bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-t-lg" : undefined}>
        <div className={userRole === 'doctor' ? "flex items-center justify-between gap-3" : "flex flex-col sm:flex-row sm:items-center justify-between gap-2"}>
          <div>
            <CardTitle className={userRole === 'doctor' ? "text-white flex items-center gap-2" : undefined}>
              {userRole === 'doctor' && <Stethoscope className="w-5 h-5" />}
              My Services
            </CardTitle>
            <CardDescription className={userRole === 'doctor' ? "text-blue-100" : undefined}>Manage your services and pricing</CardDescription>
          </div>
          <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className={userRole === 'doctor' 
                ? "bg-white text-blue-600 hover:bg-blue-50 shadow-lg transition-all duration-300 px-2 py-1 sm:px-3 sm:py-2 h-8 sm:h-10"
                : "shrink-0 self-start sm:self-auto w-full sm:w-auto"}>
                {userRole === 'doctor' ? (
                  <>
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-[10px] sm:text-sm font-medium">Add</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </>
                )}
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
                    onChange={(e) => { setServiceForm({...serviceForm, name: e.target.value}); validateTopField('name', e.target.value); }}
                    placeholder="e.g., Consultation"
                    className={serviceErrors.name ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                  />
                  {serviceErrors.name && (
                    <p className="text-xs text-red-600 mt-1">{serviceErrors.name}</p>
                  )}
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

                {/* Availability Selection */}
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
                        <span className="text-sm">Physical - In-person service only</span>
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
                        <span className="text-sm">Online - Remote consultation/delivery available</span>
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

                {/* Location Fields */}
                <div className="space-y-3 border-t pt-3">
                  <h4 className="font-medium text-sm">Location Information</h4>
                  
                  <div>
                    <Label htmlFor="hospitalClinicName">Hospital/Clinic Name</Label>
                    <Input
                      id="hospitalClinicName"
                      value={serviceForm.hospitalClinicName}
                      onChange={(e) => { setServiceForm({...serviceForm, hospitalClinicName: e.target.value}); validateTopField('hospitalClinicName', e.target.value); }}
                      placeholder="e.g., Aga Khan Hospital, Shaukat Khanum"
                      className={serviceErrors.hospitalClinicName ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                    />
                    {serviceErrors.hospitalClinicName && (
                      <p className="text-xs text-red-600 mt-1">{serviceErrors.hospitalClinicName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="serviceCity">City</Label>
                    <Input
                      id="serviceCity"
                      value={serviceForm.city}
                      onChange={(e) => { setServiceForm({...serviceForm, city: e.target.value}); validateTopField('city', e.target.value); }}
                      placeholder="e.g., Karachi, Lahore"
                      className={serviceErrors.city ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                    />
                    {serviceErrors.city && (
                      <p className="text-xs text-red-600 mt-1">{serviceErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="serviceAddress">Detailed Address</Label>
                    <Textarea
                      id="serviceAddress"
                      value={serviceForm.detailAddress}
                      onChange={(e) => { setServiceForm({...serviceForm, detailAddress: e.target.value}); validateTopField('detailAddress', e.target.value); }}
                      placeholder="Complete address where service is provided"
                      rows={2}
                      className={serviceErrors.detailAddress ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                    />
                    {serviceErrors.detailAddress && (
                      <p className="text-xs text-red-600 mt-1">{serviceErrors.detailAddress}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="serviceMapLink">Google Maps Link (Optional)</Label>
                    <Input
                      id="serviceMapLink"
                      value={serviceForm.googleMapLink}
                      onChange={(e) => { setServiceForm({...serviceForm, googleMapLink: e.target.value}); validateTopLink(e.target.value); }}
                      placeholder="https://maps.google.com/..."
                      className={serviceErrors.googleMapLink ? 'border-red-500 focus-visible:ring-red-500' : undefined}
                    />
                    {serviceErrors.googleMapLink && (
                      <p className="text-xs text-red-600 mt-1">{serviceErrors.googleMapLink}</p>
                    )}
                  </div>
                </div>

                {/* Service Type Selection */}
                <div className="space-y-3 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Service Type (Optional)</h4>
                    {userRole === 'doctor' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setServiceForm(prev => ({ ...prev, serviceType: [] }))}
                        className="h-8 px-2 text-xs text-gray-600 hover:text-red-600"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>What type of service is this? (Select multiple if applicable)</Label>
                    <div className="grid grid-cols-2 gap-2">
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
                    </div>
                  </div>
                </div>

                {/* Default Schedule (if you don't add variants) - Doctors only */}
                {userRole === 'doctor' && (
                  <div className="space-y-3 border-t pt-3">
                    <h4 className="font-medium text-sm">Default Schedule (optional)</h4>
                    <p className="text-xs text-muted-foreground">If you don't add variants below, this schedule applies to the main service only.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label>Time Label</Label>
                        <div className="flex gap-3 mt-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="baseTimeLabel"
                              value="Morning"
                              checked={(serviceForm.baseTimeLabel || '') === 'Morning'}
                              onChange={(e) => setServiceForm({ ...serviceForm, baseTimeLabel: e.target.value })}
                              className="text-primary focus:ring-primary"
                            />
                            <span className="text-sm">Morning</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="baseTimeLabel"
                              value="Evening"
                              checked={(serviceForm.baseTimeLabel || '') === 'Evening'}
                              onChange={(e) => setServiceForm({ ...serviceForm, baseTimeLabel: e.target.value })}
                              className="text-primary focus:ring-primary"
                            />
                            <span className="text-sm">Evening</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <Label>Days</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                            const selectedDays = (serviceForm.baseDays || '').split(',').map(d => d.trim()).filter(Boolean);
                            const isSelected = selectedDays.includes(day);
                            return (
                              <label key={day} className="flex items-center space-x-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    let newDays;
                                    if (e.target.checked) {
                                      newDays = [...selectedDays, day].join(', ');
                                    } else {
                                      newDays = selectedDays.filter(d => d !== day).join(', ');
                                    }
                                    setServiceForm({ ...serviceForm, baseDays: newDays });
                                  }}
                                  className="text-primary focus:ring-primary"
                                />
                                <span className="text-xs">{day}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={serviceForm.baseStartTime || ''}
                          onChange={(e) => setServiceForm({ ...serviceForm, baseStartTime: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={serviceForm.baseEndTime || ''}
                          onChange={(e) => setServiceForm({ ...serviceForm, baseEndTime: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Home Delivery - Doctors only */}
                {userRole === 'doctor' && (
                  <div className="space-y-2 border-t pt-3">
                    <h4 className="font-medium text-sm">Home Delivery / Visit</h4>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={serviceForm.homeDelivery}
                        onChange={(e) => setServiceForm({ ...serviceForm, homeDelivery: e.target.checked })}
                        className="text-emerald-600 focus:ring-emerald-600"
                      />
                      <span className="text-sm">Home Delivery Available <span className="ml-1">🏠</span></span>
                    </label>
                  </div>
                )}
                
                {/* Diseases Multi-Select with Typeahead - Doctors only */}
                {userRole === 'doctor' && (
                  <div className="space-y-2 border-t pt-3">
                    <h4 className="font-medium text-sm">Diseases</h4>
                    <div className="max-w-md">
                      <div className="flex flex-wrap items-center gap-2 border rounded-md p-2">
                        {diseases.map((d) => (
                          <span key={d} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {d}
                            <button type="button" className="ml-1 text-blue-700 hover:text-blue-900" onClick={() => removeDisease(d)}>×</button>
                          </span>
                        ))}
                        {diseases.length < 4 && (
                          <input
                            value={diseaseInput}
                            onChange={(e) => setDiseaseInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ',') {
                                e.preventDefault();
                                addDisease(diseaseInput);
                              }
                            }}
                            placeholder={diseases.length === 0 ? 'Type or pick disease (max 4)' : 'Add more...'}
                            className="flex-1 min-w-[160px] outline-none text-sm bg-transparent"
                          />
                        )}
                      </div>
                      {filteredDiseaseSuggestions.length > 0 && diseaseInput && (
                        <div className="mt-1 border rounded-md max-w-md bg-white shadow-sm">
                          {filteredDiseaseSuggestions.map(opt => (
                            <button
                              type="button"
                              key={opt}
                              onClick={() => addDisease(opt)}
                              className="w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Add up to 4 diseases. You can type a custom disease or select from suggestions.</p>
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
                              <div className="flex gap-3 mt-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`timeLabel-${idx}`}
                                    value="Morning"
                                    checked={(v.timeLabel || '') === 'Morning'}
                                    onChange={(e) => {
                                      const nv = [...variants]; nv[idx] = { ...v, timeLabel: e.target.value }; setVariants(nv);
                                    }}
                                    className="text-primary focus:ring-primary"
                                  />
                                  <span className="text-sm">Morning</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`timeLabel-${idx}`}
                                    value="Evening"
                                    checked={(v.timeLabel || '') === 'Evening'}
                                    onChange={(e) => {
                                      const nv = [...variants]; nv[idx] = { ...v, timeLabel: e.target.value }; setVariants(nv);
                                    }}
                                    className="text-primary focus:ring-primary"
                                  />
                                  <span className="text-sm">Evening</span>
                                </label>
                              </div>
                            </div>
                            <div>
                              <Label>Days</Label>
                              <div className="grid grid-cols-4 gap-2 mt-2">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                                  const selectedDays = (v.days || '').split(',').map(d => d.trim()).filter(Boolean);
                                  const isSelected = selectedDays.includes(day);
                                  return (
                                    <label key={day} className="flex items-center space-x-1 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          let newDays;
                                          if (e.target.checked) {
                                            newDays = [...selectedDays, day].join(', ');
                                          } else {
                                            newDays = selectedDays.filter(d => d !== day).join(', ');
                                          }
                                          const nv = [...variants]; nv[idx] = { ...v, days: newDays }; setVariants(nv);
                                        }}
                                        className="text-primary focus:ring-primary"
                                      />
                                      <span className="text-xs">{day}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                            <div>
                              <Label>Start Time</Label>
                              <Input 
                                type="time"
                                value={v.startTime || ''} 
                                onChange={(e) => {
                                  const nv = [...variants]; nv[idx] = { ...v, startTime: e.target.value }; setVariants(nv);
                                }} 
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>End Time</Label>
                              <Input 
                                type="time"
                                value={v.endTime || ''} 
                                onChange={(e) => {
                                  const nv = [...variants]; nv[idx] = { ...v, endTime: e.target.value }; setVariants(nv);
                                }} 
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Price (optional override)</Label>
                              <Input value={v.price || ''} onChange={(e) => {
                                const nv = [...variants]; nv[idx] = { ...v, price: e.target.value }; setVariants(nv);
                              }} placeholder="e.g., 2500" />
                            </div>
                            <div>
                              <Label>Hospital/Clinic Name</Label>
                              <Input value={v.hospitalClinicName || ''} onChange={(e) => {
                                const nv = [...variants]; nv[idx] = { ...v, hospitalClinicName: e.target.value }; setVariants(nv);
                                validateVariantField(idx, 'hospitalClinicName', e.target.value);
                              }} placeholder="e.g., Aga Khan Hospital" className={variantErrors[idx]?.hospitalClinicName ? 'border-red-500 focus-visible:ring-red-500' : undefined} />
                              {variantErrors[idx]?.hospitalClinicName && (
                                <p className="text-xs text-red-600 mt-1">{variantErrors[idx]?.hospitalClinicName}</p>
                              )}
                            </div>
                            <div>
                              <Label>City</Label>
                              <Input value={v.city || ''} onChange={(e) => {
                                const nv = [...variants]; nv[idx] = { ...v, city: e.target.value }; setVariants(nv);
                                validateVariantField(idx, 'city', e.target.value);
                              }} placeholder="e.g., Karachi" className={variantErrors[idx]?.city ? 'border-red-500 focus-visible:ring-red-500' : undefined} />
                              {variantErrors[idx]?.city && (
                                <p className="text-xs text-red-600 mt-1">{variantErrors[idx]?.city}</p>
                              )}
                            </div>
                            <div className="sm:col-span-2">
                              <Label>Detailed Address</Label>
                              <Textarea value={v.detailAddress || ''} onChange={(e) => {
                                const nv = [...variants]; nv[idx] = { ...v, detailAddress: e.target.value }; setVariants(nv);
                                validateVariantField(idx, 'detailAddress', e.target.value);
                              }} rows={2} placeholder="Complete address" className={variantErrors[idx]?.detailAddress ? 'border-red-500 focus-visible:ring-red-500' : undefined} />
                              {variantErrors[idx]?.detailAddress && (
                                <p className="text-xs text-red-600 mt-1">{variantErrors[idx]?.detailAddress}</p>
                              )}
                            </div>
                            <div className="sm:col-span-2">
                              <Label>Google Maps Link</Label>
                              <Input value={v.googleMapLink || ''} onChange={(e) => {
                                const nv = [...variants]; nv[idx] = { ...v, googleMapLink: e.target.value }; setVariants(nv);
                              }} placeholder="https://maps.google.com/..." />
                            </div>
                            <div className="sm:col-span-2">
                              <Label>Service Availability</Label>
                              <p className="text-sm text-muted-foreground mb-3">How is this variant available? *</p>
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id={`variant-physical-${idx}`}
                                    name={`variant-availability-${idx}`}
                                    value="Physical"
                                    checked={(v.availability || 'Physical') === 'Physical'}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        const nv = [...variants]; nv[idx] = { ...v, availability: 'Physical' }; setVariants(nv);
                                      }
                                    }}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                  />
                                  <label htmlFor={`variant-physical-${idx}`} className="text-sm font-medium text-gray-900">
                                    Physical - In-person service only
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id={`variant-online-${idx}`}
                                    name={`variant-availability-${idx}`}
                                    value="Online"
                                    checked={(v.availability || 'Physical') === 'Online'}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        const nv = [...variants]; nv[idx] = { ...v, availability: 'Online' }; setVariants(nv);
                                      }
                                    }}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                  />
                                  <label htmlFor={`variant-online-${idx}`} className="text-sm font-medium text-gray-900">
                                    Online - Remote consultation/delivery available
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id={`variant-both-${idx}`}
                                    name={`variant-availability-${idx}`}
                                    value="Online and Physical"
                                    checked={(v.availability || 'Physical') === 'Online and Physical'}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        const nv = [...variants]; nv[idx] = { ...v, availability: 'Online and Physical' }; setVariants(nv);
                                      }
                                    }}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                  />
                                  <label htmlFor={`variant-both-${idx}`} className="text-sm font-medium text-gray-900">
                                    Online and Physical - Both options available
                                  </label>
                                </div>
                              </div>
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
                      { id: Math.random().toString(36).slice(2), availability: 'Physical', isActive: true, imageFile: null }
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
      <CardContent className={userRole === 'doctor' ? "max-h-[600px] overflow-y-auto" : undefined}>
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
                        <div className="space-y-1 mt-1">
                          <span className="text-[11px] text-muted-foreground truncate block">
                            {formatAddress((service as any).detailAddress || (service as any).city)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">PKR {service.price?.toLocaleString() || 0}</span>
                    {userRole === 'pharmacy' && 'stock' in service && (
                      <span className="text-sm text-muted-foreground">
                        {(service as any).stock || 'N/A'} in stock
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 whitespace-nowrap justify-end">
                    <Button size="sm" variant="outline" onClick={() => handleEditService(service)}>
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteService(service.id)}>
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
                      <TableHead>Price</TableHead>
                      {userRole === 'doctor' && (<TableHead>Variants</TableHead>)}
                      {userRole === 'pharmacy' && (<TableHead>Stock</TableHead>)}
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
                                <div className="space-y-1 mt-1 max-w-[420px]">
                                  <span className="text-xs text-muted-foreground truncate block">
                                    {formatAddress((service as any).detailAddress || (service as any).city)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>PKR {service.price?.toLocaleString() || 0}</TableCell>
                        {userRole === 'doctor' && (
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {(service as any).variants?.length ? `${(service as any).variants.length} variants` : (editingService && editingService.id === service.id ? `${variants.length} variants` : '0 variants')}
                              </div>
                            </div>
                          </TableCell>
                        )}
                        {userRole === 'pharmacy' && (
                          <TableCell>
                            {(service as any).stock || 'N/A'}
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <div className="flex items-center gap-3 justify-end whitespace-nowrap">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditService(service)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteService(service.id)}
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
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceManagement;