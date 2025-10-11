// 📱 WhatsApp utility functions

// ✅ Phone number ko proper WhatsApp format me convert karta hai (Pakistan code 92)
export const formatPhoneForWhatsApp = (phone: string): string => {
  if (!phone) return '';

  // Remove all non-digit characters
  let cleanPhone = phone.replace(/\D/g, '');

  // If phone starts with 0, replace it with 92
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '92' + cleanPhone.substring(1);
  }

  // If phone doesn't start with country code 92, add it
  if (!cleanPhone.startsWith('92')) {
    cleanPhone = '92' + cleanPhone;
  }

  return cleanPhone;
};

// ✅ WhatsApp chat open karta hai with pre-filled message
export const openWhatsAppChat = (phone: string, message?: string): void => {
  if (!phone) {
    console.warn('⚠️ No phone number provided for WhatsApp');
    return;
  }

  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = message ? encodeURIComponent(message) : '';
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
};

// ✅ Default WhatsApp message generate karta hai
export const getDefaultWhatsAppMessage = (
  serviceName: string,
  providerName: string,
  serviceId?: string
): string => {
  // Use current domain (works for both production and development)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sehatkor.cloud';
  const serviceLink = serviceId ? `${baseUrl}/service/${serviceId}` : '';

  console.log('🔧 WhatsApp Debug:', {
    serviceName,
    providerName,
    serviceId,
    baseUrl,
    serviceLink,
    currentOrigin: window.location.origin
  });

  let message = `Hi! I'm interested in your service "${serviceName}" listed on SehatKor.`;

  if (serviceLink) {
    message += `\n\n🔗 View Service Details: ${serviceLink}`;
  }

  message += `\n\nCould you please provide more details about this service?`;

  console.log('📱 Generated WhatsApp message:', message);

  return message;
};
