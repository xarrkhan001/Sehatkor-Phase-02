import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  ShieldCheck,
  Search,
  Eye,
  UserCheck,
  Building,
  TestTube,
  ShoppingBag,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminVerifications = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Guard: redirect to /admin (gate) if not admin-authenticated
  useEffect(() => {
    const hasAdmin = localStorage.getItem('sehatkor_admin_auth');
    if (!hasAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

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

  useEffect(() => { 
    fetchPendingUsers(); 
  }, []);

  const pendingUsers = users.filter((user: any) => !user.isVerified && user.role !== 'patient');

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="outline" 
          onClick={() => {
            if (window.history.length > 1) navigate(-1); else navigate('/admin');
          }}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Entity Verifications</h1>
          <p className="text-muted-foreground">Review and approve healthcare provider registrations</p>
        </div>
      </div>

      {/* Main Content */}
      <Card className="card-healthcare">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                Pending Verifications ({pendingUsers.length})
              </CardTitle>
              <CardDescription>
                Review and approve healthcare provider registrations
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile Card List */}
          <div className="space-y-3 lg:hidden">
            {pendingUsers.map((user: any) => (
              <div key={user.id || user._id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shrink-0">
                    {getRoleIcon(user.role)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                  {user.isVerified ? (
                    <Badge className="bg-success text-success-foreground shrink-0">Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="text-warning border-warning shrink-0">Pending</Badge>
                  )}
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <div className="flex gap-2">
                    <Badge variant="outline">{user.role}</Badge>
                    <span className="truncate">{user.phone}</span>
                  </div>
                  {user.licenseNumber && (
                    <div className="mt-1 text-xs">
                      <span className="font-medium">License: </span>
                      <span>{user.licenseNumber}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline"><Eye className="w-4 h-4" /></Button>
                  <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => handleApprove(user._id)}>
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReject(user._id)}>
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <Table className="hidden lg:table">
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map((user: any) => (
                <TableRow key={user._id || user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                        {getRoleIcon(user.role)}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{user.phone}</p>
                  </TableCell>
                  <TableCell>
                    {user.licenseNumber ? (
                      <p className="text-sm font-mono">{user.licenseNumber}</p>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not provided</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.isVerified ? (
                      <Badge className="bg-success text-success-foreground">Verified</Badge>
                    ) : (
                      <Badge variant="outline" className="text-warning border-warning">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-success hover:bg-success/90"
                        onClick={() => handleApprove(user._id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(user._id)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pendingUsers.length === 0 && (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-xl text-muted-foreground mb-2">No Pending Verifications</p>
              <p className="text-muted-foreground">All healthcare providers have been verified</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVerifications;
