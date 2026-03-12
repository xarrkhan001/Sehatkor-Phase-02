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
import { apiUrl } from '@/config/api';
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Globe,
  Plus
} from "lucide-react";
import SEO from "@/components/SEO";

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
    cnic: role === 'patient'
      ? Yup.string().matches(/^[0-9]{5}-[0-9]{7}-[0-9]$/, 'CNIC must be in format 12345-1234567-1').notRequired()
      : Yup.string()
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
      .test('min-length-if-provided', 'License number must be at least 3 characters', function (value) {
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
      .test('min-length-if-provided', 'License number must be at least 3 characters', function (value) {
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
      .min(2, 'Account number must be at least 10 characters')
      .matches(/^[0-9A-Z-]*$/, 'Account number can only contain numbers, letters, and hyphens'),
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
    cnic: role === 'patient'
      ? Yup.string().matches(/^[0-9]{5}-[0-9]{7}-[0-9]$/, 'CNIC must be in format 12345-1234567-1').notRequired()
      : Yup.string()
        .matches(/^[0-9]{5}-[0-9]{7}-[0-9]$/, 'CNIC must be in format 12345-1234567-1')
        .required('CNIC number is required'),
    city: Yup.string().required('Please select your city'),
  };

  // Role-specific requirements
  const roleSpecific: Record<string, any> = {};
  if (role === 'doctor') {
    roleSpecific.licenseNumber = Yup.string()
      .test('min-length-if-provided', 'License number must be at least 3 characters', function (value) {
        if (!value || value.trim() === '') return true;
        return value.length >= 3;
      })
      .notRequired();
    roleSpecific.designation = Yup.string()
      .test('min-length-if-provided', 'Designation must be at least 2 characters', function (value) {
        if (!value || value.trim() === '') return true;
        return value.length >= 2;
      })
      .notRequired();
  }

  if (['clinic/hospital', 'laboratory', 'pharmacy'].includes(role)) {
    roleSpecific.businessName = Yup.string()
      .min(2, 'Business name must be at least 2 characters')
      .required('Business name is required');
    roleSpecific.licenseNumber = Yup.string()
      .test('min-length-if-provided', 'License number must be at least 3 characters', function (value) {
        if (!value || value.trim() === '') return true;
        return value.length >= 3;
      })
      .notRequired();
    roleSpecific.address = Yup.string()
      .min(10, 'Address must be at least 10 characters')
      .required('Complete address is required');
    roleSpecific.province = Yup.string().required('Please select your province');
  }

  return Yup.object({ ...base, ...roleSpecific });
};

const RegisterPage = () => {
  const [activeStep, setActiveStep] = useState(0);
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
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [successRole, setSuccessRole] = useState<string>('');

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
      const res = await fetch(apiUrl('/api/auth/google'), {
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
            const upRes = await fetch(apiUrl('/api/documents/upload'), {
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
        setShowGoogleAdditionalFields(false);
        setSuccessRole(currentFormValues.role);
        setShowSuccessScreen(true);
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
      const response = await fetch(apiUrl('/api/auth/register'), {
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
            const upRes = await fetch(apiUrl('/api/documents/upload'), {
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
        setSuccessRole(values.role);
        setShowSuccessScreen(true);
      } else {
        // Patients are verified immediately - show success screen
        setSuccessRole(values.role);
        setShowSuccessScreen(true);
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
      <Label htmlFor={name} className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
        {label}{required && " *"}
      </Label>
      {children}
      <ErrorMessage name={name} component="div" className="text-[9px] font-bold text-red-500 mt-0.5" />
    </div>
  );

  const FormikInput = ({ name, ...props }: any) => (
    <Field name={name}>
      {({ field, meta }: any) => (
        <Input
          {...field}
          {...props}
          className={`h-9 text-sm ${props.className || ''} ${meta.touched && meta.error ? 'border-red-500' : ''}`}
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
          className={`text-sm min-h-[60px] ${props.className || ''} ${meta.touched && meta.error ? 'border-red-500' : ''}`}
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
          <SelectTrigger className={`h-9 text-sm ${meta.touched && meta.error ? 'border-red-500' : ''}`}>
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
      <div className="w-[85px] sm:w-[95px] flex-shrink-0">
        <FormikSelect name={countryCodeName} placeholder="Code">
          {countryCodes.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center gap-1.5 sm:gap-2">
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
        <div className="space-y-2 rounded-xl border bg-slate-50/50 p-2 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-1">
            <Building className="w-3.5 h-3.5" />
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                placeholder="CEO, Director, etc"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <FormField name="licenseNumber" label="Registration/License (Optional)">
              <FormikInput
                name="licenseNumber"
                placeholder="Enter license"
              />
            </FormField>
            {values.role === "doctor" && (
              <FormField name="specialization" label="Specialization (Optional)">
                <FormikInput
                  name="specialization"
                  placeholder="e.g., Cardiology"
                />
              </FormField>
            )}
          </div>
        </div>

        {/* Address & Location */}
        <div className="space-y-2 rounded-xl border bg-slate-50/50 p-2 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-1">
            <MapPin className="w-3.5 h-3.5" />
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
              rows={2}
              className="text-xs"
            />
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Field name="deliveryAvailable">
              {({ field, form }: any) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="deliveryAvailable"
                    checked={field.value}
                    onCheckedChange={(checked) => form.setFieldValue('deliveryAvailable', checked)}
                  />
                  <Label htmlFor="deliveryAvailable" className="text-[10px] uppercase font-bold text-slate-600">Delivery Available</Label>
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
                  <Label htmlFor="service24x7" className="text-[10px] uppercase font-bold text-slate-600">24/7 Service</Label>
                </div>
              )}
            </Field>
          </div>
        </div>


        {/* Documents Required */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Upload className="w-3.5 h-3.5" />
            Verification Document
          </h3>

          <div className={`rounded-xl border-2 border-dashed transition-all duration-300 ${providerDoc ? "p-3 bg-emerald-50/30 border-emerald-200" : "p-6 bg-slate-50/50 border-slate-200"}`}>
            {!providerDoc ? (
              <div className="text-center">
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
                  className="group inline-flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-2 cursor-pointer bg-white hover:bg-slate-50 shadow-sm transition-all"
                >
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-tight text-slate-700">Upload Credentials</p>
                    <p className="text-[9px] text-slate-400">License / CNIC (PDF/DOC)</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-100">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-slate-900 truncate max-w-[180px]" title={providerDoc.name}>
                      {providerDoc.name}
                    </p>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">File Uploaded</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                  onClick={() => {
                    setProviderDoc(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
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

  // SUCCESS SCREEN
  if (showSuccessScreen) {
    const roleLabels: Record<string, string> = {
      doctor: 'Doctor',
      'clinic/hospital': 'Clinic / Hospital',
      laboratory: 'Laboratory',
      pharmacy: 'Pharmacy',
      patient: 'Patient',
    };
    const roleLabel = roleLabels[successRole] || successRole;
    const isProvider = successRole !== 'patient';

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-lg"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 text-center shadow-2xl">

            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 mb-3">SehatKor Healthcare</p>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
                Congratulations! 🎉
              </h1>
              <p className="text-white/70 text-base font-medium">
                Your <span className="text-emerald-400 font-bold">{roleLabel}</span> account has been successfully created.
              </p>
            </motion.div>

            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 bg-white/10 border border-white/10 rounded-2xl p-5 text-left space-y-4"
            >
              {isProvider ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Admin Verification Pending</p>
                      <p className="text-white/60 text-xs mt-1 leading-relaxed">
                        Your account has been submitted successfully. Our admin team will review and verify your account within <span className="text-amber-300 font-bold">24 hours</span>.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Account Active After Approval</p>
                      <p className="text-white/60 text-xs mt-1 leading-relaxed">
                        Once approved by the admin, you will be able to log in and access all features of your {roleLabel} dashboard.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Account Ready to Use</p>
                      <p className="text-white/60 text-xs mt-1 leading-relaxed">
                        Your patient account is active and ready. You can now log in to book appointments and manage your health records.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Secure & Private</p>
                      <p className="text-white/60 text-xs mt-1 leading-relaxed">
                        Your medical data is protected with enterprise-grade security. Your privacy is our top priority.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>

            {/* Progress Steps */}
            {(() => {
              const steps = isProvider ? [
                { step: '1', label: 'Account Created', done: true },
                { step: '2', label: 'Admin Review', done: false },
                { step: '3', label: 'Verified & Active', done: false },
              ] : [
                { step: '1', label: 'Account Created', done: true },
                { step: '2', label: 'Email Verified', done: true },
                { step: '3', label: 'Ready to Use', done: true },
              ];
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="mt-6 grid grid-cols-3 gap-3"
                >
                  {steps.map((item) => (
                    <div key={item.step} className={`rounded-xl p-3 border text-center ${
                      item.done
                        ? 'bg-emerald-500/20 border-emerald-400/40'
                        : 'bg-white/5 border-white/10'
                    }`}>
                      <div className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center text-xs font-black mb-1 ${
                        item.done ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/50'
                      }`}>
                        {item.done ? <CheckCircle2 className="w-4 h-4" /> : item.step}
                      </div>
                      <p className={`text-[9px] font-bold uppercase tracking-wide ${
                        item.done ? 'text-emerald-300' : 'text-white/40'
                      }`}>{item.label}</p>
                    </div>
                  ))}
                </motion.div>
              );
            })()}

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="mt-8"
            >
              <Button
                onClick={() => navigate('/login')}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
              >
                {isProvider ? 'Proceed to Login' : 'Login to Your Account'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-white/30 text-[10px] mt-4 font-medium">
                © 2026 SehatKor Healthcare Network • All rights reserved
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-0 overflow-x-hidden">
      <SEO
        title="Register - Sehatkor | Join Pakistan's Premier Healthcare Network"
        description="Join Sehatkor today. The smartest way to connect with patients and manage your healthcare practice in Pakistan."
        keywords="sehatkor registration, join sehatkor, healthcare network pakistan"
        canonical="https://sehatkor.pk/register"
      />

      <div className="w-full flex-1 flex flex-col lg:flex-row">
        {/* LEFT SIDE: BRANDING & CONTENT */}
        <div className="hidden lg:flex lg:w-[50%] bg-emerald-950 text-white p-12 flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-400 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative z-10">
            <Link to="/" className="flex items-center space-x-3 mb-16 group">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic">SehatKor</span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <h1 className="text-5xl font-black leading-tight tracking-tight">
                Unlock the Power of <span className="text-emerald-400 underline decoration-emerald-500/30 underline-offset-8">Smart</span> Healthcare.
              </h1>
              <p className="text-emerald-100/70 text-lg font-medium max-w-md leading-relaxed">
                Join Pakistan's fastest growing digital health network. Whether you're a doctor or a patient, we bring healthcare to your fingertips.
              </p>

              <div className="space-y-6 pt-6">
                {[
                  { icon: Zap, title: "Instant Connectivity", desc: "Connect with verified healthcare providers in seconds." },
                  { icon: ShieldCheck, title: "Vault Security", desc: "Your medical data is encrypted with enterprise-grade security." },
                  { icon: Database, title: "Digital Records", desc: "Access prescriptions and lab reports anytime, anywhere." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-800/50 flex items-center justify-center border border-emerald-700/50">
                      <item.icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{item.title}</h3>
                      <p className="text-emerald-100/50 text-xs leading-none mt-1">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="relative z-10 pt-16">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-emerald-900 bg-emerald-700 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover grayscale opacity-80" />
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold text-emerald-400">Join 50,000+ Active Users</p>
            </div>
            <p className="text-[10px] text-emerald-500/40 uppercase font-black tracking-widest">© 2026 SehatKor Healthcare Network • All rights reserved</p>
          </div>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="flex-1 bg-white flex flex-col justify-start pt-6 pb-20 sm:pt-10 lg:pt-16 px-4 py-8 sm:px-10 lg:px-16 relative overflow-y-auto min-h-screen">
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-10">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase italic text-emerald-950">SehatKor</span>
              </Link>
            </div>

            <div className="mb-10 lg:mb-16">
              <div className="flex justify-between items-center max-w-sm mx-auto relative px-4">
                {[0, 1, 2, 3].map((step) => {
                  const isCompleted = activeStep > step;
                  const isActive = activeStep === step;
                  return (
                    <div key={step} className="flex flex-col items-center z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-all duration-500 ${isCompleted ? "bg-emerald-600 border-emerald-600 text-white shadow-[0_4px_10px_rgba(16,185,129,0.3)]" :
                        isActive ? "bg-white border-emerald-600 text-emerald-600 scale-110 shadow-lg shadow-emerald-100" :
                          "bg-white border-slate-200 text-slate-300"
                        }`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step + 1}
                      </div>
                      <span className={`text-[8px] font-black uppercase mt-1.5 tracking-widest ${isActive ? "text-emerald-700" : "text-slate-400"}`}>
                        {step === 0 ? "Role" : step === 1 ? "Info" : step === 2 ? "Professional" : "Final"}
                      </span>
                    </div>
                  );
                })}
                {/* Connector Lines */}
                <div className="absolute top-4 left-0 w-full h-[2px] bg-slate-100 -z-0" />
                <motion.div
                  className="absolute top-4 left-0 h-[2px] bg-emerald-500 shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${(activeStep / 3) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="py-6 px-4 md:px-8">


              {/* Google Additional Fields Form */}
              {showGoogleAdditionalFields && (
                <div className="mb-8 animate-in fade-in duration-500">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center overflow-hidden shadow-sm shrink-0 ring-4 ring-emerald-50">
                      {googleProfile?.picture ? (
                        <img src={googleProfile?.picture} alt={googleProfile?.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-7 h-7 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Complete Registration</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1.5 leading-relaxed">
                        Welcome <span className="text-emerald-700 font-bold">{googleProfile?.name}</span>! Just a few more details to set up your account.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Role Selection for Google Users */}
                    <div>
                      <Label className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-4 block text-center">Select Your Identity *</Label>
                      <div className="flex flex-row justify-center gap-2 sm:gap-6 overflow-x-auto pb-4 no-scrollbar">
                        {roles.map((role) => {
                          const Icon = role.icon;
                          const isSelected = currentFormValues.role === role.value;
                          return (
                            <div
                              key={role.value}
                              className="relative flex flex-col items-center cursor-pointer group flex-shrink-0"
                              onClick={() => {
                                setGoogleErrors({});
                                handleGoogleFieldChange("role", role.value);
                              }}
                            >
                              <div
                                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-500 transform ${isSelected
                                  ? `bg-gradient-to-br ${role.gradient} text-white shadow-lg scale-110 -translate-y-1 ring-2 ring-white`
                                  : `bg-white ${role.iconColor} hover:bg-slate-50 border border-slate-100 shadow-sm`
                                  }`}
                              >
                                <Icon className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-500 ${isSelected ? "scale-110" : "group-hover:scale-110"}`} />
                              </div>

                              <h3 className={`mt-2 text-[7px] sm:text-[8px] font-black uppercase tracking-tighter text-center transition-colors duration-300 leading-tight max-w-[60px] ${isSelected ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
                                }`}>
                                {role.label}
                              </h3>

                              {isSelected && (
                                <div className={`mt-1 h-1 w-4 rounded-full bg-gradient-to-br ${role.gradient}`} />
                              )}
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
                            <div className="w-[85px] sm:w-[95px] flex-shrink-0">
                              <Select value={currentFormValues.phoneCountryCode} onValueChange={(value) => handleGoogleFieldChange("phoneCountryCode", value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Code" />
                                </SelectTrigger>
                                <SelectContent>
                                  {countryCodes.map((country) => (
                                    <SelectItem key={country.code} value={country.code}>
                                      <span className="flex items-center gap-1.5 sm:gap-2">
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
                        <div>
                          <Label htmlFor="google-cnic">CNIC Number {currentFormValues.role === 'patient' ? '(Optional)' : '*'}</Label>
                          <Input
                            id="google-cnic"
                            value={currentFormValues.cnic}
                            onChange={(e) => handleGoogleFieldChange("cnic", e.target.value)}
                            placeholder="12345-1234567-1 (Optional for patients)"
                            required={currentFormValues.role !== 'patient'}
                          />
                          {googleErrors.cnic && (
                            <p className="text-xs text-red-600 mt-1">{googleErrors.cnic}</p>
                          )}
                        </div>
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
                              <SelectItem value="Mardan">Mardan</SelectItem>
                              <SelectItem value="Abbottabad">Abbottabad</SelectItem>
                              <SelectItem value="Bahawalpur">Bahawalpur</SelectItem>
                              <SelectItem value="Bannu">Bannu</SelectItem>
                              <SelectItem value="Chiniot">Chiniot</SelectItem>
                              <SelectItem value="Dera Ghazi Khan">Dera Ghazi Khan</SelectItem>
                              <SelectItem value="Dera Ismail Khan">Dera Ismail Khan</SelectItem>
                              <SelectItem value="Gujranwala">Gujranwala</SelectItem>
                              <SelectItem value="Gujrat">Gujrat</SelectItem>
                              <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                              <SelectItem value="Jhang">Jhang</SelectItem>
                              <SelectItem value="Jhelum">Jhelum</SelectItem>
                              <SelectItem value="Kasur">Kasur</SelectItem>
                              <SelectItem value="Kohat">Kohat</SelectItem>
                              <SelectItem value="Larkana">Larkana</SelectItem>
                              <SelectItem value="Mirpur Khas">Mirpur Khas</SelectItem>
                              <SelectItem value="Muzaffarabad">Muzaffarabad</SelectItem>
                              <SelectItem value="Nawabshah">Nawabshah</SelectItem>
                              <SelectItem value="Okara">Okara</SelectItem>
                              <SelectItem value="Pakpattan">Pakpattan</SelectItem>
                              <SelectItem value="Sahiwal">Sahiwal</SelectItem>
                              <SelectItem value="Sargodha">Sargodha</SelectItem>
                              <SelectItem value="Sheikhupura">Sheikhupura</SelectItem>
                              <SelectItem value="Sialkot">Sialkot</SelectItem>
                              <SelectItem value="Sukkur">Sukkur</SelectItem>
                              <SelectItem value="Swat">Swat</SelectItem>
                              <SelectItem value="Taxila">Taxila</SelectItem>
                              <SelectItem value="Turbat">Turbat</SelectItem>
                              <SelectItem value="Wah Cantonment">Wah Cantonment</SelectItem>
                              <SelectItem value="Zhob">Zhob</SelectItem>
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
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowGoogleAdditionalFields(false);
                          setGoogleProfile(null);
                          setGoogleIdToken('');
                        }}
                        className="w-full sm:flex-1 h-9 font-bold"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleGoogleRegistrationComplete}
                        disabled={googleLoading}
                        className="w-full sm:flex-1 h-9 font-bold bg-emerald-600 hover:bg-emerald-700"
                      >
                        {googleLoading ? "Completing..." : "Complete Account"}
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
                  <Form className="space-y-6" style={{ display: showGoogleAdditionalFields ? 'none' : 'block' }}>
                    {/* STEP 0: ROLE SELECTION */}
                    {activeStep === 0 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                        <div className="text-center space-y-1 mb-6">
                          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create your account</h2>
                          <p className="text-sm text-slate-500 font-medium">Join our healthcare network in minutes.</p>
                        </div>

                        {/* Social signup */}
                        <div className="mb-4">
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <div className="w-full sm:w-[240px]">
                              <GoogleLogin
                                onSuccess={async (cred) => {
                                  try {
                                    setGoogleLoading(true);
                                    const res = await fetch(apiUrl('/api/auth/google'), {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ idToken: cred.credential, role: values.role })
                                    });
                                    const data = await res.json();
                                    
                                    if (res.ok && data.token) {
                                      login({ ...data.user, id: data.user._id }, data.token);
                                      toast({ title: 'Welcome Back!', description: 'Logged in securely with Google.' });
                                      navigate('/');
                                    } else if (res.status === 400 && data.requiresAdditionalFields) {
                                      setGoogleIdToken(cred.credential);
                                      setGoogleProfile(data.profile);
                                      setCurrentFormValues(prev => ({ ...prev, role: values.role }));
                                      setFieldValue('name', data.profile.name);
                                      setFieldValue('email', data.profile.email);
                                      // Also sync into currentFormValues so the Google validation schema can read name & email
                                      setCurrentFormValues(prev => ({
                                        ...prev,
                                        name: data.profile.name,
                                        email: data.profile.email,
                                        role: values.role,
                                      }));
                                      setShowGoogleAdditionalFields(true);
                                    } else {
                                      throw new Error(data.message || 'Google signup failed');
                                    }
                                  } catch (err: any) {
                                    toast({ title: 'Google Sign-in Failed', description: err.message || 'Try again', variant: 'destructive' });
                                  } finally {
                                    setGoogleLoading(false);
                                  }
                                }}
                                theme="outline"
                                shape="pill"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-[240px] rounded-full text-xs font-bold border-gray-200"
                              onClick={() => {
                                window.location.href = apiUrl(`/api/auth/facebook?role=${encodeURIComponent(values.role)}`);
                              }}
                            >
                              Continue with Facebook
                            </Button>
                          </div>
                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-gray-400">
                              <span className="bg-transparent px-3">or use direct form</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <Label className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3 block text-center">Select Your Identity *</Label>
                          <Field name="role">
                            {({ field, form }: any) => (
                              <div className="flex flex-row justify-center gap-2 sm:gap-6 overflow-x-auto pb-2 no-scrollbar">
                                {roles.map((role) => {
                                  const Icon = role.icon;
                                  const isSelected = field.value === role.value;
                                  return (
                                    <div
                                      key={role.value}
                                      className="relative flex flex-col items-center cursor-pointer group flex-shrink-0"
                                      onClick={() => {
                                        form.setFieldValue('role', role.value);
                                        form.setFieldTouched('role', true);
                                      }}
                                    >
                                      <div
                                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-500 transform ${isSelected
                                          ? `bg-gradient-to-br ${role.gradient} text-white shadow-lg scale-110 -translate-y-1 ring-2 ring-white`
                                          : `bg-white ${role.iconColor} hover:bg-slate-50 border border-slate-100 shadow-sm`
                                          }`}
                                      >
                                        <Icon className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-500 ${isSelected ? "scale-110" : "group-hover:scale-110"}`} />
                                      </div>

                                      <h3 className={`mt-2 text-[7px] sm:text-[8px] font-black uppercase tracking-tighter text-center transition-colors duration-300 leading-tight max-w-[60px] ${isSelected ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
                                        }`}>
                                        {role.label}
                                      </h3>

                                      {isSelected && (
                                        <div className={`mt-1 h-1 w-4 rounded-full bg-gradient-to-br ${role.gradient}`} />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </Field>
                        </div>

                        <div className="flex justify-center pt-4">
                          <Button
                            type="button"
                            onClick={() => setActiveStep(1)}
                            className="w-full sm:w-auto px-10 py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] sm:text-xs tracking-widest shadow-xl shadow-emerald-100 transition-all hover:-translate-y-1"
                          >
                            Continue
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 1: BASIC INFORMATION */}
                    {activeStep === 1 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
                        <div className="space-y-3 rounded-xl border bg-slate-50/50 p-4 shadow-sm">
                          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2 mb-2">
                            <User className="w-4 h-4" />
                            Step 2: Basic Information
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
                              <PhoneInputWithCountryCode
                                phoneName="phone"
                                countryCodeName="phoneCountryCode"
                                placeholder="300 1234567"
                                required
                              />
                            </FormField>
                            <FormField name="phoneAlternate" label="Alternate Phone Numbers">
                              <PhoneInputWithCountryCode
                                phoneName="phoneAlternate"
                                countryCodeName="phoneAlternateCountryCode"
                                placeholder="300 1234567"
                              />
                            </FormField>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              name="cnic"
                              label={`CNIC Number ${values.role === 'patient' ? '(Optional)' : ''}`}
                              required={values.role !== 'patient'}
                            >
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
                                <SelectItem value="Mardan">Mardan</SelectItem>
                                <SelectItem value="Abbottabad">Abbottabad</SelectItem>
                                <SelectItem value="Bahawalpur">Bahawalpur</SelectItem>
                                <SelectItem value="Bannu">Bannu</SelectItem>
                                <SelectItem value="Chiniot">Chiniot</SelectItem>
                                <SelectItem value="Dera Ghazi Khan">Dera Ghazi Khan</SelectItem>
                                <SelectItem value="Dera Ismail Khan">Dera Ismail Khan</SelectItem>
                                <SelectItem value="Gujranwala">Gujranwala</SelectItem>
                                <SelectItem value="Gujrat">Gujrat</SelectItem>
                                <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                                <SelectItem value="Jhang">Jhang</SelectItem>
                                <SelectItem value="Jhelum">Jhelum</SelectItem>
                                <SelectItem value="Kasur">Kasur</SelectItem>
                                <SelectItem value="Kohat">Kohat</SelectItem>
                                <SelectItem value="Larkana">Larkana</SelectItem>
                                <SelectItem value="Mirpur Khas">Mirpur Khas</SelectItem>
                                <SelectItem value="Muzaffarabad">Muzaffarabad</SelectItem>
                                <SelectItem value="Nawabshah">Nawabshah</SelectItem>
                                <SelectItem value="Okara">Okara</SelectItem>
                                <SelectItem value="Pakpattan">Pakpattan</SelectItem>
                                <SelectItem value="Sahiwal">Sahiwal</SelectItem>
                                <SelectItem value="Sargodha">Sargodha</SelectItem>
                                <SelectItem value="Sheikhupura">Sheikhupura</SelectItem>
                                <SelectItem value="Sialkot">Sialkot</SelectItem>
                                <SelectItem value="Sukkur">Sukkur</SelectItem>
                                <SelectItem value="Swat">Swat</SelectItem>
                                <SelectItem value="Taxila">Taxila</SelectItem>
                                <SelectItem value="Turbat">Turbat</SelectItem>
                                <SelectItem value="Wah Cantonment">Wah Cantonment</SelectItem>
                                <SelectItem value="Zhob">Zhob</SelectItem>
                              </FormikSelect>
                            </FormField>
                          </div>
                          <div className="grid grid-cols-5 gap-2 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setActiveStep(0)}
                              className="col-span-2 py-4 rounded-xl font-bold uppercase text-[9px] sm:text-[10px] tracking-widest ring-1 ring-gray-200 bg-white"
                            >
                              Back
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setActiveStep(values.role === 'patient' ? 3 : 2)}
                              className="col-span-3 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[9px] sm:text-[10px] tracking-widest shadow-lg shadow-emerald-50 transition-all truncate"
                            >
                              {values.role === 'patient' ? 'Next: Security' : 'Next: Prof.'}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: PROFESSIONAL INFORMATION (PROVDIERS ONLY) */}
                    {activeStep === 2 && values.role !== 'patient' && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                        {getRoleSpecificFields(values, setFieldValue)}
                        <div className="grid grid-cols-5 gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setActiveStep(1)}
                            className="col-span-2 py-4 rounded-xl font-bold uppercase text-[9px] sm:text-[10px] tracking-widest ring-1 ring-gray-200 bg-white"
                          >
                            Back
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setActiveStep(3)}
                            className="col-span-3 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[9px] sm:text-[10px] tracking-widest shadow-lg shadow-emerald-50 transition-all truncate"
                          >
                            Next: Security
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: SECURITY & AGREEMENT */}
                    {activeStep === 3 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
                        <div className="space-y-2.5 rounded-xl border bg-slate-50/50 p-3 shadow-sm">
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2 mb-1">
                            <Lock className="w-3.5 h-3.5" />
                            Step 4: Security Account Setup
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
                        <div className="space-y-3 rounded-xl border bg-white/60 p-3 pb-4">
                          <h3 className="text-base font-semibold">Agreement & Declaration</h3>
                          <div className="bg-muted/50 p-2 px-3 rounded-lg">
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
                        <div className="grid grid-cols-5 gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setActiveStep(values.role === 'patient' ? 1 : 2)}
                            className="col-span-2 py-4 rounded-xl font-bold uppercase text-[9px] sm:text-[10px] tracking-widest ring-1 ring-gray-200 bg-white"
                          >
                            Back
                          </Button>
                          <Button
                            type="button"
                            className="col-span-3 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black uppercase text-[9px] sm:text-[10px] tracking-widest shadow-xl shadow-emerald-100 transition-all truncate"
                            disabled={isSubmitting}
                            onClick={async () => {
                              const validationErrors = await validateForm();
                              if (validationErrors && Object.keys(validationErrors).length > 0) {
                                setTouched(
                                  Object.keys(validationErrors).reduce((acc: any, key: string) => {
                                    acc[key] = true;
                                    return acc;
                                  }, {}),
                                  true
                                );
                                toast({ title: 'Validation Errors', description: 'Please check all steps for missing info.', variant: 'destructive' });
                                return;
                              }
                              await submitForm();
                            }}
                          >
                            {isSubmitting ? "Wait..." : "Register Now"}
                          </Button>
                        </div>
                      </motion.div>
                    )}
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

                    <div className="mt-6 text-center border-t pt-4">
                      <p className="text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-black uppercase text-[11px] tracking-widest underline decoration-2 underline-offset-4">
                          Sign in here
                        </Link>
                      </p>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
