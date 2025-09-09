import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  Users, 
  Search,
  Filter,
  Trash2,
  UserCheck,
  Building,
  TestTube,
  ShoppingBag,
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Shield,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  role: string;
  isVerified: boolean;
  profileImage?: string;
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasMore: boolean;
}

const AdminUserManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasMore: false
  });

  const fetchUsers = async (page = 1, search = "", role = "all") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20"
      });

      const response = await fetch(`http://localhost:4000/api/admin/verified-users?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      
      // Filter users based on search and role
      let filteredUsers = data.users || [];
      
      if (search) {
        filteredUsers = filteredUsers.filter((user: User) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          (user.phone && user.phone.includes(search))
        );
      }

      if (role !== "all") {
        filteredUsers = filteredUsers.filter((user: User) => user.role === role);
      }

      setUsers(filteredUsers);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        hasMore: false
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      toast({
        title: "User Deleted",
        description: `${userName} has been permanently removed from the system.`
      });

      // Refresh the user list
      fetchUsers(currentPage, searchTerm, roleFilter);
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "doctor":
        return <UserCheck className="w-4 h-4 text-green-600" />;
      case "clinic/hospital":
        return <Building className="w-4 h-4 text-blue-600" />;
      case "laboratory":
        return <TestTube className="w-4 h-4 text-orange-600" />;
      case "pharmacy":
        return <ShoppingBag className="w-4 h-4 text-purple-600" />;
      case "patient":
        return <Users className="w-4 h-4 text-indigo-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "doctor":
        return "bg-green-100 text-green-800 border-green-200";
      case "clinic/hospital":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "laboratory":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "pharmacy":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "patient":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, searchTerm, roleFilter);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchUsers(newPage, searchTerm, roleFilter);
  };

  useEffect(() => {
    // Guard: redirect to /admin if not admin-authenticated
    const hasAdmin = localStorage.getItem('sehatkor_admin_auth');
    if (!hasAdmin) {
      navigate('/admin', { replace: true });
      return;
    }
    fetchUsers();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
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
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-2">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                User Management
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage all verified users including patients - Remove users permanently from the system
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 w-fit">
            <Shield className="w-4 h-4 mr-1" />
            Danger Zone
          </Badge>
        </div>

        {/* Warning Card */}
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Warning: Permanent Action</h3>
                <p className="text-sm text-red-800">
                  Deleting a user will permanently remove them from the system. They will not be able to login again and all their data will be lost. This action cannot be undone.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search & Filter Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="doctor">Doctors</SelectItem>
                  <SelectItem value="clinic/hospital">Hospitals/Clinics</SelectItem>
                  <SelectItem value="laboratory">Laboratories</SelectItem>
                  <SelectItem value="pharmacy">Pharmacies</SelectItem>
                  <SelectItem value="patient">Patients</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Verified Users ({pagination.totalUsers})
              </span>
              <Badge variant="secondary">
                Page {pagination.currentPage} of {pagination.totalPages}
              </Badge>
            </CardTitle>
            <CardDescription>
              Showing {users.length} users on this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {user.profileImage ? (
                                <img
                                  src={user.profileImage}
                                  alt={user.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <Users className="w-5 h-5 text-gray-500" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getRoleBadgeColor(user.role)} flex items-center gap-1 w-fit`}>
                              {getRoleIcon(user.role)}
                              {user.role === 'clinic/hospital' ? 'Hospital/Clinic' : 
                               user.role === 'patient' ? 'Patient' :
                               user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {user.phone && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="w-3 h-3" />
                                  {user.phone}
                                </div>
                              )}
                              {user.whatsapp && (
                                <div className="flex items-center gap-1 text-sm text-green-600">
                                  <Phone className="w-3 h-3" />
                                  {user.whatsapp}
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                Email
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="w-3 h-3" />
                              {formatDate(user.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="flex items-center gap-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                    Delete User Permanently
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete <strong>{user.name}</strong>? 
                                    This action will permanently remove the user from the system and cannot be undone.
                                    <br /><br />
                                    <strong>User Details:</strong>
                                    <br />• Name: {user.name}
                                    <br />• Email: {user.email}
                                    <br />• Role: {user.role}
                                    {user.phone && <><br />• Phone: {user.phone}</>}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user._id, user.name)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Permanently
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-muted-foreground">
                      Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, pagination.totalUsers)} of {pagination.totalUsers} users
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <span className="text-sm px-3 py-1 bg-muted rounded">
                        {pagination.currentPage}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasMore}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUserManagement;
