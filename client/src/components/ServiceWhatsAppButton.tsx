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
import { getConnectedUsers, getSentRequests, sendConnectionRequest, searchUsersForConnection } from "@/lib/connectionApi";
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
          detail: { serviceName, providerName, providerId: providerIdUsed }
        })
      );
    }
  };

  const [open, setOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const [connStatus, setConnStatus] = useState<'loading' | 'connected' | 'pending' | 'none'>('loading');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  // Fallback resolution when providerId is missing (e.g., public cards)
  const [resolvedProviderId, setResolvedProviderId] = useState<string | undefined>(undefined);

  // Determine which providerId to use in actions
  const providerIdUsed = providerId || resolvedProviderId;
  const isSelf = !!(user && providerIdUsed && (String((user as any).id) === String(providerIdUsed)));

  const refreshStatus = async () => {
    // Only for signed-in users with a valid providerId
    const token = typeof window !== 'undefined' ? localStorage.getItem('sehatkor_token') : null;
    if (isSelf) {
      // Self-cards: we don't allow chat/request; keep as none and exit
      setConnStatus('none');
      return;
    }
    if (!providerIdUsed || !token) {
      setConnStatus('none');
      return;
    }
    try {
      setConnStatus('loading');
      const [connected, sent] = await Promise.all([getConnectedUsers(), getSentRequests()]);
      const isConnected = (connected || []).some((u: any) => String(u._id) === String(providerIdUsed));
      if (isConnected) {
        setConnStatus('connected');
        return;
      }
      // Some APIs may also return accepted connections inside sent requests
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

  useEffect(() => {
    refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerIdUsed]);

  // Detect small screens (below Tailwind's sm breakpoint ~640px)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia('(max-width: 639px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsSmallScreen(('matches' in e ? e.matches : (e as MediaQueryList).matches));
    };
    // Initialize and subscribe
    handler(mql as any);
    if (typeof mql.addEventListener === 'function') mql.addEventListener('change', handler as any);
    else if (typeof (mql as any).addListener === 'function') (mql as any).addListener(handler as any);
    return () => {
      if (typeof mql.removeEventListener === 'function') mql.removeEventListener('change', handler as any);
      else if (typeof (mql as any).removeListener === 'function') (mql as any).removeListener(handler as any);
    };
  }, []);

  // Attempt to resolve providerId if missing, using providerName (limited to 1 hit by API)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (providerId || !providerName || providerName.trim().length < 2) return;
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('sehatkor_token') : null;
        if (!token) return;
        const results = await searchUsersForConnection(providerName.trim());
        const first = Array.isArray(results) && results.length > 0 ? results[0] : null;
        if (!cancelled && first && first._id) {
          setResolvedProviderId(String(first._id));
        }
      } catch {}
    };
    run();
    return () => { cancelled = true; };
  }, [providerId, providerName]);

  const onRequestClick = async () => {
    if (!providerIdUsed || sending) return;
    if (isSelf) {
      toast({ title: 'Action not allowed', description: 'You cannot send a connection request to yourself.', variant: 'destructive' });
      return;
    }
    try {
      setSending(true);
      await sendConnectionRequest(providerIdUsed, "");
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
            className="rounded-full w-8 h-8 p-[1px] bg-gradient-to-br from-sky-500/35 via-violet-500/35 to-fuchsia-500/35 hover:from-sky-500/50 hover:via-violet-500/50 hover:to-fuchsia-500/50 transition-colors"
            aria-label="Contact options"
            onMouseEnter={() => { if (!isSmallScreen) setOpen(true); }}
            onFocus={() => { if (!isSmallScreen) setOpen(true); }}
            onClick={(e) => { e.preventDefault(); setOpen((v) => !v); }}
          >
            <span className="flex items-center justify-center w-full h-full rounded-full bg-background text-blue-600 hover:text-blue-700">
              <MessageCircle className="w-4 h-4" />
            </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="p-1.5"
        onPointerEnter={() => { if (!isSmallScreen) setOpen(true); }}
        onPointerLeave={() => { if (!isSmallScreen) setOpen(false); }}
      >
        <TooltipArrow className="fill-popover" />
        <div className="flex flex-col gap-1.5">
          <Button
            onClick={handleWhatsAppClick}
            size="sm"
            className="w-full h-7 text-[10px] bg-green-100 hover:bg-green-200 text-green-700 border border-green-200 px-1.5"
          >
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 mr-1"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M20.52 3.48A11.8 11.8 0 0 0 12.04 0C5.72 0 .6 5.12.6 11.44c0 2.02.53 3.98 1.54 5.71L0 24l6.02-2.07a11.38 11.38 0 0 0 6.02 1.72h.01c6.32 0 11.44-5.12 11.44-11.44 0-3.06-1.19-5.94-3.41-8.16zM12.04 21.3c-1.89 0-3.75-.51-5.37-1.48l-.38-.22-3.58 1.23 1.23-3.48-.25-.4a9.42 9.42 0 0 1-1.45-5.11c0-5.23 4.26-9.49 9.49-9.49 2.54 0 4.93.99 6.72 2.78a9.46 9.46 0 0 1 2.77 6.71c0 5.23-4.26 9.49-9.49 9.49zm5.46-7.1c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.28-.47-2.44-1.5-.9-.8-1.51-1.78-1.69-2.08-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35z"/>
            </svg>
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

