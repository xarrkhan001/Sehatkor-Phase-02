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
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import * as Yup from 'yup';
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
  FlaskConical,
  ShoppingBag,
  Stethoscope,
  Clock,
  Users,
  CreditCard,
  FileText,
  X
} from "lucide-react";
import { generateUserId } from "@/data/mockData";

// Validation Schema
const getValidationSchema = (role: string) => {
  const baseSchema = {
    role: Yup.string().required('Please select a role'),
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
      .required('Full name is required'),
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email address is required'),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
      .required('WhatsApp number is required'),
    phoneCountryCode: Yup.string().required('Country code is required'),
    phoneAlternate: Yup.string()
      .matches(/^([0-9]{10})?$/, 'Alternate phone must be 10 digits'),
    phoneAlternateCountryCode: Yup.string(),
    cnic: Yup.string()
      .matches(/^[0-9]{5}-[0-9]{7}-[0-9]$/, 'CNIC must be in format 12345-1234567-1')
      .required('CNIC number is required'),
    city: Yup.string().required('Please select your city'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password')
  };

  // Role-specific validations
  const roleSpecificSchema: any = {};

  if (role === 'doctor') {
    roleSpecificSchema.licenseNumber = Yup.string()
      .test('min-length-if-provided', 'License number must be at least 3 characters', function(value) {
        if (!value || value.trim() === '') return true; // Allow empty
        return value.length >= 3; // Validate only if provided
      })
      .notRequired();
    roleSpecificSchema.designation = Yup.string()
      .min(2, 'Designation must be at least 2 characters')
      .required('Designation is required for doctors');
    roleSpecificSchema.specialization = Yup.string()
      .transform((val) => (typeof val === 'string' && val.trim() === '' ? undefined : val))
      .notRequired()
      .min(2, 'Specialization must be at least 2 characters');
  }

  if (['clinic/hospital', 'laboratory', 'pharmacy'].includes(role)) {
    roleSpecificSchema.businessName = Yup.string()
      .min(2, 'Business name must be at least 2 characters')
      .required('Business name is required');
    roleSpecificSchema.licenseNumber = Yup.string()
      .test('min-length-if-provided', 'License number must be at least 3 characters', function(value) {
        if (!value || value.trim() === '') return true; // Allow empty
        return value.length >= 3; // Validate only if provided
      })
      .notRequired();
    roleSpecificSchema.designation = Yup.string()
      .min(2, 'Designation must be at least 2 characters')
      .required('Designation is required');
    roleSpecificSchema.address = Yup.string()
      .min(10, 'Address must be at least 10 characters')
      .required('Complete address is required');
    roleSpecificSchema.province = Yup.string()
      .required('Please select your province');
  }

  // Optional fields with validation when provided
  roleSpecificSchema.description = Yup.string()
    .max(500, 'Description must be less than 500 characters');

  // Staff details validation (numbers only when provided)
  roleSpecificSchema.staffDetails = Yup.object({
    doctors: Yup.string().matches(/^[0-9]*$/, 'Must be a valid number'),
    specialists: Yup.string().matches(/^[0-9]*$/, 'Must be a valid number'),
    nurses: Yup.string().matches(/^[0-9]*$/, 'Must be a valid number')
  });

  // Bank details validation (optional but validated when provided)
  roleSpecificSchema.bankDetails = Yup.object({
    bankName: Yup.string()
      .transform((val) => (typeof val === 'string' && val.trim() === '' ? undefined : val))
      .notRequired()
      .min(2, 'Bank name must be at least 2 characters'),
    accountTitle: Yup.string()
      .transform((val) => (typeof val === 'string' && val.trim() === '' ? undefined : val))
      .notRequired()
      .min(2, 'Account title must be at least 2 characters'),
    accountNumber: Yup.string()
      .transform((val) => (typeof val === 'string' && val.trim() === '' ? undefined : val))
      .notRequired()
      .matches(/^[0-9A-Z-]*$/, 'Account number can only contain numbers, letters, and hyphens')
      .min(10, 'Account number must be at least 10 characters'),
    paymentMode: Yup.string()
      .transform((val) => (typeof val === 'string' && val.trim() === '' ? undefined : val))
      .notRequired()
  });


  return Yup.object({ ...baseSchema, ...roleSpecificSchema });
};

// Validation schema for Google additional-fields flow
const getGoogleValidationSchema = (role: string) => {
  // Base validations required for all roles in Google completion flow
  const base: Record<string, any> = {
    name: Yup.string().min(2).max(50).required(),
    email: Yup.string().email().required(),
    role: Yup.string().required(),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/i, 'Phone number must be 10 digits')
      .required('Phone number is required'),
    cnic: Yup.string()
      .matches(/^[0-9]{5}-[0-9]{7}-[0-9]$/, 'CNIC must be in format 12345-1234567-1')
      .required('CNIC number is required'),
    city: Yup.string().required('Please select your city'),
  };

  // Role-specific requirements
  const roleSpecific: Record<string, any> = {};
  if (role === 'doctor') {
    roleSpecific.licenseNumber = Yup.string()
      .min(3, 'License number must be at least 3 characters')
      .required('License number is required');
    roleSpecific.designation = Yup.string()
      .min(2, 'Designation must be at least 2 characters')
      .required('Designation is required');
  }

  if (['clinic/hospital', 'laboratory', 'pharmacy'].includes(role)) {
    roleSpecific.businessName = Yup.string()
      .min(2, 'Business name must be at least 2 characters')
      .required('Business name is required');
    roleSpecific.licenseNumber = Yup.string()
      .min(3, 'License number must be at least 3 characters')
      .required('License number is required');
    roleSpecific.address = Yup.string()
      .min(10, 'Address must be at least 10 characters')
      .required('Complete address is required');
    roleSpecific.province = Yup.string().required('Please select your province');
  }

  return Yup.object({ ...base, ...roleSpecific });
};

const RegisterPage = () => {
  const initialValues = {
    role: "patient",
    name: "",
    email: "",
    phone: "",
    phoneCountryCode: "+92",
    phoneAlternate: "",
    phoneAlternateCountryCode: "+92",
    cnic: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "",
    businessName: "",
    address: "",
    city: "",
    province: "",
    specialization: "",
    description: "",
    designation: "",
    servicesOffered: [] as string[],
    deliveryAvailable: false,
    service24x7: false,
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
  };
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
  const [googleErrors, setGoogleErrors] = useState<Record<string, string>>({});

  const roles = [
    { value: "patient", label: "Patient", icon: User, description: "Book appointments and manage health records", gradient: "from-blue-500 to-cyan-500", bgColor: "bg-blue-50", iconColor: "text-blue-600" },
    { value: "doctor", label: "Doctor", icon: UserCheck, description: "Provide medical consultations and treatments", gradient: "from-emerald-500 to-teal-500", bgColor: "bg-emerald-50", iconColor: "text-emerald-600" },
    { value: "clinic/hospital", label: "Clinic/Hospital", icon: Building, description: "Manage medical facility operations", gradient: "from-purple-500 to-indigo-500", bgColor: "bg-purple-50", iconColor: "text-purple-600" },
    { value: "laboratory", label: "Laboratory", icon: FlaskConical, description: "Provide diagnostic and testing services", gradient: "from-orange-500 to-red-500", bgColor: "bg-orange-50", iconColor: "text-orange-600" },
    { value: "pharmacy", label: "Pharmacy", icon: ShoppingBag, description: "Sell medicines and health products", gradient: "from-pink-500 to-rose-500", bgColor: "bg-pink-50", iconColor: "text-pink-600" }
  ];

  // Whitelist of Google additional fields per role for per-field validation
  const GOOGLE_BASE_FIELDS = ['name', 'email', 'role', 'phone', 'cnic', 'city'] as const;
  const GOOGLE_DOCTOR_FIELDS = ['licenseNumber', 'designation'] as const;
  const GOOGLE_PROVIDER_FIELDS = ['businessName', 'address', 'province', 'licenseNumber'] as const;
  const isProviderRole = (role: string) => ['clinic/hospital', 'laboratory', 'pharmacy'].includes(role);

  const servicesOptions = [
    "OPD Consultation", "IPD / Admissions", "Emergency Services", "Lab Tests", 
    "Radiology (X-ray, CT, MRI, etc.)", "Pharmacy / Medicine Supply", "Home Sample Collection",
    "Online Consultation", "Vaccination", "Physiotherapy", "Aesthetic Procedure", "Dentistry"
  ];

  const provinces = [
    "Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Gilgit-Baltistan", "Azad Kashmir"
  ];

  const paymentModes = ["Bank Transfer", "Easypaisa/JazzCash", "Manual Settlement"];

  const countryCodes = [
    { code: "+92", country: "Pakistan", flag: "🇵🇰" },
    { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
    { code: "+971", country: "UAE", flag: "🇦🇪" },
    { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+86", country: "China", flag: "🇨🇳" },
    { code: "+49", country: "Germany", flag: "🇩🇪" },
    { code: "+33", country: "France", flag: "🇫🇷" },
    { code: "+61", country: "Australia", flag: "🇦🇺" }
  ];

  // Helper functions for Formik and non-Formik contexts
  const handleInputChange = (
    field: string,
    value: string | boolean | string[],
    setFieldValue?: (field: string, value: any) => void
  ) => {
    if (setFieldValue) {
      setFieldValue(field, value);
      return;
    }
    // Fallback to local state for non-Formik sections (e.g., Google Additional Fields)
    setCurrentFormValues((prev) => {
      const next = { ...prev } as any;
      if (field.includes('.')) {
        const parts = field.split('.');
        let ref = next;
        for (let i = 0; i < parts.length - 1; i++) {
          const p = parts[i];
          ref[p] = ref[p] ?? {};
          ref = ref[p];
        }
        ref[parts[parts.length - 1]] = value;
      } else {
        (next as any)[field] = value;
      }
      return next;
    });
  };


  const handleServiceToggle = (
    service: string,
    currentServices: string[],
    setFieldValue?: (field: string, value: any) => void
  ) => {
    const next = currentServices.includes(service)
      ? currentServices.filter((s) => s !== service)
      : [...currentServices, service];
    if (setFieldValue) {
      setFieldValue('servicesOffered', next);
      return;
    }
    setCurrentFormValues((prev) => ({
      ...prev,
      servicesOffered: next,
    }));
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

    // Schema validation for Google additional fields
    try {
      setGoogleErrors({});
      await getGoogleValidationSchema(currentFormValues.role).validate(currentFormValues, { abortEarly: false });
    } catch (err: any) {
      const errs: Record<string, string> = {};
      if (err?.inner && Array.isArray(err.inner)) {
        err.inner.forEach((e: any) => {
          if (e.path && !errs[e.path]) errs[e.path] = e.message;
        });
      } else if (err?.path && err?.message) {
        errs[err.path] = err.message;
      }
      setGoogleErrors(errs);
      toast({ title: 'Missing Required Fields', description: 'Please correct the highlighted fields.', variant: 'destructive' });
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
        phone: currentFormValues.phoneCountryCode + currentFormValues.phone,
        phoneAlternate: currentFormValues.phoneAlternateCountryCode + currentFormValues.phoneAlternate,
        cnic: currentFormValues.cnic,
        licenseNumber: currentFormValues.licenseNumber,
        businessName: currentFormValues.businessName,
        address: currentFormValues.address,
        city: currentFormValues.city,
        province: currentFormValues.province,
        designation: currentFormValues.designation,
      };

      // Complete Google registration with additional fields
      const res = await fetch('http://localhost:4000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: googleIdToken,
          role: currentFormValues.role || 'patient',
          additionalFields,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to complete Google registration');
      }

      const isPatient = (currentFormValues.role === 'patient');
      if (!isPatient) {
        // Providers: optionally upload document if selected and token returned
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
          description: `Your registration as ${currentFormValues.role} has been submitted. Please wait for admin verification before you can log in.`,
        });
        setShowGoogleAdditionalFields(false);
        navigate('/login');
      } else {
        // Patients: log them in immediately
        await login({ ...data.user, id: data.user._id }, data.token);
        toast({ 
          title: 'Welcome!', 
          description: 'Successfully signed in with Google.' 
        });
        setShowGoogleAdditionalFields(false);
        navigate('/');
      }
    } catch (err: any) {
      toast({ 
        title: 'Google Registration Failed', 
        description: err?.message || 'Try again', 
        variant: 'destructive' 
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const [currentFormValues, setCurrentFormValues] = useState<typeof initialValues>(initialValues);

  const performRegistration = async () => {
    await performRegistrationWithValues(currentFormValues);
  };

  const performRegistrationWithValues = async (values: typeof initialValues) => {
    setIsSubmitting(true);

    // Patients can use the app immediately; providers require admin verification
    const isPatient = values.role === "patient";
    const userPayload = {
      id: generateUserId(),
      name: values.name,
      email: values.email,
      phone: values.phoneCountryCode + values.phone,
      phoneAlternate: values.phoneAlternateCountryCode + values.phoneAlternate,
      cnic: values.cnic,
      role: values.role,
      isVerified: isPatient ? true : false,
      password: values.password,
      licenseNumber: values.licenseNumber,
      businessName: values.businessName,
      address: values.address,
      city: values.city,
      province: values.province,
      specialization: values.specialization,
      description: values.description,
      designation: values.designation,
      servicesOffered: values.servicesOffered,
      deliveryAvailable: values.deliveryAvailable,
      service24x7: values.service24x7,
      staffDetails: values.staffDetails,
      bankDetails: values.bankDetails
    };

    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...userPayload,
          confirmPassword: values.confirmPassword // backend expects this field
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
          description: `Your registration as ${values.role} has been submitted. Please wait for admin verification before you can log in.`,
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

  const handleFormSubmit = async (values: typeof initialValues) => {
    if (!acceptTerms) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions",
        variant: "destructive"
      });
      return;
    }

    // Store current form values for modal usage
    setCurrentFormValues(values);

    // For provider roles, if no document selected yet, open modal first
    if (values.role !== 'patient' && !providerDoc) {
      setShowDocModal(true);
      return;
    }

    await performRegistrationWithValues(values);
  };

  // Custom Field Components with Error Display
  const FormField = ({ name, label, required = false, children, className = "" }: {
    name: string;
    label: string;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={className}>
      <Label htmlFor={name}>
        {label}{required && " *"}
      </Label>
      {children}
      <ErrorMessage name={name} component="div" className="text-sm text-red-500 mt-1" />
    </div>
  );

  const FormikInput = ({ name, ...props }: any) => (
    <Field name={name}>
      {({ field, meta }: any) => (
        <Input
          {...field}
          {...props}
          className={`${props.className || ''} ${meta.touched && meta.error ? 'border-red-500' : ''}`}
        />
      )}
    </Field>
  );

  const FormikTextarea = ({ name, ...props }: any) => (
    <Field name={name}>
      {({ field, meta }: any) => (
        <Textarea
          {...field}
          {...props}
          className={`${props.className || ''} ${meta.touched && meta.error ? 'border-red-500' : ''}`}
        />
      )}
    </Field>
  );

  const FormikSelect = ({ name, placeholder, children, onValueChange, ...props }: any) => (
    <Field name={name}>
      {({ field, form, meta }: any) => (
        <Select
          value={field.value}
          onValueChange={(value) => {
            form.setFieldValue(name, value);
            if (onValueChange) onValueChange(value);
          }}
          {...props}
        >
          <SelectTrigger className={meta.touched && meta.error ? 'border-red-500' : ''}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {children}
          </SelectContent>
        </Select>
      )}
    </Field>
  );

  const PhoneInputWithCountryCode = ({ phoneName, countryCodeName, placeholder, required = false }: {
    phoneName: string;
    countryCodeName: string;
    placeholder: string;
    required?: boolean;
  }) => (
    <div className="flex gap-2">
      <div className="w-32">
        <FormikSelect name={countryCodeName} placeholder="Code">
          {countryCodes.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center gap-2">
                <span>{country.flag}</span>
                <span>{country.code}</span>
              </span>
            </SelectItem>
          ))}
        </FormikSelect>
      </div>
      <div className="flex-1">
        <FormikInput
          name={phoneName}
          placeholder={placeholder}
          className=""
        />
      </div>
    </div>
  );

  const getRoleSpecificFields = (values: any, setFieldValue: any) => {
    if (values.role === "patient") return null;

    return (
      <>
        {/* Business Information */}
        <div className="space-y-4 rounded-xl border bg-white/60 p-5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building className="w-5 h-5" />
            Business Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="businessName"
              label="Business/Facility Name"
              required={['clinic/hospital', 'laboratory', 'pharmacy'].includes(values.role)}
            >
              <FormikInput
                name="businessName"
                placeholder="Enter business name"
              />
            </FormField>
            <FormField name="designation" label="Designation/Role" required>
              <FormikInput
                name="designation"
                placeholder="e.g., CEO, Medical Director"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="licenseNumber" label="Registration/License Number (Optional)">
              <FormikInput
                name="licenseNumber"
                placeholder="Enter license number"
              />
            </FormField>
            {values.role === "doctor" && (
              <FormField name="specialization" label="Specialization (Optional)">
                <FormikInput
                  name="specialization"
                  placeholder="e.g., Cardiology, Pediatrics"
                />
              </FormField>
            )}
          </div>
        </div>

        {/* Address & Location */}
        <div className="space-y-4 rounded-xl border bg-white/60 p-5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Address & Location
          </h3>
          
          <FormField
            name="address"
            label="Complete Address"
            required={['clinic/hospital', 'laboratory', 'pharmacy'].includes(values.role)}
          >
            <FormikTextarea
              name="address"
              placeholder="Enter complete address"
              rows={3}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <FormField
              name="province"
              label="Province/State"
              required={['clinic/hospital', 'laboratory', 'pharmacy'].includes(values.role)}
            >
              <FormikSelect name="province" placeholder="Select province">
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>{province}</SelectItem>
                ))}
              </FormikSelect>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field name="deliveryAvailable">
              {({ field, form }: any) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="deliveryAvailable"
                    checked={field.value}
                    onCheckedChange={(checked) => form.setFieldValue('deliveryAvailable', checked)}
                  />
                  <Label htmlFor="deliveryAvailable">Delivery/Visit Available</Label>
                </div>
              )}
            </Field>
            <Field name="service24x7">
              {({ field, form }: any) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="service24x7"
                    checked={field.value}
                    onCheckedChange={(checked) => form.setFieldValue('service24x7', checked)}
                  />
                  <Label htmlFor="service24x7">24/7 Service</Label>
                </div>
              )}
            </Field>
          </div>
        </div>

        {/* Services Offered */}
        <div className="space-y-4 rounded-xl border bg-white/60 p-5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Services Offered
          </h3>
          
          <Field name="servicesOffered">
            {({ field, form }: any) => (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {servicesOptions.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={field.value.includes(service)}
                      onCheckedChange={() => handleServiceToggle(service, field.value, form.setFieldValue)}
                    />
                    <Label htmlFor={service} className="text-sm">{service}</Label>
                  </div>
                ))}
              </div>
            )}
          </Field>
        </div>

        {/* Staff Details */}
        <div className="space-y-4 rounded-xl border bg-white/60 p-5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Staff Details (Optional)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField name="staffDetails.doctors" label="Number of Doctors">
              <FormikInput
                name="staffDetails.doctors"
                type="number"
                placeholder="0"
              />
            </FormField>
            <FormField name="staffDetails.specialists" label="Number of Specialists">
              <FormikInput
                name="staffDetails.specialists"
                type="number"
                placeholder="0"
              />
            </FormField>
            <FormField name="staffDetails.nurses" label="Number of Nurses/Technicians">
              <FormikInput
                name="staffDetails.nurses"
                type="number"
                placeholder="0"
              />
            </FormField>
          </div>
        </div>


        {/* Bank Details */}
        <div className="space-y-4 rounded-xl border bg-white/60 p-5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Bank/Payment Information (Optional)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="bankDetails.bankName" label="Bank Name">
              <FormikInput
                name="bankDetails.bankName"
                placeholder="Enter bank name"
              />
            </FormField>
            <FormField name="bankDetails.accountTitle" label="Account Title">
              <FormikInput
                name="bankDetails.accountTitle"
                placeholder="Enter account title"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="bankDetails.accountNumber" label="Account Number/IBAN">
              <FormikInput
                name="bankDetails.accountNumber"
                placeholder="Enter account number"
              />
            </FormField>
            <FormField name="bankDetails.paymentMode" label="Payment Mode">
              <FormikSelect name="bankDetails.paymentMode" placeholder="Select payment mode">
                {paymentModes.map((mode) => (
                  <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                ))}
              </FormikSelect>
            </FormField>
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

  const handleGoogleFieldChange = (field: string, value: any) => {
    setCurrentFormValues((prev) => {
      // Deep-set clone
      const next = { ...prev } as any;
      if (field.includes('.')) {
        const parts = field.split('.');
        let ref = next;
        for (let i = 0; i < parts.length - 1; i++) {
          const p = parts[i];
          ref[p] = ref[p] ?? {};
          ref = ref[p];
        }
        ref[parts[parts.length - 1]] = value;
      } else {
        (next as any)[field] = value;
      }

      // Validate this specific field with the Google schema and clear/set error
      const schema = getGoogleValidationSchema(next.role);
      // Only validate fields that are in our whitelist for the current role
      const allowed = new Set<string>([
        ...GOOGLE_BASE_FIELDS,
        ...(next.role === 'doctor' ? GOOGLE_DOCTOR_FIELDS : []),
        ...(isProviderRole(next.role) ? GOOGLE_PROVIDER_FIELDS : []),
      ] as readonly string[]);
      if (!allowed.has(field)) {
        setGoogleErrors((errs) => {
          if (!(field in errs)) return errs;
          const { [field]: _, ...rest } = errs;
          return rest;
        });
        return next;
      }

      try {
        const result = (schema as any).validateAt(field, next);
        if (result && typeof (result as any).then === 'function') {
          (result as Promise<any>)
            .then(() => {
              setGoogleErrors((errs) => {
                if (!(field in errs)) return errs;
                const { [field]: _, ...rest } = errs;
                return rest;
              });
            })
            .catch((e: any) => {
              if (e?.message) {
                setGoogleErrors((errs) => ({ ...errs, [field]: e.message }));
              }
            });
        }
      } catch (e: any) {
        // Path not in schema or other sync error: clear any existing error and continue
        setGoogleErrors((errs) => {
          if (!(field in errs)) return errs;
          const { [field]: _, ...rest } = errs;
          return rest;
        });
      }

      return next;
    });
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
                        body: JSON.stringify({ idToken, role: currentFormValues.role || 'patient' })
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
                        setCurrentFormValues((prev) => ({
                          ...prev,
                          name: data.profile.name,
                          email: data.profile.email,
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
                      const role = currentFormValues.role || 'patient';
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
                        const isSelected = currentFormValues.role === role.value;
                        return (
                          <div
                            key={role.value}
                            className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                              isSelected ? "scale-105" : ""
                            }`}
                            onClick={() => {
                            setGoogleErrors({});
                            handleGoogleFieldChange("role", role.value);
                          }}
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
                        <div className="flex gap-2">
                          <div className="w-32">
                            <Select value={currentFormValues.phoneCountryCode} onValueChange={(value) => handleGoogleFieldChange("phoneCountryCode", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Code" />
                              </SelectTrigger>
                              <SelectContent>
                                {countryCodes.map((country) => (
                                  <SelectItem key={country.code} value={country.code}>
                                    <span className="flex items-center gap-2">
                                      <span>{country.flag}</span>
                                      <span>{country.code}</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1">
                            <Input
                              id="google-phone"
                              value={currentFormValues.phone}
                              onChange={(e) => handleGoogleFieldChange("phone", e.target.value)}
                              placeholder="300 1234567"
                              required
                            />
                            {googleErrors.phone && (
                              <p className="text-xs text-red-600 mt-1">{googleErrors.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="google-cnic">CNIC Number *</Label>
                      <Input
                        id="google-cnic"
                        value={currentFormValues.cnic}
                        onChange={(e) => handleGoogleFieldChange("cnic", e.target.value)}
                        placeholder="12345-1234567-1"
                        required
                      />
                      {googleErrors.cnic && (
                        <p className="text-xs text-red-600 mt-1">{googleErrors.cnic}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="google-address">
                        Complete Address {['clinic/hospital', 'laboratory', 'pharmacy'].includes(currentFormValues.role) ? '*' : ''}
                      </Label>
                      <Textarea
                        id="google-address"
                        value={currentFormValues.address}
                        onChange={(e) => handleGoogleFieldChange("address", e.target.value)}
                        placeholder="Enter complete address"
                        rows={3}
                        required={['clinic/hospital', 'laboratory', 'pharmacy'].includes(currentFormValues.role)}
                      />
                      {googleErrors.address && (
                        <p className="text-xs text-red-600 mt-1">{googleErrors.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="google-city">City *</Label>
                        <Select value={currentFormValues.city} onValueChange={(value) => handleGoogleFieldChange("city", value)}>
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
                        {googleErrors.city && (
                          <p className="text-xs text-red-600 mt-1">{googleErrors.city}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="google-province">
                          Province *{['clinic/hospital', 'laboratory', 'pharmacy'].includes(currentFormValues.role) ? '*' : ''}
                        </Label>
                        <Select value={currentFormValues.province} onValueChange={(value) => handleGoogleFieldChange("province", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                          <SelectContent>
                            {provinces.map((province) => (
                              <SelectItem key={province} value={province}>{province}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {googleErrors.province && (
                          <p className="text-xs text-red-600 mt-1">{googleErrors.province}</p>
                        )}
                      </div>
                    </div>

                    {/* Role-specific fields for Google registration */}
                    {currentFormValues.role === 'doctor' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="google-license">License Number *</Label>
                          <Input
                            id="google-license"
                            value={currentFormValues.licenseNumber}
                            onChange={(e) => handleGoogleFieldChange("licenseNumber", e.target.value)}
                            placeholder="Enter license number"
                            required
                          />
                          {googleErrors.licenseNumber && (
                            <p className="text-xs text-red-600 mt-1">{googleErrors.licenseNumber}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="google-designation">Designation *</Label>
                          <Input
                            id="google-designation"
                            value={currentFormValues.designation}
                            onChange={(e) => handleGoogleFieldChange("designation", e.target.value)}
                            placeholder="e.g., Medical Officer, Consultant"
                            required
                          />
                          {googleErrors.designation && (
                            <p className="text-xs text-red-600 mt-1">{googleErrors.designation}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {['clinic/hospital', 'laboratory', 'pharmacy'].includes(currentFormValues.role) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="google-business">Business Name *</Label>
                          <Input
                            id="google-business"
                            value={currentFormValues.businessName}
                            onChange={(e) => handleGoogleFieldChange("businessName", e.target.value)}
                            placeholder="Enter business/facility name"
                            required
                          />
                          {googleErrors.businessName && (
                            <p className="text-xs text-red-600 mt-1">{googleErrors.businessName}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="google-license-provider">License Number *</Label>
                          <Input
                            id="google-license-provider"
                            value={currentFormValues.licenseNumber}
                            onChange={(e) => handleGoogleFieldChange("licenseNumber", e.target.value)}
                            placeholder="Enter license number"
                            required
                          />
                          {googleErrors.licenseNumber && (
                            <p className="text-xs text-red-600 mt-1">{googleErrors.licenseNumber}</p>
                          )}
                        </div>
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

            <Formik
              initialValues={initialValues}
              validate={(values) => {
                try {
                  getValidationSchema(values.role).validateSync(values, { abortEarly: false });
                  return {};
                } catch (err: any) {
                  const errors: Record<string, any> = {};
                  if (err.inner && Array.isArray(err.inner)) {
                    err.inner.forEach((e: any) => {
                      if (e.path && !errors[e.path]) errors[e.path] = e.message;
                    });
                  } else if (err.path) {
                    errors[err.path] = err.message;
                  }
                  return errors;
                }
              }}
              onSubmit={handleFormSubmit}
            >
              {({ values, setFieldValue, errors, touched, setFieldTouched, submitForm, validateForm, setTouched }) => (
                <Form className="space-y-8" style={{ display: showGoogleAdditionalFields ? 'none' : 'block' }}>
              {/* Role Selection */}
              <div>
                <Label className="text-base font-medium mb-4 block">Select Your Role *</Label>
                <Field name="role">
                  {({ field, form }: any) => (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {roles.map((role) => {
                        const Icon = role.icon;
                        const isSelected = field.value === role.value;
                        return (
                          <div
                            key={role.value}
                            className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                              isSelected ? "scale-105" : ""
                            }`}
                            onClick={() => {
                              form.setFieldValue('role', role.value);
                              form.setFieldTouched('role', true);
                              // Force re-validation with new schema
                              setTimeout(() => {
                                form.validateForm();
                              }, 0);
                            }}
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
                  )}
                </Field>
                <ErrorMessage name="role" component="div" className="text-sm text-red-500 mt-2" />
              </div>

              {/* Basic Information */}
              <div className="space-y-4 rounded-xl border bg-white/60 p-5">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="name" label="Full Name" required>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <User className="w-4 h-4" />
                      </span>
                      <FormikInput
                        name="name"
                        className="pl-9"
                        placeholder="Enter full name"
                      />
                    </div>
                  </FormField>
                  <FormField name="email" label="Email Address" required>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                      </span>
                      <FormikInput
                        name="email"
                        type="email"
                        className="pl-9"
                        placeholder="Enter email address"
                      />
                    </div>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="phone" label="Whatsapp Number" required>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                        <Phone className="w-4 h-4" />
                      </span>
                      <div className="pl-9">
                        <PhoneInputWithCountryCode
                          phoneName="phone"
                          countryCodeName="phoneCountryCode"
                          placeholder="300 1234567"
                          required
                        />
                      </div>
                    </div>
                  </FormField>
                  <FormField name="phoneAlternate" label="Alternate Phone Numbers">
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                        <Phone className="w-4 h-4" />
                      </span>
                      <div className="pl-9">
                        <PhoneInputWithCountryCode
                          phoneName="phoneAlternate"
                          countryCodeName="phoneAlternateCountryCode"
                          placeholder="300 1234567"
                        />
                      </div>
                    </div>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="cnic" label="CNIC Number" required>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <IdCard className="w-4 h-4" />
                      </span>
                      <FormikInput
                        name="cnic"
                        className="pl-9"
                        placeholder="12345-1234567-1"
                      />
                    </div>
                  </FormField>
                  <FormField name="city" label="City" required>
                    <FormikSelect name="city" placeholder="Select your city">
                      <SelectItem value="Karachi">Karachi</SelectItem>
                      <SelectItem value="Lahore">Lahore</SelectItem>
                      <SelectItem value="Islamabad">Islamabad</SelectItem>
                      <SelectItem value="Faisalabad">Faisalabad</SelectItem>
                      <SelectItem value="Rawalpindi">Rawalpindi</SelectItem>
                      <SelectItem value="Multan">Multan</SelectItem>
                      <SelectItem value="Peshawar">Peshawar</SelectItem>
                      <SelectItem value="Quetta">Quetta</SelectItem>
                    </FormikSelect>
                  </FormField>
                </div>
              </div>

              {getRoleSpecificFields(values, setFieldValue)}

              {/* Security */}
              <div className="space-y-4 rounded-xl border bg-white/60 p-5">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="password" label="Password" required>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="w-4 h-4" />
                      </span>
                      <FormikInput
                        name="password"
                        type="password"
                        className="pl-9"
                        placeholder="Create a strong password"
                      />
                    </div>
                  </FormField>
                  <FormField name="confirmPassword" label="Confirm Password" required>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="w-4 h-4" />
                      </span>
                      <FormikInput
                        name="confirmPassword"
                        type="password"
                        className="pl-9"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </FormField>
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
                type="button"
                className="w-full py-6 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                disabled={isSubmitting}
                onClick={async () => {
                  // Validate form before attempting submit to surface errors via toast
                  const validationErrors = await validateForm();
                  if (validationErrors && Object.keys(validationErrors).length > 0) {
                    // Mark all fields as touched so errors show up
                    setTouched(
                      Object.keys(validationErrors).reduce((acc: any, key: string) => {
                        acc[key] = true;
                        return acc;
                      }, {}),
                      true
                    );
                    toast({ title: 'Please fix the highlighted errors', description: 'Some required fields are missing or invalid.', variant: 'destructive' });
                    return;
                  }
                  await submitForm();
                }}
              >
                {isSubmitting ? "Submitting Registration..." : "Submit Registration"}
              </Button>
                </Form>
              )}
            </Formik>

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