import React, { useState, useEffect } from 'react';
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
  Phone,
  Plus,
  Trash2
} from "lucide-react";

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<DoctorService[]>([]);
  const [specialization, setSpecialization] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

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

  const todayAppointments = [
    { id: 1, patient: "Ahmad Ali", time: "10:00 AM", type: "Consultation", status: "Confirmed" },
    { id: 2, patient: "Sara Khan", time: "11:30 AM", type: "Follow-up", status: "Waiting" },
    { id: 3, patient: "Hassan Ahmed", time: "2:00 PM", type: "Checkup", status: "Confirmed" },
  ];

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
            <CardContent className="p-6">
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
            <CardContent className="p-6">
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
            <CardContent className="p-6">
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
            <CardContent className="p-6">
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
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="appointments" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
              </TabsList>

              <TabsContent value="appointments" className="space-y-4">
                <Card className="card-healthcare">
                  <CardHeader>
                    <CardTitle>Today's Appointments</CardTitle>
                    <CardDescription>Your scheduled patients for today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {todayAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{appointment.patient}</h4>
                            <p className="text-sm text-muted-foreground">{appointment.type}</p>
                            <div className="flex items-center space-x-1 mt-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{appointment.time}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={appointment.status === "Confirmed" ? "default" : "secondary"}
                            >
                              {appointment.status}
                            </Badge>
                            <div className="mt-2 space-x-2">
                              <Button size="sm" variant="outline">
                                <Phone className="w-4 h-4" />
                              </Button>
                              <Button size="sm">Start</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bookings" className="space-y-4">
                <Card className="card-healthcare">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Patient Bookings</CardTitle>
                        <CardDescription>Bookings from patients for your services</CardDescription>
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
                          <div key={booking._id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{booking.patientName}</h4>
                              <p className="text-sm text-muted-foreground">{booking.serviceName}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Phone className="w-4 h-4" />
                                  <span>{booking.paymentMethod}: ***{booking.paymentNumber.slice(-4)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex items-center space-x-2">
                              <Badge
                                variant={booking.status === "confirmed" ? "default" : "secondary"}
                                className={booking.status === "confirmed" ? "bg-success" : ""}
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
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="w-8 h-8 text-primary" />
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

                  <Button className="w-full" variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
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