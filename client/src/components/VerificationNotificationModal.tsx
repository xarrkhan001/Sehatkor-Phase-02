import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl } from '@/config/api';

interface VerificationNotification {
  id: string;
  type: 'approved' | 'rejected';
  registrationNumber: string;
  adminNotes?: string;
  timestamp: string;
}

const VerificationNotificationModal: React.FC = () => {
  const { user } = useAuth();
  const [notification, setNotification] = useState<VerificationNotification | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const checkForNotifications = async () => {
    if (!user) return;

    try {
      const response = await fetch(apiUrl('/api/verification/notifications'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.notification) {
          setNotification(data.notification);
          setIsOpen(true);
        }
      }
    } catch (error) {
      console.error('Failed to check notifications:', error);
    }
  };

  useEffect(() => {
    // Check for notifications on component mount
    checkForNotifications();

    // Set up interval to check every 30 seconds
    const interval = setInterval(checkForNotifications, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleClose = async () => {
    if (notification) {
      // Mark notification as read
      try {
        await fetch(apiUrl(`/api/verification/notifications/${notification.id}/read`), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
          },
        });
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    
    setIsOpen(false);
    setNotification(null);
  };

  if (!notification) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {notification.type === 'approved' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <X className="w-5 h-5 text-red-600" />
            )}
            Registration {notification.type === 'approved' ? 'Approved' : 'Rejected'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {notification.type === 'approved' ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-800">🎉 Congratulations!</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your registration number <strong>{notification.registrationNumber}</strong> has been verified successfully.
                  </p>
                  <p className="text-sm text-green-700 mt-2">
                    You are now a verified provider and can access all platform features.
                  </p>
                  <div className="mt-3 p-2 bg-white rounded border border-green-300">
                    <p className="text-xs text-green-600">
                      💡 Need to update your registration number? You can submit a new one anytime from your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Verification Rejected</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Your registration number <strong>{notification.registrationNumber}</strong> could not be verified.
                  </p>
                  {notification.adminNotes && (
                    <div className="mt-3 p-2 bg-white rounded border border-red-300">
                      <p className="text-xs font-medium text-red-800">Admin Notes:</p>
                      <p className="text-xs text-red-600 mt-1">{notification.adminNotes}</p>
                    </div>
                  )}
                  <p className="text-sm text-red-700 mt-2">
                    You can submit a new registration number from your dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationNotificationModal;
