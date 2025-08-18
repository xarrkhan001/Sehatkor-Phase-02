import { useEffect, useState } from 'react';
import { getMyBookings, Booking } from '@/lib/bookingApi';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getMyBookings();
        setBookings(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch bookings.');
        toast({
          title: 'Error',
          description: err.message || 'Could not fetch your bookings.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [toast]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading your bookings...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      {bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking._id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{booking.serviceSnapshot.name}</span>
                  <Badge variant={booking.bookingStatus === 'confirmed' ? 'success' : 'default'}>
                    {booking.bookingStatus}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Provider:</strong> {booking.provider.name}</p>
                <p><strong>Booked On:</strong> {format(new Date(booking.createdAt), 'PPP')}</p>
                <p><strong>Price:</strong> PKR {booking.serviceSnapshot.price.toLocaleString()}</p>
                <p><strong>Payment:</strong> {booking.paymentMethod} ({booking.paymentStatus})</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
