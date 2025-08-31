// Invoice preview utility - shows preview before download
export const previewInvoice = (invoice: any) => {
  // Create a new window with the invoice content for preview
  const previewWindow = window.open('', '_blank', 'width=800,height=900,scrollbars=yes,resizable=yes');
  if (!previewWindow) {
    alert('Please allow popups to preview the invoice');
    return;
  }

  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice Preview - ${invoice.invoiceNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          background: #f5f5f5;
        }
        .preview-header {
          background: #007bff;
          color: white;
          padding: 15px;
          margin: -20px -20px 20px -20px;
          text-align: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .preview-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 10px;
        }
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          text-decoration: none;
          display: inline-block;
        }
        .btn-primary {
          background: #28a745;
          color: white;
        }
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        .btn:hover {
          opacity: 0.9;
        }
        .invoice-container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #007bff;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 5px;
        }
        .invoice-title {
          font-size: 24px;
          color: #333;
          margin-bottom: 10px;
        }
        .invoice-number {
          font-size: 18px;
          color: #666;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .info-section {
          flex: 1;
        }
        .info-title {
          font-weight: bold;
          color: #007bff;
          margin-bottom: 5px;
        }
        .provider-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .badge-doctor { background: #e3f2fd; color: #1976d2; }
        .badge-hospital { background: #e8f5e8; color: #388e3c; }
        .badge-laboratory { background: #f3e5f5; color: #7b1fa2; }
        .badge-pharmacy { background: #fff3e0; color: #f57c00; }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th,
        .items-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        .items-table th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #333;
        }
        .items-table .amount {
          text-align: right;
        }
        .totals-section {
          margin-top: 30px;
          border-top: 2px solid #007bff;
          padding-top: 20px;
        }
        .totals-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        .total-card {
          text-align: center;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
        .total-card.subtotal { background: #f8f9fa; }
        .total-card.commission { background: #fff3cd; }
        .total-card.commission-amount { background: #f8d7da; }
        .total-card.net-total { background: #d4edda; }
        .total-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }
        .total-amount {
          font-size: 18px;
          font-weight: bold;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        .notes {
          margin-top: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }
      </style>
    </head>
    <body>
      <div class="preview-header">
        <h2>Invoice Preview</h2>
        <div class="preview-actions">
          <button class="btn btn-primary" onclick="downloadPDF()">📥 Download PDF</button>
          <button class="btn btn-secondary" onclick="window.close()">✖ Close Preview</button>
        </div>
      </div>

      <div class="invoice-container">
        <div class="header">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
            <div style="display: flex; align-items: center; background: #dc2626; color: white; padding: 8px 12px; border-radius: 8px;">
              <div style="width: 32px; height: 32px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; color: #dc2626;">
                  <path fill="currentColor" d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V3H13V9H21ZM14 10V12H16V10H14ZM16 13H14V15H16V13ZM20.5 18.08L19.42 17L18.5 17.92L19.58 19L16.5 22.08L15.42 21L14.5 21.92L15.58 23L18.5 20.08L20.5 18.08Z"/>
                </svg>
              </div>
              <span style="font-size: 20px; font-weight: bold;">SehatKor</span>
            </div>
          </div>
          <div class="invoice-title">Payment Invoice</div>
          <div class="invoice-number">${invoice.invoiceNumber}</div>
        </div>

        <div class="invoice-info">
          <div class="info-section">
            <div class="info-title">Provider Information</div>
            <div><strong>${invoice.providerName || 'Unknown Provider'}</strong></div>
            <div class="provider-badge badge-${invoice.providerType || 'doctor'}">
              ${(invoice.providerType || 'doctor').charAt(0).toUpperCase() + (invoice.providerType || 'doctor').slice(1)}
            </div>
            <div style="margin-top: 10px; color: #666;">
              Provider ID: ${invoice.providerId}
            </div>
          </div>
          <div class="info-section" style="text-align: right;">
            <div class="info-title">Invoice Details</div>
            <div><strong>Issue Date:</strong> ${new Date(invoice.issuedAt || invoice.createdAt || '').toLocaleDateString()}</div>
            <div><strong>Issue Time:</strong> ${new Date(invoice.issuedAt || invoice.createdAt || '').toLocaleTimeString()}</div>
            <div><strong>Total Items:</strong> ${invoice.items?.length || 0}</div>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Patient</th>
              <th class="amount">Original Amount</th>
              <th class="amount">Commission</th>
              <th class="amount">Net Amount</th>
              <th>Release Date</th>
            </tr>
          </thead>
          <tbody>
            ${(invoice.items || []).map((item: any) => `
              <tr>
                <td>${item.serviceName || '-'}</td>
                <td>${item.patientName || '-'}</td>
                <td class="amount">PKR ${item.originalAmount?.toLocaleString() || '0'}</td>
                <td class="amount">PKR ${item.adminCommissionAmount?.toLocaleString() || '0'}</td>
                <td class="amount"><strong>PKR ${item.netAmount?.toLocaleString() || '0'}</strong></td>
                <td>${item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals-section">
          <div class="totals-grid">
            <div class="total-card subtotal">
              <div class="total-label">Subtotal</div>
              <div class="total-amount">PKR ${invoice.totals?.subtotal?.toLocaleString() || '0'}</div>
            </div>
            <div class="total-card commission">
              <div class="total-label">Commission Rate</div>
              <div class="total-amount">${invoice.totals?.commissionPercentage || 0}%</div>
            </div>
            <div class="total-card commission-amount">
              <div class="total-label">Commission Amount</div>
              <div class="total-amount">PKR ${invoice.totals?.commissionAmount?.toLocaleString() || '0'}</div>
            </div>
            <div class="total-card net-total">
              <div class="total-label">Net Total</div>
              <div class="total-amount">PKR ${invoice.totals?.netTotal?.toLocaleString() || '0'}</div>
            </div>
          </div>
        </div>

        ${invoice.notes ? `
          <div class="notes">
            <div class="info-title">Notes</div>
            <div>${invoice.notes}</div>
          </div>
        ` : ''}

        <div class="footer">
          <div>Generated on ${new Date().toLocaleString()}</div>
          <div>SehatKor - Healthcare Payment Management System</div>
          <div style="margin-top: 10px;">
            This is a computer-generated invoice and does not require a signature.
          </div>
        </div>
      </div>

      <script>
        function downloadPDF() {
          // Hide preview header and show print dialog
          document.querySelector('.preview-header').style.display = 'none';
          window.print();
          setTimeout(function() {
            document.querySelector('.preview-header').style.display = 'block';
          }, 1000);
        }
      </script>
    </body>
    </html>
  `;

  previewWindow.document.write(invoiceHTML);
  previewWindow.document.close();
};

// PDF generation utility for invoices
export const generateInvoicePDF = (invoice: any) => {
  // Create a new window with the invoice content
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download the PDF');
    return;
  }

  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #007bff;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 5px;
        }
        .invoice-title {
          font-size: 24px;
          color: #333;
          margin-bottom: 10px;
        }
        .invoice-number {
          font-size: 18px;
          color: #666;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .info-section {
          flex: 1;
        }
        .info-title {
          font-weight: bold;
          color: #007bff;
          margin-bottom: 5px;
        }
        .provider-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .badge-doctor { background: #e3f2fd; color: #1976d2; }
        .badge-hospital { background: #e8f5e8; color: #388e3c; }
        .badge-laboratory { background: #f3e5f5; color: #7b1fa2; }
        .badge-pharmacy { background: #fff3e0; color: #f57c00; }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th,
        .items-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        .items-table th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #333;
        }
        .items-table .amount {
          text-align: right;
        }
        .totals-section {
          margin-top: 30px;
          border-top: 2px solid #007bff;
          padding-top: 20px;
        }
        .totals-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        .total-card {
          text-align: center;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
        .total-card.subtotal { background: #f8f9fa; }
        .total-card.commission { background: #fff3cd; }
        .total-card.commission-amount { background: #f8d7da; }
        .total-card.net-total { background: #d4edda; }
        .total-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }
        .total-amount {
          font-size: 18px;
          font-weight: bold;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        .notes {
          margin-top: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">SehatKor</div>
        <div class="invoice-title">Payment Invoice</div>
        <div class="invoice-number">${invoice.invoiceNumber}</div>
      </div>

      <div class="invoice-info">
        <div class="info-section">
          <div class="info-title">Provider Information</div>
          <div><strong>${invoice.providerName || 'Unknown Provider'}</strong></div>
          <div class="provider-badge badge-${invoice.providerType || 'doctor'}">
            ${(invoice.providerType || 'doctor').charAt(0).toUpperCase() + (invoice.providerType || 'doctor').slice(1)}
          </div>
          <div style="margin-top: 10px; color: #666;">
            Provider ID: ${invoice.providerId}
          </div>
        </div>
        <div class="info-section" style="text-align: right;">
          <div class="info-title">Invoice Details</div>
          <div><strong>Issue Date:</strong> ${new Date(invoice.issuedAt || invoice.createdAt || '').toLocaleDateString()}</div>
          <div><strong>Issue Time:</strong> ${new Date(invoice.issuedAt || invoice.createdAt || '').toLocaleTimeString()}</div>
          <div><strong>Total Items:</strong> ${invoice.items?.length || 0}</div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Patient</th>
            <th class="amount">Original Amount</th>
            <th class="amount">Commission</th>
            <th class="amount">Net Amount</th>
            <th>Release Date</th>
          </tr>
        </thead>
        <tbody>
          ${(invoice.items || []).map((item: any) => `
            <tr>
              <td>${item.serviceName || '-'}</td>
              <td>${item.patientName || '-'}</td>
              <td class="amount">PKR ${item.originalAmount?.toLocaleString() || '0'}</td>
              <td class="amount">PKR ${item.adminCommissionAmount?.toLocaleString() || '0'}</td>
              <td class="amount"><strong>PKR ${item.netAmount?.toLocaleString() || '0'}</strong></td>
              <td>${item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals-section">
        <div class="totals-grid">
          <div class="total-card subtotal">
            <div class="total-label">Subtotal</div>
            <div class="total-amount">PKR ${invoice.totals?.subtotal?.toLocaleString() || '0'}</div>
          </div>
          <div class="total-card commission">
            <div class="total-label">Commission Rate</div>
            <div class="total-amount">${invoice.totals?.commissionPercentage || 0}%</div>
          </div>
          <div class="total-card commission-amount">
            <div class="total-label">Commission Amount</div>
            <div class="total-amount">PKR ${invoice.totals?.commissionAmount?.toLocaleString() || '0'}</div>
          </div>
          <div class="total-card net-total">
            <div class="total-label">Net Total</div>
            <div class="total-amount">PKR ${invoice.totals?.netTotal?.toLocaleString() || '0'}</div>
          </div>
        </div>
      </div>

      ${invoice.notes ? `
        <div class="notes">
          <div class="info-title">Notes</div>
          <div>${invoice.notes}</div>
        </div>
      ` : ''}

      <div class="footer">
        <div>Generated on ${new Date().toLocaleString()}</div>
        <div>SehatKor - Healthcare Payment Management System</div>
        <div style="margin-top: 10px;">
          This is a computer-generated invoice and does not require a signature.
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() {
            window.close();
          }, 1000);
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
};

// Alternative download function using blob
export const downloadInvoiceHTML = (invoice: any) => {
  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoiceNumber}</title>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #007bff;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 5px;
        }
        .invoice-title {
          font-size: 24px;
          color: #333;
          margin-bottom: 10px;
        }
        .invoice-number {
          font-size: 18px;
          color: #666;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .info-section {
          flex: 1;
        }
        .info-title {
          font-weight: bold;
          color: #007bff;
          margin-bottom: 5px;
        }
        .provider-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          background: #e3f2fd;
          color: #1976d2;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th,
        .items-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        .items-table th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #333;
        }
        .items-table .amount {
          text-align: right;
        }
        .totals-section {
          margin-top: 30px;
          border-top: 2px solid #007bff;
          padding-top: 20px;
        }
        .totals-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        .total-card {
          text-align: center;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #ddd;
          background: #f8f9fa;
        }
        .total-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }
        .total-amount {
          font-size: 18px;
          font-weight: bold;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        .notes {
          margin-top: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">SehatKor</div>
        <div class="invoice-title">Payment Invoice</div>
        <div class="invoice-number">${invoice.invoiceNumber}</div>
      </div>

      <div class="invoice-info">
        <div class="info-section">
          <div class="info-title">Provider Information</div>
          <div><strong>${invoice.providerName || 'Unknown Provider'}</strong></div>
          <div class="provider-badge">
            ${(invoice.providerType || 'doctor').charAt(0).toUpperCase() + (invoice.providerType || 'doctor').slice(1)}
          </div>
          <div style="margin-top: 10px; color: #666;">
            Provider ID: ${invoice.providerId}
          </div>
        </div>
        <div class="info-section" style="text-align: right;">
          <div class="info-title">Invoice Details</div>
          <div><strong>Issue Date:</strong> ${new Date(invoice.issuedAt || invoice.createdAt || '').toLocaleDateString()}</div>
          <div><strong>Issue Time:</strong> ${new Date(invoice.issuedAt || invoice.createdAt || '').toLocaleTimeString()}</div>
          <div><strong>Total Items:</strong> ${invoice.items?.length || 0}</div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Patient</th>
            <th class="amount">Original Amount</th>
            <th class="amount">Commission</th>
            <th class="amount">Net Amount</th>
            <th>Release Date</th>
          </tr>
        </thead>
        <tbody>
          ${(invoice.items || []).map((item: any) => `
            <tr>
              <td>${item.serviceName || '-'}</td>
              <td>${item.patientName || '-'}</td>
              <td class="amount">PKR ${item.originalAmount?.toLocaleString() || '0'}</td>
              <td class="amount">PKR ${item.adminCommissionAmount?.toLocaleString() || '0'}</td>
              <td class="amount"><strong>PKR ${item.netAmount?.toLocaleString() || '0'}</strong></td>
              <td>${item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals-section">
        <div class="totals-grid">
          <div class="total-card">
            <div class="total-label">Subtotal</div>
            <div class="total-amount">PKR ${invoice.totals?.subtotal?.toLocaleString() || '0'}</div>
          </div>
          <div class="total-card">
            <div class="total-label">Commission Rate</div>
            <div class="total-amount">${invoice.totals?.commissionPercentage || 0}%</div>
          </div>
          <div class="total-card">
            <div class="total-label">Commission Amount</div>
            <div class="total-amount">PKR ${invoice.totals?.commissionAmount?.toLocaleString() || '0'}</div>
          </div>
          <div class="total-card">
            <div class="total-label">Net Total</div>
            <div class="total-amount">PKR ${invoice.totals?.netTotal?.toLocaleString() || '0'}</div>
          </div>
        </div>
      </div>

      ${invoice.notes ? `
        <div class="notes">
          <div class="info-title">Notes</div>
          <div>${invoice.notes}</div>
        </div>
      ` : ''}

      <div class="footer">
        <div>Generated on ${new Date().toLocaleString()}</div>
        <div>SehatKor - Healthcare Payment Management System</div>
        <div style="margin-top: 10px;">
          This is a computer-generated invoice and does not require a signature.
        </div>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([invoiceHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Invoice_${invoice.invoiceNumber}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
