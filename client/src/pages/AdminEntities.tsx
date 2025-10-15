import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserCheck, Building, FlaskConical, ShoppingBag, ArrowLeft, Search, ShieldCheck } from "lucide-react";
import { apiUrl } from "@/config/api";
import { useToast } from "@/hooks/use-toast";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  phone?: string;
  createdAt?: string;
}

const roleLabel = (role: string) => {
  if (role === "clinic/hospital") return "Hospital/Clinic";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const roleIcon = (role: string) => {
  switch (role) {
    case "doctor":
      return <UserCheck className="w-4 h-4" />;
    case "clinic/hospital":
      return <Building className="w-4 h-4" />;
    case "laboratory":
      return <FlaskConical className="w-4 h-4" />;
    case "pharmacy":
      return <ShoppingBag className="w-4 h-4" />;
    default:
      return <Users className="w-4 h-4" />;
  }
};

const AdminEntities = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const [allUsers, setAllUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(params.get("status") || "all");
  const [type, setType] = useState(params.get("type") || "all");

  const title = useMemo(() => {
    if (type !== "all") return `${roleLabel(type)}s`;
    if (status === "verified") return "Verified Users";
    if (status === "unverified") return "Unverified Users";
    return "All Users";
  }, [type, status]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Use single endpoint and filter client-side for flexibility
      const res = await fetch(apiUrl('/api/admin/users'));
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setAllUsers(data || []);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to load users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hasAdmin = localStorage.getItem('sehatkor_admin_auth');
    if (!hasAdmin) {
      navigate('/admin', { replace: true });
      return;
    }
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let list = [...allUsers];

    if (type !== "all") {
      list = list.filter(u => u.role === type);
    }
    if (status === "verified") list = list.filter(u => u.isVerified);
    if (status === "unverified") list = list.filter(u => !u.isVerified);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || '').includes(search)
      );
    }
    return list;
  }, [allUsers, type, status, search]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/admin'); }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">Search users and see verification badges</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter by role and verification status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <Input placeholder="Search by name, email, or phone" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={type} onValueChange={(v) => setType(v)}>
                <SelectTrigger className="w-full md:w-56">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="doctor">Doctors</SelectItem>
                  <SelectItem value="clinic/hospital">Hospitals/Clinics</SelectItem>
                  <SelectItem value="pharmacy">Pharmacies</SelectItem>
                  <SelectItem value="laboratory">Laboratories</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={(v) => setStatus(v)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchUsers} disabled={loading}>Refresh</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Results ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((u) => (
                      <TableRow key={u._id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            {roleIcon(u.role)}
                            {roleLabel(u.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {u.isVerified ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-300">Unverified</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{u.email}</TableCell>
                        <TableCell className="text-sm">{u.phone || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminEntities;
