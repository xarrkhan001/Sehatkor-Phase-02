import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiUrl } from '@/config/api';
import RegistrationUpdateModal from './RegistrationUpdateModal';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText, 
  Shield,
  X
} from "lucide-react";

interface VerificationStatus {
  user: {
    isVerified: boolean;
    verificationStatus: string;
    hasLicenseNumber: boolean;
  };
  registrationVerification: {
    id: string;
    registrationNumber: string;
    status: string;
    submittedAt: string;
    reviewedAt?: string;
    adminNotes?: string;
  } | null;
}

const RegistrationVerification: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch(apiUrl('/api/verification/my-status'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVerificationStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
    
    // Set up interval to refresh status every 30 seconds
    const interval = setInterval(() => {
      fetchVerificationStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmitRegistration = async () => {
    if (!registrationNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter your registration number",
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
        body: JSON.stringify({ registrationNumber: registrationNumber.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        });
        setRegistrationNumber('');
        fetchVerificationStatus(); // Refresh status
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to submit registration number",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit registration number",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <X className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Review</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show for patients
  if (user?.role === 'patient') {
    return null;
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Registration Verification
        </CardTitle>
        <CardDescription className="text-blue-100">
          Submit your professional registration number to get verified
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {verificationStatus?.registrationVerification ? (
          // Show existing verification status
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Registration Number Verification</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchVerificationStatus}
                  disabled={isLoading}
                >
                  Refresh Status
                </Button>
                <Badge variant={verificationStatus.user.isVerified ? "default" : "secondary"}>
                  {verificationStatus.user.isVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                {getStatusIcon(verificationStatus.registrationVerification.status)}
                <div>
                  <h4 className="font-medium">Registration Number: {verificationStatus.registrationVerification.registrationNumber}</h4>
                  <p className="text-sm text-muted-foreground">
                    Submitted: {new Date(verificationStatus.registrationVerification.submittedAt).toLocaleDateString()}
                  </p>
                  {verificationStatus.registrationVerification.reviewedAt && (
                    <p className="text-sm text-muted-foreground">
                      Reviewed: {new Date(verificationStatus.registrationVerification.reviewedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {getStatusBadge(verificationStatus.registrationVerification.status)}
            </div>

            {verificationStatus.registrationVerification.status === 'pending' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Verification in Progress</h4>
                    <p className="text-sm text-yellow-700">
                      Your registration number is being reviewed by our admin team. You'll be notified once the verification is complete.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {verificationStatus.registrationVerification.status === 'approved' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800">Verification Approved </h4>
                    <p className="text-sm text-green-700 mb-3">
                      Congratulations! Your registration number has been verified. You are now a verified provider.
                    </p>
                    <Button 
                      onClick={() => setIsUpdateModalOpen(true)}
                      variant="outline"
                      size="sm"
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      Update Registration Number
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {verificationStatus.registrationVerification.status === 'rejected' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-800">Verification Rejected</h4>
                    <p className="text-sm text-red-700 mb-3">
                      Your registration number could not be verified. You can submit a new registration number below.
                    </p>
                    {verificationStatus.registrationVerification.adminNotes && (
                      <div className="bg-white p-3 rounded border border-red-300 mb-3">
                        <p className="text-sm font-medium text-red-800 mb-1">Admin Notes:</p>
                        <p className="text-xs text-red-600">{verificationStatus.registrationVerification.adminNotes}</p>
                      </div>
                    )}
                    <Button 
                      onClick={() => {
                        setVerificationStatus(null);
                        setRegistrationNumber('');
                      }}
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Submit New Registration Number
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Show registration form
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Get Verified</h4>
                  <p className="text-sm text-blue-700">
                    Submit your professional registration number to become a verified provider. This helps patients trust your services.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="registrationNumber">Professional Registration Number</Label>
                <Input
                  id="registrationNumber"
                  type="text"
                  placeholder="Enter your registration number"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your medical license, pharmacy license, or laboratory registration number
                </p>
              </div>

              <Button 
                onClick={handleSubmitRegistration}
                disabled={isSubmitting || !registrationNumber.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit for Verification'
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Registration Update Modal */}
      <RegistrationUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        currentRegistrationNumber={verificationStatus?.registrationVerification?.registrationNumber}
        onSuccess={fetchVerificationStatus}
      />
    </Card>
  );
};

export default RegistrationVerification;
