import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  CreditCard,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Booking {
  _id: string;
  patientName: string;
  providerName: string;
  providerType: string;
  serviceName: string;
  price: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  scheduledTime?: string;
  variantLabel?: string;
  location?: string;
  phone?: string;
}

interface PatientBookingHistoryProps {
  patientId: string;
}

const PatientBookingHistory: React.FC<PatientBookingHistoryProps> = ({ patientId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [patientId]);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings/patient/${patientId}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (error) {
      toast.error('Failed to fetch booking history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { variant: any; icon: any; label: string } } = {
      'Confirmed': { variant: 'default', icon: CheckCircle, label: 'Confirmed' },
      'Scheduled': { variant: 'secondary', icon: Calendar, label: 'Scheduled' },
      'Completed': { variant: 'outline', icon: CheckCircle, label: 'Completed' },
      'Cancelled': { variant: 'destructive', icon: AlertCircle, label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { variant: 'outline', icon: AlertCircle, label: status };
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const variants: { [key: string]: any } = {
      easypaisa: { variant: "default", label: "EasyPaisa" },
      jazzcash: { variant: "secondary", label: "JazzCash" }
    };
    
    const config = variants[method] || { variant: "outline", label: method };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading booking history...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          My Bookings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <div>No bookings yet</div>
            <div className="text-sm">Your service bookings will appear here</div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{booking.serviceName}</h4>
                    {booking.variantLabel && (
                      <div className="text-sm text-muted-foreground">{booking.variantLabel}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(booking.status)}
                    <div className="text-sm font-medium">
                      {booking.currency} {booking.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{booking.providerName}</span>
                    <Badge variant="outline" className="text-xs">
                      {booking.providerType}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Booked: {new Date(booking.createdAt).toLocaleDateString()}</span>
                  </div>

                  {booking.scheduledTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Scheduled: {new Date(booking.scheduledTime).toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    {getPaymentMethodBadge(booking.paymentMethod)}
                  </div>

                  {booking.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{booking.location}</span>
                    </div>
                  )}

                  {booking.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{booking.phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t flex gap-2">
                  {booking.status === 'Confirmed' && (
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4 mr-1" />
                      Contact Provider
                    </Button>
                  )}
                  
                  {booking.status === 'Completed' && (
                    <Button size="sm" variant="outline">
                      Leave Review
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientBookingHistory;
