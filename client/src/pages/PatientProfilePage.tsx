import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Heart, 
  FileText, 
  Clock,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import EditProfileDialog from '@/components/EditProfileDialog';

interface PatientUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  emergencyContact?: string;
  medicalHistory?: string[];
  allergies?: string[];
  isVerified?: boolean;
  createdAt: string;
}

interface Booking {
  _id: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  providerType: string;
  amount: number;
  status: string;
  bookingDate: string;
  appointmentDate?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const PatientProfilePage = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [patientUser, setPatientUser] = useState<PatientUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'medical'>('overview');

  const isOwnProfile = user?.id === patientId;
  const canEdit = isOwnProfile;
  const canViewMedical = isOwnProfile || (user?.role !== 'patient');

  // Normalize avatar URL
  const avatarSrc = patientUser?.avatar ? 
    (patientUser.avatar.startsWith('http') ? patientUser.avatar : patientUser.avatar) : 
    undefined;

  // Fetch patient user data
  useEffect(() => {
    const fetchPatientUser = async () => {
      if (!patientId) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/user/public/${patientId}`);
        if (response.ok) {
          const userData = await response.json();
          setPatientUser(userData);
        } else {
          toast.error("Failed to load patient profile");
        }
      } catch (error) {
        console.error("Error fetching patient user:", error);
        toast.error("Error loading patient profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientUser();
  }, [patientId]);

  // Fetch patient bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!patientId) return;
      
      setBookingsLoading(true);
      try {
        const response = await fetch(`/api/bookings/patient/${patientId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setBookings(Array.isArray(data) ? data : (data?.bookings || []));
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setBookingsLoading(false);
      }
    };

    if (canViewMedical) {
      fetchBookings();
    } else {
      setBookingsLoading(false);
    }
  }, [patientId, canViewMedical]);

  // Refetch bookings when navigating to this page (for sync with dashboard deletions)
  useEffect(() => {
    const refetchBookings = async () => {
      if (patientId && canViewMedical) {
        try {
          const response = await fetch(`/api/bookings/patient/${patientId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setBookings(Array.isArray(data) ? data : (data?.bookings || []));
          }
        } catch (error) {
          console.error("Error refetching bookings:", error);
        }
      }
    };

    // Refetch when location changes (navigation)
    refetchBookings();
  }, [location.pathname, patientId, canViewMedical]);

  // Also refetch when page becomes visible (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && patientId && canViewMedical) {
        const fetchBookings = async () => {
          try {
            const response = await fetch(`/api/bookings/patient/${patientId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`
              }
            });
            if (response.ok) {
              const data = await response.json();
              setBookings(Array.isArray(data) ? data : (data?.bookings || []));
            }
          } catch (error) {
            console.error("Error refetching bookings:", error);
          }
        };
        fetchBookings();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [patientId, canViewMedical]);

  const getStatusColor = (status: string) => {
    const s = (status || '').toString().toLowerCase();
    switch (s) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    const s = (status || '').toString().toLowerCase();
    switch (s) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'confirmed':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  // Delete a single booking (same as dashboard)
  const handleDeleteBooking = async (bookingId: string) => {
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
      } else {
        toast.error('Failed to delete booking');
      }
    } catch (error) {
      toast.error('Failed to delete booking');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Loading Patient Profile...</h1>
            <p className="text-gray-500">Please wait while we load the profile information</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patientUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Patient Not Found</h1>
            <p className="text-gray-500">The requested patient profile could not be found</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/30">
      {/* Profile Hero Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-100 to-purple-200 border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 py-7">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <span className="inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm">
              <User className="w-5 h-5" />
            </span>
            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                {patientUser.name} — Patient Profile
              </h1>
              <p className="mt-1 text-xs text-gray-600">
                {isOwnProfile ? 'Your patient profile' : 'Patient information'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto px-4 py-8">
        {/* Left Sidebar - Patient Information */}
        <div className="w-full xl:w-96 xl:flex-shrink-0 xl:order-1">
          <div className="xl:sticky xl:top-8">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[560px]">
              {/* Header with blue gradient */}
              <div className="bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-300 p-8 text-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-700/22 to-purple-900/22"></div>
                <div className="relative z-10">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="p-1.5 rounded-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 shadow-2xl">
                        <Avatar className="w-24 h-24 rounded-full bg-white ring-2 ring-white">
                          <AvatarImage
                            src={avatarSrc}
                            alt={patientUser.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-white text-gray-700 text-2xl font-bold">
                            {patientUser.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 shadow-lg">
                        <Heart className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-gray-800">{patientUser.name}</h1>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-medium px-3 py-1">
                      <User className="w-4 h-4 mr-1" />
                      Patient
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Patient Details - Compact with contact info */}
              <div className="p-6 space-y-6 flex-1 bg-white">
                <div className="flex items-center justify-center">
                  <Badge className="bg-green-50 text-green-700 border-green-200 px-4 py-2 font-semibold">
                    <Shield className="w-4 h-4 mr-2" />
                    Verified Patient
                  </Badge>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                {/* Contact - email and registered phone only */}
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Contact</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-gray-800">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm break-all">{patientUser.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-800">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{patientUser.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                {/* Member Since - small foot info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Member Since</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(patientUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 xl:order-2">
          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              {canViewMedical && (
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'bookings'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Booking History
                </button>
              )}
              <button
                onClick={() => setActiveTab('medical')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'medical'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Wellness
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <Card className="shadow-lg border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Patient Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Friendly Summary */}
                  <div className="rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-5 border border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">
                          Hi {patientUser.name.split(' ')[0]}, wishing you good health!
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Member since {new Date(patientUser.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                        <div className="rounded-lg bg-white border border-gray-200 p-3 text-center">
                          <div className="text-xs text-gray-500">Total Bookings</div>
                          <div className="text-lg font-bold text-gray-900">{bookings.length}</div>
                        </div>
                        <div className="rounded-lg bg-white border border-gray-200 p-3 text-center">
                          <div className="text-xs text-gray-500">Completed</div>
                          <div className="text-lg font-bold text-green-600">{bookings.filter(b => (b.status || '').toLowerCase() === 'completed').length}</div>
                        </div>
                        <div className="rounded-lg bg-white border border-gray-200 p-3 text-center">
                          <div className="text-xs text-gray-500">Pending</div>
                          <div className="text-lg font-bold text-amber-600">{bookings.length - bookings.filter(b => (b.status || '').toLowerCase() === 'completed').length}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patientUser.dateOfBirth && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Date of Birth</h4>
                        <p className="text-gray-900">{new Date(patientUser.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                    )}
                    {patientUser.gender && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Gender</h4>
                        <p className="text-gray-900 capitalize">{patientUser.gender}</p>
                      </div>
                    )}
                    {patientUser.emergencyContact && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Emergency Contact</h4>
                        <p className="text-gray-900">{patientUser.emergencyContact}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'bookings' && canViewMedical && (
            <div className="space-y-6">
              <Card className="shadow-lg border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Booking History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Loading bookings...</p>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No bookings found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{booking.serviceName}</h4>
                              <p className="text-sm text-gray-600 mb-2">
                                Provider: {booking.providerName} ({booking.providerType})
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(booking.createdAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <CreditCard className="w-3 h-3" />
                                  PKR {Number(booking?.amount ?? 0).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
                                {getStatusIcon(booking.status)}
                                {(booking.status || '').toString()}
                              </Badge>
                              {isOwnProfile && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteBooking(booking._id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="space-y-6">
              {/* Wellness Hero */}
              <div className="rounded-2xl p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-100">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-emerald-900">Wellness & Healthy Habits</h3>
                </div>
                <p className="text-sm text-emerald-700">Small daily steps make a big difference. Keep moving, stay hydrated, and rest well.</p>
              </div>

              {/* Quick Goals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border p-4 bg-white">
                  <div className="text-sm text-gray-500 mb-1">Hydration</div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-cyan-500 rounded-full" style={{ width: '70%' }} />
                  </div>
                  <div className="text-xs text-gray-500 mt-2">~ 7/10 glasses</div>
                </div>
                <div className="rounded-xl border p-4 bg-white">
                  <div className="text-sm text-gray-500 mb-1">Steps</div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-emerald-500 rounded-full" style={{ width: '55%' }} />
                  </div>
                  <div className="text-xs text-gray-500 mt-2">~ 5,500 / 10,000</div>
                </div>
                <div className="rounded-xl border p-4 bg-white">
                  <div className="text-sm text-gray-500 mb-1">Sleep</div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-indigo-500 rounded-full" style={{ width: '80%' }} />
                  </div>
                  <div className="text-xs text-gray-500 mt-2">~ 8 / 10 hours</div>
                </div>
              </div>

              {/* Tips List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border p-4 bg-white">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Daily Tips</h4>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Drink a glass of water every hour</li>
                    <li>Take a 10-minute walk after meals</li>
                    <li>Add fruits and veggies to your plate</li>
                  </ul>
                </div>
                <div className="rounded-xl border p-4 bg-white">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Mind & Mood</h4>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Pause for 3 deep breaths</li>
                    <li>Write one thing you’re grateful for</li>
                    <li>Take a 5-minute stretch break</li>
                  </ul>
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-xl border p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90">Weekly challenge</div>
                  <div className="text-base font-semibold">Walk 70,000 steps this week</div>
                </div>
                <button className="px-4 py-2 bg-white text-blue-700 rounded-lg text-sm font-medium hover:bg-white/90">Join</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      {editDialogOpen && (
        <EditProfileDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          role="doctor"
          name={patientUser?.name}
          avatar={patientUser?.avatar}
        />
      )}
    </div>
  );
};

export default PatientProfilePage;
