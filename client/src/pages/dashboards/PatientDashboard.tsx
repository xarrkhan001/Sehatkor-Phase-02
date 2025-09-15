import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ServiceManager from "@/lib/serviceManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Edit,
  LogOut,
  Bell,
  Star,
  Heart,
  CreditCard,
  Settings,
  CheckCircle,
  AlertCircle,
  User
} from "lucide-react";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import EditProfileDialog from "@/components/EditProfileDialog";

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingPrices, setBookingPrices] = useState<Record<string, number>>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  

  const fetchBookings = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/bookings/patient/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });
      if (response.ok) {
        setBookings(prev => prev.filter(b => b._id !== bookingId));
        toast.success('Booking deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete booking');
    }
  };

  const deleteAllBookings = async () => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });
      if (response.ok) {
        setBookings([]);
        toast.success('All bookings deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete all bookings');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user?.id]);

  // Normalize booking price like service cards (fallbacks included)
  const getBookingPrice = (booking: any): number => {
    const raw = booking?.amount ?? booking?.price ?? booking?.servicePrice ?? booking?.service?.price ?? booking?.serviceData?.price ?? 0;
    const num = Number(raw);
    return Number.isFinite(num) ? num : 0;
  };

  // If a booking has 0 price locally, fetch the exact service price and cache it
  useEffect(() => {
    const loadMissingPrices = async () => {
      const updates: Record<string, number> = {};
      for (const b of bookings) {
        const localPrice = getBookingPrice(b);
        if (localPrice > 0) continue;
        if (!b?.serviceId || !b?.providerType) continue;
        const normalizeProviderType = (t: string): 'clinic' | 'doctor' | 'laboratory' | 'pharmacy' => {
          const low = (t || '').toString().toLowerCase();
          if (low === 'lab' || low === 'laboratory') return 'laboratory';
          if (low === 'hospital' || low === 'hospitals' || low === 'clinic') return 'clinic';
          if (low === 'doctor' || low === 'doctors') return 'doctor';
          if (low === 'pharmacy' || low === 'pharmacies') return 'pharmacy';
          return 'clinic';
        };
        try {
          const svc = await ServiceManager.fetchServiceById(String(b.serviceId), normalizeProviderType(b.providerType));
          if (svc?.price != null) {
            updates[b._id] = Number(svc.price) || 0;
          }
        } catch (e) {
          // ignore individual failures, keep showing Free
        }
      }
      if (Object.keys(updates).length) {
        setBookingPrices(prev => ({ ...prev, ...updates }));
      }
    };
    if (bookings?.length) {
      loadMissingPrices();
    }
  }, [bookings]);

  const resolveBookingPrice = (booking: any): number => {
    const p = getBookingPrice(booking);
    return p > 0 ? p : (bookingPrices[booking._id] ?? 0);
  };

  // Calculate real stats from bookings data
  const calculateStats = () => {
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'Completed').length;
    const pendingBookings = bookings.filter(b => b.status !== 'Completed').length;
    const totalSpent = bookings.reduce((sum, booking) => {
      return sum + resolveBookingPrice(booking);
    }, 0);

    return {
      totalBookings,
      completedBookings,
      pendingBookings,
      totalSpent
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your health services and appointments from your dashboard
            </p>
          </div>
        </div>

        {/* Verification Banner */}
        {user?.role === 'patient' && !user?.isVerified && (user as any)?.verificationStatus === 'pending' && (
          <Card className="mb-8 border-warning bg-warning/5">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-warning mb-1">Account Verification Required</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Please verify your account to access all features and book services.
                  </p>
                  <Button size="sm" className="bg-warning hover:bg-warning/90">
                    Verify Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Bookings Card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100 opacity-90">Total Bookings</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{isLoading ? "..." : stats.totalBookings}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            </CardContent>
          </Card>

          {/* Completed Bookings Card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100 opacity-90">Completed</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{isLoading ? "..." : stats.completedBookings}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            </CardContent>
          </Card>

          {/* Pending Bookings Card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100 opacity-90">Pending</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{isLoading ? "..." : stats.pendingBookings}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            </CardContent>
          </Card>

          {/* Total Spent Card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-100 opacity-90">Total Spent</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{isLoading ? "..." : `PKR ${stats.totalSpent.toLocaleString()}`}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Tabs Section */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="bookings" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-slate-100 to-gray-200 p-1 rounded-xl shadow-inner h-10 sm:h-12">
                <TabsTrigger 
                  value="bookings" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium text-xs sm:text-sm"
                >
                  My Bookings
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium text-xs sm:text-sm"
                >
                  Booking History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-4">
                <Card className="card-healthcare">
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>
                      Your latest appointments and services
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {bookings.filter(b => b.status !== 'Completed').length > 0 ? (
                        bookings.filter(b => b.status !== 'Completed').map((booking) => (
                          <div key={booking._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm sm:text-base">{booking.serviceName}</h4>
                              <p className="text-xs sm:text-sm text-muted-foreground">{booking.providerName}</p>
                              <div className="flex flex-col space-y-1 sm:space-y-2 mt-2 text-xs sm:text-sm text-muted-foreground">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>Booked on: {new Date(booking.createdAt).toLocaleDateString()}</span>
                                </div>
                                {booking.status === 'Scheduled' && booking.scheduledTime && (
                                  <div className="flex items-center space-x-2 text-primary font-semibold">
                                    <Clock className="w-4 h-4" />
                                    <span>Appointment: {new Date(booking.scheduledTime).toLocaleString()}</span>
                                  </div>
                                )}
                                {booking.status === 'Scheduled' && booking.communicationChannel && (
                                  <div className="flex items-center space-x-2">
                                    <Phone className="w-4 h-4" />
                                    <span>Channel: {booking.communicationChannel}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right sm:text-right text-left">
                              <Badge
                                variant={booking.status === "Completed" ? "default" : "secondary"}
                                className={
                                  booking.status === "Completed" ? "bg-green-600" :
                                  booking.status === 'Scheduled' ? 'bg-blue-500' :
                                  booking.status === 'Confirmed' ? 'bg-yellow-500' : ''
                                }
                              >
                                {booking.status}
                              </Badge>
                              <p className="text-xs sm:text-sm font-medium mt-1">
                                {resolveBookingPrice(booking) === 0
                                  ? 'Free'
                                  : `PKR ${resolveBookingPrice(booking).toLocaleString()}`}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No active bookings</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card className="card-healthcare">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>My Booking History</CardTitle>
                        <CardDescription>
                          All your bookings and payment history
                        </CardDescription>
                      </div>
                      {bookings.length > 0 && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={deleteAllBookings}
                          className="text-xs sm:text-sm"
                        >
                          Delete All
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-2">Loading bookings...</p>
                      </div>
                    ) : bookings.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No bookings found</p>
                        <p className="text-sm text-muted-foreground">Your booking history will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {bookings.map((booking) => (
                          <div key={booking._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm sm:text-base">{booking.serviceName}</h4>
                              <p className="text-xs sm:text-sm text-muted-foreground">{booking.providerName}</p>
                              <div className="flex flex-col space-y-1 sm:space-y-2 mt-2 text-xs sm:text-sm text-muted-foreground">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>Booked on: {new Date(booking.createdAt).toLocaleDateString()}</span>
                                </div>
                                {booking.status === 'Scheduled' && booking.scheduledTime && (
                                  <div className="flex items-center space-x-2 text-primary font-semibold">
                                    <Clock className="w-4 h-4" />
                                    <span>Appointment: {new Date(booking.scheduledTime).toLocaleString()}</span>
                                  </div>
                                )}
                                {booking.status === 'Scheduled' && booking.communicationChannel && (
                                  <div className="flex items-center space-x-2">
                                    <Phone className="w-4 h-4" />
                                    <span>Channel: {booking.communicationChannel}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right sm:text-right text-left flex flex-col sm:items-end items-start space-y-2">
                              <Badge
                                variant={booking.status === "Completed" ? "default" : "secondary"}
                                className={
                                  booking.status === "Completed" ? "bg-green-600" :
                                  booking.status === 'Scheduled' ? 'bg-blue-500' :
                                  booking.status === 'Confirmed' ? 'bg-yellow-500' : ''
                                }
                              >
                                {booking.status}
                              </Badge>
                              <p className="text-xs sm:text-sm font-medium mt-1">
                                {resolveBookingPrice(booking) === 0
                                  ? 'Free'
                                  : `PKR ${resolveBookingPrice(booking).toLocaleString()}`}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteBooking(booking._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Profile Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-white shadow-xl">
              <CardHeader className="relative z-10">
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
              </CardHeader>
              <CardContent className="relative z-10 pb-4">
                <div className="flex flex-col items-center text-center mb-4">
                  <ProfileImageUpload
                    currentImage={user?.avatar}
                    userName={user?.name}
                    size="lg"
                    showEditButton={true}
                  />
                  <div className="mt-3">
                    <h3 className="text-lg font-semibold text-white">{user?.name}</h3>
                    <Badge variant="secondary" className="capitalize bg-white/20 text-white border-white/30 mt-1">{user?.role}</Badge>
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center space-x-3 text-sm text-gray-300">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-sm text-gray-300">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{(user as any)?.phone || 'Not provided'}</span>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Button 
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-xs sm:text-sm" 
                    variant="outline"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    <Edit className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm text-xs sm:text-sm"
                    variant="outline"
                    onClick={() => navigate(`/patient/${user?.id}`)}
                  >
                    <User className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                    See Public Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        role="doctor"
        name={user?.name}
        specialization={(user as any)?.specialization}
        avatar={user?.avatar}
      />
    </div>
  );
};

export default PatientDashboard;