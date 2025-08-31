import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import InvoicePreviewModal from './InvoicePreviewModal';

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

  useEffect(() => {
    fetchInvoices();
  }, [pagination.page, filterProvider]);

  const fetchInvoices = async () => {
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
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0
        }));
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
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6" />
            Invoice Management
          </h2>
          <p className="text-muted-foreground">View and manage all generated invoices</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices, providers, services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
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
                <div className="text-2xl font-bold">{pagination.total}</div>
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
                <div className="text-2xl font-bold">
                  PKR {filteredInvoices.reduce((sum, inv) => sum + (inv.totals?.netTotal || 0), 0).toLocaleString()}
                </div>
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
                <div className="text-2xl font-bold">
                  PKR {filteredInvoices.reduce((sum, inv) => sum + (inv.totals?.commissionAmount || 0), 0).toLocaleString()}
                </div>
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
                <div className="text-2xl font-bold">
                  {new Set(filteredInvoices.map(inv => inv.providerId)).size}
                </div>
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
