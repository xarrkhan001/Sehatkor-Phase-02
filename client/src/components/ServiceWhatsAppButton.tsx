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
            className="rounded-full w-6 h-6 text-muted-foreground hover:bg-muted/50"
            aria-label="Contact options"
            onMouseEnter={() => setOpen(true)}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen((v) => !v)}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
          </svg>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="p-1.5" onPointerEnter={() => setOpen(true)} onPointerLeave={() => setOpen(false)}>
        <TooltipArrow className="fill-popover" />
        <div className="grid grid-cols-2 gap-1.5 min-w-[160px]">
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

