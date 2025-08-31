import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipArrow,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { MessageCircle, MessageSquare } from "lucide-react";
import { openWhatsAppChat, getDefaultWhatsAppMessage } from "@/utils/whatsapp";
import { getConnectedUsers, getSentRequests, sendConnectionRequest } from "@/lib/connectionApi";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ServiceWhatsAppButtonProps {
  phoneNumber: string;
  serviceName: string;
  providerName: string;
  onChatClick?: () => void;
  providerId?: string;
}

const ServiceWhatsAppButton = ({ phoneNumber, serviceName, providerName, onChatClick, providerId }: ServiceWhatsAppButtonProps) => {
  if (!phoneNumber) {
    return null;
  }

  const { user } = useAuth();
  const isSelf = user && providerId && (String(user.id) === String(providerId));

  const handleWhatsAppClick = () => {
    openWhatsAppChat(phoneNumber, getDefaultWhatsAppMessage(serviceName, providerName));
  };

  const handleChatClick = () => {
    if (onChatClick) {
      onChatClick();
      return;
    }
    // Fallback: dispatch a global event so a site-wide chat widget can listen and open
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('sehatkor:open-chat', {
          detail: { serviceName, providerName, providerId }
        })
      );
    }
  };

  const [open, setOpen] = useState(false);
  const [connStatus, setConnStatus] = useState<'loading' | 'connected' | 'pending' | 'none'>('loading');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const refreshStatus = async () => {
    // Only for signed-in users with a valid providerId
    const token = typeof window !== 'undefined' ? localStorage.getItem('sehatkor_token') : null;
    if (isSelf) {
      // Self-cards: we don't allow chat/request; keep as none and exit
      setConnStatus('none');
      return;
    }
    if (!providerId || !token) {
      setConnStatus('none');
      return;
    }
    try {
      setConnStatus('loading');
      const [connected, sent] = await Promise.all([getConnectedUsers(), getSentRequests()]);
      const isConnected = (connected || []).some((u: any) => String(u._id) === String(providerId));
      if (isConnected) {
        setConnStatus('connected');
        return;
      }
      // Some APIs may also return accepted connections inside sent requests
      const isAcceptedInSent = (sent || []).some((r: any) =>
        r.status === 'accepted' && (String(r.recipient?._id) === String(providerId) || String(r.sender?._id) === String(providerId))
      );
      if (isAcceptedInSent) {
        setConnStatus('connected');
        return;
      }
      const hasPending = (sent || []).some((r: any) =>
        r.status === 'pending' && (String(r.recipient?._id) === String(providerId) || String(r.sender?._id) === String(providerId))
      );
      setConnStatus(hasPending ? 'pending' : 'none');
    } catch {
      setConnStatus('none');
    }
  };

  useEffect(() => {
    refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  const onRequestClick = async () => {
    if (!providerId || sending) return;
    if (isSelf) {
      toast({ title: 'Action not allowed', description: 'You cannot send a connection request to yourself.', variant: 'destructive' });
      return;
    }
    try {
      setSending(true);
      await sendConnectionRequest(providerId, "");
      setConnStatus('pending');
      toast({ title: 'Request Sent', description: 'Your connection request was sent.' });
    } catch (e: any) {
      const msg = String(e?.message || '');
      // If backend reports already connected, flip state and open chat
      if (msg.includes('Already connected')) {
        setConnStatus('connected');
        toast({ title: 'Already connected', description: 'Opening chat...' });
        // Open chat immediately for better UX
        try { handleChatClick(); } catch {}
        return;
      }
      // If backend reports an already pending/sent request, switch to pending
      if (msg.toLowerCase().includes('already pending') || msg.toLowerCase().includes('already sent') || msg.toLowerCase().includes('request already')) {
        setConnStatus('pending');
        toast({ title: 'Request Pending', description: 'Your request is already pending.' });
        return;
      }
      toast({ title: 'Error', description: msg || 'Failed to send request', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-3 h-3 text-muted-foreground hover:bg-muted/50"
            aria-label="Contact options"
            onMouseEnter={() => setOpen(true)}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen((v) => !v)}
          >
           <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.5 19H8C4 19 2 18 2 13V8C2 4 4 2 8 2H16C20 2 22 4 22 8V13C22 17 20 19 16 19H15.5C15.19 19 14.89 19.15 14.7 19.4L13.2 21.4C12.54 22.28 11.46 22.28 10.8 21.4L9.3 19.4C9.14 19.18 8.77 19 8.5 19Z" stroke="#292D32" strokeWidth="1.5" strokeMiterLimit="10" strokeLineCap="round" strokeLineJoin="round"/>
<path d="M15.9965 11H16.0054" stroke="#292D32" strokeWidth="2" strokeLineCap="round" strokeLineJoin="round"/>
<path d="M11.9955 11H12.0045" stroke="#292D32" strokeWidth="2" strokeLineCap="round" strokeLineJoin="round"/>
<path d="M7.99451 11H8.00349" stroke="#292D32" strokeWidth="2" strokeLineCap="round" strokeLineJoin="round"/>
</svg>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="p-1.5" onPointerEnter={() => setOpen(true)} onPointerLeave={() => setOpen(false)}>
        <TooltipArrow className="fill-popover" />
        <div className="flex flex-col gap-1.5">
          <Button
            onClick={handleWhatsAppClick}
            size="sm"
            className="w-full h-7 text-[10px] bg-green-100 hover:bg-green-200 text-green-700 border border-green-200 px-1.5"
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={
              connStatus === 'connected' ? (() => { if (isSelf) { toast({ title: 'Action not allowed', description: 'You cannot chat with yourself.', variant: 'destructive' }); return; } handleChatClick(); })
              : connStatus === 'none' ? onRequestClick
              : undefined
            }
            disabled={isSelf || connStatus === 'pending' || connStatus === 'loading' || sending}
            className="w-full h-7 text-[10px] px-1.5"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            {isSelf ? 'Not allowed' : (connStatus === 'connected' ? 'Chat' : connStatus === 'pending' ? 'Pending' : connStatus === 'loading' ? '...' : sending ? 'Sending...' : 'Send Request')}
          </Button>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
};

export default ServiceWhatsAppButton;

