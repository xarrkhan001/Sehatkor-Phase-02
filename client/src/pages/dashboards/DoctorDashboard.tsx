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
import ServiceManager, { DoctorService } from "@/lib/serviceManager";
import { listServices as apiList } from "@/lib/doctorApi";
import ServiceManagement from "@/components/ServiceManagement";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import EditProfileDialog from "@/components/EditProfileDialog";
import ProviderWallet from "@/components/ProviderWallet";
import CurrencyAmount from "@/components/CurrencyAmount";
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
  User,
  Wallet,
  DollarSign
} from "lucide-react";

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<DoctorService[]>([]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [scheduleDetails, setScheduleDetails] = useState({
    scheduledTime: '',
    communicationChannel: 'SehatKor Chat',
  });
  const [walletData, setWalletData] = useState<any>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);

  // Normalize booking price with sensible fallbacks
  const getBookingPrice = (booking: any): number => {
    const raw = booking?.price ?? booking?.amount ?? booking?.servicePrice ?? 0;
    const num = Number(raw);
    return Number.isFinite(num) ? num : 0;
  };

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
      ...(Array.isArray(d.diseases) ? { diseases: d.diseases } : {}),
      ...(d.city ? { city: d.city } : {}),
      ...(d.detailAddress ? { detailAddress: d.detailAddress } : {}),
      ...(d.hospitalClinicName ? { hospitalClinicName: d.hospitalClinicName } : {}),
      ...(d.googleMapLink ? { googleMapLink: d.googleMapLink } : {}),
      ...(d.availability ? { availability: d.availability } : {}),
      serviceType: Array.isArray(d.serviceType) ? d.serviceType : (d.serviceType ? [d.serviceType] : []),
      ...(typeof d.homeDelivery === 'boolean' ? { homeDelivery: d.homeDelivery } : {}),
      // Base schedule fields (main service)
      ...(d.timeLabel ? { timeLabel: d.timeLabel } : {}),
      ...(d.startTime ? { startTime: d.startTime } : {}),
      ...(d.endTime ? { endTime: d.endTime } : {}),
      ...(Array.isArray(d.days) ? { days: d.days } : {}),
      ...(Array.isArray(d.variants) ? { variants: d.variants } : {}),
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
        ...(d.hospitalClinicName ? { hospitalClinicName: d.hospitalClinicName } : {}),
        ...(d.googleMapLink ? { googleMapLink: d.googleMapLink } : {}),
        ...(d.availability ? { availability: d.availability } : {}),
        serviceType: Array.isArray(d.serviceType) ? d.serviceType : (d.serviceType ? [d.serviceType] : []),
        ...(typeof d.homeDelivery === 'boolean' ? { homeDelivery: d.homeDelivery } : {}),
        // Base schedule fields (main service)
        ...(d.timeLabel ? { timeLabel: d.timeLabel } : {}),
        ...(d.startTime ? { startTime: d.startTime } : {}),
        ...(d.endTime ? { endTime: d.endTime } : {}),
        ...(Array.isArray(d.days) ? { days: d.days } : {}),
        ...(Array.isArray(d.variants) ? { variants: d.variants } : {}),
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

  const fetchWalletData = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`http://localhost:4000/api/payments/wallet/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWalletData(data.wallet);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setIsLoadingWallet(false);
    }
  };

  useEffect(() => {
    reloadServices();
    fetchBookings();
    fetchWalletData();
  }, [user?.id]);

  // Note: Removed legacy handleSpecialtyChange; specialization is edited via EditProfileDialog now.

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 break-words">Dr. {user?.name}</h1>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
              Welcome to your medical practice dashboard
            </p>
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

        {/* Stats Cards - Pharmacy style gradients and overlays */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {/* Total Services Card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-blue-100 opacity-90 truncate">Total Services</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{services.length}</p>
                </div>
                <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0">
                  <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 sm:-translate-y-14 md:-translate-y-16 translate-x-10 sm:translate-x-14 md:translate-x-16"></div>
            </CardContent>
          </Card>

          {/* Total Bookings Card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-green-100 opacity-90 truncate">Total Bookings</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{bookings.length}</p>
                </div>
                <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 sm:-translate-y-14 md:-translate-y-16 translate-x-10 sm:translate-x-14 md:translate-x-16"></div>
            </CardContent>
          </Card>

          {/* Available Balance Card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-purple-100 opacity-90 truncate">Available Balance</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white break-all">
                    <CurrencyAmount
                      amount={walletData?.availableBalance}
                      loading={isLoadingWallet}
                      currency="PKR"
                    />
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 sm:-translate-y-14 md:-translate-y-16 translate-x-10 sm:translate-x-14 md:translate-x-16"></div>
            </CardContent>
          </Card>

          {/* Total Earnings Card */}
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-amber-100 opacity-90 truncate">Total Earnings</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white break-all">
                    <CurrencyAmount
                      amount={walletData?.totalEarnings}
                      loading={isLoadingWallet}
                      currency="PKR"
                    />
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 sm:-translate-y-14 md:-translate-y-16 translate-x-10 sm:translate-x-14 md:translate-x-16"></div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Tabs defaultValue="services" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-100 to-gray-200 p-1 rounded-xl shadow-inner">
                <TabsTrigger 
                  value="services" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium text-xs sm:text-sm md:text-base px-2 py-2 sm:px-3 sm:py-2"
                >
                  Services
                </TabsTrigger>
                <TabsTrigger 
                  value="bookings" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium text-xs sm:text-sm md:text-base px-2 py-2 sm:px-3 sm:py-2"
                >
                  <span className="hidden sm:inline">Bookings</span>
                  <span className="sm:hidden">Orders</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="wallet" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium text-xs sm:text-sm md:text-base px-2 py-2 sm:px-3 sm:py-2"
                >
                  Wallet
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-4">
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          Patient Bookings
                        </CardTitle>
                        <CardDescription className="text-orange-100">Bookings from patients for your services</CardDescription>
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
                  <CardContent className="max-h-[600px] overflow-y-auto">
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
                              <h4 
                                className="font-medium truncate text-blue-600 hover:text-blue-800 cursor-pointer hover:underline transition-colors"
                                onClick={() => navigate(`/patient/${booking.patientId}`)}
                              >
                                {booking.patientName}
                              </h4>
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
                      availability: (s as any).availability,
                      serviceType: (s as any).serviceType,
                      homeDelivery: Boolean((s as any).homeDelivery),
                      variants: (s as any).variants,
                      createdAt: (s as any).createdAt,
                      updatedAt: (s as any).updatedAt,
                    }));

                    syncLocalFromDocs(docs);
                  }}
                  onReloadServices={reloadServices}
                />
              </TabsContent>

              <TabsContent value="wallet" className="space-y-4">
                <ProviderWallet />
              </TabsContent>
            </Tabs>
          </div>

          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-white shadow-xl">
              <CardHeader className="relative z-10">
                <CardTitle className="text-white flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Doctor Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-center mb-6">
                  <div className="mb-4 relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                    <ProfileImageUpload
                      currentImage={user?.avatar}
                      userName={user?.name || 'Doctor'}
                      size="lg"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Dr. {user?.name}</h3>
                  <Badge variant="outline" className="capitalize bg-white/20 text-white border-white/30 hover:bg-white/30">
                    {user?.role}
                  </Badge>
                  {user?.specialization && (
                    <Badge variant="secondary" className="mt-2 bg-white/10 text-white border-white/20">
                      {user?.specialization}
                    </Badge>
                  )}
                  <p className="text-sm text-gray-300 mt-3">{user?.email}</p>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300" 
                    variant="outline" 
                    onClick={() => setIsEditProfileOpen(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white border-0 shadow-lg transition-all duration-300"
                    onClick={() => navigate(`/provider/${user?.id}`)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    See Public Profile
                  </Button>
                </div>
              </CardContent>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
            </Card>

            {/* Edit Profile Dialog */}
            <EditProfileDialog
              open={isEditProfileOpen}
              onOpenChange={setIsEditProfileOpen}
              role={(user?.role as any) || 'doctor'}
              name={user?.name}
              specialization={user?.specialization}
              avatar={user?.avatar}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;