import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  IdCard, 
  MapPin, 
  Upload, 
  UserCheck,
  Building,
  TestTube,
  ShoppingBag,
  Stethoscope,
  Clock,
  Users,
  CreditCard,
  FileText,
  X
} from "lucide-react";
import { generateUserId } from "@/data/mockData";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    role: "patient",
    name: "",
    email: "",
    phone: "",
    phoneAlternate: "",
    cnic: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "",
    businessName: "",
    address: "",
    city: "",
    province: "",
    mapsLocation: "",
    specialization: "",
    description: "",
    designation: "",
    servicesOffered: [] as string[],
    deliveryAvailable: false,
    service24x7: false,
    operatingHours: {
      monday: { open: "", close: "" },
      tuesday: { open: "", close: "" },
      wednesday: { open: "", close: "" },
      thursday: { open: "", close: "" },
      friday: { open: "", close: "" },
      saturday: { open: "", close: "" },
      sunday: { open: "", close: "" }
    },
    staffDetails: {
      doctors: "",
      specialists: "",
      nurses: ""
    },
    bankDetails: {
      bankName: "",
      accountTitle: "",
      accountNumber: "",
      paymentMode: ""
    }
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [showGoogleAdditionalFields, setShowGoogleAdditionalFields] = useState(false);
  const [googleProfile, setGoogleProfile] = useState<any>(null);
  const [googleIdToken, setGoogleIdToken] = useState<string>('');
  const [providerDoc, setProviderDoc] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDocModal, setShowDocModal] = useState(false);

  const roles = [
    { value: "patient", label: "Patient", icon: User, description: "Book appointments and manage health records", gradient: "from-blue-500 to-cyan-500", bgColor: "bg-blue-50", iconColor: "text-blue-600" },
    { value: "doctor", label: "Doctor", icon: UserCheck, description: "Provide medical consultations and treatments", gradient: "from-emerald-500 to-teal-500", bgColor: "bg-emerald-50", iconColor: "text-emerald-600" },
    { value: "clinic/hospital", label: "Clinic/Hospital", icon: Building, description: "Manage medical facility operations", gradient: "from-purple-500 to-indigo-500", bgColor: "bg-purple-50", iconColor: "text-purple-600" },
    { value: "laboratory", label: "Laboratory", icon: TestTube, description: "Provide diagnostic and testing services", gradient: "from-orange-500 to-red-500", bgColor: "bg-orange-50", iconColor: "text-orange-600" },
    { value: "pharmacy", label: "Pharmacy", icon: ShoppingBag, description: "Sell medicines and health products", gradient: "from-pink-500 to-rose-500", bgColor: "bg-pink-50", iconColor: "text-pink-600" }
  ];

  const servicesOptions = [
    "OPD Consultation", "IPD / Admissions", "Emergency Services", "Lab Tests", 
    "Radiology (X-ray, CT, MRI, etc.)", "Pharmacy / Medicine Supply", "Home Sample Collection",
    "Online Consultation", "Vaccination", "Physiotherapy", "Aesthetic Procedure", "Dentistry"
  ];

  const provinces = [
    "Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Gilgit-Baltistan", "Azad Kashmir"
  ];

  const paymentModes = ["Bank Transfer", "Easypaisa/JazzCash", "Manual Settlement"];

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleOperatingHoursChange = (day: string, type: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day as keyof typeof prev.operatingHours],
          [type]: value
        }
      }
    }));
  };

  const handleServiceToggle = (service: string) => {
    const currentServices = formData.servicesOffered;
    if (currentServices.includes(service)) {
      handleInputChange('servicesOffered', currentServices.filter(s => s !== service));
    } else {
      handleInputChange('servicesOffered', [...currentServices, service]);
    }
  };

  const handleGoogleRegistrationComplete = async () => {
    if (!googleIdToken || !googleProfile) {
      toast({
        title: "Error",
        description: "Google authentication data is missing",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    const requiredFields = ['phone', 'cnic', 'address', 'city', 'province'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData] || (formData[field as keyof typeof formData] as string).trim() === '');
    
    // Role-specific required fields
    if (formData.role === 'doctor' && (!formData.licenseNumber || formData.licenseNumber.trim() === '')) {
      missingFields.push('licenseNumber');
    }
    if (formData.role === 'doctor' && (!formData.designation || formData.designation.trim() === '')) {
      missingFields.push('designation');
    }
    if (['clinic/hospital', 'laboratory', 'pharmacy'].includes(formData.role) && (!formData.businessName || formData.businessName.trim() === '')) {
      missingFields.push('businessName');
    }

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions",
        variant: "destructive"
      });
      return;
    }

    setGoogleLoading(true);

    try {
      const additionalFields = {
        phone: formData.phone,
        cnic: formData.cnic,
        licenseNumber: formData.licenseNumber,
        businessName: formData.businessName,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        designation: formData.designation
      };

      const res = await fetch('http://localhost:4000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idToken: googleIdToken, 
          role: formData.role,
          additionalFields
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google registration failed');

      if (data.requiresVerification) {
        // Non-patient user registered successfully but needs admin verification
        toast({ 
          title: 'Registration Submitted!', 
          description: `Your registration as ${formData.role} has been submitted. Please wait for admin verification before you can log in.`
        });
        navigate('/login');
      } else {
        // Patient user or existing verified user - log them in
        await login({ ...data.user, id: data.user._id }, data.token);
        toast({ 
          title: 'Welcome!', 
          description: 'Successfully signed in with Google.' 
        });
        navigate('/');
      }
    } catch (err: any) {
      toast({ 
        title: 'Google Registration Failed', 
        description: err.message || 'Try again', 
        variant: 'destructive' 
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const performRegistration = async () => {
    setIsSubmitting(true);

    // Patients can use the app immediately; providers require admin verification
    const isPatient = formData.role === "patient";
    const userPayload = {
      id: generateUserId(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      phoneAlternate: formData.phoneAlternate,
      cnic: formData.cnic,
      role: formData.role,
      isVerified: isPatient ? true : false,
      password: formData.password,
      licenseNumber: formData.licenseNumber,
      businessName: formData.businessName,
      address: formData.address,
      city: formData.city,
      province: formData.province,
      mapsLocation: formData.mapsLocation,
      specialization: formData.specialization,
      description: formData.description,
      designation: formData.designation,
      servicesOffered: formData.servicesOffered,
      deliveryAvailable: formData.deliveryAvailable,
      service24x7: formData.service24x7,
      operatingHours: formData.operatingHours,
      staffDetails: formData.staffDetails,
      bankDetails: formData.bankDetails
    };

    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...userPayload,
          confirmPassword: formData.confirmPassword // backend expects this field
        })
      });
      const data = await response.json();
      if (!response.ok) {
        toast({
          title: 'Registration Failed',
          description: data.message || 'Registration failed. Please try again.',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }
      if (!isPatient) {
        // For providers: if a document is selected and token returned, upload it now
        if (data?.token && providerDoc) {
          try {
            const fd = new FormData();
            fd.append('file', providerDoc);
            const upRes = await fetch('http://localhost:4000/api/documents/upload', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${data.token}` },
              body: fd,
            });
            const upData = await upRes.json();
            if (!upRes.ok) {
              toast({ title: 'Document Upload Failed', description: upData?.message || 'Please try again', variant: 'destructive' });
            } else {
              toast({ title: 'Documents Received', description: 'Your document has been submitted for admin verification.' });
            }
          } catch (docErr: any) {
            toast({ title: 'Document Upload Error', description: docErr?.message || 'Failed to upload document', variant: 'destructive' });
          }
        }
        toast({
          title: 'Registration Submitted!',
          description: `Your registration as ${formData.role} has been submitted. Please wait for admin verification before you can log in.`,
        });
        navigate('/login');
      } else {
        // Patients are verified immediately but should login manually
        toast({
          title: 'Registration Successful!',
          description: 'Your patient account is ready. Please sign in to continue.',
        });
        navigate('/login');
      }
    } catch (error: any) {
      toast({
        title: 'Registration Error',
        description: error.message || 'An error occurred during registration.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role) {
      toast({
        title: "Error",
        description: "Please select a role",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error", 
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions",
        variant: "destructive"
      });
      return;
    }

    // For provider roles, if no document selected yet, open modal first
    if (formData.role !== 'patient' && !providerDoc) {
      setShowDocModal(true);
      return;
    }

    await performRegistration();
  };

  const getRoleSpecificFields = () => {
    if (formData.role === "patient") return null;

    return (
      <>
        {/* Business Information */}
        <div className="space-y-4 rounded-xl border bg-white/60 p-5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building className="w-5 h-5" />
            Business Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Business/Facility Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleInputChange("businessName", e.target.value)}
                placeholder="Enter business name"
                required
              />
            </div>
            <div>
              <Label htmlFor="designation">Designation/Role *</Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) => handleInputChange("designation", e.target.value)}
                placeholder="e.g., CEO, Medical Director"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="licenseNumber">Registration/License Number *</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                placeholder="Enter license number"
                required
              />
            </div>
            {formData.role === "doctor" && (
              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => handleInputChange("specialization", e.target.value)}
                  placeholder="e.g., Cardiology, Pediatrics"
                />
              </div>
            )}
          </div>
        </div>

        {/* Address & Location */}
        <div className="space-y-4 rounded-xl border bg-white/60 p-5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Address & Location
          </h3>
          
          <div>
            <Label htmlFor="address">Complete Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter complete address"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="province">Province/State *</Label>
              <Select value={formData.province} onValueChange={(value) => handleInputChange("province", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>{province}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="mapsLocation">Google Maps Location Link</Label>
              <Input
                id="mapsLocation"
                value={formData.mapsLocation}
                onChange={(e) => handleInputChange("mapsLocation", e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="deliveryAvailable"
                checked={formData.deliveryAvailable}
                onCheckedChange={(checked) => handleInputChange("deliveryAvailable", checked as boolean)}
              />
              <Label htmlFor="deliveryAvailable">Delivery/Visit Available</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="service24x7"
                checked={formData.service24x7}
                onCheckedChange={(checked) => handleInputChange("service24x7", checked as boolean)}
              />
              <Label htmlFor="service24x7">24/7 Service</Label>
            </div>
          </div>
        </div>

        {/* Services Offered */}
        <div className="space-y-4 rounded-xl border bg-white/60 p-5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Services Offered
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {servicesOptions.map((service) => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox
                  id={service}
                  checked={formData.servicesOffered.includes(service)}
                  onCheckedChange={() => handleServiceToggle(service)}
                />
                <Label htmlFor={service} className="text-sm">{service}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Details */}
        <div className="space-y-4 rounded-xl border bg-white/60 p-5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Staff Details (Optional)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="doctors">Number of Doctors</Label>
              <Input
                id="doctors"
                type="number"
                value={formData.staffDetails.doctors}
                onChange={(e) => handleInputChange("staffDetails.doctors", e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="specialists">Number of Specialists</Label>
              <Input
                id="specialists"
                type="number"
                value={formData.staffDetails.specialists}
                onChange={(e) => handleInputChange("staffDetails.specialists", e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="nurses">Number of Nurses/Technicians</Label>
              <Input
                id="nurses"
                type="number"
                value={formData.staffDetails.nurses}
                onChange={(e) => handleInputChange("staffDetails.nurses", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="space-y-4 rounded-xl border bg-white/60 p-5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Operating Hours
          </h3>
          
          <div className="space-y-3">
            {Object.keys(formData.operatingHours).map((day) => (
              <div key={day} className="grid grid-cols-3 gap-4 items-center">
                <Label className="capitalize">{day}</Label>
                <Input
                  type="time"
                  value={formData.operatingHours[day as keyof typeof formData.operatingHours].open}
                  onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                  placeholder="Open Time"
                />
                <Input
                  type="time"
                  value={formData.operatingHours[day as keyof typeof formData.operatingHours].close}
                  onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                  placeholder="Close Time"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bank Details */}
        <div className="space-y-4 rounded-xl border bg-white/60 p-5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Bank/Payment Information (Optional)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bankDetails.bankName}
                onChange={(e) => handleInputChange("bankDetails.bankName", e.target.value)}
                placeholder="Enter bank name"
              />
            </div>
            <div>
              <Label htmlFor="accountTitle">Account Title</Label>
              <Input
                id="accountTitle"
                value={formData.bankDetails.accountTitle}
                onChange={(e) => handleInputChange("bankDetails.accountTitle", e.target.value)}
                placeholder="Enter account title"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="accountNumber">Account Number/IBAN</Label>
              <Input
                id="accountNumber"
                value={formData.bankDetails.accountNumber}
                onChange={(e) => handleInputChange("bankDetails.accountNumber", e.target.value)}
                placeholder="Enter account number"
              />
            </div>
            <div>
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Select value={formData.bankDetails.paymentMode} onValueChange={(value) => handleInputChange("bankDetails.paymentMode", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentModes.map((mode) => (
                    <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Documents Required */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Documents Required
          </h3>
          <div className="rounded-xl border-2 border-dashed p-6 md:p-8 text-center bg-gradient-to-br from-gray-50 to-white hover:from-gray-50/80 transition-colors">
            <p className="text-sm text-muted-foreground mb-3">Please attach copies of the following documents:</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside mb-5 text-left inline-block">
              <li>Business Registration / License</li>
              <li>CNIC of Owner / Admin</li>
              <li>PMDC/PMC Certificate (for Doctors)</li>
            </ul>

            <input
              ref={fileInputRef}
              id="providerDoc"
              type="file"
              className="hidden"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                if (f && f.size > 25 * 1024 * 1024) {
                  toast({ title: 'File too large', description: 'Max 25MB allowed', variant: 'destructive' });
                  if (fileInputRef.current) fileInputRef.current.value = '';
                  setProviderDoc(null);
                  return;
                }
                setProviderDoc(f);
              }}
            />

            <label
              htmlFor="providerDoc"
              className="group inline-flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer bg-white hover:bg-gray-50 shadow-sm hover:shadow transition-all"
            >
              <span className="w-9 h-9 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                <Upload className="w-5 h-5 text-white" />
              </span>
              <span className="text-sm text-gray-700">
                <span className="font-medium">Click to upload</span>
                <span className="text-muted-foreground"> • PDF, DOC, DOCX • up to 25MB</span>
              </span>
            </label>

            {providerDoc && (
              <div className="mt-4 flex items-center justify-center">
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-2 border">
                  <span className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-medium truncate max-w-[220px]" title={providerDoc.name}>{providerDoc.name}</p>
                    <p className="text-xs text-muted-foreground">{(providerDoc.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-1"
                    onClick={() => {
                      setProviderDoc(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <p className="mt-3 text-xs text-muted-foreground">Only one file allowed. Accepted types: PDF/DOC/DOCX. Max 25MB.</p>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">SehatKor</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Create your account and become part of Pakistan's largest healthcare network
          </p>
        </div>

        <Card className="card-healthcare border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Health Services Provider Registration</CardTitle>
            <CardDescription>
              Fill in the details below to register your healthcare facility or service
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Social signup */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="w-[260px] sm:w-[280px]">
                  <GoogleLogin
                  onSuccess={async (cred) => {
                    try {
                      setGoogleLoading(true);
                      const idToken = cred?.credential as string;
                      if (!idToken) throw new Error('Missing Google credential');
                      
                      // First, try to authenticate with Google (without additional fields)
                      const res = await fetch('http://localhost:4000/api/auth/google', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idToken, role: formData.role || 'patient' })
                      });
                      const data = await res.json();
                      
                      if (res.ok) {
                        // User already exists, log them in
                        await login({ ...data.user, id: data.user._id }, data.token);
                        toast({ title: 'Welcome back!', description: 'Signed in with Google.' });
                        navigate('/');
                      } else if (data.requiresAdditionalFields) {
                        // New user, need additional fields
                        setGoogleProfile(data.profile);
                        setGoogleIdToken(idToken);
                        setFormData(prev => ({
                          ...prev,
                          name: data.profile.name,
                          email: data.profile.email
                        }));
                        setShowGoogleAdditionalFields(true);
                        toast({ 
                          title: 'Additional Information Required', 
                          description: 'Please fill in the required fields to complete your registration.' 
                        });
                      } else {
                        throw new Error(data.message || 'Google signup failed');
                      }
                    } catch (err: any) {
                      toast({ title: 'Google Sign-in Failed', description: err.message || 'Try again', variant: 'destructive' });
                    } finally {
                      setGoogleLoading(false);
                    }
                  }}
                  onError={() => toast({ title: 'Google Sign-in Failed', description: 'Try again', variant: 'destructive' })}
                  theme="filled_blue"
                  shape="rectangular"
                  size="large"
                  text="continue_with"
                  useOneTap
                  />
                </div>
                <Button
                  type="button"
                  variant="default"
                  className="w-[260px] sm:w-[280px] flex items-center justify-center rounded-md bg-[#145DBF] hover:bg-[#0F4CA1] text-white shadow-sm"
                  disabled={facebookLoading}
                  onClick={() => {
                    try {
                      setFacebookLoading(true);
                      const role = formData.role || 'patient';
                      // Start OAuth flow on backend; backend will redirect to Facebook and then back to client callback
                      window.location.href = `http://localhost:4000/api/auth/facebook?role=${encodeURIComponent(role)}`;
                    } finally {
                      // loading state will be cleared after redirect; this is a safety noop
                    }
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <g transform="translate(-4 -4) scale(1.25)">
                      <path d="M22 16.1C22 13.1 19.9 11 16.9 11C14.1 11 12 13.1 12 16.1C12 18.7 13.7 20.6 16.1 20.9V17.2H14.7V16.1H16.1V15.2C16.1 13.9 16.8 13.3 18 13.3C18.5 13.3 18.9 13.4 19 13.4V14.7H18.3C17.7 14.7 17.6 15 17.6 15.3V16.1H19L18.8 17.2H17.6V20.9C20 20.6 22 18.7 22 16.1Z" fill="white"/>
                    </g>
                  </svg>
                  Continue with Facebook
                </Button>
              </div>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">or continue with email</span>
                </div>
              </div>
            </div>

            {/* Google Additional Fields Form */}
            {showGoogleAdditionalFields && (
              <div className="mb-8 p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Complete Your Google Registration</h3>
                    <p className="text-sm text-blue-700">
                      Welcome {googleProfile?.name}! Please provide additional information to complete your registration.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Role Selection for Google Users */}
                  <div>
                    <Label className="text-base font-medium mb-4 block">Select Your Role *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {roles.map((role) => {
                        const Icon = role.icon;
                        const isSelected = formData.role === role.value;
                        return (
                          <div
                            key={role.value}
                            className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                              isSelected ? "scale-105" : ""
                            }`}
                            onClick={() => handleInputChange("role", role.value)}
                          >
                            <div className={`bg-gradient-to-br ${role.gradient} p-[1.5px] rounded-lg w-full h-[120px] ${
                              isSelected ? "shadow-lg shadow-current/25" : "shadow-md hover:shadow-lg"
                            }`}>
                              <div className={`bg-white rounded-lg p-3 w-full h-full flex flex-col items-center justify-center ${
                                isSelected ? role.bgColor : "hover:" + role.bgColor
                              } transition-all duration-300`}>
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-2 transform transition-transform duration-300 ${
                                  isSelected ? "scale-110" : "group-hover:scale-110"
                                }`}>
                                  <Icon className="w-4 h-4 text-white" />
                                </div>
                                
                                <h3 className={`text-sm font-bold text-center mb-1 ${role.iconColor} transition-colors duration-300`}>
                                  {role.label}
                                </h3>
                                
                                <p className="text-[10px] text-gray-600 text-center leading-tight px-1">
                                  {role.description}
                                </p>
                                
                                {isSelected && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-white">
                                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Required Fields for Google Registration */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold">Required Information</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="google-phone">Phone Number *</Label>
                        <Input
                          id="google-phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+92 300 1234567"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="google-cnic">CNIC Number *</Label>
                        <Input
                          id="google-cnic"
                          value={formData.cnic}
                          onChange={(e) => handleInputChange("cnic", e.target.value)}
                          placeholder="12345-1234567-1"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="google-address">Complete Address *</Label>
                      <Textarea
                        id="google-address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter complete address"
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="google-city">City *</Label>
                        <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your city" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Karachi">Karachi</SelectItem>
                            <SelectItem value="Lahore">Lahore</SelectItem>
                            <SelectItem value="Islamabad">Islamabad</SelectItem>
                            <SelectItem value="Faisalabad">Faisalabad</SelectItem>
                            <SelectItem value="Rawalpindi">Rawalpindi</SelectItem>
                            <SelectItem value="Multan">Multan</SelectItem>
                            <SelectItem value="Peshawar">Peshawar</SelectItem>
                            <SelectItem value="Quetta">Quetta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="google-province">Province *</Label>
                        <Select value={formData.province} onValueChange={(value) => handleInputChange("province", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                          <SelectContent>
                            {provinces.map((province) => (
                              <SelectItem key={province} value={province}>{province}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Role-specific fields for Google registration */}
                    {formData.role === 'doctor' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="google-license">License Number *</Label>
                          <Input
                            id="google-license"
                            value={formData.licenseNumber}
                            onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                            placeholder="Enter license number"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="google-designation">Designation *</Label>
                          <Input
                            id="google-designation"
                            value={formData.designation}
                            onChange={(e) => handleInputChange("designation", e.target.value)}
                            placeholder="e.g., Medical Officer, Consultant"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {['clinic/hospital', 'laboratory', 'pharmacy'].includes(formData.role) && (
                      <div>
                        <Label htmlFor="google-business">Business Name *</Label>
                        <Input
                          id="google-business"
                          value={formData.businessName}
                          onChange={(e) => handleInputChange("businessName", e.target.value)}
                          placeholder="Enter business/facility name"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="google-terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                    />
                    <Label htmlFor="google-terms" className="text-sm leading-relaxed">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms and Conditions
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowGoogleAdditionalFields(false);
                        setGoogleProfile(null);
                        setGoogleIdToken('');
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleGoogleRegistrationComplete}
                      disabled={googleLoading}
                      className="flex-1"
                    >
                      {googleLoading ? "Completing Registration..." : "Complete Registration"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8" style={{ display: showGoogleAdditionalFields ? 'none' : 'block' }}>
              {/* Role Selection */}
              <div>
                <Label className="text-base font-medium mb-4 block">Select Your Role *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    const isSelected = formData.role === role.value;
                    return (
                      <div
                        key={role.value}
                        className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                          isSelected ? "scale-105" : ""
                        }`}
                        onClick={() => handleInputChange("role", role.value)}
                      >
                        <div className={`bg-gradient-to-br ${role.gradient} p-[1.5px] rounded-lg w-full h-[120px] ${
                          isSelected ? "shadow-lg shadow-current/25" : "shadow-md hover:shadow-lg"
                        }`}>
                          <div className={`bg-white rounded-lg p-3 w-full h-full flex flex-col items-center justify-center ${
                            isSelected ? role.bgColor : "hover:" + role.bgColor
                          } transition-all duration-300`}>
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-2 transform transition-transform duration-300 ${
                              isSelected ? "scale-110" : "group-hover:scale-110"
                            }`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            
                            <h3 className={`text-sm font-bold text-center mb-1 ${role.iconColor} transition-colors duration-300`}>
                              {role.label}
                            </h3>
                            
                            <p className="text-[10px] text-gray-600 text-center leading-tight px-1">
                              {role.description}
                            </p>
                            
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-white">
                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4 rounded-xl border bg-white/60 p-5">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name*</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <User className="w-4 h-4" />
                      </span>
                      <Input
                        id="name"
                        className="pl-9"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address*</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                      </span>
                      <Input
                        id="email"
                        type="email"
                        className="pl-9"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Whatsapp Number*</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                      </span>
                      <Input
                        id="phone"
                        className="pl-9"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+92 300 1234567"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phoneAlternate">Alternate Phone Numbers</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                      </span>
                      <Input
                        id="phoneAlternate"
                        className="pl-9"
                        value={formData.phoneAlternate}
                        onChange={(e) => handleInputChange("phoneAlternate", e.target.value)}
                        placeholder="+92 300 1234567"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cnic">CNIC Number*</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <IdCard className="w-4 h-4" />
                      </span>
                      <Input
                        id="cnic"
                        className="pl-9"
                        value={formData.cnic}
                        onChange={(e) => handleInputChange("cnic", e.target.value)}
                        placeholder="12345-1234567-1"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="city">City*</Label>
                    <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Karachi">Karachi</SelectItem>
                        <SelectItem value="Lahore">Lahore</SelectItem>
                        <SelectItem value="Islamabad">Islamabad</SelectItem>
                        <SelectItem value="Faisalabad">Faisalabad</SelectItem>
                        <SelectItem value="Rawalpindi">Rawalpindi</SelectItem>
                        <SelectItem value="Multan">Multan</SelectItem>
                        <SelectItem value="Peshawar">Peshawar</SelectItem>
                        <SelectItem value="Quetta">Quetta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {getRoleSpecificFields()}

              {/* Security */}
              <div className="space-y-4 rounded-xl border bg-white/60 p-5">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="w-4 h-4" />
                      </span>
                      <Input
                        id="password"
                        type="password"
                        className="pl-9"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="Create a strong password"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="w-4 h-4" />
                      </span>
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="pl-9"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Agreement */}
              <div className="space-y-4 rounded-xl border bg-white/60 p-5">
                <h3 className="text-lg font-semibold">Agreement & Declaration</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-4">
                    I hereby declare that all information provided is true and valid to the best of my knowledge. 
                    I agree to abide by the platform's guidelines and ensure patient safety, privacy, and quality care.
                  </p>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I agree to the{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-6 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting Registration..." : "Submit Registration"}
              </Button>
            </form>

            {/* Document Upload Modal for Providers */}
            <Dialog open={showDocModal} onOpenChange={setShowDocModal}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Upload Verification Document</DialogTitle>
                  <DialogDescription>
                    Please upload your business/clinic verification document. You can also skip and submit now; you may be asked to provide it later during verification.
                  </DialogDescription>
                </DialogHeader>

                <div className="rounded-xl border-2 border-dashed p-6 text-center bg-gradient-to-br from-gray-50 to-white">
                  <input
                    ref={fileInputRef}
                    id="providerDocModal"
                    type="file"
                    className="hidden"
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      if (f && f.size > 25 * 1024 * 1024) {
                        toast({ title: 'File too large', description: 'Max 25MB allowed', variant: 'destructive' });
                        if (fileInputRef.current) fileInputRef.current.value = '';
                        setProviderDoc(null);
                        return;
                      }
                      setProviderDoc(f);
                    }}
                  />

                  <label
                    htmlFor="providerDocModal"
                    className="group inline-flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer bg-white hover:bg-gray-50 shadow-sm hover:shadow transition-all"
                  >
                    <span className="w-9 h-9 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                      <Upload className="w-5 h-5 text-white" />
                    </span>
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">Click to upload</span>
                      <span className="text-muted-foreground"> • PDF, DOC, DOCX • up to 25MB</span>
                    </span>
                  </label>

                  {providerDoc && (
                    <div className="mt-4 flex items-center justify-center">
                      <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-2 border">
                        <span className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-white" />
                        </span>
                        <div className="text-left">
                          <p className="text-sm font-medium truncate max-w-[260px]" title={providerDoc.name}>{providerDoc.name}</p>
                          <p className="text-xs text-muted-foreground">{(providerDoc.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-1"
                          onClick={() => {
                            setProviderDoc(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <p className="mt-3 text-xs text-muted-foreground">Only one file allowed. Accepted types: PDF/DOC/DOCX. Max 25MB.</p>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowDocModal(false);
                      performRegistration();
                    }}
                    disabled={isSubmitting}
                  >
                    Skip and Submit
                  </Button>
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!providerDoc) {
                        toast({ title: 'No file selected', description: 'Please choose a document to upload or skip.', variant: 'destructive' });
                        return;
                      }
                      setShowDocModal(false);
                      await performRegistration();
                    }}
                    disabled={isSubmitting}
                  >
                    Upload & Submit
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;