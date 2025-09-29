import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CreditCard,
  Filter,
  Search,
  Eye,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { apiUrl } from '@/config/api';

interface Payment {
  _id: string;
  patientName: string;
  patientId?: string;
  patientContact: string;
  providerName: string;
  providerType: string;
  serviceName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentNumber: string;
  transactionId: string;
  paymentStatus: string;
  serviceCompleted: boolean;
  releasedToProvider: boolean;
  releaseDate?: string;
  createdAt: string;
  completionDate?: string;
  metadata?: {
    isDonation?: boolean;
    donationNote?: string;
    [key: string]: any;
  };
}

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  pendingRelease: number;
  releasedPayments: number;
  paymentsByMethod: Array<{ _id: string; count: number; total: number }>;
  paymentsByProviderType: Array<{ _id: string; count: number; total: number }>;
}

const AdminPaymentRecords: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerTypeFilter, setProviderTypeFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [releasingPayment, setReleasingPayment] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [statusFilter, providerTypeFilter]);

  const fetchPayments = async () => {
    try {
      console.log('📋 Fetching payment records...');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (providerTypeFilter !== 'all') params.append('providerType', providerTypeFilter);

      const response = await fetch(apiUrl(`/api/payments?${params.toString()}`));
      console.log('📊 Payment records response status:', response.status);
      
      const data = await response.json();
      console.log('📝 Payment records data:', data);

      if (data.success) {
        setPayments(data.payments);
      } else {
        console.error('❌ Failed to fetch payments:', data.message);
        toast.error(data.message || 'Failed to fetch payments');
      }
    } catch (error) {
      console.error('💥 Payment fetch error:', error);
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('📈 Fetching payment statistics...');
      const response = await fetch(apiUrl('/api/payments/stats'));
      console.log('📊 Payment stats response status:', response.status);
      
      const data = await response.json();
      console.log('📋 Payment stats data:', data);

      if (data.success) {
        setStats(data.stats);
      } else {
        console.error('❌ Failed to fetch payment stats:', data.message);
      }
    } catch (error) {
      console.error('💥 Payment stats fetch error:', error);
    }
  };

  const markServiceCompleted = async (paymentId: string) => {
    try {
      console.log('✅ Marking service as completed:', paymentId);
      const response = await fetch(apiUrl(`/api/payments/${paymentId}/complete`), {
        method: 'PUT',
      });

      console.log('🔄 Service completion response status:', response.status);
      const data = await response.json();
      console.log('📋 Service completion data:', data);

      if (data.success) {
        console.log('✅ Service marked as completed successfully');
        toast.success('Service marked as completed');
        fetchPayments();
        fetchStats();
      } else {
        console.error('❌ Failed to mark service as completed:', data.message);
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('💥 Service completion error:', error);
      toast.error(error.message || 'Failed to mark service as completed');
    }
  };

  const releasePayment = async () => {
    if (!selectedPayment) return;

    setReleasingPayment(true);
    try {
      console.log('💰 Releasing payment to provider:', selectedPayment._id);
      const adminId = localStorage.getItem('userId') || 'admin-user';
      
      const response = await fetch(apiUrl(`/api/payments/${selectedPayment._id}/release`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: adminId,
          releaseNotes
        }),
      });

      console.log('💸 Payment release response status:', response.status);
      const data = await response.json();
      console.log('📋 Payment release data:', data);

      if (data.success) {
        console.log('✅ Payment released successfully to provider');
        toast.success('Payment released to provider successfully');
        setSelectedPayment(null);
        setReleaseNotes('');
        fetchPayments();
        fetchStats();
      } else {
        console.error('❌ Payment release failed:', data.message);
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('💥 Payment release error:', error);
      toast.error(error.message || 'Failed to release payment');
    } finally {
      setReleasingPayment(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadge = (payment: Payment) => {
    const isDonation = payment?.metadata?.isDonation || payment.providerType === 'admin';
    if (isDonation) {
      return <Badge variant="secondary">Donation</Badge>;
    }
    if (payment.releasedToProvider) {
      return <Badge variant="default">Released</Badge>;
    }
    if (payment.serviceCompleted) {
      return <Badge variant="secondary">Pending Release</Badge>;
    }
    return <Badge variant="outline">Service Pending</Badge>;
  };

  const getPaymentMethodBadge = (method: string) => {
    const variants: { [key: string]: any } = {
      easypaisa: { variant: "default", label: "EasyPaisa" },
      jazzcash: { variant: "secondary", label: "JazzCash" }
    };

    const config = variants[method] || { variant: "outline", label: method };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">PKR {stats.totalAmount.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalPayments}</div>
                  <div className="text-sm text-muted-foreground">Total Bookings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.pendingRelease}</div>
                  <div className="text-sm text-muted-foreground">Pending Release</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.releasedPayments}</div>
                  <div className="text-sm text-muted-foreground">Released</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient, provider, service, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="released">Released</SelectItem>
              </SelectContent>
            </Select>

            <Select value={providerTypeFilter} onValueChange={setProviderTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="doctor">Doctors</SelectItem>
                <SelectItem value="hospital">Hospitals</SelectItem>
                <SelectItem value="lab">Labs</SelectItem>
                <SelectItem value="pharmacy">Pharmacies</SelectItem>
                <SelectItem value="admin">Donations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Records Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading payments...
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            <span 
                              className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                              onClick={() => window.open(`/patient/${payment.patientId || 'unknown'}`, '_blank')}
                            >
                              {payment.patientName}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">{payment.patientContact}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.providerType === 'admin' ? 'Sehat Kor Admin' : payment.providerName}</div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {payment.providerType === 'admin' ? 'donation' : payment.providerType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {payment.metadata?.isDonation || payment.providerType === 'admin' ? 'Donation' : payment.serviceName}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {payment.currency} {payment.amount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodBadge(payment.paymentMethod)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Payment Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Transaction ID</Label>
                                    <div className="font-mono text-sm">{payment.transactionId}</div>
                                  </div>
                                  <div>
                                    <Label>Payment Number</Label>
                                    <div className="font-mono text-sm">{payment.paymentNumber}</div>
                                  </div>
                                </div>
                                <div>
                                  <Label>Service Details</Label>
                                  <div className="text-sm">{payment.serviceName}</div>
                                </div>
                                {payment.releaseDate && (
                                  <div>
                                    <Label>Release Date</Label>
                                    <div className="text-sm">
                                      {new Date(payment.releaseDate).toLocaleString()}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Hide action buttons for donations */}
                          {!((payment.metadata?.isDonation || payment.providerType === 'admin')) && !payment.serviceCompleted && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markServiceCompleted(payment._id)}
                            >
                              Mark Complete
                            </Button>
                          )}

                          {(payment.serviceCompleted && !payment.releasedToProvider && !(payment.metadata?.isDonation || payment.providerType === 'admin')) && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => setSelectedPayment(payment)}
                                >
                                  Release Payment
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Release Payment to Provider</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Provider</Label>
                                    <div>{payment.providerName}</div>
                                  </div>
                                  <div>
                                    <Label>Amount</Label>
                                    <div className="font-semibold">
                                      {payment.currency} {payment.amount.toLocaleString()}
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="releaseNotes">Release Notes (Optional)</Label>
                                    <Textarea
                                      id="releaseNotes"
                                      placeholder="Add any notes about this payment release..."
                                      value={releaseNotes}
                                      onChange={(e) => setReleaseNotes(e.target.value)}
                                    />
                                  </div>
                                  <Button
                                    onClick={releasePayment}
                                    disabled={releasingPayment}
                                    className="w-full"
                                  >
                                    {releasingPayment ? 'Releasing...' : 'Confirm Release'}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPaymentRecords;
