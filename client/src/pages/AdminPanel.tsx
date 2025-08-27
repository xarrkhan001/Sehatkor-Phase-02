import { useState, useEffect } from "react";
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
  TestTube,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
  Activity,
  Download,
  Stethoscope,
  CreditCard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminPaymentDashboard from "@/components/AdminPaymentDashboard";

const AdminPanel = () => {
  // Simple in-page gate for /admin route
  const [showGate, setShowGate] = useState(true);
  const [gateEmail, setGateEmail] = useState("");
  const [gatePassword, setGatePassword] = useState("");
  const [animateIn, setAnimateIn] = useState(false);
  const { toast } = useToast();

  const handleGateSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const validEmail = "test@gmail.com";
    const validPassword = "12345678";
    if (gateEmail.trim().toLowerCase() === validEmail && gatePassword === validPassword) {
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

  // Soft surface gradient per card color
  const getCardSurface = (color: string) => {
    if (color.includes('blue')) return 'from-blue-500/5 to-white';
    if (color.includes('green')) return 'from-green-500/5 to-white';
    if (color.includes('indigo')) return 'from-indigo-500/5 to-white';
    if (color.includes('purple')) return 'from-purple-500/5 to-white';
    if (color.includes('orange')) return 'from-orange-500/5 to-white';
    if (color.includes('red')) return 'from-red-500/5 to-white';
    return 'from-gray-400/5 to-white';
  };

  const getAuthToken = () => localStorage.getItem('sehatkor_token') || localStorage.getItem('token');
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<any>({
    verifiedUsers: 0,
    totalDoctors: 0,
    totalPharmacies: 0,
    totalLabs: 0,
    totalHospitals: 0
  });
  const [pendingDocs, setPendingDocs] = useState<any[]>([]);

  // Fetch pending users from backend
  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sehatkor_token') || localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/admin/pending', {
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
      const token = localStorage.getItem('sehatkor_token') || localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/admin/stats', {
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
  }, []);

  const statsData = [
    { title: "Verified Users", value: stats.verifiedUsers?.toString() || "0", icon: Users, change: "", color: "text-blue-500" },
    { title: "Total Doctors", value: stats.totalDoctors?.toString() || "0", icon: UserCheck, change: "", color: "text-green-500" },
    { title: "Total Hospitals/Clinics", value: stats.totalHospitals?.toString() || "0", icon: Building, change: "", color: "text-indigo-500" },
    { title: "Total Pharmacies", value: stats.totalPharmacies?.toString() || "0", icon: ShoppingBag, change: "", color: "text-purple-500" },
    { title: "Total Laboratories", value: stats.totalLabs?.toString() || "0", icon: TestTube, change: "", color: "text-orange-500" }
  ];

  const pendingUsers = users.filter((user: any) => !user.isVerified && user.role !== 'patient');

  // removed Manage Services demo data

  // toast already initialized above for gate

  const getDownloadUrl = (url: string) => {
    if (!url) return '#';
    // Add fl_attachment flag to Cloudinary URL to force download
    return url.replace('/upload/', '/upload/fl_attachment/');
  };

  // Documents: fetch pending
  const fetchPendingDocuments = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/documents/pending', {
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
      const res = await fetch(`http://localhost:4000/api/documents/${docId}`, {
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
      const token = localStorage.getItem('sehatkor_token') || localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/admin/verify/${userId}`, {
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
      const token = localStorage.getItem('sehatkor_token') || localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/admin/verify/${userId}`, {
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
        return <TestTube className="w-4 h-4" />;
      case "pharmacy":
        return <ShoppingBag className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  // Helper to map icon color -> soft gradient background for badge
  const getIconBg = (color: string) => {
    if (color.includes('blue')) return 'from-blue-500/10 to-blue-600/10 text-blue-600';
    if (color.includes('green')) return 'from-green-500/10 to-green-600/10 text-green-600';
    if (color.includes('indigo')) return 'from-indigo-500/10 to-indigo-600/10 text-indigo-600';
    if (color.includes('purple')) return 'from-purple-500/10 to-purple-600/10 text-purple-600';
    if (color.includes('orange')) return 'from-orange-500/10 to-orange-600/10 text-orange-600';
    if (color.includes('red')) return 'from-red-500/10 to-red-600/10 text-red-600';
    return 'from-gray-400/10 to-gray-500/10 text-gray-700';
  };

  // Accent gradient for top bar per card color
  const getAccentBar = (color: string) => {
    if (color.includes('blue')) return 'from-blue-400/40 via-blue-500/40 to-blue-600/40';
    if (color.includes('green')) return 'from-green-400/40 via-green-500/40 to-green-600/40';
    if (color.includes('indigo')) return 'from-indigo-400/40 via-indigo-500/40 to-indigo-600/40';
    if (color.includes('purple')) return 'from-purple-400/40 via-purple-500/40 to-purple-600/40';
    if (color.includes('orange')) return 'from-orange-400/40 via-orange-500/40 to-orange-600/40';
    if (color.includes('red')) return 'from-red-400/40 via-red-500/40 to-red-600/40';
    return 'from-gray-400/40 via-gray-500/40 to-gray-600/40';
  };

  return (
    <div className="relative min-h-screen bg-background">
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage SehatKor platform operations and user verifications
            </p>
          </div>
          <div>
            <Badge variant="outline" className="text-success border-success w-fit">
              <ShieldCheck className="w-4 h-4 mr-1" />
              Admin Access
            </Badge>
          </div>
        </div>

        {/* Removed: Top Verified Users Card */}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="relative border border-gray-100 shadow-sm hover:shadow-md transition hover:-translate-y-0.5 rounded-2xl bg-white hover:border-gray-200 overflow-hidden"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${getAccentBar(stat.color)}`} />
                <CardContent className="p-5">
                  <div className={`flex items-start justify-between gap-4 p-3 rounded-xl bg-gradient-to-br ${getCardSurface(stat.color)}`}>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-semibold leading-tight">{stat.value}</p>
                      <p
                        className={`mt-1 text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}
                      >
                        {stat.change || 'from last month'}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr ${getIconBg(stat.color)} ring-1 ring-black/5`}>
                        <Icon className={`w-5 h-5`} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stylish Navigation Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
              
              {/* Verify Entities Card */}
              <div 
                className="group cursor-pointer bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-blue-200"
                onClick={() => window.location.href = '/admin/verifications'}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Verify Entities</h3>
                    <p className="text-sm text-gray-500 mt-1">Review & approve providers</p>
                  </div>
                </div>
              </div>

              {/* Documents Card */}
              <div 
                className="group cursor-pointer bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-purple-200"
                onClick={() => window.location.href = '/admin/documents'}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Documents</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage uploaded files</p>
                  </div>
                </div>
              </div>

              {/* Payment Management Card */}
              <div 
                className="group cursor-pointer bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-blue-200"
                onClick={() => window.location.href = '/admin/payments'}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Payment Management</h3>
                    <p className="text-sm text-gray-500 mt-1">Handle transactions & releases</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
          <CardContent className="p-8">
            <div className="text-center">
              <ShieldCheck className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Admin Dashboard</h2>
              <p className="text-gray-600 mb-6">
                Use the navigation cards above to access different admin sections
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;