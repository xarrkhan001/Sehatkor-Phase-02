import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield,
  FileText,
  Eye,
  UserCheck,
  Building,
  FlaskConical,
  ShoppingBag
} from "lucide-react";
import { apiUrl } from '@/config/api';

interface RegistrationVerification {
  id: string;
  registrationNumber: string;
  providerType: string;
  status: string;
  submittedAt: string;
  provider: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    avatar?: string;
    businessName?: string;
  };
}

const RegistrationVerificationAdmin: React.FC = () => {
  const { toast } = useToast();
  const [verifications, setVerifications] = useState<RegistrationVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<RegistrationVerification | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sehatkor_token') || localStorage.getItem('token');
      console.log('Fetching from:', apiUrl('/api/verification/pending'));
      console.log('Using token:', token ? 'Present' : 'Missing');
      const response = await fetch(apiUrl('/api/verification/pending'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVerifications(data.verifications || []);
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        toast({
          title: "Error",
          description: `Failed to fetch pending verifications (${response.status})`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending verifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const handleApprove = async (verificationId: string) => {
    try {
      setActionLoading(verificationId);
      const token = localStorage.getItem('sehatkor_token') || localStorage.getItem('token');
      const response = await fetch(apiUrl(`/api/verification/${verificationId}/approve`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ adminNotes }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Registration verification approved successfully",
        });
        fetchPendingVerifications();
        setIsReviewDialogOpen(false);
        setSelectedVerification(null);
        setAdminNotes('');
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Failed to approve verification",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve verification",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (verificationId: string) => {
    try {
      setActionLoading(verificationId);
      const token = localStorage.getItem('sehatkor_token') || localStorage.getItem('token');
      const response = await fetch(apiUrl(`/api/verification/${verificationId}/reject`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ adminNotes }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Registration verification rejected",
        });
        fetchPendingVerifications();
        setIsReviewDialogOpen(false);
        setSelectedVerification(null);
        setAdminNotes('');
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Failed to reject verification",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject verification",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openReviewDialog = (verification: RegistrationVerification) => {
    setSelectedVerification(verification);
    setAdminNotes('');
    setIsReviewDialogOpen(true);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "doctor":
        return <UserCheck className="w-4 h-4" />;
      case "clinic/hospital":
        return <Building className="w-4 h-4" />;
      case "laboratory":
        return <FlaskConical className="w-4 h-4" />;
      case "pharmacy":
        return <ShoppingBag className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getProviderTypeLabel = (type: string) => {
    switch (type) {
      case "clinic/hospital":
        return "Clinic/Hospital";
      case "laboratory":
        return "Laboratory";
      case "pharmacy":
        return "Pharmacy";
      case "doctor":
        return "Doctor";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Card className="card-healthcare">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-healthcare">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Registration Number Verifications ({verifications.length})
          </CardTitle>
          <CardDescription>
            Review and approve provider registration numbers for verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verifications.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-xl text-muted-foreground mb-2">No Pending Registration Verifications</p>
              <p className="text-muted-foreground">All registration numbers have been reviewed</p>
            </div>
          ) : (
            <>
              {/* Mobile Card List */}
              <div className="space-y-3 lg:hidden">
                {verifications.map((verification) => (
                  <div key={verification.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shrink-0">
                        {getRoleIcon(verification.provider.role)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{verification.provider.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{verification.provider.email}</p>
                      </div>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600 shrink-0">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                    <div className="mt-3 text-sm">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline">{getProviderTypeLabel(verification.providerType)}</Badge>
                        <span className="text-muted-foreground">{verification.provider.phone}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        <span className="font-medium">Registration #: </span>
                        <span className="font-mono">{verification.registrationNumber}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Submitted: {new Date(verification.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openReviewDialog(verification)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-success hover:bg-success/90"
                        onClick={() => openReviewDialog(verification)}
                        disabled={actionLoading === verification.id}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => openReviewDialog(verification)}
                        disabled={actionLoading === verification.id}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <Table className="hidden lg:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Registration Number</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verifications.map((verification) => (
                    <TableRow key={verification.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                            {getRoleIcon(verification.provider.role)}
                          </div>
                          <div>
                            <p className="font-medium">{verification.provider.name}</p>
                            <p className="text-sm text-muted-foreground">{verification.provider.email}</p>
                            {verification.provider.businessName && (
                              <p className="text-xs text-muted-foreground">{verification.provider.businessName}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getProviderTypeLabel(verification.providerType)}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                          {verification.registrationNumber}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{new Date(verification.submittedAt).toLocaleDateString()}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openReviewDialog(verification)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-success hover:bg-success/90"
                            onClick={() => openReviewDialog(verification)}
                            disabled={actionLoading === verification.id}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => openReviewDialog(verification)}
                            disabled={actionLoading === verification.id}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Review Registration Verification
            </DialogTitle>
            <DialogDescription>
              Review the provider's registration number and decide whether to approve or reject the verification.
            </DialogDescription>
          </DialogHeader>
          
          {selectedVerification && (
            <div className="space-y-6 pr-2">
              {/* Provider Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Provider Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Name</Label>
                    <p className="text-sm">{selectedVerification.provider.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-sm">{selectedVerification.provider.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                    <p className="text-sm">{selectedVerification.provider.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Provider Type</Label>
                    <p className="text-sm">{getProviderTypeLabel(selectedVerification.providerType)}</p>
                  </div>
                  {selectedVerification.provider.businessName && (
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-gray-600">Business Name</Label>
                      <p className="text-sm">{selectedVerification.provider.businessName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Registration Details */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Registration Details</h3>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Registration Number</Label>
                    <p className="text-lg font-mono bg-white p-2 rounded border">
                      {selectedVerification.registrationNumber}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Submitted On</Label>
                    <p className="text-sm">{new Date(selectedVerification.submittedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <Label htmlFor="adminNotes" className="text-sm font-medium">
                  Admin Notes (Optional)
                </Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Add any notes about this verification decision..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsReviewDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleReject(selectedVerification.id)}
                  disabled={actionLoading === selectedVerification.id}
                >
                  {actionLoading === selectedVerification.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Reject
                </Button>
                <Button 
                  className="bg-success hover:bg-success/90"
                  onClick={() => handleApprove(selectedVerification.id)}
                  disabled={actionLoading === selectedVerification.id}
                >
                  {actionLoading === selectedVerification.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Approve & Verify
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RegistrationVerificationAdmin;
