import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, MessageCircle, MessageSquare, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipArrow,
} from "@/components/ui/tooltip";
import { openWhatsAppChat } from '@/utils/whatsapp';
import { useAuth } from '@/contexts/AuthContext';
import { sendConnectionRequest } from '@/lib/connectionApi';
import { useToast } from '@/hooks/use-toast';

interface BookingOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: string;
    name: string;
    provider: string;
    price: number;
    image?: string;
    location?: string;
    _providerId?: string;
    _providerType?: string;
    providerPhone?: string;
    // For search page variant support
    variantIndex?: number;
    variantLabel?: string;
    variantTimeRange?: string;
  };
}

const BookingOptionsModal: React.FC<BookingOptionsModalProps> = ({
  isOpen,
  onClose,
  service
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast: useToastHook } = useToast();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [connStatus, setConnStatus] = useState<'loading' | 'connected' | 'pending' | 'none'>('none');
  const [sending, setSending] = useState(false);
  const [resolvedProviderId, setResolvedProviderId] = useState<string | undefined>(undefined);

  // Determine which providerId to use in actions
  const providerIdUsed = service._providerId || resolvedProviderId;
  const isSelf = !!(user && providerIdUsed && (String((user as any).id) === String(providerIdUsed)));

  const refreshStatus = async () => {
    // Only for signed-in users with a valid providerId
    const token = typeof window !== 'undefined' ? localStorage.getItem('sehatkor_token') : null;
    if (isSelf) {
      setConnStatus('none');
      return;
    }
    if (!providerIdUsed || !token) {
      setConnStatus('none');
      return;
    }
    try {
      setConnStatus('loading');
      // Import functions dynamically to avoid issues
      const { getConnectedUsers, getSentRequests } = await import('@/lib/connectionApi');
      const [connected, sent] = await Promise.all([getConnectedUsers(), getSentRequests()]);
      const isConnected = (connected || []).some((u: any) => String(u._id) === String(providerIdUsed));
      if (isConnected) {
        setConnStatus('connected');
        return;
      }
      const isAcceptedInSent = (sent || []).some((r: any) =>
        r.status === 'accepted' && (String(r.recipient?._id) === String(providerIdUsed) || String(r.sender?._id) === String(providerIdUsed))
      );
      if (isAcceptedInSent) {
        setConnStatus('connected');
        return;
      }
      const hasPending = (sent || []).some((r: any) =>
        r.status === 'pending' && (String(r.recipient?._id) === String(providerIdUsed) || String(r.sender?._id) === String(providerIdUsed))
      );
      setConnStatus(hasPending ? 'pending' : 'none');
    } catch {
      setConnStatus('none');
    }
  };

  React.useEffect(() => {
    refreshStatus();
  }, [providerIdUsed]);

  // Attempt to resolve providerId if missing, using providerName (limited to 1 hit by API)
  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (service._providerId || !service.provider || service.provider.trim().length < 2) return;
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('sehatkor_token') : null;
        if (!token) return;
        const { searchUsersForConnection } = await import('@/lib/connectionApi');
        const results = await searchUsersForConnection(service.provider.trim());
        const first = Array.isArray(results) && results.length > 0 ? results[0] : null;
        if (!cancelled && first && first._id) {
          setResolvedProviderId(String(first._id));
        }
      } catch {}
    };
    run();
    return () => { cancelled = true; };
  }, [service._providerId, service.provider]);

  const handleAdminPayment = () => {
    // // Temporarily show a Coming Soon modal instead of navigating to payment page
    setShowComingSoon(true);
    // Keep the original navigate code for future enablement (uncomment to enable)

    // navigate('/payment', {
    //   state: {
    //     serviceId: service.id,
    //     serviceName: service.name,
    //     providerId: service._providerId || service.id,
    //     providerName: service.provider,
    //     providerType: service._providerType,
    //     price: Number(service.price ?? 0),
    //     currency: 'PKR',
    //     image: service.image,
    //     location: service.location,
    //     phone: service.providerPhone,
    //     // variant context for search page
    //     variantIndex: service.variantIndex,
    //     variantLabel: service.variantLabel,
    //     variantTimeRange: service.variantTimeRange,
    //   }
    // });
    // onClose();

  };

  const getBookingMessage = () => {
    const price = service.price ? `PKR ${service.price.toLocaleString()}` : '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sehatkor.cloud';
    const serviceLink = service.id ? `${baseUrl}/service/${service.id}` : '';

    let message = `Hello! I would like to book your service "${service.name}" ${price ? `(${price})` : ''} through SehatKor.

Please confirm:
- Availability
- Appointment time
- Location details
- Any special requirements

Thank you!`;

    if (serviceLink) {
      message = `Hello! I would like to book your service "${service.name}" ${price ? `(${price})` : ''} through SehatKor.

🔗 View Service Details: ${serviceLink}

Please confirm:
- Availability
- Appointment time
- Location details
- Any special requirements

Thank you!`;
    }

    return message;
  };

  const handleChatClick = async () => {
    if (connStatus === 'connected') {
      // If already connected, just open the chat
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('sehatkor:open-chat', {
            detail: {
              serviceName: service.name,
              providerName: service.provider,
              providerId: providerIdUsed,
              initialMessage: getBookingMessage()
            }
          })
        );
      }
      onClose();
      return;
    }

    // Send connection request
    if (!providerIdUsed || sending) return;
    if (isSelf) {
      useToastHook({ title: 'Action not allowed', description: 'You cannot send a connection request to yourself.', variant: 'destructive' });
      return;
    }

    try {
      setSending(true);

      // Generate formatted message with service link
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sehatkor.cloud';
      const serviceLink = service.id ? `${baseUrl}/service/${service.id}` : '';

      let formattedMessage = `Hello! I would like to book your service "${service.name}" through SehatKor.`;
      if (serviceLink) {
        formattedMessage += `\n\n🔗 View Service Details: ${serviceLink}`;
      }
      formattedMessage += `\n\nPlease confirm availability and provide more details.`;

      await sendConnectionRequest(
        providerIdUsed,
        formattedMessage,
        {
          serviceName: service.name,
          serviceId: service.id || '',
          serviceLink: serviceLink
        }
      );

      // Play notification sound when request is sent
      try {
        const audio = new Audio('/sounds/abu.wav');
        audio.play().catch(err => console.log('Could not play notification sound:', err));
      } catch (err) {
        console.log('Notification sound error:', err);
      }

      setConnStatus('pending');
      useToastHook({ title: 'Request Sent', description: 'Your connection request was sent with service details.' });
    } catch (e: any) {
      const msg = String(e?.message || '');
      // If backend reports already connected, flip state and open chat
      if (msg.includes('Already connected')) {
        setConnStatus('connected');
        useToastHook({ title: 'Already connected', description: 'Opening chat...' });
        // Open chat immediately for better UX
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('sehatkor:open-chat', {
              detail: {
                serviceName: service.name,
                providerName: service.provider,
                providerId: providerIdUsed,
                initialMessage: getBookingMessage()
              }
            })
          );
        }
        onClose();
        return;
      }
      // If backend reports an already pending/sent request, switch to pending
      if (msg.toLowerCase().includes('already pending') || msg.toLowerCase().includes('already sent') || msg.toLowerCase().includes('request already')) {
        setConnStatus('pending');
        useToastHook({ title: 'Request Pending', description: 'Your request is already pending.' });
        onClose();
        return;
      }
      useToastHook({ title: 'Error', description: msg || 'Failed to send request', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (!service.providerPhone) {
      toast.error('Provider WhatsApp number not available');
      return;
    }
    openWhatsAppChat(service.providerPhone, getBookingMessage());
    onClose();
  };


  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl">
          <DialogHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Choose Booking Method
            </DialogTitle>
            <p className="text-gray-500 text-sm">
              Select how you'd like to book <span className="font-semibold text-blue-600">"{service.name}"</span>
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            {/* Admin Payment Option */}
            <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Payment via Admin</h3>
                    <p className="text-gray-600 mt-1 text-sm">
                      Secure payment through SehatKor. Choose JazzCash or EasyPaisa.
                    </p>
                    <div className="mt-3">
                      <Button
                        onClick={handleAdminPayment}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        💳 Pay PKR {service.price?.toLocaleString() || 0}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Manual Booking Options */}
            <Card
              className="border-0 bg-gradient-to-r from-gray-50 to-slate-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer relative"
              onClick={(e) => {
                // Check if click is on tooltip buttons to avoid double triggering
                if ((e.target as Element).closest('button')) {
                  return;
                }
                if (service.providerPhone) {
                  handleWhatsAppClick();
                }
                handleChatClick();
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 flex items-center">
                      💬 Manual Booking
                    </h3>
                    <p className="text-gray-600 mt-1 text-sm">
                      Contact the provider directly. No payment record will be stored.
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {service.providerPhone && (
                      <TooltipProvider delayDuration={150}>
                        <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full w-10 h-10 bg-gradient-to-r from-teal-100 to-green-100 hover:from-teal-200 hover:to-green-200 text-teal-600 hover:text-teal-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110"
                              aria-label="Contact options"
                              onMouseEnter={() => setTooltipOpen(true)}
                              onFocus={() => setTooltipOpen(true)}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click
                                setTooltipOpen((v) => !v);
                              }}
                            >
                              <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.5 19H8C4 19 2 18 2 13V8C2 4 4 2 8 2H16C20 2 22 4 22 8V13C22 17 20 19 16 19H15.5C15.19 19 14.89 19.15 14.7 19.4L13.2 21.4C12.54 22.28 11.46 22.28 10.8 21.4L9.3 19.4C9.14 19.18 8.77 19 8.5 19Z" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M15.9965 11H16.0054" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M11.9955 11H12.0045" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7.99451 11H8.00349" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="p-3 bg-white shadow-xl border-0 rounded-xl" onPointerEnter={() => setTooltipOpen(true)} onPointerLeave={() => setTooltipOpen(false)}>
                            <TooltipArrow className="fill-white" />
                            <div className="flex flex-col gap-2">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWhatsAppClick();
                                }}
                                size="sm"
                                className="w-full h-9 text-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                WhatsApp
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChatClick();
                                }}
                                disabled={isSelf || connStatus === 'pending' || connStatus === 'loading' || sending}
                                className="w-full h-9 text-sm border-2 border-blue-200 hover:border-blue-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                {isSelf ? 'Not allowed' : (connStatus === 'connected' ? 'Chat' : connStatus === 'pending' ? 'Pending' : connStatus === 'loading' ? '...' : sending ? 'Sending...' : 'Send Request')}
                              </Button>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 font-medium px-6 py-1 rounded-xl hover:bg-gray-100 transition-all duration-300"
            >
              ✕ Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Coming Soon Modal */}
      <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
        <DialogContent className="sm:max-w-xl bg-white border-0 shadow-2xl rounded-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 border-b border-yellow-100">
            <div className="mx-auto w-16 h-16 rounded-full bg-white shadow flex items-center justify-center ring-8 ring-yellow-100">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            <DialogHeader className="text-center mt-4">
              <DialogTitle className="text-2xl font-bold text-gray-900">Admin Payment — Coming Soon</DialogTitle>
              <p className="text-gray-600 text-sm mt-1">JazzCash and EasyPaisa integration is under development</p>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-gray-700 text-base text-center font-semibold">
              We’re finalizing secure payments via SehatKor Admin. Until then, please book manually and coordinate payment directly with the provider.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-sm text-gray-800 font-semibold">Secure & Verified</p>
                <p className="text-xs text-gray-500 mt-1">Admin payment will include receipts and verified tracking.</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-sm text-gray-800 font-semibold">JazzCash • EasyPaisa</p>
                <p className="text-xs text-gray-500 mt-1">Local wallet support planned for fast and easy checkout.</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-sm text-gray-800 font-semibold">Timeline</p>
                <p className="text-xs text-gray-500 mt-1">Feature will appear here automatically once live.</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-[13px] text-gray-600 font-semibold">
                جیز کیش/ایزی پیسہ کے ذریعے آن لائن ادائیگیاں جلد دستیاب ہوں گی۔ فی الحال براہِ کرم دستی بکنگ استعمال کریں۔
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button onClick={() => setShowComingSoon(false)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Got it
              </Button>
              <Button variant="outline" onClick={() => setShowComingSoon(false)} className="flex-1">
                Use Manual Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingOptionsModal;
