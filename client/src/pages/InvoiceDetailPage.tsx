import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, FileText, Calendar, User, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import InvoicePreviewModal from '@/components/InvoicePreviewModal';

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

const InvoiceDetailPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const fetchInvoice = async () => {
    if (!invoiceId || !user?.id) return;
    
    try {
      const token = localStorage.getItem('sehatkor_token');
      const response = await fetch(`http://localhost:4000/api/payments/invoices/${invoiceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvoice(data.invoice);
      } else {
        toast({
          title: "Error",
          description: "Failed to load invoice details",
          variant: "destructive"
        });
        navigate(-1);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast({
        title: "Error",
        description: "Failed to load invoice details",
        variant: "destructive"
      });
      navigate(-1);
    } finally {
      setLoading(false);
    }
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
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading invoice details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Invoice Not Found</h2>
            <p className="text-muted-foreground mb-6">The requested invoice could not be found.</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Invoice {invoice.invoiceNumber}</h1>
              <p className="text-muted-foreground">Detailed invoice information</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(true)}>
              <FileText className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={() => generateInvoicePDF(invoice)}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Invoice Header Card */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Provider Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{invoice.providerName || 'Unknown Provider'}</span>
                  </div>
                  <Badge className={getProviderTypeColor(invoice.providerType)}>
                    {(invoice.providerType || 'provider').charAt(0).toUpperCase() + (invoice.providerType || 'provider').slice(1)}
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">Invoice Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Issued: {new Date(invoice.issuedAt || invoice.createdAt || '').toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span>Items: {invoice.items?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Totals Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">PKR {invoice.totals?.subtotal?.toLocaleString() || '0'}</div>
              <div className="text-sm text-muted-foreground">Subtotal</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{invoice.totals?.commissionPercentage || 0}%</div>
              <div className="text-sm text-muted-foreground">Commission Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">PKR {invoice.totals?.commissionAmount?.toLocaleString() || '0'}</div>
              <div className="text-sm text-muted-foreground">Commission Amount</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">PKR {invoice.totals?.netTotal?.toLocaleString() || '0'}</div>
              <div className="text-sm text-muted-foreground">Net Total</div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Items ({invoice.items?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
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
                  {(invoice.items || []).map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.serviceName || '-'}</TableCell>
                      <TableCell>{item.patientName || '-'}</TableCell>
                      <TableCell className="text-right">PKR {item.originalAmount?.toLocaleString() || '0'}</TableCell>
                      <TableCell className="text-right">PKR {item.adminCommissionAmount?.toLocaleString() || '0'}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">PKR {item.netAmount?.toLocaleString() || '0'}</TableCell>
                      <TableCell>{item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Invoice Preview Modal */}
        <InvoicePreviewModal 
          invoice={invoice}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
