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
  const whatsappUrl = `https://wa.me/${formattedPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
  
  window.open(whatsappUrl, '_blank');
};

export const getDefaultWhatsAppMessage = (serviceName: string, providerName: string): string => {
  return `Hi! I'm interested in your service "${serviceName}" listed on SehatKor. Could you please provide more details?`;
};
