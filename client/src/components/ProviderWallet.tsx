import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Eye,
  EyeOff,
  CreditCard,
  ArrowUpRight,
  Calendar,
  User,
  Trash2
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import io from 'socket.io-client';

interface Payment {
  _id: string;
  serviceName: string;
  patientName: string;
  patientId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  serviceCompleted: boolean;
  releasedToProvider: boolean;
  releaseDate?: string;
  createdAt: string;
  completionDate?: string;
}

interface Withdrawal {
  _id: string;
  amount: number;
  paymentMethod: 'easypaisa' | 'jazzcash' | string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected' | string;
  createdAt: string;
}

interface WalletData {
  providerId: string;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  totalServices: number;
  completedServices: number;
  payments: Payment[];
}

const ProviderWallet: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState<boolean>(false);
  const [selectedWithdrawals, setSelectedWithdrawals] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'single' | 'bulk' | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState({
    amount: '',
    paymentMethod: 'easypaisa',
    accountNumber: '',
    accountName: ''
  });
  const [socket, setSocket] = useState<any>(null);
  // Use backend-provided availableBalance for withdrawal validations/UI

  useEffect(() => {
    if (!user?.id) return;

    // Initialize WebSocket connection
    const token = localStorage.getItem('sehatkor_token');
    const socketConnection = io('http://localhost:4000', {
      auth: { token }
    });

    socketConnection.on('connect', () => {
      console.log('🔗 Connected to payment notifications');
    });

    socketConnection.on('payment_released', (data) => {
      console.log('💰 Payment released notification:', data);
      if (data.providerId === user.id) {
        toast.success(`Payment Released: PKR ${data.amount} for ${data.serviceName}`);
        fetchWallet(); // Refresh wallet data
      }
    });

    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchWallet();
      fetchWithdrawals();
    }
  }, [user?.id]);

  const fetchWallet = async () => {
    if (!user?.id) return;
    
    try {
      console.log('💳 Fetching wallet data for provider:', user.id);
      const response = await fetch(`http://localhost:4000/api/payments/wallet/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Wallet data received:', data);
        setWallet(data.wallet);
      } else {
        console.error('❌ Failed to fetch wallet:', response.status);
        toast.error('Failed to load wallet data');
      }
    } catch (error) {
      console.error('💥 Wallet fetch error:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    if (!user?.id) return;
    setLoadingWithdrawals(true);
    try {
      const res = await fetch(`http://localhost:4000/api/payments/withdrawals/${user.id}` , {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.withdrawals || []);
      } else {
        console.error('❌ Failed to fetch withdrawals:', res.status);
      }
    } catch (err) {
      console.error('💥 Withdrawals fetch error:', err);
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!user?.id || !withdrawalData.amount || !withdrawalData.accountNumber || !withdrawalData.accountName) {
      toast.error('Please fill in all withdrawal details');
      return;
    }

    const amount = parseFloat(withdrawalData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Validate against backend computed availableBalance (released - withdrawals)
    if (wallet && amount > wallet.availableBalance) {
      toast.error('Insufficient balance for withdrawal');
      return;
    }
    if (wallet && wallet.availableBalance <= 0) {
      toast.error('No available balance to withdraw');
      return;
    }

    try {
      console.log('💸 Processing withdrawal request:', withdrawalData);
      const response = await fetch(`http://localhost:4000/api/payments/withdraw/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
        body: JSON.stringify({
          amount,
          paymentMethod: withdrawalData.paymentMethod,
          accountNumber: withdrawalData.accountNumber,
          accountName: withdrawalData.accountName
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Withdrawal request successful:', data);
        toast.success(`Withdrawal request submitted: ${data.withdrawalId}`);
        setWithdrawalOpen(false);
        setWithdrawalData({
          amount: '',
          paymentMethod: 'easypaisa',
          accountNumber: '',
          accountName: ''
        });
        // Refresh wallet to reflect any backend-side changes (if implemented later)
        fetchWallet();
        fetchWithdrawals();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to process withdrawal');
      }
    } catch (error) {
      console.error('💥 Withdrawal error:', error);
      toast.error('Failed to process withdrawal request');
    }
  };

  const handleDeleteWithdrawal = async (withdrawalId: string) => {
    if (!user?.id) return;
    try {
      const res = await fetch(`http://localhost:4000/api/payments/withdrawals/${user.id}/${withdrawalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      toast.success('Withdrawal deleted');
      // Refresh list and clear selection of this id
      setSelectedWithdrawals(prev => prev.filter(id => id !== withdrawalId));
      fetchWithdrawals();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete withdrawal');
    }
  };

  const handleBulkDelete = async () => {
    if (!user?.id) return;
    if (selectedWithdrawals.length === 0) return toast.error('No items selected');
    try {
      const res = await fetch(`http://localhost:4000/api/payments/withdrawals/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
        body: JSON.stringify({ providerId: user.id, ids: selectedWithdrawals }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Bulk delete failed');
      toast.success(`Deleted ${data.deletedCount ?? selectedWithdrawals.length} item(s)`);
      setSelectedWithdrawals([]);
      fetchWithdrawals();
    } catch (e: any) {
      toast.error(e.message || 'Failed to bulk delete');
    }
  };

  const handleDeleteAll = async () => {
    if (!user?.id) return;
    if (withdrawals.length === 0) return;
    const ok = window.confirm(`Delete ALL ${withdrawals.length} withdrawals for this provider?`);
    if (!ok) return;
    try {
      const res = await fetch(`http://localhost:4000/api/payments/withdrawals/provider/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Delete all failed');
      toast.success(`Deleted ${data.deletedCount ?? withdrawals.length} withdrawal(s)`);
      setSelectedWithdrawals([]);
      fetchWithdrawals();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete all');
    }
  };

  const toggleSelected = (id: string, checked: boolean | 'indeterminate') => {
    setSelectedWithdrawals(prev => {
      const set = new Set(prev);
      if (checked) set.add(id); else set.delete(id);
      return Array.from(set);
    });
  };

  const allSelected = withdrawals.length > 0 && selectedWithdrawals.length === withdrawals.length;
  const anySelected = selectedWithdrawals.length > 0;

  const getStatusBadge = (payment: Payment) => {
    if (payment.releasedToProvider) {
      return <Badge variant="default" className="bg-green-600">Released</Badge>;
    }
    if (payment.serviceCompleted) {
      return <Badge variant="secondary">Pending Release</Badge>;
    }
    return <Badge variant="outline">Service Pending</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No wallet data found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Single list: show all withdrawals; no explicit "Pending" tag shown in UI

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">
                      {balanceVisible ? `PKR ${wallet.availableBalance.toLocaleString()}` : '••••••'}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBalanceVisible(!balanceVisible)}
                    >
                      {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">Available Balance</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  PKR {wallet.pendingBalance.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Pending Release</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  PKR {wallet.totalEarnings.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Earnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payment History</h2>
          <p className="text-muted-foreground">Track your earnings and withdrawals</p>
        </div>
        <Dialog open={withdrawalOpen} onOpenChange={setWithdrawalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" disabled={!wallet || wallet.availableBalance <= 0}>
              <ArrowUpRight className="w-4 h-4" />
              Withdraw Funds
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Available Balance</Label>
                <div className="text-2xl font-bold text-green-600">
                  PKR {wallet.availableBalance.toLocaleString()}
                </div>
              </div>
              
              <div>
                <Label htmlFor="amount">Withdrawal Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  min={1}
                  max={wallet.availableBalance}
                  value={withdrawalData.amount}
                  onChange={(e) => setWithdrawalData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={withdrawalData.paymentMethod}
                  onValueChange={(value) => setWithdrawalData(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                    <SelectItem value="jazzcash">JazzCash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="Enter account number"
                  value={withdrawalData.accountNumber}
                  onChange={(e) => setWithdrawalData(prev => ({ ...prev, accountNumber: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  placeholder="Enter account holder name"
                  value={withdrawalData.accountName}
                  onChange={(e) => setWithdrawalData(prev => ({ ...prev, accountName: e.target.value }))}
                />
              </div>

              <Button
                onClick={handleWithdrawal}
                className="w-full"
                disabled={!withdrawalData.amount || parseFloat(withdrawalData.amount) <= 0 || parseFloat(withdrawalData.amount) > wallet.availableBalance}
              >
                Submit Withdrawal Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment History ({wallet.payments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {wallet.payments.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No payments yet</p>
              <p className="text-sm text-muted-foreground">Your payment history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {wallet.payments.map((payment) => (
                <div key={payment._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{payment.serviceName}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span 
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
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-lg">
                      {payment.currency} {payment.amount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(payment)}
                      {payment.releaseDate && (
                        <div className="text-xs text-muted-foreground">
                          Released: {new Date(payment.releaseDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5" />
              Withdrawal History ({withdrawals.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(val) => {
                  if (val) setSelectedWithdrawals(withdrawals.map(w => w._id));
                  else setSelectedWithdrawals([]);
                }}
                aria-label="Select all"
              />
              <Button
                variant="destructive"
                size="sm"
                disabled={!anySelected}
                onClick={() => {
                  if (!anySelected) return toast.error('No items selected');
                  setConfirmMode('bulk');
                  setPendingId(null);
                  setConfirmOpen(true);
                }}
              >
                Delete Selected
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingWithdrawals ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading withdrawals...</p>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No withdrawals yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((w) => (
                <div key={w._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="mb-2">
                      <Checkbox
                        checked={selectedWithdrawals.includes(w._id)}
                        onCheckedChange={(val) => toggleSelected(w._id, !!val)}
                        aria-label={`Select ${w._id}`}
                      />
                    </div>
                    <div className="font-medium">{w.paymentMethod?.toUpperCase()} Withdrawal</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {w.accountName} • {w.accountNumber}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(w.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-lg">PKR {w.amount.toLocaleString()}</div>
                    <div className="flex items-center justify-end gap-2">
                      {w.status === 'completed' && (
                        <Badge variant="default" className="bg-green-600">Completed</Badge>
                      )}
                      {w.status === 'approved' && (
                        <Badge variant="default" className="bg-blue-600">Approved</Badge>
                      )}
                      {w.status === 'rejected' && (
                        <Badge variant="destructive">Rejected</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        title={'Delete this withdrawal'}
                        onClick={() => {
                          setConfirmMode('single');
                          setPendingId(w._id);
                          setConfirmOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmMode === 'single' ? 'Delete withdrawal?' : 'Delete selected withdrawals?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmMode === 'single'
                ? 'This action will permanently remove this withdrawal from the server.'
                : `This action will permanently remove ${selectedWithdrawals.length} withdrawal(s) from the server.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmMode === 'single' && pendingId) {
                  await handleDeleteWithdrawal(pendingId);
                } else if (confirmMode === 'bulk') {
                  await handleBulkDelete();
                }
                setConfirmOpen(false);
                setConfirmMode(null);
                setPendingId(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Service Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Services</span>
                <span className="font-medium">{wallet.totalServices}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed Services</span>
                <span className="font-medium text-green-600">{wallet.completedServices}</span>
              </div>
              <div className="flex justify-between">
                <span>Completion Rate</span>
                <span className="font-medium">
                  {wallet.totalServices > 0 
                    ? Math.round((wallet.completedServices / wallet.totalServices) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <span>EasyPaisa</span>
                </div>
                <Badge variant="outline">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-red-600" />
                  <span>JazzCash</span>
                </div>
                <Badge variant="outline">Available</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderWallet;
