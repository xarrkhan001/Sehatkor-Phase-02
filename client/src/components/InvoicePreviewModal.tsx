import React from 'react';

interface InvoicePreviewModalProps {
  invoice: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({ invoice, open, onOpenChange }) => {
  if (!open || !invoice) return null;


  const getProviderBadgeClass = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'doctor': return 'bg-blue-100 text-blue-800';
      case 'hospital': return 'bg-green-100 text-green-800';
      case 'laboratory': return 'bg-purple-100 text-purple-800';
      case 'pharmacy': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b bg-gray-50">
          <h2 className="text-base font-semibold text-gray-800">Invoice Preview</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* PDF-Style Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
          <div className="space-y-6">
            {/* Header - Same as PDF */}
            <div className="text-center border-b-2 border-blue-500 pb-5 mb-6">
              <div className="flex items-center justify-center mb-3">
                <div className="flex items-center bg-red-500 text-white px-3 py-2 rounded-lg">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-red-500">
                      <path fill="currentColor" d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V3H13V9H21ZM14 10V12H16V10H14ZM16 13H14V15H16V13ZM20.5 18.08L19.42 17L18.5 17.92L19.58 19L16.5 22.08L15.42 21L14.5 21.92L15.58 23L18.5 20.08L20.5 18.08Z"/>
                    </svg>
                  </div>
                  <span className="text-xl font-bold">SehatKor</span>
                </div>
              </div>
              <div className="text-xl text-gray-800 mb-2">Payment Invoice</div>
              <div className="text-base text-gray-600">{invoice.invoiceNumber}</div>
            </div>

            {/* Invoice Info - Same as PDF */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="font-bold text-blue-600 mb-1">Provider Information</div>
                <div className="font-semibold mb-2">{invoice.providerName || invoice.provider?.name || 'Unknown Provider'}</div>
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${getProviderBadgeClass(invoice.providerType || invoice.provider?.type)}`}>
                  {invoice.providerType || invoice.provider?.type || 'doctor'}
                </span>
                <div className="mt-2 text-gray-600 text-sm">
                  Provider ID: {invoice.providerId || invoice.provider?.id || invoice._id}
                </div>
              </div>
              <div className="flex-1 sm:text-right">
                <div className="font-bold text-blue-600 mb-1">Invoice Details</div>
                <div className="mb-1"><strong>Issue Date:</strong> {new Date(invoice.issuedAt || invoice.createdAt || Date.now()).toLocaleDateString()}</div>
                <div className="mb-1"><strong>Issue Time:</strong> {new Date(invoice.issuedAt || invoice.createdAt || Date.now()).toLocaleTimeString()}</div>
                <div><strong>Total Items:</strong> {invoice.items?.length || invoice.payments?.length || 0}</div>
              </div>
            </div>

            {/* Items Table - Same as PDF */}
            <div className="mb-6 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-3 text-left bg-gray-100 font-bold">Service</th>
                    <th className="border border-gray-300 p-3 text-left bg-gray-100 font-bold">Patient</th>
                    <th className="border border-gray-300 p-3 text-right bg-gray-100 font-bold">Original Amount</th>
                    <th className="border border-gray-300 p-3 text-right bg-gray-100 font-bold">Commission</th>
                    <th className="border border-gray-300 p-3 text-right bg-gray-100 font-bold">Net Amount</th>
                    <th className="border border-gray-300 p-3 text-left bg-gray-100 font-bold">Release Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.items || invoice.payments || []).length > 0 ? (
                    (invoice.items || invoice.payments || []).map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-3">{item.serviceName || item.service?.name || item.serviceId || '-'}</td>
                        <td className="border border-gray-300 p-3">{item.patientName || item.patient?.name || item.patientId || '-'}</td>
                        <td className="border border-gray-300 p-3 text-right">PKR {(item.originalAmount || item.amount || 0)?.toLocaleString()}</td>
                        <td className="border border-gray-300 p-3 text-right">PKR {(item.adminCommissionAmount || item.commission || 0)?.toLocaleString()}</td>
                        <td className="border border-gray-300 p-3 text-right font-bold">PKR {(item.netAmount || item.providerAmount || (item.amount - item.commission) || 0)?.toLocaleString()}</td>
                        <td className="border border-gray-300 p-3">{item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : (item.releasedAt ? new Date(item.releasedAt).toLocaleDateString() : '-')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="border border-gray-300 p-8 text-center text-gray-500">
                        No payment items found in this invoice
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Section - Same as PDF */}
            <div className="border-t-2 border-blue-500 pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                <div className="text-center p-3 sm:p-4 border rounded-lg bg-gray-100">
                  <div className="text-xs text-gray-600 mb-1">Subtotal</div>
                  <div className="text-base sm:text-lg font-bold">PKR {(invoice.totals?.subtotal || invoice.totalAmount || 0)?.toLocaleString()}</div>
                </div>
                <div className="text-center p-3 sm:p-4 border rounded-lg bg-yellow-100">
                  <div className="text-xs text-gray-600 mb-1">Commission Rate</div>
                  <div className="text-base sm:text-lg font-bold">{invoice.totals?.commissionPercentage || invoice.commissionRate || 10}%</div>
                </div>
                <div className="text-center p-3 sm:p-4 border rounded-lg bg-red-100">
                  <div className="text-xs text-gray-600 mb-1">Commission Amount</div>
                  <div className="text-base sm:text-lg font-bold">PKR {(invoice.totals?.commissionAmount || invoice.totalCommission || 0)?.toLocaleString()}</div>
                </div>
                <div className="text-center p-3 sm:p-4 border rounded-lg bg-green-100">
                  <div className="text-xs text-gray-600 mb-1">Net Total</div>
                  <div className="text-base sm:text-lg font-bold">PKR {(invoice.totals?.netTotal || invoice.netAmount || invoice.providerAmount || 0)?.toLocaleString()}</div>
                </div>
              </div>
            </div>


            {/* Notes Section - Same as PDF */}
            {invoice.notes && (
              <div className="mt-5 p-4 bg-gray-100 rounded-lg border-l-4 border-blue-500">
                <div className="font-bold text-blue-600 mb-1">Notes</div>
                <div>{invoice.notes}</div>
              </div>
            )}

            {/* Footer - Same as PDF */}
            <div className="mt-8 text-center text-gray-600 text-xs border-t pt-5">
              <div>Generated on {new Date().toLocaleString()}</div>
              <div>SehatKor - Healthcare Payment Management System</div>
              <div className="mt-2">
                This is a computer-generated invoice and does not require a signature.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreviewModal;
