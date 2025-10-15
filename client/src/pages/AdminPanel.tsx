import { useState, useEffect, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// removed unused mock data import
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  ShieldCheck,
  Search,
  Filter,
  Trash2,
  Eye,
  UserCheck,
  Building,
  FlaskConical,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
  Activity,
  Download,
  Stethoscope,
  CreditCard,
  ChevronRight,
  Star,
  Handshake,
  Pill,
  Heart,
  DollarSign,
  Image
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminPaymentDashboard from "@/components/AdminPaymentDashboard";
import { apiUrl } from "@/config/api";
import { Input as UiInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type AddPartnerPayload = { name: string; logo: File };

const AddPartnerDialog = memo(function AddPartnerDialog({
  open,
  onOpenChange,
  onSave
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (payload: AddPartnerPayload) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFile = useCallback((file: File | null) => {
    setLogo(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
  }, []);

  const handleSave = useCallback(async () => {
    if (!logo) return;
    await onSave({ name: name.trim(), logo });
    // reset after successful save
    setName("");
    setLogo(null);
    setPreviewUrl("");
    onOpenChange(false);
  }, [name, logo, onSave, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Add Partner</Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e)=>e.preventDefault()} onPointerDownOutside={(e)=>e.preventDefault()} onInteractOutside={(e)=>e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Add Partner</DialogTitle>
          <DialogDescription>Upload PNG logo. Company name is optional.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Company Name (optional)</label>
            <UiInput autoComplete="off" value={name} onChange={(e:any)=>setName(e.target.value)} placeholder="e.g., TCS" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">PNG Logo</label>
            <input type="file" accept="image/png" onChange={(e:any)=> handleFile(e.target.files?.[0]||null)} />
            {previewUrl && (
              <div className="mt-2 flex items-center gap-3">
                <img src={previewUrl} className="h-16 w-16 rounded-full object-contain ring-1 ring-gray-200" />
                <span className="text-sm text-gray-600">Preview</span>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

const AdminPanel = () => {
  // Simple in-page gate for /admin route with persisted state
  const navigate = useNavigate();
  const [showGate, setShowGate] = useState(() => !localStorage.getItem('sehatkor_admin_auth'));
  const [gateEmail, setGateEmail] = useState("");
  const [gatePassword, setGatePassword] = useState("");
  const [animateIn, setAnimateIn] = useState(false);
  const { toast } = useToast();

  const handleGateSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const validEmail = "sehatkor@admin.com";
    const validPassword = "Ntl@0099";
    if (gateEmail.trim().toLowerCase() === validEmail && gatePassword === validPassword) {
      // Persist admin auth so navigating between admin pages doesn't prompt again
      localStorage.setItem('sehatkor_admin_auth', 'true');
      setShowGate(false);
      toast({ title: "Access granted", description: "Welcome to the Admin Panel." });
    } else {
      toast({ title: "Invalid credentials", description: "Email or password is incorrect.", variant: "destructive" });
    }
  };

  // Trigger a subtle entrance animation for the gate form
  useEffect(() => {
    if (showGate) {
      const t = setTimeout(() => setAnimateIn(true), 30);
      return () => clearTimeout(t);
    } else {
      setAnimateIn(false);
    }
  }, [showGate]);

  // Admin-only logout: clears only admin auth and redirects home
  const handleAdminLogout = () => {
    localStorage.removeItem('sehatkor_admin_auth');
    toast({ title: 'Logged out', description: 'You have been logged out from the Admin Panel.' });
    navigate('/', { replace: true });
  };

  // Vibrant gradient backgrounds per card color
  const getCardGradient = (color: string) => {
    if (color.includes('teal')) return 'from-teal-500 via-teal-400 to-cyan-400';
    if (color.includes('blue')) return 'from-blue-500 via-blue-400 to-indigo-400';
    if (color.includes('green')) return 'from-green-500 via-emerald-400 to-teal-400';
    if (color.includes('indigo')) return 'from-indigo-500 via-purple-400 to-pink-400';
    if (color.includes('purple')) return 'from-purple-500 via-fuchsia-400 to-pink-400';
    if (color.includes('orange')) return 'from-orange-500 via-amber-400 to-yellow-400';
    if (color.includes('red')) return 'from-red-500 via-rose-400 to-pink-400';
    return 'from-gray-500 via-gray-400 to-slate-400';
  };

  const getAuthToken = () => localStorage.getItem('sehatkor_token') || localStorage.getItem('token');
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<any>({
    verifiedUsers: 0,
    totalDoctors: 0,
    totalHospitals: 0,
    totalPharmacies: 0,
    totalLabs: 0,
    totalRegisteredAccounts: 0
  });
  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [openAddModal, setOpenAddModal] = useState(false);

  // Fetch pending users from backend
  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(apiUrl('/api/admin/pending'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          toast({ title: 'Authentication Error', description: 'Please login to access admin panel', variant: 'destructive' });
          return;
        }
        throw new Error('Failed to fetch pending users');
      }
      
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch pending users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin stats from backend
  const fetchAdminStats = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(apiUrl('/api/admin/stats'), {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          toast({ title: 'Authentication Error', description: 'Please login to access admin panel', variant: 'destructive' });
          return;
        }
        throw new Error('Failed to fetch admin stats');
      }
      
      const data = await res.json();
      setStats(data.stats);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch admin stats', variant: 'destructive' });
    }
  };

  // Fetch on mount
  useEffect(() => { 
    fetchPendingUsers(); 
    fetchAdminStats();
    fetchPendingDocuments();
    fetchPartners();
  }, []);

  const statsData = [
    { title: "Total Registered Accounts", value: stats.totalRegisteredAccounts?.toString() || "0", icon: Activity, change: "Lifetime", color: "text-teal-500" },
    { title: "Verified Users", value: stats.verifiedUsers?.toString() || "0", icon: Users, change: "", color: "text-blue-500" },
    { title: "Total Doctors", value: stats.totalDoctors?.toString() || "0", icon: UserCheck, change: "", color: "text-green-500" },
    { title: "Total Hospitals/Clinics", value: stats.totalHospitals?.toString() || "0", icon: Building, change: "", color: "text-indigo-500" },
    { title: "Total Pharmacies", value: stats.totalPharmacies?.toString() || "0", icon: ShoppingBag, change: "", color: "text-purple-500" },
    { title: "Total Laboratories", value: stats.totalLabs?.toString() || "0", icon: FlaskConical, change: "", color: "text-orange-500" }
  ];

  const pendingUsers = users.filter((user: any) => !user.isVerified && user.role !== 'patient');

  // removed Manage Services demo data

  // toast already initialized above for gate

  const getDownloadUrl = (url: string) => {
    if (!url) return '#';
    // Add fl_attachment flag to Cloudinary URL to force download
    return url.replace('/upload/', '/upload/fl_attachment/');
  };

  const PartnerManager = () => (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Marquee Partners</CardTitle>
        <CardDescription>Upload partner PNG logos. Company name is optional. Stored on Cloudinary.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Admin top controls */}
        <div className="flex items-center justify-end">
          <Button variant="destructive" onClick={handleAdminLogout}>Admin Logout</Button>
        </div>
        <div className="flex justify-between items-center" id="partners-section">
          <h3 className="font-semibold">Add New Partner</h3>
          <AddPartnerDialog open={openAddModal} onOpenChange={setOpenAddModal} onSave={({name, logo})=>handleCreatePartner(name, logo)} />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(partners||[]).map((p:any)=> (
              <TableRow key={p._id}>
                <TableCell>
                  <img src={p.logoUrl} alt={p.name} className="h-12 w-12 rounded-full object-contain" />
                </TableCell>
                <TableCell>
                  <UiInput defaultValue={p.name} onBlur={(e:any)=>handleReplaceLogo(p._id, null, e.target.value)} />
                </TableCell>
                <TableCell className="space-x-2">
                  <input type="file" accept="image/png" onChange={(e:any)=>handleReplaceLogo(p._id, e.target.files?.[0]||null)} />
                  <Button variant="destructive" onClick={()=>handleDeletePartner(p._id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const fetchPartners = async () => {
    try {
      const res = await fetch(apiUrl('/api/partners'));
      const data = await res.json();
      if (res.ok && data?.success) setPartners(data.partners || []);
    } catch {}
  };

  const handleCreatePartner = async (name: string, logo: File) => {
    if (!logo) { toast({ title: 'Missing', description: 'PNG logo is required', variant: 'destructive' }); return; }
    const fd = new FormData();
    if (name && name.trim()) fd.append('name', name.trim());
    fd.append('logo', logo);
    const res = await fetch(apiUrl('/api/partners'), { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) { toast({ title: 'Error', description: data?.message || 'Failed', variant: 'destructive' }); return; }
    toast({ title: 'Added', description: 'Partner created' });
    fetchPartners();
  };

  const handleReplaceLogo = async (id: string, file: File | null, name?: string) => {
    if (!file && !name) return;
    const fd = new FormData();
    if (name) fd.append('name', name);
    if (file) fd.append('logo', file);
    const res = await fetch(apiUrl(`/api/partners/${id}`), { method: 'PUT', body: fd });
    const data = await res.json();
    if (!res.ok) { toast({ title: 'Update failed', description: data?.message || 'Try again', variant: 'destructive' }); return; }
    toast({ title: 'Updated', description: 'Partner updated' });
    fetchPartners();
  };

  const handleDeletePartner = async (id: string) => {
    const res = await fetch(apiUrl(`/api/partners/${id}`), { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { toast({ title: 'Delete failed', description: data?.message || 'Try again', variant: 'destructive' }); return; }
    toast({ title: 'Deleted', description: 'Partner removed' });
    fetchPartners();
  };

  // Documents: fetch pending
  const fetchPendingDocuments = async () => {
    try {
      const res = await fetch(apiUrl('/api/documents/pending'), {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch documents');
      setPendingDocs(data.documents || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to fetch documents', variant: 'destructive' });
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const res = await fetch(apiUrl(`/api/documents/${docId}`), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to delete');
      toast({ title: 'Deleted', description: 'The document has been deleted successfully.' });
      fetchPendingDocuments();
    } catch (err: any) {
      toast({ title: 'Deletion Error', description: err.message || 'Try again', variant: 'destructive' });
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await fetch(apiUrl(`/api/admin/verify/${userId}`), {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ status: 'approved' })
      });
      if (res.ok) {
        toast({ title: 'User Verified!', description: 'The user has been verified. Please inform them to login.' });
        fetchPendingUsers();
        fetchAdminStats(); // Refresh stats after verification
      } else {
        const errData = await res.json();
        toast({ title: 'Verification Error', description: errData.message || 'Failed to verify user', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Verification Error', description: 'Failed to verify user', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await fetch(apiUrl(`/api/admin/verify/${userId}`), {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ status: 'rejected' })
      });
      if (res.ok) {
        toast({ title: 'User Rejected', description: 'The user has been removed from the system.' });
        fetchPendingUsers();
        fetchAdminStats(); // Refresh stats after rejection
      } else {
        const errData = await res.json();
        toast({ title: 'Rejection Error', description: errData.message || 'Failed to reject user', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Rejection Error', description: 'Failed to reject user', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // removed getStatusBadge (used only in Manage Services)

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "doctor":
        return <UserCheck className="w-4 h-4" />;
      case "clinic":
        return <Building className="w-4 h-4" />;
      case "laboratory":
        return <FlaskConical className="w-4 h-4" />;
      case "pharmacy":
        return <ShoppingBag className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  // Shimmer effect for hover animation
  const getShimmerGradient = (color: string) => {
    if (color.includes('teal')) return 'from-teal-600 via-cyan-500 to-teal-600';
    if (color.includes('blue')) return 'from-blue-600 via-indigo-500 to-blue-600';
    if (color.includes('green')) return 'from-green-600 via-emerald-500 to-green-600';
    if (color.includes('indigo')) return 'from-indigo-600 via-purple-500 to-indigo-600';
    if (color.includes('purple')) return 'from-purple-600 via-fuchsia-500 to-purple-600';
    if (color.includes('orange')) return 'from-orange-600 via-amber-500 to-orange-600';
    if (color.includes('red')) return 'from-red-600 via-rose-500 to-red-600';
    return 'from-gray-600 via-slate-500 to-gray-600';
  };

  // Build link for stat card -> entities list with filters
  const cardLinkFor = (title: string) => {
    switch (title) {
      case 'Total Registered Accounts':
        return '/admin/entities?status=all&type=all';
      case 'Verified Users':
        return '/admin/entities?status=verified&type=all';
      case 'Total Doctors':
        return '/admin/entities?type=doctor&status=all';
      case 'Total Hospitals/Clinics':
        return '/admin/entities?type=clinic/hospital&status=all';
      case 'Total Pharmacies':
        return '/admin/entities?type=pharmacy&status=all';
      case 'Total Laboratories':
        return '/admin/entities?type=laboratory&status=all';
      default:
        return '/admin/entities';
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-200 via-gray-200 to-slate-300">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-300/25 to-purple-300/25 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-300/25 to-pink-300/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.025)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
      </div>
      
      {/* Gate Modal Overlay */}
      {showGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 overflow-hidden">
          {/* Top Navbar-like Header */}
          <div className="fixed top-0 left-0 right-0 z-10">
            <div className="w-full">
              <div className="h-14 px-0 flex items-center justify-between bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 min-w-0 ml-3 sm:ml-6">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-600 ring-1 ring-red-100">
                    <Stethoscope className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-semibold text-gray-900 text-base sm:text-lg truncate">SehatKor</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base mr-3 sm:mr-6">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-gray-700">Admin Panel</span>
                </div>
              </div>
            </div>
          </div>
          <div className={`w-full max-w-md mt-24 px-4 transition-all duration-500 ease-out ${animateIn ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-[0.98]'}`}>
            <Card className="shadow-2xl border border-gray-100 rounded-2xl overflow-hidden min-h-[430px]">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3 inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md ring-4 ring-indigo-100">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <CardTitle className="text-2xl">SehatKor Admin Panel</CardTitle>
                <CardDescription>Type your admin email and password to continue</CardDescription>
              </CardHeader>
              <CardContent className="pt-2 pb-8">
                <form onSubmit={handleGateSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={gateEmail}
                      onChange={(e) => setGateEmail(e.target.value)}
                      placeholder="Type your admin email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      value={gatePassword}
                      onChange={(e) => setGatePassword(e.target.value)}
                      placeholder="Type your admin password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-600/90 text-white">
                    Continue
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className={`container mx-auto px-4 py-8 transition ${showGate ? 'pointer-events-none select-none' : ''}`} aria-hidden={showGate}>
        {/* Stylish White Header */}
        <div className="relative overflow-hidden rounded-3xl mb-8 bg-white shadow-xl border border-gray-100">
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50" />
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          {/* Content */}
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-8">
            <div className="flex items-center gap-4">
              {/* Icon Badge */}
              <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center shadow-lg">
                <ShieldCheck className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              
              {/* Text Content */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                  Admin Dashboard
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-xs font-semibold text-white shadow-md">
                    LIVE
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-gray-600 font-medium">
                  Manage SehatKor platform operations and user verifications
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600 transition-all shadow-md">
                <ShieldCheck className="w-4 h-4 mr-1" />
                Admin Access
              </Badge>
              <Button 
                onClick={handleAdminLogout}
                className="bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 hover:scale-105 transition-all shadow-md font-semibold border-0"
              >
                Admin Logout
              </Button>
            </div>
          </div>
          
          {/* Bottom Gradient Accent Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        </div>

        {/* Removed: Top Verified Users Card */}

        {/* Stats Cards - Stylish Gradient Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                onClick={() => navigate(cardLinkFor(stat.title))}
                className="group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getCardGradient(stat.color)} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Shimmer Effect on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${getShimmerGradient(stat.color)} opacity-0 group-hover:opacity-20 transition-opacity duration-700`} />
                
                {/* Decorative Circles */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                
                {/* Content */}
                <div className="relative p-6 text-white">
                  {/* Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      <Icon className="w-7 h-7 text-white drop-shadow-lg" />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-white/40 group-hover:scale-150 transition-transform duration-300" />
                  </div>
                  
                  {/* Stats */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-white/80 uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <p className="text-4xl font-bold text-white drop-shadow-lg">
                      {stat.value}
                    </p>
                    <p className="text-xs text-white/70 font-medium">
                      {stat.change || 'from last month'}
                    </p>
                  </div>
                  
                  {/* Bottom Accent Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 group-hover:h-1.5 transition-all duration-300" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stylish Navigation Cards - Light Pastel Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          
          {/* Verify Entities Card */}
          <div 
            className="group cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-green-100 hover:border-green-200"
            onClick={() => navigate('/admin/verifications')}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all shadow-md">
                <UserCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Verify Entities</h3>
                <p className="text-xs text-gray-500 mt-1">Review & approve providers</p>
              </div>
            </div>
          </div>

          {/* Documents Card */}
          <div 
            className="group cursor-pointer bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 hover:border-purple-200"
            onClick={() => navigate('/admin/documents')}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-fuchsia-400 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all shadow-md">
                <Eye className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Documents</h3>
                <p className="text-xs text-gray-500 mt-1">Manage uploaded files</p>
              </div>
            </div>
          </div>

          {/* Payment Management Card */}
          <div 
            className="group cursor-pointer bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-100 hover:border-blue-200"
            onClick={() => navigate('/admin/payments')}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all shadow-md">
                <CreditCard className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Payment Management</h3>
                <p className="text-xs text-gray-500 mt-1">Handle transactions & releases</p>
              </div>
            </div>
          </div>

          {/* User Management Card */}
          <div 
            className="group cursor-pointer bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-red-100 hover:border-red-200"
            onClick={() => navigate('/admin/user-management')}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-rose-400 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all shadow-md">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">User Management</h3>
                <p className="text-xs text-gray-500 mt-1">Manage user accounts</p>
              </div>
            </div>
          </div>

          {/* Recommended Services Card */}
          <div 
            className="group cursor-pointer bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-amber-100 hover:border-amber-200"
            onClick={() => navigate('/admin/recommended-services')}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all shadow-md">
                <Star className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Recommended Services</h3>
                <p className="text-xs text-gray-500 mt-1">Mark services as recommended</p>
              </div>
            </div>
          </div>

          {/* Hero Images Card */}
          <div 
            className="group cursor-pointer bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-indigo-100 hover:border-indigo-200"
            onClick={() => navigate('/admin/hero-images')}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-violet-400 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all shadow-md">
                <Image className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Hero Images</h3>
                <p className="text-xs text-gray-500 mt-1">Manage homepage slider</p>
              </div>
            </div>
          </div>

          {/* Partners Marquee Card */}
          <div 
            className="group cursor-pointer bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-pink-100 hover:border-pink-200"
            onClick={() => navigate('/admin/partners')}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all shadow-md">
                <Handshake className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Partners Marquee</h3>
                <p className="text-xs text-gray-500 mt-1">Add logos and names</p>
              </div>
            </div>
          </div>

        </div>

        {/* Partner Manager moved to separate page: /admin/partners */}

        {/* Welcome Message */}
        <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
          <CardContent className="p-8">
            <div className="text-center">
              <ShieldCheck className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Admin Dashboard</h2>
              <p className="text-gray-600 mb-6">
                Use the navigation cards above to access different admin sections
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <UserCheck className="w-4 h-4" />
                  <span>Entity Verifications</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-purple-600">
                  <Eye className="w-4 h-4" />
                  <span>Document Management</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <CreditCard className="w-4 h-4" />
                  <span>Payment Management</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>User Management</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;