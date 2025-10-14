import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiUrl } from '@/config/api';

interface RegistrationUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRegistrationNumber?: string;
  onSuccess?: () => void;
}

const RegistrationUpdateModal: React.FC<RegistrationUpdateModalProps> = ({
  isOpen,
  onClose,
  currentRegistrationNumber,
  onSuccess
}) => {
  const { toast } = useToast();
  const [newRegistrationNumber, setNewRegistrationNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newRegistrationNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter your new registration number",
        variant: "destructive"
      });
      return;
    }

    if (newRegistrationNumber.trim() === currentRegistrationNumber) {
      toast({
        title: "Error",
        description: "Please enter a different registration number",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(apiUrl('/api/verification/submit-registration'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
        body: JSON.stringify({ registrationNumber: newRegistrationNumber.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "New registration number submitted for verification",
        });
        setNewRegistrationNumber('');
        onSuccess?.();
        onClose();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to submit new registration number",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit new registration number",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNewRegistrationNumber('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Update Registration Number
          </DialogTitle>
          <DialogDescription>
            Submit a new registration number to replace your current one. It will need admin approval.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {currentRegistrationNumber && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <Label className="text-sm font-medium text-gray-600">Current Registration Number</Label>
              <p className="text-sm font-mono">{currentRegistrationNumber}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="newRegistrationNumber">New Registration Number</Label>
            <Input
              id="newRegistrationNumber"
              value={newRegistrationNumber}
              onChange={(e) => setNewRegistrationNumber(e.target.value)}
              placeholder="Enter your new registration number"
              disabled={isSubmitting}
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Your current verification status will remain active until the new registration number is approved by admin.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit New Number'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationUpdateModal;
