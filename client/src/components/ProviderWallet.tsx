import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ClipboardList,
  CreditCard,
  ArrowUpRight,
  Calendar,
  User,
  Trash2,
  Download,
  FileText
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
import { generateInvoicePDF, downloadInvoiceHTML } from '@/utils/pdfGenerator';
import InvoicePreviewModal from './InvoicePreviewModal';
import CurrencyAmount from '@/components/CurrencyAmount';

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

interface InvoiceItem {
  paymentId: string;
  serviceId?: string;
  serviceName?: string;
  patientName?: string;
  originalAmount: number;
  adminCommissionAmount: number;
  netAmount: number;
  completionDate?: string;
  releaseDate?: string;
}

interface InvoiceTotals {
  subtotal: number;
  commissionPercentage: number;
  commissionAmount: number;
  netTotal: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  providerId: string;
  providerName?: string;
  providerType?: string;
  items: InvoiceItem[];
  totals: InvoiceTotals;
  paymentIds: string[];
  notes?: string;
  issuedAt?: string;
  createdAt?: string;
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

const ProviderWallet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
  // Invoices
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState<boolean>(false);
  const [invoiceOpen, setInvoiceOpen] = useState<boolean>(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewInvoiceData, setPreviewInvoiceData] = useState<Invoice | null>(null);
  // Payment list filter: all | pending | released
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'released'>('all');
  const [socket, setSocket] = useState<any>(null);
  // Use backend-provided availableBalance for withdrawal validations/UI
  // Payment delete confirm dialog
  const [confirmPaymentOpen, setConfirmPaymentOpen] = useState<boolean>(false);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);
  // Bulk-select payments
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [confirmBulkPaymentsOpen, setConfirmBulkPaymentsOpen] = useState<boolean>(false);

  const fetchInvoices = async () => {
    if (!user?.id) return;
    setLoadingInvoices(true);
    try {
      const res = await fetch(`http://localhost:4000/api/payments/invoices/provider/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(Array.isArray(data.invoices) ? data.invoices : []);
      } else {
        console.error('❌ Failed to fetch invoices:', res.status);
      }
    } catch (e) {
      console.error('💥 Invoices fetch error:', e);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleBulkDeletePayments = async () => {
    if (!user?.id) return;
    if (selectedPayments.length === 0) {
      toast.error('No payments selected');
      return;
    }
    try {
      const res = await fetch(`http://localhost:4000/api/payments/provider/${user.id}/payments/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
        body: JSON.stringify({ ids: selectedPayments }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Bulk delete failed');
      toast.success(`Deleted ${data.modified ?? selectedPayments.length} payment(s) from history`);
      setSelectedPayments([]);
      setConfirmBulkPaymentsOpen(false);
      fetchWallet();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to bulk delete payments');
    }
  };

  const handleDeletePayment = async () => {
    if (!user?.id || !pendingPaymentId) return;
    try {
      const res = await fetch(`http://localhost:4000/api/payments/provider/${user.id}/payment/${pendingPaymentId}` , {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to delete payment');
      toast.success('Payment deleted from your history');
      setConfirmPaymentOpen(false);
      setPendingPaymentId(null);
      fetchWallet();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete payment');
    }
  };

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

    socketConnection.on('invoice_issued', (data) => {
      console.log('🧾 Invoice issued notification:', data);
      if (data.providerId === user.id) {
        toast.success(`Invoice Issued: ${data.invoiceNumber} • Net PKR ${data.totals?.netTotal?.toLocaleString?.() ?? ''}`);
        fetchInvoices();
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
      fetchInvoices();
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
      return <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md">Released</Badge>;
    }
    if (payment.serviceCompleted) {
      return <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md">Pending Release</Badge>;
    }
    return <Badge variant="outline" className="bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-md">Service Pending</Badge>;
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

  // Derived counts for payment filters
  const releasedCount = wallet?.payments?.filter(p => p.releasedToProvider).length ?? 0;
  const pendingCount = wallet?.payments?.filter(p => !p.releasedToProvider).length ?? 0;
  const filteredPayments = wallet.payments.filter(p => paymentFilter==='all' ? true : paymentFilter==='released' ? p.releasedToProvider : !p.releasedToProvider);
  const togglePaymentSelected = (id: string, checked: boolean | 'indeterminate') => {
    setSelectedPayments(prev => {
      const set = new Set(prev);
      if (checked) set.add(id); else set.delete(id);
      return Array.from(set);
    });
  };
  const allPaymentsSelected = filteredPayments.length > 0 && selectedPayments.filter(id => filteredPayments.some(p => p._id === id)).length === filteredPayments.length;
  const anyPaymentsSelected = selectedPayments.length > 0 && filteredPayments.some(p => selectedPayments.includes(p._id));
  const selectAllVisiblePayments = () => {
    if (allPaymentsSelected) {
      // clear only those currently visible
      const visibleIds = new Set(filteredPayments.map(p => p._id));
      setSelectedPayments(prev => prev.filter(id => !visibleIds.has(id)));
    } else {
      const ids = filteredPayments.map(p => p._id);
      setSelectedPayments(prev => Array.from(new Set([...prev, ...ids])));
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 shadow-xl">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CurrencyAmount
                      amount={wallet.availableBalance}
                      masked={!balanceVisible}
                      className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBalanceVisible(!balanceVisible)}
                      className="hover:bg-emerald-100"
                    >
                      {balanceVisible ? <EyeOff className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                    </Button>
                  </div>
                  <div className="text-sm font-medium text-emerald-700">Available Balance</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 shadow-xl">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-amber-500/20 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <CurrencyAmount
                  amount={wallet.pendingBalance}
                  className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent"
                />
                <div className="text-sm font-medium text-orange-700">Pending Release</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full -translate-y-10 translate-x-10"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <CurrencyAmount
                  amount={wallet.totalEarnings}
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent"
                />
                <div className="text-sm font-medium text-blue-700">Total Earnings</div>
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
            <Button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg transition-all duration-300" disabled={!wallet || wallet.availableBalance <= 0}>
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
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg transition-all duration-300"
                disabled={!withdrawalData.amount || parseFloat(withdrawalData.amount) <= 0 || parseFloat(withdrawalData.amount) > wallet.availableBalance}
              >
                Submit Withdrawal Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payment History */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-slate-600 to-gray-700 text-white">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <CreditCard className="w-5 h-5" />
              Payment History ({wallet.payments.length})
            </CardTitle>
            <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg">
              <Button size="sm" variant="ghost" className={`text-white hover:bg-white/20 ${paymentFilter==='all' ? 'bg-white/20' : ''}`} onClick={() => setPaymentFilter('all')}>
                All ({wallet.payments.length})
              </Button>
              <Button size="sm" variant="ghost" className={`text-white hover:bg-white/20 ${paymentFilter==='pending' ? 'bg-white/20' : ''}`} onClick={() => setPaymentFilter('pending')}>
                Pending ({pendingCount})
              </Button>
              <Button size="sm" variant="ghost" className={`text-white hover:bg-white/20 ${paymentFilter==='released' ? 'bg-white/20' : ''}`} onClick={() => setPaymentFilter('released')}>
                Released ({releasedCount})
              </Button>
            </div>
            <div className="flex items-center gap-2 bg-white/10 p-1 rounded-lg">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={selectAllVisiblePayments}>
                {allPaymentsSelected ? 'Clear visible' : 'Select visible'}
              </Button>
              <Button
                size="sm"
                variant={anyPaymentsSelected ? 'destructive' : 'ghost'}
                className={`${anyPaymentsSelected ? 'bg-red-600 text-white hover:bg-red-700' : 'text-white hover:bg-white/20'}`}
                disabled={!anyPaymentsSelected}
                onClick={() => setConfirmBulkPaymentsOpen(true)}
                title="Delete selected from history"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Bulk Delete
              </Button>
            </div>
          </div>
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
              {filteredPayments.map((payment) => (
                <div key={payment._id} className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={selectedPayments.includes(payment._id)}
                      onCheckedChange={(v) => togglePaymentSelected(payment._id, v)}
                      className="mt-1"
                      aria-label="Select payment"
                    />
                    <div className="font-medium">{payment.serviceName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-lg">
                      {payment.currency} {payment.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4 flex-wrap">
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
                        <ClipboardList className="w-3 h-3" />
                        <span className="text-slate-700">Service: {payment.serviceName}</span>
                        <Badge
                          className={`ml-2 h-5 px-2 text-[10px] font-semibold rounded-full shadow-sm ${payment.releasedToProvider
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white'}`}
                        >
                          {payment.releasedToProvider ? 'Released' : (payment.serviceCompleted ? 'Pending Release' : 'Service Pending')}
                        </Badge>
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
                    {payment.releaseDate && (
                      <div className="text-xs text-muted-foreground">
                        Released: {new Date(payment.releaseDate).toLocaleDateString()}
                      </div>
                    )}
                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => { setPendingPaymentId(payment._id); setConfirmPaymentOpen(true); }}
                        title="Delete from history"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm bulk delete payments */}
      <AlertDialog open={confirmBulkPaymentsOpen} onOpenChange={setConfirmBulkPaymentsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected payments from your history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the selected payments from your Payment History. It will not affect invoices or balances.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmBulkPaymentsOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDeletePayments} className="bg-red-600 hover:bg-red-700">
              Delete Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete payment */}
      <AlertDialog open={confirmPaymentOpen} onOpenChange={setConfirmPaymentOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete payment from your history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the selected payment from your Payment History. It will not affect invoices or balances.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setConfirmPaymentOpen(false); setPendingPaymentId(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePayment} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invoices */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <ClipboardList className="w-5 h-5" />
              Invoices ({invoices.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loadingInvoices ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No invoices yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Subtotal (PKR)</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead className="text-right">Net Total (PKR)</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map(inv => (
                    <TableRow key={inv._id}>
                      <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                      <TableCell>{new Date(inv.issuedAt || inv.createdAt || '').toLocaleString()}</TableCell>
                      <TableCell className="text-right">{inv.totals?.subtotal?.toLocaleString?.()}</TableCell>
                      <TableCell className="text-right">{inv.totals?.commissionPercentage ?? 0}% ({inv.totals?.commissionAmount?.toLocaleString?.()})</TableCell>
                      <TableCell className="text-right font-semibold text-emerald-700">{inv.totals?.netTotal?.toLocaleString?.()}</TableCell>
                      <TableCell className="text-right">{inv.items?.length ?? 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1">
                          <Button size="sm" variant="secondary" onClick={() => navigate(`/invoice/${inv._id}`)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setPreviewInvoiceData(inv); setPreviewOpen(true); }} title="Preview Invoice">
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => generateInvoicePDF(inv)} title="Download PDF">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice {activeInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {activeInvoice ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="grid grid-cols-2 gap-4 text-sm flex-1">
                  <div>
                    <div className="text-muted-foreground">Issued</div>
                    <div>{new Date(activeInvoice.issuedAt || activeInvoice.createdAt || '').toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground">Totals</div>
                    <div>Subtotal: PKR {activeInvoice.totals.subtotal.toLocaleString()}</div>
                    <div>Commission: {activeInvoice.totals.commissionPercentage}% (PKR {activeInvoice.totals.commissionAmount.toLocaleString()})</div>
                    <div className="font-semibold text-emerald-700">Net: PKR {activeInvoice.totals.netTotal.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { setPreviewInvoiceData(activeInvoice); setPreviewOpen(true); }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => generateInvoicePDF(activeInvoice)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead className="text-right">Original</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeInvoice.items.map((it, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{it.serviceName || '-'}</TableCell>
                        <TableCell>{it.patientName || '-'}</TableCell>
                        <TableCell className="text-right">{it.originalAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{it.adminCommissionAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{it.netAmount.toLocaleString()}</TableCell>
                        <TableCell>{it.releaseDate ? new Date(it.releaseDate).toLocaleDateString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Withdrawal History */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-white">
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
                className="bg-white text-red-600 hover:bg-red-50 shadow-lg transition-all duration-300"
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
                <div key={w._id} className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border border-red-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
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
                        <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md">Completed</Badge>
                      )}
                      {w.status === 'approved' && (
                        <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">Approved</Badge>
                      )}
                      {w.status === 'rejected' && (
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md">Rejected</Badge>
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
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
            <CardTitle className="text-white">Service Statistics</CardTitle>
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

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white">
            <CardTitle className="text-white">Payment Methods</CardTitle>
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

      {/* Invoice Preview Modal */}
      <InvoicePreviewModal 
        invoice={previewInvoiceData}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
};

export default ProviderWallet;
