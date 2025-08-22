import { useState, useEffect } from "react";
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
  AlertCircle
} from "lucide-react";

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingPrices, setBookingPrices] = useState<Record<string, number>>({});
  
  const [stats] = useState({
    totalBookings: 8,
    completedBookings: 5,
    pendingBookings: 3,
    totalSpent: 15500
  });

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground">
              Manage your health services and appointments from your dashboard
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Verification Banner */}
        {!user?.isVerified && (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-healthcare">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-success">{stats.completedBookings}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-warning">{stats.pendingBookings}</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">PKR {stats.totalSpent.toLocaleString()}</p>
                </div>
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tabs Section */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="bookings" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                <TabsTrigger value="history">Booking History</TabsTrigger>
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
                    <div className="space-y-4">
                      {bookings.filter(b => b.status !== 'Completed').length > 0 ? (
                        bookings.filter(b => b.status !== 'Completed').map((booking) => (
                          <div key={booking._id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{booking.serviceName}</h4>
                              <p className="text-sm text-muted-foreground">{booking.providerName}</p>
                              <div className="flex flex-col space-y-2 mt-2 text-sm text-muted-foreground">
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
                              </div>
                            </div>
                            <div className="text-right">
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
                              <p className="text-sm font-medium mt-1">
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
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <div key={booking._id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{booking.serviceName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {booking.providerName} ({booking.providerType})
                              </p>
                              <div className="flex flex-col space-y-2 mt-2 text-sm text-muted-foreground">
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
                            <div className="text-right flex flex-col items-end space-y-2">
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteBooking(booking._id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
            <Card className="card-healthcare">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src="" alt={user?.name} />
                    <AvatarFallback className="text-lg font-semibold">
                      {user?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{user?.name}</h3>
                    <Badge variant="outline" className="capitalize">{user?.role}</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{user?.email}</span>
                  </div>
                </div>

                <Button className="w-full mt-6" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-healthcare">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Heart className="w-4 h-4 mr-2" />
                  Health Checkup
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;