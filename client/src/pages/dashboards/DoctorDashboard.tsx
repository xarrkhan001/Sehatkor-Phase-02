import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ui/image-upload";
import ServiceManager, { DoctorService } from "@/lib/serviceManager";
import { listServices as apiList } from "@/lib/doctorApi";
import ServiceManagement from "@/components/ServiceManagement";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import { toast } from "sonner";
import { 
  Stethoscope, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  LogOut,
  Bell,
  Edit,
  Star,
  FileText,
  Plus,
  Trash2,
  Eye,
  User
} from "lucide-react";

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<DoctorService[]>([]);
  const [specialization, setSpecialization] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [scheduleDetails, setScheduleDetails] = useState({
    scheduledTime: '',
    communicationChannel: 'SehatKor Chat',
  });

  // Normalize booking price with sensible fallbacks
  const getBookingPrice = (booking: any): number => {
    const raw = booking?.price ?? booking?.amount ?? booking?.servicePrice ?? 0;
    const num = Number(raw);
    return Number.isFinite(num) ? num : 0;
  };

  const specialties = [
    'Cardiologist', 'Neurologist', 'Dermatologist', 'Pediatrician', 
    'Orthopedic', 'Gynecologist', 'Psychiatrist', 'General Physician'
  ];

  const syncLocalFromDocs = (docs: any[]) => {
    if (!user?.id) return;
    const all = ServiceManager.getAllServices();
    const filtered = all.filter((s: any) => !(s.providerType === 'doctor' && s.providerId === user.id));
    const mapped = docs.map((d: any) => ({
      id: String(d._id),
      name: d.name,
      description: d.description || '',
      price: d.price || 0,
      category: (d.category || 'Treatment') as any,
      providerType: 'doctor' as const,
      providerId: user.id,
      providerName: d.providerName || (user?.name || 'Doctor'),
      image: d.imageUrl,
      ...(d.duration ? { duration: d.duration } : {}),
      ...(Array.isArray(d.diseases) ? { diseases: d.diseases } : {}),
      ...(d.city ? { city: d.city } : {}),
      ...(d.detailAddress ? { detailAddress: d.detailAddress } : {}),
      ...(d.googleMapLink ? { googleMapLink: d.googleMapLink } : {}),
      createdAt: d.createdAt || new Date().toISOString(),
      updatedAt: d.updatedAt || d.createdAt || new Date().toISOString(),
    }));

    const next = [...filtered, ...mapped];
    localStorage.setItem('sehatkor_services', JSON.stringify(next));
    window.dispatchEvent(new StorageEvent('storage', { key: 'sehatkor_services' }));
  };

  const reloadServices = async () => {
    if (!user?.id) return;
    try {
      console.log('Fetching doctor services for user:', user.id);
      const docs = await apiList();
      console.log('Doctor services fetched:', docs);
      
      // Map to UI Service type for table
      const mapped: DoctorService[] = docs.map((d: any) => ({
        id: String(d._id),
        name: d.name,
        description: d.description || '',
        price: d.price || 0,
        category: (d.category || 'Treatment') as any,
        providerType: 'doctor',
        providerId: user.id,
        providerName: d.providerName || (user?.name || 'Doctor'),
        image: d.imageUrl,
        duration: d.duration,
        ...(Array.isArray(d.diseases) ? { diseases: d.diseases } : {}),
        ...(d.city ? { city: d.city } : {}),
        ...(d.detailAddress ? { detailAddress: d.detailAddress } : {}),
        ...(d.googleMapLink ? { googleMapLink: d.googleMapLink } : {}),
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }) as any);

      setServices(mapped);
      syncLocalFromDocs(docs);
    } catch (error) {
      console.error('Error fetching doctor services:', error);
      // fallback to local
      const userServices = ServiceManager.getServicesByProvider(user.id).filter(
        service => service.providerType === 'doctor'
      ) as DoctorService[];
      setServices(userServices);
      toast({
        title: "Warning",
        description: "Could not load services from server. Using local data.",
        variant: "destructive"
      });
    }
  };

  const fetchBookings = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/bookings/provider/${user.id}`, {
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
      setIsLoadingBookings(false);
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
        toast({
          title: "Success",
          description: "Booking deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete booking",
        variant: "destructive"
      });
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
        toast({
          title: "Success",
          description: "All bookings deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete all bookings",
        variant: "destructive"
      });
    }
  };

  const scheduleBooking = async () => {
    if (!selectedBooking || !scheduleDetails.scheduledTime) {
      toast({ title: "Error", description: "Please select a time for the appointment.", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${selectedBooking._id}/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
        body: JSON.stringify(scheduleDetails),
      });

      if (response.ok) {
        const updatedBooking = await response.json();
        setBookings(prev => prev.map(b => b._id === selectedBooking._id ? updatedBooking : b));
        toast({ title: "Success", description: "Booking scheduled successfully" });
        setIsScheduling(false);
        setSelectedBooking(null);
      } else {
        throw new Error('Failed to schedule booking');
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to schedule booking", variant: "destructive" });
    }
  };

  const completeBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });

      if (response.ok) {
        const updatedBooking = await response.json();
        setBookings(prev => prev.map(b => b._id === bookingId ? updatedBooking : b));
        toast({ title: "Success", description: "Booking marked as complete" });
      } else {
        throw new Error('Failed to complete booking');
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to complete booking", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    reloadServices();
    fetchBookings();
    const savedSpecialization = localStorage.getItem(`doctor_specialization_${user.id}`);
    if (savedSpecialization) setSpecialization(savedSpecialization);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);


  const handleSpecialtyChange = (specialty: string) => {
    setSpecialization(specialty);
    localStorage.setItem(`doctor_specialization_${user?.id}`, specialty);
    
    toast({
      title: "Success",
      description: "Specialization updated successfully"
    });
  };

  

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dr. {user?.name}</h1>
            <p className="text-muted-foreground">
              Welcome to your medical practice dashboard
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 md:mt-0">
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
              <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 space-y-3 sm:space-y-0">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-warning mb-1">Medical License Verification Pending</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your medical license is being verified. You'll be able to accept patients once verified.
                  </p>
                  <Button size="sm" className="bg-warning hover:bg-warning/90">
                    Upload Documents
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-healthcare">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Patients</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-success">5</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold text-warning">3</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-healthcare">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">4.8</p>
                </div>
                <Star className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="bookings" className="space-y-6">
              <TabsList className="w-full -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto flex gap-2 sm:grid sm:grid-cols-2 snap-x snap-mandatory">
                <TabsTrigger value="bookings" className="shrink-0 whitespace-nowrap snap-start">Bookings</TabsTrigger>
                <TabsTrigger value="services" className="shrink-0 whitespace-nowrap snap-start">Services</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-4">
                <Card className="card-healthcare">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <CardTitle>Patient Bookings</CardTitle>
                        <CardDescription>Bookings from patients for your services</CardDescription>
                      </div>
                      {bookings.length > 0 && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={deleteAllBookings}
                          className="shrink-0 self-start sm:self-auto w-full sm:w-auto"
                        >
                          Delete All
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingBookings ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-2">Loading bookings...</p>
                      </div>
                    ) : bookings.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No bookings yet</p>
                        <p className="text-sm text-muted-foreground">Patient bookings will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <div key={booking._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{booking.patientName}</h4>
                              <p className="text-sm text-muted-foreground truncate">{booking.serviceName}</p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Booked: {new Date(booking.createdAt).toLocaleDateString()}</span>
                                </div>
                                {booking.status === 'Scheduled' && booking.scheduledTime && (
                                  <div className="flex items-center space-x-1 text-primary font-semibold">
                                    <Clock className="w-4 h-4" />
                                    <span>Scheduled: {new Date(booking.scheduledTime).toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="w-full sm:w-auto text-left sm:text-right flex flex-wrap items-center gap-2 justify-start sm:justify-end">
                              <Badge
                                variant={booking.status === "Completed" ? "default" : "secondary"}
                                className={(booking.status === "Completed" ? "bg-green-600" : booking.status === 'Scheduled' ? 'bg-blue-500' : 'bg-yellow-500') + " text-xs px-2 py-0.5"}
                              >
                                {booking.status}
                              </Badge>
                              <span className="text-sm font-medium ml-1">
                                {getBookingPrice(booking) === 0 ? 'Free' : `PKR ${getBookingPrice(booking).toLocaleString()}`}
                              </span>
                              {booking.status === 'Confirmed' && (
                                <Button size="sm" onClick={() => { setSelectedBooking(booking); setIsScheduling(true); }}>Schedule</Button>
                              )}
                              {booking.status === 'Scheduled' && (
                                <Button size="sm" variant="outline" onClick={() => completeBooking(booking._id)}>Mark as Complete</Button>
                              )}
                              {booking.status === 'Completed' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteBooking(booking._id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <Dialog open={isScheduling} onOpenChange={setIsScheduling}>
                <DialogContent className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Schedule Appointment</DialogTitle>
                    <DialogDescription>
                      Set a time and communication channel for '{selectedBooking?.serviceName}' with {selectedBooking?.patientName}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduleTime">Appointment Time</Label>
                      <Input 
                        id="scheduleTime"
                        type="datetime-local" 
                        value={scheduleDetails.scheduledTime}
                        onChange={(e) => setScheduleDetails(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="communicationChannel">Communication Channel</Label>
                      <Select 
                        value={scheduleDetails.communicationChannel}
                        onValueChange={(value) => setScheduleDetails(prev => ({ ...prev, communicationChannel: value }))}
                      >
                        <SelectTrigger id="communicationChannel">
                          <SelectValue placeholder="Select a channel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SehatKor Chat">SehatKor Chat</SelectItem>
                          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                          <SelectItem value="Phone Call">Phone Call</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsScheduling(false)}>Cancel</Button>
                    <Button onClick={scheduleBooking}>Confirm Schedule</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <TabsContent value="services" className="space-y-4">
                <ServiceManagement
                  userId={user?.id || ''}
                  userRole="doctor"
                  userName={user?.name || 'Doctor'}
                  services={services as any}
                  onServicesUpdate={(newServices) => {
                    setServices(newServices as DoctorService[]);
                    // keep ServiceManager in sync using ids in current services
                    const docs = (newServices as any[]).map(s => ({
                      _id: s.id,
                      name: s.name,
                      description: s.description,
                      price: s.price,
                      category: s.category,
                      duration: (s as any).duration,
                      imageUrl: s.image,
                      providerName: s.providerName,
                      diseases: (s as any).diseases,
                      city: (s as any).city,
                      detailAddress: (s as any).detailAddress,
                      googleMapLink: (s as any).googleMapLink,
                      createdAt: (s as any).createdAt,
                      updatedAt: (s as any).updatedAt,
                    }));

                    syncLocalFromDocs(docs);
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="card-healthcare">
              <CardHeader>
                <CardTitle>Doctor Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="mb-4">
                    <ProfileImageUpload 
                      currentImage={user?.avatar}
                      userName={user?.name || 'Doctor'}
                      size="lg"
                    />
                  </div>
                  <h3 className="text-lg font-semibold">Dr. {user?.name}</h3>
                  <Badge variant="outline" className="capitalize">{user?.role}</Badge>
                  {specialization && (
                    <Badge variant="secondary" className="mt-2">{specialization}</Badge>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">{user?.email}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="specialty">Medical Specialty</Label>
                    <Select value={specialization} onValueChange={handleSpecialtyChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="secondary"
                      onClick={() => navigate(`/provider/${user?.id}`)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      See Public Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-healthcare">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Set Availability
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Write Prescription
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Patient History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;