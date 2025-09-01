import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  Calendar,
  DollarSign,
  User,
  FileText,
  Download
} from 'lucide-react';
import { Trash } from 'lucide-react';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import InvoicePreviewModal from './InvoicePreviewModal';
import { getSocket } from '@/lib/socket';

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

const AdminInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewInvoiceData, setPreviewInvoiceData] = useState<Invoice | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  // Selection and deletion UI state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [singleDialogOpen, setSingleDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Snapshot for header stats so deletions do not affect these tiles
  const [headerStats, setHeaderStats] = useState({
    totalInvoices: 0,
    totalReleased: 0,
    totalCommission: 0,
    uniqueProviders: 0,
  });

  // Immutable aggregates from payments API (independent from invoices list)
  const [immutableStats, setImmutableStats] = useState({
    totalReleased: 0,
    totalCommission: 0,
  });

  // Load persisted header stats on mount or provider filter change.
  // If no snapshot exists, initialize from server once.
  useEffect(() => {
    let hasSnapshot = false;
    try {
      const key = `admin_invoices_header_stats_${filterProvider}`;
      const persisted = localStorage.getItem(key);
      if (persisted) {
        const parsed = JSON.parse(persisted);
        setHeaderStats(parsed);
        hasSnapshot = true;
      }
    } catch {}
    // Always fetch list, but only update header stats if there was no snapshot
    fetchInvoices(!hasSnapshot);
    // Load immutable payment aggregates (persisted)
    (async () => {
      try {
        const ikey = `payments_immutable_stats_${filterProvider}`;
        const persisted = localStorage.getItem(ikey);
        if (persisted) {
          setImmutableStats(JSON.parse(persisted));
        } else {
          await fetchPaymentAggregates();
        }
      } catch {
        await fetchPaymentAggregates();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterProvider]);

  // Selection helpers (component scope)
  const isAllSelected = (list: Invoice[]) => {
    if (!list.length) return false;
    return list.every(inv => selectedIds.has(inv._id));
  };

  const toggleSelectAll = (checked: boolean, list: Invoice[]) => {
    const next = new Set<string>(selectedIds);
    if (checked) {
      list.forEach(inv => next.add(inv._id));
    } else {
      list.forEach(inv => next.delete(inv._id));
    }
    setSelectedIds(next);
  };

  const toggleRow = (id: string, checked: boolean) => {
    const next = new Set<string>(selectedIds);
    if (checked) next.add(id); else next.delete(id);
    setSelectedIds(next);
  };

  useEffect(() => {
    // Page changes should only update the list, not the header snapshot
    fetchInvoices(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  // Real-time updates: when payments are released on server, refresh immutable aggregates
  useEffect(() => {
    let socket: ReturnType<typeof getSocket> | null = null;
    try {
      socket = getSocket();
      const refresh = (payload: any) => {
        console.log('[AdminInvoices] payment event received, refreshing aggregates');
        fetchPaymentAggregates();
      };
      socket.on('payment_released', refresh);
      socket.on('bulk_payment_released', refresh);
    } catch (e) {
      console.warn('Socket unavailable for AdminInvoices real-time totals:', e);
    }
    return () => {
      try {
        if (socket) {
          socket.off('payment_released');
          socket.off('bulk_payment_released');
        }
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterProvider]);

  const fetchInvoices = async (updateHeaderStats: boolean = false) => {
    try {
      setLoading(true);
      console.log('📋 Fetching admin invoices...');
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (filterProvider !== 'all') {
        params.append('provider', filterProvider);
      }

      const response = await fetch(`http://localhost:4000/api/payments/invoices?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Admin invoices data received:', data);
        setInvoices(data.invoices || []);
        // Reset row selection on new data page
        setSelectedIds(new Set());
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0
        }));

        if (updateHeaderStats) {
          // Compute and persist snapshot only when explicitly requested
          const list: Invoice[] = data.invoices || [];
          const released = list.reduce((sum, inv) => sum + (inv.totals?.netTotal || 0), 0);
          const commission = list.reduce((sum, inv) => sum + (inv.totals?.commissionAmount || 0), 0);
          const uniqProviders = new Set(list.map(inv => inv.providerId)).size;
          const nextHeader = {
            totalInvoices: data.pagination?.total ?? list.length,
            totalReleased: released,
            totalCommission: commission,
            uniqueProviders: uniqProviders,
          };
          setHeaderStats(nextHeader);
          try {
            const key = `admin_invoices_header_stats_${filterProvider}`;
            localStorage.setItem(key, JSON.stringify(nextHeader));
          } catch {}
        }
      } else {
        console.error('❌ Failed to fetch admin invoices:', response.status);
        toast.error('Failed to load invoices');
      }
    } catch (error) {
      console.error('💥 Admin invoices fetch error:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  // Fetch immutable payment aggregates: 
  // - totalReleased from providers summary (sum of provider.releasedAmount)
  // - totalCommission from released payments list (adminCommissionAmount)
  const fetchPaymentAggregates = async () => {
    try {
      // 1) Total Released via providers summary
      let totalReleased = 0;
      try {
        const respProv = await fetch(`http://localhost:4000/api/payments/providers-summary`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}` },
        });
        if (respProv.ok) {
          const dataProv = await respProv.json();
          const providers = Array.isArray(dataProv?.providers) ? dataProv.providers : [];
          const filtered = filterProvider === 'all' 
            ? providers 
            : providers.filter((p: any) => p?.providerType === filterProvider);
          totalReleased = filtered.reduce((sum: number, p: any) => sum + (Number(p?.releasedAmount) || 0), 0);
        }
      } catch (e) {
        console.warn('Providers summary fetch failed; falling back to 0 for totalReleased', e);
      }

      // 2) Total Commission via released payments list (paginates)
      let page = 1;
      const limit = 200;
      let totalPages = 1;
      let totalCommission = 0;
      const providerTypeParam = filterProvider !== 'all' ? `&providerType=${encodeURIComponent(filterProvider)}` : '';
      const MAX_PAGES = 25;
      try {
        do {
          const resp = await fetch(`http://localhost:4000/api/payments?status=released&page=${page}&limit=${limit}${providerTypeParam}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
            },
          });
          if (!resp.ok) break;
          const data = await resp.json();
          const payments = data.payments || [];
          for (const p of payments) {
            const comm = typeof p?.adminCommissionAmount === 'number' ? p.adminCommissionAmount : 0;
            totalCommission += comm;
          }
          totalPages = Number(data?.pagination?.totalPages) || 1;
          page += 1;
        } while (page <= totalPages && page <= MAX_PAGES);
      } catch (e) {
        console.warn('Released payments fetch failed; commission may be partial', e);
      }

      const next = { totalReleased, totalCommission };
      setImmutableStats(next);
      try {
        const ikey = `payments_immutable_stats_${filterProvider}`;
        localStorage.setItem(ikey, JSON.stringify(next));
      } catch {}
    } catch (e) {
      console.error('Failed to fetch immutable payment aggregates:', e);
    }
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setSingleDeleteId(invoiceId);
    setSingleDialogOpen(true);
  };

  const performSingleDelete = async () => {
    if (!singleDeleteId) return;
    try {
      setDeleting(true);
      const response = await fetch(`http://localhost:4000/api/payments/invoices/${singleDeleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to delete invoice');
      }
      setInvoices(prev => prev.filter(inv => inv._id !== singleDeleteId));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(singleDeleteId);
        return next;
      });
      if (selectedInvoice?._id === singleDeleteId) {
        setDetailsOpen(false);
        setSelectedInvoice(null);
      }
      toast.success('Invoice deleted');
    } catch (e: any) {
      console.error('Invoice delete failed:', e);
      toast.error(e?.message || 'Failed to delete invoice');
    } finally {
      setDeleting(false);
      setSingleDialogOpen(false);
      setSingleDeleteId(null);
    }
  };

  const openBulkDelete = () => setBulkDialogOpen(true);

  const performBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      setDeleting(true);
      const response = await fetch(`http://localhost:4000/api/payments/invoices/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sehatkor_token')}`,
        },
        body: JSON.stringify({ invoiceIds: Array.from(selectedIds) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to bulk delete invoices');
      }
      const removed = new Set(selectedIds);
      setInvoices(prev => prev.filter(inv => !removed.has(inv._id)));
      setSelectedIds(new Set());
      // Close details if the currently opened one has been removed
      if (selectedInvoice && removed.has(selectedInvoice._id)) {
        setDetailsOpen(false);
        setSelectedInvoice(null);
      }
      toast.success('Selected invoices deleted');
    } catch (e: any) {
      console.error('Bulk delete failed:', e);
      toast.error(e?.message || 'Failed to bulk delete invoices');
    } finally {
      setDeleting(false);
      setBulkDialogOpen(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
      invoice.providerName?.toLowerCase().includes(searchLower) ||
      invoice.items.some(item => 
        item.serviceName?.toLowerCase().includes(searchLower) ||
        item.patientName?.toLowerCase().includes(searchLower)
      )
    );
  });

  const openInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailsOpen(true);
  };

  const getProviderTypeColor = (type?: string) => {
    switch (type) {
      case 'doctor': return 'bg-blue-100 text-blue-800';
      case 'hospital': return 'bg-green-100 text-green-800';
      case 'laboratory': return 'bg-purple-100 text-purple-800';
      case 'pharmacy': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6" />
            Invoice Management
          </h2>
          <p className="text-muted-foreground">View and manage all generated invoices</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Force refresh header tiles from latest server data
              fetchInvoices(true);
              fetchPaymentAggregates();
              toast.message('Tiles refreshed');
            }}
          >
            Refresh
          </Button>
          <Select value={filterProvider} onValueChange={setFilterProvider}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="doctor">Doctors</SelectItem>
              <SelectItem value="hospital">Hospitals</SelectItem>
              <SelectItem value="laboratory">Labs</SelectItem>
              <SelectItem value="pharmacy">Pharmacies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{headerStats.totalInvoices}</div>
                <div className="text-sm text-muted-foreground">Total Invoices</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">PKR {immutableStats.totalReleased.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Released</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">PKR {immutableStats.totalCommission.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Commission</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{headerStats.uniqueProviders}</div>
                <div className="text-sm text-muted-foreground">Unique Providers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            All Invoices ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Bulk actions bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between p-3 mb-3 border rounded-md bg-red-50">
              <div className="text-sm"><strong>{selectedIds.size}</strong> selected</div>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={openBulkDelete}>
                  <Trash className="w-4 h-4 mr-2" /> Delete Selected
                </Button>
              </div>
            </div>
          )}
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[32px]">
                      <Checkbox
                        checked={isAllSelected(filteredInvoices)}
                        onCheckedChange={(v) => toggleSelectAll(Boolean(v), filteredInvoices)}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead className="text-right">Net Total</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map(invoice => (
                    <TableRow key={invoice._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(invoice._id)}
                          onCheckedChange={(v) => toggleRow(invoice._id, Boolean(v))}
                          aria-label={`Select invoice ${invoice.invoiceNumber}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.providerName || 'Unknown Provider'}</TableCell>
                      <TableCell>
                        <Badge className={getProviderTypeColor(invoice.providerType)}>
                          {invoice.providerType?.charAt(0).toUpperCase() + invoice.providerType?.slice(1) || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(invoice.issuedAt || invoice.createdAt || '').toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{invoice.items?.length || 0}</TableCell>
                      <TableCell className="text-right">PKR {invoice.totals?.subtotal?.toLocaleString() || '0'}</TableCell>
                      <TableCell className="text-right">
                        {invoice.totals?.commissionPercentage || 0}% (PKR {invoice.totals?.commissionAmount?.toLocaleString() || '0'})
                      </TableCell>
                      <TableCell className="text-right font-semibold text-emerald-700">
                        PKR {invoice.totals?.netTotal?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1">
                          <Button size="sm" variant="secondary" onClick={() => openInvoiceDetails(invoice)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setPreviewInvoiceData(invoice); setPreviewOpen(true); }} title="Preview Invoice">
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => generateInvoicePDF(invoice)} title="Download PDF">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteInvoice(invoice._id)} title="Delete Invoice">
                            <Trash className="w-4 h-4" />
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

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Invoice Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Invoice {selectedInvoice?.invoiceNumber}
              </DialogTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { if (selectedInvoice) { setPreviewInvoiceData(selectedInvoice); setPreviewOpen(true); } }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => selectedInvoice && generateInvoicePDF(selectedInvoice)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => selectedInvoice && handleDeleteInvoice(selectedInvoice._id)}
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Provider</div>
                  <div className="font-medium">{selectedInvoice.providerName}</div>
                  <Badge className={getProviderTypeColor(selectedInvoice.providerType)}>
                    {selectedInvoice.providerType?.charAt(0).toUpperCase() + selectedInvoice.providerType?.slice(1)}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Issued</div>
                  <div>{new Date(selectedInvoice.issuedAt || selectedInvoice.createdAt || '').toLocaleString()}</div>
                </div>
              </div>

              {/* Invoice Totals */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">PKR {selectedInvoice.totals.subtotal.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Subtotal</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{selectedInvoice.totals.commissionPercentage}%</div>
                  <div className="text-sm text-muted-foreground">Commission Rate</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">PKR {selectedInvoice.totals.commissionAmount.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Commission Amount</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">PKR {selectedInvoice.totals.netTotal.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Net Total</div>
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Invoice Items ({selectedInvoice.items.length})</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead className="text-right">Original Amount</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead className="text-right">Net Amount</TableHead>
                        <TableHead>Release Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.serviceName || '-'}</TableCell>
                          <TableCell>{item.patientName || '-'}</TableCell>
                          <TableCell className="text-right">PKR {item.originalAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-right">PKR {item.adminCommissionAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-semibold">PKR {item.netAmount.toLocaleString()}</TableCell>
                          <TableCell>{item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-muted-foreground">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Single Delete Confirmation */}
      <AlertDialog open={singleDialogOpen} onOpenChange={setSingleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the invoice from admin permanently, but it will remain available to the provider. You can’t undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performSingleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} selected invoice(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Selected invoices will be hidden from the admin list but remain available to providers. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performBulkDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              Delete Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invoice Preview Modal */}
      <InvoicePreviewModal 
        invoice={previewInvoiceData}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
};

export default AdminInvoices;
