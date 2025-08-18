import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBookingById, Booking } from '@/lib/bookingApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Calendar, Clock, User, Building, Stethoscope, FlaskConical, Pill, CheckCircle, ArrowLeft } from 'lucide-react';

const BookingDetailPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        setIsLoading(true);
        const data = await getBookingById(bookingId);
        setBooking(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch booking details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const getProviderIcon = (role: string) => {
    switch (role) {
      case 'doctor': return <Stethoscope className="w-6 h-6 text-blue-600" />;
      case 'clinic':
      case 'hospital': return <Building className="w-6 h-6 text-green-600" />;
      case 'laboratory': return <FlaskConical className="w-6 h-6 text-purple-600" />;
      case 'pharmacy': return <Pill className="w-6 h-6 text-red-600" />;
      default: return <User className="w-6 h-6 text-gray-600" />;
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading booking details...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!booking) {
    return <div className="container mx-auto px-4 py-8 text-center">Booking not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/dashboard" className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <CheckCircle className="w-6 h-6" />
                        Booking Confirmed
                    </CardTitle>
                    <CardDescription className="text-blue-100 mt-1">
                        Your booking details are below. A confirmation has been sent to your email.
                    </CardDescription>
                </div>
                <div className="text-right">
                    <p className="text-sm text-blue-200">Booking ID</p>
                    <p className="font-mono text-lg">{booking._id}</p>
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Service Details */}
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex items-center justify-center shadow-md">
                {getProviderIcon(booking.provider.role)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-2xl text-gray-900 mb-2">{booking.serviceSnapshot.name}</h3>
                <p className="text-gray-600 leading-relaxed">{booking.serviceSnapshot.description}</p>
              </div>
            </div>

            <Separator />

            {/* Booking Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Booking Status</p>
                    <Badge className={`capitalize text-base ${booking.bookingStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{booking.bookingStatus}</Badge>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Booking Date</p>
                    <p className="font-medium text-gray-900 text-base flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(booking.createdAt), 'PPP')}
                    </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Booking Time</p>
                    <p className="font-medium text-gray-900 text-base flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        {format(new Date(booking.createdAt), 'p')}
                    </p>
                </div>
            </div>

            <Separator />

            {/* Provider & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-4">Provider Details</h4>
                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                         <div className="flex items-center gap-4">
                            {getProviderIcon(booking.provider.role)}
                            <div>
                                <p className="text-sm text-gray-500">Provider Name</p>
                                <p className="font-medium text-gray-900">{booking.provider.name}</p>
                            </div>
                        </div>
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-4">Payment Summary</h4>
                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Payment Method</span>
                            <span className="font-medium capitalize">{booking.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Amount</span>
                            <span className="font-bold text-xl text-green-600">PKR {booking.serviceSnapshot.price.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

             <div className="text-center mt-8">
                <p className="text-sm text-gray-500">Need help? <Link to="/contact" className="text-blue-600 hover:underline">Contact Support</Link></p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingDetailPage;
