import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  User,
  Search,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  Calculator,
  Send,
  Eye,
  Filter,
  Trash2
} from 'lucide-react';

interface Payment {
  _id: string;
  serviceName: string;
  patientName: string;
  patientId?: string;
  amount: number;
  currency: string;
  serviceCompleted: boolean;
  releasedToProvider: boolean;
  releaseDate?: string;
  createdAt: string;
  completionDate?: string;
}

interface ProviderData {
  providerId: string;
  providerName: string;
  providerType: string;
  providerAvatar?: string;
  totalServices: number;
  completedServices: number;
  pendingServices: number;
  totalEarnings: number;
  pendingAmount: number;
  releasedAmount: number;
  payments: Payment[];
}

const AdminProviderPayments: React.FC = () => {
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ProviderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState<ProviderData | null>(null);
  const [bulkReleaseOpen, setBulkReleaseOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedProviderDetails, setSelectedProviderDetails] = useState<ProviderData | null>(null);
  const [commissionData, setCommissionData] = useState({
    adminCommission: 10, // percentage
    releaseAmount: 0,
    deductionAmount: 0,
    finalAmount: 0
  });
  // Local-only hide state so global stats/components remain unaffected (no localStorage persistence)
  const [hiddenProviders, setHiddenProviders] = useState<Set<string>>(new Set());
  const [hiddenPayments, setHiddenPayments] = useState<Record<string, Set<string>>>({});
  // Delete confirmation dialog state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTargetProviderId, setDeleteTargetProviderId] = useState<string | null>(null);
  const [deleteTargetProviderName, setDeleteTargetProviderName] = useState<string | null>(null);
  // Per-payment deleting state to keep rows independent
  const [deletingPayments, setDeletingPayments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchProviderPayments();
    // Clear any legacy localStorage keys to avoid perf impact
    try {
      localStorage.removeItem('sk_hidden_providers');
      localStorage.removeItem('sk_hidden_payments');
    } catch {}
  }, []);

  useEffect(() => {
    filterProviders();
  }, [providers, searchTerm, filterType, hiddenProviders]);

  // No localStorage syncing for hidden items

  const fetchProviderPayments = async () => {
    try {
      console.log('📊 Fetching provider payments data...');
      const response = await fetch('http://localhost:4000/api/payments/providers-summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Provider payments data received:', data);
        setProviders(data.providers || []);
      } else {
        console.error('❌ Failed to fetch provider payments:', response.status);
        toast.error('Failed to load provider payments');
      }
    } catch (error) {
      console.error('💥 Provider payments fetch error:', error);
      toast.error('Failed to load provider payments');
    } finally {
      setLoading(false);
    }
  };

  const filterProviders = () => {
    let filtered = providers;

    // Filter by search term (provider name or service name)
    if (searchTerm) {
      filtered = filtered.filter(provider => 
        provider.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.payments.some(payment => 
          payment.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.patientName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by provider type
    if (filterType !== 'all') {
      filtered = filtered.filter(provider => provider.providerType === filterType);
    }

    // Hide providers locally if requested
    filtered = filtered.filter(p => !hiddenProviders.has(p.providerId));

    setFilteredProviders(filtered);
  };

  const performHideProvider = async (providerId: string) => {
    try {
      const resp = await fetch(`http://localhost:4000/api/payments/providers/${providerId}/hide`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await resp.json();
      if (!resp.ok || data?.success === false) {
        throw new Error(data?.message || 'Failed to hide provider');
      }
      // Optimistically remove from current view and refetch
      setHiddenProviders(prev => new Set(prev).add(providerId));
      setProviders(prev => prev.filter(p => p.providerId !== providerId));
      filterProviders();
      fetchProviderPayments();
      toast.success('Provider hidden from Admin view');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Unable to hide provider');
    } finally {
      setConfirmDeleteOpen(false);
      setDeleteTargetProviderId(null);
      setDeleteTargetProviderName(null);
    }
  };

  const openDeleteConfirm = (provider: ProviderData) => {
    setDeleteTargetProviderId(provider.providerId);
    setDeleteTargetProviderName(provider.providerName);
    setConfirmDeleteOpen(true);
  };

  const hidePaymentFromView = (providerId: string, paymentId: string) => {
    if (window.confirm('Remove this payment from the current view? This will not delete any data.')) {
      setHiddenPayments(prev => {
        const next = { ...prev };
        const setForProvider = new Set(next[providerId] ?? []);
        setForProvider.add(paymentId);
        next[providerId] = setForProvider;
        return next;
      });
    }
  };

  // Remove a payment from admin view (soft delete for admin). We still hide locally first
  // to keep UI responsive, then refresh the summary to sync lists. Totals remain unchanged.
  const deletePaymentForProvider = async (providerId: string, paymentId: string) => {
    const key = `${providerId}:${paymentId}`;
    try {
      const confirmed = window.confirm('Remove this payment from the admin view? Totals will remain unchanged.');
      if (!confirmed) return;
      setDeletingPayments(prev => ({ ...prev, [key]: true }));
      const resp = await fetch(`http://localhost:4000/api/payments/${paymentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || data?.success === false) {
        throw new Error(data?.message || 'Failed to remove payment from admin view');
      }
      // Locally hide from this admin view for responsiveness
      setHiddenPayments(prev => {
        const next = { ...prev };
        const setForProvider = new Set(next[providerId] ?? []);
        setForProvider.add(paymentId);
        next[providerId] = setForProvider;
        return next;
      });
      toast.success('Payment removed from admin view');
      // Refresh in background to update provider lists (totals remain same)
      fetchProviderPayments();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Unable to remove payment from admin view');
    } finally {
      setDeletingPayments(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const calculateCommission = (provider: ProviderData) => {
    const totalPendingAmount = provider.pendingAmount;
    const deduction = (totalPendingAmount * commissionData.adminCommission) / 100;
    const finalAmount = totalPendingAmount - deduction;

    setCommissionData({
      ...commissionData,
      releaseAmount: totalPendingAmount,
      deductionAmount: deduction,
      finalAmount: finalAmount
    });
  };

  const handleBulkRelease = async () => {
    if (!selectedProvider) return;

    try {
      console.log('💸 Processing bulk payment release for provider:', selectedProvider.providerId);
      
      const response = await fetch(`http://localhost:4000/api/payments/bulk-release/${selectedProvider.providerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
        body: JSON.stringify({
          adminCommission: commissionData.adminCommission,
          deductionAmount: commissionData.deductionAmount,
          finalAmount: commissionData.finalAmount
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Bulk payment release successful:', data);
        toast.success(`Released PKR ${commissionData.finalAmount.toLocaleString()} to ${selectedProvider.providerName}`);
        setBulkReleaseOpen(false);
        setSelectedProvider(null);
        fetchProviderPayments(); // Refresh data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to release payments');
      }
    } catch (error) {
      console.error('💥 Bulk release error:', error);
      toast.error('Failed to process bulk payment release');
    }
  };

  const openBulkReleaseDialog = (provider: ProviderData) => {
    setSelectedProvider(provider);
    calculateCommission(provider);
    setBulkReleaseOpen(true);
  };

  const openDetailsDialog = (provider: ProviderData) => {
    setSelectedProviderDetails(provider);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading provider payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Provider Payment Management</h2>
          <p className="text-muted-foreground">Manage payments for all providers</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search providers or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="doctor">Doctors</SelectItem>
              <SelectItem value="hospital">Hospitals</SelectItem>
              <SelectItem value="laboratory">Labs</SelectItem>
              <SelectItem value="pharmacy">Pharmacies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid gap-6">
        {filteredProviders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No providers found</p>
            </CardContent>
          </Card>
        ) : (
          filteredProviders.map((provider) => (
            <Card key={provider.providerId} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-blue-200 shadow-sm">
                      <AvatarImage src={provider.providerAvatar || undefined} alt={provider.providerName} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {provider.providerName?.charAt(0) ?? 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{provider.providerName}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {provider.providerType.charAt(0).toUpperCase() + provider.providerType.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailsDialog(provider)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    
                    {provider.pendingAmount > 0 && (
                      <Button
                        size="sm"
                        onClick={() => openBulkReleaseDialog(provider)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Release Payments
                      </Button>
                    )}

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteConfirm(provider)}
                      className="sm:ml-2"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete (View)
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{provider.totalServices}</div>
                    <div className="text-sm text-muted-foreground">Total Services</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{provider.completedServices}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      PKR {provider.pendingAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Pending Release</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      PKR {provider.releasedAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Released</div>
                  </div>
                </div>

                {/* Recent Services */}
                <div>
                  <h4 className="font-medium mb-3">Recent Services</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {provider.payments
                      .filter((payment) => !hiddenPayments[provider.providerId]?.has(payment._id))
                      .slice(0, 5)
                      .map((payment) => (
                      <div key={payment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{payment.serviceName}</div>
                          <div className="text-xs text-muted-foreground">
                            Patient: <span 
                              className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                              onClick={() => window.open(`/patient/${payment.patientId || 'unknown'}`, '_blank')}
                            >
                              {payment.patientName}
                            </span> • 
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="text-right flex items-center gap-2">
                          <div className="font-medium text-sm">
                            {payment.currency} {payment.amount.toLocaleString()}
                          </div>
                          <Badge 
                            variant={payment.releasedToProvider ? "default" : payment.serviceCompleted ? "secondary" : "outline"}
                            className={`text-xs ${
                              payment.releasedToProvider ? "bg-green-600" : 
                              payment.serviceCompleted ? "bg-orange-500" : ""
                            }`}
                          >
                            {payment.releasedToProvider ? "Released" : 
                             payment.serviceCompleted ? "Pending" : "In Progress"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="icon"
                            title="Remove from admin view"
                            disabled={deletingPayments[`${provider.providerId}:${payment._id}`]}
                            onClick={() => deletePaymentForProvider(provider.providerId, payment._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {provider.payments.length > 5 && (
                      <div className="text-center text-sm text-muted-foreground">
                        +{provider.payments.length - 5} more services
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Bulk Release Dialog */}
      <Dialog open={bulkReleaseOpen} onOpenChange={setBulkReleaseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Release Payments</DialogTitle>
          </DialogHeader>
          
          {selectedProvider && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-medium">{selectedProvider.providerName}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedProvider.pendingServices} pending services
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="commission">Admin Commission (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    value={commissionData.adminCommission}
                    onChange={(e) => {
                      const commission = parseFloat(e.target.value) || 0;
                      const totalPendingAmount = selectedProvider.pendingAmount;
                      const deduction = (totalPendingAmount * commission) / 100;
                      const finalAmount = totalPendingAmount - deduction;
                      
                      setCommissionData({
                        adminCommission: commission,
                        releaseAmount: totalPendingAmount,
                        deductionAmount: deduction,
                        finalAmount: finalAmount
                      });
                    }}
                    min="0"
                    max="100"
                  />
                </div>

                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Total Amount:</span>
                    <span className="font-medium">PKR {commissionData.releaseAmount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Admin Commission ({commissionData.adminCommission}%):</span>
                    <span className="font-medium">-PKR {commissionData.deductionAmount.toLocaleString()}</span>
                  </div>
                  
                  <hr />
                  
                  <div className="flex justify-between font-medium text-green-600">
                    <span>Final Release Amount:</span>
                    <span>PKR {commissionData.finalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <Button onClick={handleBulkRelease} className="w-full">
                  <Calculator className="w-4 h-4 mr-2" />
                  Release PKR {commissionData.finalAmount.toLocaleString()}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove provider card from Admin view?</AlertDialogTitle>
            <AlertDialogDescription>
              This will not delete any provider data or affect global statistics. You can remove this card now and it will reappear automatically if new payments need release.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-md bg-muted p-3 text-sm">
            <span className="font-medium">Provider:</span> {deleteTargetProviderName}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTargetProviderId && performHideProvider(deleteTargetProviderId)}
            >
              Remove from View
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Provider Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-8 w-8 ring-2 ring-blue-200">
                <AvatarImage src={selectedProviderDetails?.providerAvatar || undefined} alt={selectedProviderDetails?.providerName} />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-sm">
                  {selectedProviderDetails?.providerName?.charAt(0) ?? 'P'}
                </AvatarFallback>
              </Avatar>
              {selectedProviderDetails?.providerName} - Payment Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedProviderDetails && (
            <div className="space-y-6">
              {/* Provider Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedProviderDetails.totalServices}</div>
                  <div className="text-sm text-muted-foreground">Total Services</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedProviderDetails.completedServices}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-2xl font-bold text-orange-600 text-center">
                  <div>PKR {selectedProviderDetails.pendingAmount.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">PKR {selectedProviderDetails.releasedAmount.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Released</div>
                </div>
              </div>

              {/* All Services List */}
              <div>
                <h3 className="text-lg font-semibold mb-4">All Services ({selectedProviderDetails.payments.length})</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedProviderDetails.payments
                    .filter((payment) => !hiddenPayments[selectedProviderDetails.providerId]?.has(payment._id))
                    .map((payment) => (
                    <div key={payment._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium">{payment.serviceName}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Patient: <span 
                              className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                              onClick={() => window.open(`/patient/${payment.patientId || 'unknown'}`, '_blank')}
                            >
                              {payment.patientName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                          {payment.releaseDate && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Released: {new Date(payment.releaseDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right flex items-center gap-2">
                        <div className="font-medium text-lg">
                          {payment.currency} {payment.amount.toLocaleString()}
                        </div>
                        <Badge 
                          variant={payment.releasedToProvider ? "default" : payment.serviceCompleted ? "secondary" : "outline"}
                          className={`text-xs ${
                            payment.releasedToProvider ? "bg-green-600" : 
                            payment.serviceCompleted ? "bg-orange-500" : ""
                          }`}
                        >
                          {payment.releasedToProvider ? "Released" : 
                           payment.serviceCompleted ? "Pending Release" : "Service Pending"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Remove from admin view"
                          disabled={deletingPayments[`${selectedProviderDetails.providerId}:${payment._id}`]}
                          onClick={() => deletePaymentForProvider(selectedProviderDetails.providerId, payment._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Provider Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Provider Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Provider ID:</span>
                      <span className="font-mono">{selectedProviderDetails.providerId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Provider Type:</span>
                      <Badge variant="outline">
                        {selectedProviderDetails.providerType.charAt(0).toUpperCase() + selectedProviderDetails.providerType.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Earnings:</span>
                      <span className="font-medium">PKR {selectedProviderDetails.totalEarnings.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Payment Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Completion Rate:</span>
                      <span className="font-medium">
                        {selectedProviderDetails.totalServices > 0 
                          ? Math.round((selectedProviderDetails.completedServices / selectedProviderDetails.totalServices) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Services:</span>
                      <span className="font-medium text-orange-600">{selectedProviderDetails.pendingServices}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available for Release:</span>
                      <span className="font-medium text-green-600">PKR {selectedProviderDetails.pendingAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProviderPayments;
