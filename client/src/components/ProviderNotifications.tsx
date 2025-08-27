import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, Clock, User, CreditCard, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface BookingNotification {
  _id: string;
  patientName: string;
  patientContact: string;
  serviceName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  variantLabel?: string;
  location?: string;
  phone?: string;
  read?: boolean;
}

interface ProviderNotificationsProps {
  providerId: string;
}

const ProviderNotifications: React.FC<ProviderNotificationsProps> = ({ providerId }) => {
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [providerId]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/bookings/provider/${providerId}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Sort by newest first and add read status
        const sortedNotifications = data
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map(notification => ({
            ...notification,
            read: notification.read || false
          }));
        
        setNotifications(sortedNotifications);
        setUnreadCount(sortedNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification._id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { variant: any; label: string } } = {
      'Confirmed': { variant: 'default', label: 'New Booking' },
      'Scheduled': { variant: 'secondary', label: 'Scheduled' },
      'Completed': { variant: 'outline', label: 'Completed' },
      'Cancelled': { variant: 'destructive', label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentMethodIcon = (method: string) => {
    return <CreditCard className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading notifications...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Service Bookings
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <div>No service bookings yet</div>
            <div className="text-sm">You'll see notifications here when patients book your services</div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 border rounded-lg transition-colors ${
                  !notification.read 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => !notification.read && markAsRead(notification._id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(notification.status)}
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{notification.patientName}</span>
                    <span className="text-muted-foreground">booked</span>
                    <span className="font-medium">{notification.serviceName}</span>
                  </div>

                  {notification.variantLabel && (
                    <div className="text-sm text-muted-foreground ml-6">
                      Variant: {notification.variantLabel}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground ml-6">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {notification.patientContact}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {getPaymentMethodIcon(notification.paymentMethod)}
                      {notification.currency} {notification.amount.toLocaleString()}
                    </div>
                  </div>

                  {notification.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground ml-6">
                      <MapPin className="w-3 h-3" />
                      {notification.location}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t">
                  <div className="flex gap-2">
                    {notification.status === 'Confirmed' && (
                      <Button size="sm" variant="outline">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accept Booking
                      </Button>
                    )}
                    
                    <Button size="sm" variant="ghost">
                      <Phone className="w-4 h-4 mr-1" />
                      Contact Patient
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProviderNotifications;
