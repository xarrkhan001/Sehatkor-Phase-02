// WhatsApp utility functions
export const formatPhoneForWhatsApp = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let cleanPhone = phone.replace(/\D/g, '');
  
  // If phone starts with 0, replace with 92 (Pakistan country code)
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '92' + cleanPhone.substring(1);
  }
  
  // If phone doesn't start with country code, add 92
  if (!cleanPhone.startsWith('92')) {
    cleanPhone = '92' + cleanPhone;
  }
  
  return cleanPhone;
};

export const openWhatsAppChat = (phone: string, message?: string): void => {
  if (!phone) {
    console.warn('No phone number provided for WhatsApp');
    return;
  }

  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = message ? encodeURIComponent(message) : '';
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
};

export const getDefaultWhatsAppMessage = (serviceName: string, providerName: string, serviceId?: string): string => {
  // Use production URL instead of localhost
  const baseUrl = window.location.origin.includes('localhost') ? 'https://sehatkor.cloud' : window.location.origin;
  const serviceLink = serviceId ? `${baseUrl}/service/${serviceId}` : '';

  console.log('🔧 WhatsApp Debug:', {
    serviceName,
    providerName,
    serviceId,
    baseUrl,
    serviceLink,
    currentOrigin: window.location.origin
  });

  let message = `Hi! I'm interested in your service "${serviceName}" listed on SehatKor app.`;

  if (serviceLink) {
    message += `\n\nService Link: ${serviceLink}`;
  }

  message += `\n\nCould you please provide more details about this service?`;

  console.log('📱 Generated WhatsApp message:', message);

  return message;
};
