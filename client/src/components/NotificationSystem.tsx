import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface NotificationContextType {
  sendBookingNotification: (providerId: string, bookingData: any) => void;
  sendPaymentNotification: (adminId: string, paymentData: any) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const sendBookingNotification = (providerId: string, bookingData: any) => {
    // In a real implementation, this would send a push notification or email
    // For now, we'll use a toast notification
    toast.success('Booking Confirmed!', {
      description: `Your service "${bookingData.serviceName}" has been booked successfully.`
    });
    
    // You can also emit a socket event here for real-time notifications
    // socket.emit('booking_notification', { providerId, bookingData });
  };

  const sendPaymentNotification = (adminId: string, paymentData: any) => {
    toast.info('Payment Received', {
      description: `Payment of ${paymentData.currency} ${paymentData.amount} received via ${paymentData.paymentMethod}`
    });
  };

  const value = {
    sendBookingNotification,
    sendPaymentNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
