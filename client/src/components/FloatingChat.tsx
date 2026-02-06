import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, ImageIcon, Search, User, Stethoscope, Camera, Copy, Forward, Trash2, Loader2, ChevronLeft, Download, MoreVertical, UserPlus, UserX, CornerUpLeft, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import UserBadge from "./UserBadge";
import { getSocket } from "@/lib/socket";
import { fetchVerifiedUsers, fetchMessages, getOrCreateConversation, uploadFile, uploadProfileImage, fetchConversations, markAsRead, updateMyProfile, deleteMessage as apiDeleteMessage, clearConversation as apiClearConversation } from "@/lib/chatApi";
import { getPendingRequests, getConnectedUsers, deleteUserConnection } from "@/lib/connectionApi";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ProfileAvatarDialog from "./ProfileAvatarDialog";
import ConnectionRequests from "./ConnectionRequests";

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeUser, setActiveUser] = useState<any | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showUserList, setShowUserList] = useState(true);
  const { user, updateCurrentUser } = useAuth();
  const listRef = useRef<HTMLDivElement>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);
  const [onlineIds, setOnlineIds] = useState<string[]>([]);
  const [pendingAttachment, setPendingAttachment] = useState<null | { file: File; kind: 'image'; previewUrl: string }>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const isMobile = useIsMobile();
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  const [hasSelectedUser, setHasSelectedUser] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'connections'>('chat');
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [clearChatOpen, setClearChatOpen] = useState(false);
  const [removeUserOpen, setRemoveUserOpen] = useState(false);
  const [removeTargetUser, setRemoveTargetUser] = useState<any>(null);
  const [clearingChat, setClearingChat] = useState(false);

  const chatPatternUrl = useMemo(() => {
    const stroke = 'rgba(239,68,68,0.22)'; // moderately stronger red
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'>"
      + `<path d='M1 3 C2 1,4 5,6 3 S10 1,12 3' stroke='${stroke}' stroke-width='0.9' fill='none' stroke-linecap='round' stroke-linejoin='round'/>`
      + `<path d='M2 8 C3 7,4 9,5 8 S7 7,8 8' stroke='${stroke}' stroke-width='0.9' fill='none' stroke-linecap='round' stroke-linejoin='round'/>`
      + `<path d='M9 6 C10 4,12 8,14 6' stroke='${stroke}' stroke-width='0.9' fill='none' stroke-linecap='round' stroke-linejoin='round'/>`
      + `<path d='M3 13 C4 11,6 15,8 13' stroke='${stroke}' stroke-width='0.9' fill='none' stroke-linecap='round' stroke-linejoin='round'/>`
      + `<path d='M9 12 C10 11,11 13,12 12' stroke='${stroke}' stroke-width='0.9' fill='none' stroke-linecap='round' stroke-linejoin='round'/>`
      + "</svg>";
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, []);

  // Broadcast chat open/close to coordinate with other floating UI (e.g., WhatsApp button)
  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent('sehatkor:chat-open-changed', { detail: { isOpen } }));
    } catch { }
  }, [isOpen]);

  // Load pending requests count
  const loadPendingRequestsCount = async () => {
    try {
      const requests = await getPendingRequests();
      setPendingRequestsCount(requests.length);
    } catch (error) {
      // Silently fail, don't show error for this
    }
  };

  // Refresh users list when connections are accepted
  const handleConnectionAccepted = async () => {
    try {
      // Refresh both connected users and conversations
      const [usersList, convs] = await Promise.all([getConnectedUsers(), fetchConversations()]);
      setUsers(usersList);
      setConversations(convs);
      // Also refresh pending requests count
      loadPendingRequestsCount();
    } catch (error) {
      // Silently fail, don't show error for this
    }
  };

  // Show remove user confirmation modal
  const onRemoveUser = (user: any) => {
    setRemoveTargetUser(user);
    setRemoveUserOpen(true);
  };

  // Handle removing user connection from chat
  const handleRemoveConnection = async () => {
    if (!removeTargetUser) return;
    try {
      await deleteUserConnection(removeTargetUser._id);
      toast({
        title: "Connection Removed",
        description: `Connection with ${removeTargetUser.name} has been removed`
      });
      // Refresh connected users and conversations
      const [usersList, convs] = await Promise.all([getConnectedUsers(), fetchConversations()]);
      setUsers(usersList);
      setConversations(convs);
      setRemoveUserOpen(false);
      setRemoveTargetUser(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove connection",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPendingRequestsCount();
    }
  }, [isOpen]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMediumScreen(window.innerWidth >= 640 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Initial load of connected users and conversations on mount (and when user changes)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingUsers(true);
        setUsersError(null);
        const [usersList, convs] = await Promise.all([
          getConnectedUsers(),
          fetchConversations(),
        ]);
        if (!alive) return;
        setUsers(usersList);
        setConversations(convs);
      } catch (err: any) {
        if (!alive) return;
        setUsersError(err?.message || 'Failed to load chat data');
      } finally {
        if (alive) setLoadingUsers(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);


  const [contextMessageId, setContextMessageId] = useState<string | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const msgElRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastTouchPointRef = useRef<{ x: number; y: number } | null>(null);
  const connectionsSearchInputRef = useRef<HTMLInputElement | null>(null);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [forwardQuery, setForwardQuery] = useState("");
  const [forwardSourceMessage, setForwardSourceMessage] = useState<any | null>(null);
  const [forwardSending, setForwardSending] = useState(false);
  const [forwardSendingUserId, setForwardSendingUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetMessage, setDeleteTargetMessage] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<'me' | 'everyone' | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioInitializedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const pendingOpenConvIdRef = useRef<string | null>(null);
  // Reply state and swipe gesture anchor
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  // Ask for notification permission (was accidentally removed in edits)
  const requestNotificationPermissionIfNeeded = async () => {
    try {
      if (!('Notification' in window)) return;
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    } catch { }
  };

  const notifyOS = (title: string, body: string) => {
    try {
      if (!('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;
      new Notification(title, { body, silent: false });
    } catch { }
  };

  // Briefly highlight a message by id and scroll it into view if needed
  const flashMessage = (messageId: string) => {
    try {
      const el = msgElRefs.current[messageId];
      if (!el) return;
      // Add a temporary highlight ring
      el.classList.add('ring-2', 'ring-emerald-300/70');
      setTimeout(() => {
        try { el.classList.remove('ring-2', 'ring-emerald-300/70'); } catch { }
      }, 1500);
      // Ensure it's visible
      try { el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch { }
    } catch { }
  };

  // Unlock/initialize audio on first user interaction so we can play sounds when messages arrive
  useEffect(() => {
    // Try to pre-request notification permission early
    requestNotificationPermissionIfNeeded();

    if (audioInitializedRef.current) return;
    let removed = false;
    const initAudio = async () => {
      if (audioInitializedRef.current) return;
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        const el = audioRef.current;
        el.src = '/sounds/notification.wav';
        el.preload = 'auto';
        el.volume = 0.5;
        el.muted = true;
        try { await el.play(); } catch { }
        try { el.pause(); } catch { }
        el.currentTime = 0;
        el.muted = false;
      } catch { }
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume();
        }
      } catch { }
      audioInitializedRef.current = true;
    };
    const handler = () => {
      initAudio();
      // after first attempt, remove listeners
      if (!removed) {
        removed = true;
        document.removeEventListener('pointerdown', handler);
        document.removeEventListener('keydown', handler);
        document.removeEventListener('touchstart', handler);
        document.removeEventListener('click', handler);
      }
    };
    document.addEventListener('pointerdown', handler);
    document.addEventListener('keydown', handler);
    document.addEventListener('touchstart', handler);
    document.addEventListener('click', handler);
    return () => {
      if (!removed) {
        document.removeEventListener('pointerdown', handler);
        document.removeEventListener('keydown', handler);
        document.removeEventListener('touchstart', handler);
        document.removeEventListener('click', handler);
      }
    };
  }, []);

  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, c: any) => sum + (c?.unreadCount || 0), 0);
  }, [conversations]);

  // Build quick index of replies for each original message
  const replyChildrenIndex = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const m of messages) {
      const pid = (m as any)?.replyToId;
      if (pid) {
        const arr = map.get(String(pid)) || [];
        arr.push(m);
        map.set(String(pid), arr);
      }
    }
    return map;
  }, [messages]);

  const firstWords = (text: string, count: number) => {
    if (!text) return '';
    const words = text.trim().split(/\s+/).slice(0, count);
    const preview = words.join(' ');
    return preview + (text.trim().split(/\s+/).length > count ? '…' : '');
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateLabel = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const yest = new Date();
    yest.setDate(today.getDate() - 1);
    const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
    if (sameDay(d, today)) return 'Today';
    if (sameDay(d, yest)) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
  };

  const playNotificationSound = async () => {
    let played = false;
    // Ensure audio context is available and resumed
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        try { await audioCtxRef.current.resume(); } catch { }
      }
    } catch { }

    // Try playing from audio file sources
    try {
      const testSrcs = [
        '/sounds/notification.wav',
        '/notification.wav',
        '/sounds/notification.mp3',
        '/notification.mp3',
      ];
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.preload = 'auto';
        audioRef.current.volume = 0.5;
      }
      const el = audioRef.current;
      for (const src of testSrcs) {
        try {
          if (el.src !== src) el.src = src;
          el.currentTime = 0;
          await el.play();
          played = true;
          break;
        } catch {
          // try next
        }
      }
    } catch { }

    // Fallback beep using Web Audio if file playback failed
    if (!played) {
      try {
        const ctx = audioCtxRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
        if (ctx.state === 'suspended') {
          try { await ctx.resume(); } catch { }
        }
        const duration = 0.2;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.0001, now);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.stop(now + duration);
      } catch { }
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    if (isMobile || isMediumScreen) {
      setShowUserList(true);
    }
    // On open, start from user list only (desktop too)
    setHasSelectedUser(false);
    setActiveUser(null);
    setConversationId(null);
    setMessages([]);

    const token = localStorage.getItem('sehatkor_token');
    if (!token) {
      setUsersError('Please login to use chat');
      setUsers([]);
      return;
    }
    setLoadingUsers(true);
    setUsersError(null);
    Promise.all([getConnectedUsers(), fetchConversations()])
      .then((list) => {
        const [usersList, convs] = list as any;
        setUsers(usersList);
        setConversations(convs);
        // If an incoming message arrived while closed, auto-open that conversation
        const pendingId = pendingOpenConvIdRef.current;
        if (pendingId) {
          const conv = convs.find((c: any) => String(c._id) === String(pendingId));
          if (conv) {
            const other = (conv.participants || []).find((p: any) => (p?._id || p) !== myId);
            const otherId = (other && (other as any)._id) ? (other as any)._id : (other as any);
            const u = usersList.find((uu: any) => String(uu._id) === String(otherId));
            if (u) {
              openChatWith(u);
            }
          }
          pendingOpenConvIdRef.current = null;
        }
      })
      .catch((err: any) => {
        setUsers([]);
        setUsersError(err?.message || 'Failed to load users');
      })
      .finally(() => setLoadingUsers(false));
  }, [isOpen]);

  useEffect(() => {
    const token = localStorage.getItem('sehatkor_token');
    if (!token) return;
    let sc: any;
    try {
      sc = getSocket();
    } catch {
      return;
    }
    const onNewMessage = (m: any) => {
      if (m.conversationId === conversationId) {
        setMessages((prev) => {
          // Helper to normalize various id forms
          const normId = (v: any) => String((v && (v._id || v)) || '');
          // First, remove any optimistic message matched by clientNonce
          if ((m as any)?.clientNonce) {
            const byNonce = prev.filter((x: any) => x?.clientNonce !== (m as any).clientNonce);
            const refByNonce = (m as any)?.replyToId ? byNonce.find((x) => normId(x._id) === normId((m as any).replyToId)) : undefined;
            return [...byNonce, refByNonce ? { ...m, replyTo: refByNonce } : m];
          }
          const filtered = prev.filter((x: any) => {
            if (!x?.local) return true;
            const sameType = String(x.type) === String(m.type);
            const sameSender = normId(x.sender) === normId((m as any).sender);
            const sameReply = normId(x.replyToId || '') === normId((m as any).replyToId || '');
            let sameContent = false;
            if (m.type === 'text') {
              sameContent = String(x.text || '').trim() === String((m as any).text || '').trim();
            } else if (m.type === 'image') {
              sameContent = !!x.fileUrl && String(x.fileUrl) === String((m as any).fileUrl || '');
            }
            return !(sameType && sameSender && sameReply && sameContent);
          });
          const ref = (m as any)?.replyToId ? filtered.find((x) => normId(x._id) === normId((m as any).replyToId)) : undefined;
          // If this is a reply and the referenced message is on screen, flash it
          if (ref) {
            setTimeout(() => flashMessage(String((m as any).replyToId)), 0);
          }
          return [...filtered, ref ? { ...m, replyTo: ref } : m];
        });
        // Mark as read if the conversation is currently open
        try { markAsRead(m.conversationId); } catch { }
        setConversations((prev) => prev.map((c) => String(c._id) === String(m.conversationId)
          ? { ...c, unreadCount: 0, lastMessage: { type: m.type, text: m.text, fileUrl: m.fileUrl, fileName: m.fileName, fileSize: m.fileSize, sender: m.sender, createdAt: m.createdAt } }
          : c));
      }
      setConversations((prev) => {
        const next = [...prev];
        const idx = next.findIndex(c => c._id === m.conversationId);
        if (idx !== -1) {
          const item = { ...next[idx] };
          const myId = (user as any)?.id || (user as any)?._id;
          if (!activeUser || m.sender !== myId) {
            item.unreadCount = (item.unreadCount || 0) + 1;
          }
          item.lastMessage = { type: m.type, text: m.text, fileUrl: m.fileUrl, fileName: m.fileName, fileSize: m.fileSize, sender: m.sender, createdAt: m.createdAt };
          next.splice(idx, 1);
          next.unshift(item);
        } else {
          // Conversation not in list yet (e.g., chat closed and not fetched). Add a lightweight entry so badge updates.
          next.unshift({
            _id: m.conversationId,
            participants: [],
            unreadCount: 1,
            lastMessage: { type: m.type, text: m.text, fileUrl: m.fileUrl, fileName: m.fileName, fileSize: m.fileSize, sender: m.sender, createdAt: m.createdAt },
            updatedAt: m.createdAt,
          } as any);
        }
        return next;
      });
      try {
        const myId = (user as any)?.id || (user as any)?._id;
        if (m.sender && String(m.sender) !== String(myId)) {
          // Attempt in-app sound first
          playNotificationSound();
          // Also trigger OS-level notification sound if permission granted and chat is closed
          if (!isOpen) {
            const title = 'New message';
            const body = m.type === 'text' ? (m.text || 'New message') : 'New image message';
            notifyOS(title, body);
          }
        }
      } catch { }
    };
    const onOnline = (ids: string[]) => setOnlineIds(ids || []);
    const onConnectionAccepted = async (data: any) => {
      // Refresh chat user list when a connection is accepted
      try {
        const [usersList, convs] = await Promise.all([getConnectedUsers(), fetchConversations()]);
        setUsers(usersList);
        setConversations(convs);
        // Show notification
        toast({
          title: "Connection Established",
          description: data.message || "You can now chat with this user"
        });
      } catch (error) {
        // Silently fail, don't show error for this
      }
    };

    sc.on("new_message", onNewMessage);
    const onCleared = (evt: any) => {
      if (!evt?.conversationId) return;
      setConversations((prev) => prev.map((c) => String(c._id) === String(evt.conversationId) ? { ...c, lastMessage: undefined, unreadCount: 0 } : c));
      if (evt.conversationId === conversationId) {
        setMessages([]);
      }
    };
    sc.on('conversation_cleared', onCleared);
    sc.on("online_users", onOnline);
    sc.on('connection_accepted', onConnectionAccepted);

    return () => {
      sc?.off("new_message", onNewMessage);
      sc?.off("online_users", onOnline);
      sc?.off('conversation_cleared', onCleared);
      sc?.off('connection_accepted', onConnectionAccepted);

    };
  }, [conversationId, isOpen, user, activeUser]);

  useEffect(() => {
    if (listRef.current) {
      try {
        listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
      } catch {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }
  }, [messages]);

  const onCopyMessage = async (m: any) => {
    try {
      if (m.type === 'text' && m.text) {
        await navigator.clipboard.writeText(m.text);
        alert('Copied');
      } else if (m.type === 'image' && m.fileUrl) {
        await navigator.clipboard.writeText(m.fileUrl);
        alert('Image URL copied');
      }
    } catch { }
  };

  const onForwardMessage = (m: any) => {
    setForwardSourceMessage(m);
    setForwardQuery("");
    setForwardOpen(true);
  };

  const onDownloadMessage = async (m: any) => {
    try {
      if ((m.type === 'image' || m.type === 'file') && m.fileUrl) {
        const a = document.createElement('a');
        a.href = m.fileUrl;
        a.download = (m.fileName || (m.type === 'image' ? 'image.jpg' : 'file')) as string;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch {
      try { if (m.fileUrl) window.open(m.fileUrl, '_blank'); } catch { }
    }
  };

  const onDeleteMessage = (m: any) => {
    setDeleteTargetMessage(m);
    setDeleteConfirmOpen(true);
  };

  const doDelete = async (scope: 'me' | 'everyone') => {
    if (!deleteTargetMessage || deleting) return;
    setDeleting(scope);
    try {
      const sc = getSocket();
      await new Promise<void>((resolve, reject) => {
        sc.emit('delete_message', { messageId: deleteTargetMessage._id, scope }, (resp: any) => {
          if (resp?.success) resolve();
          else reject(new Error(resp?.error || 'Failed'));
        });
      });
      apiDeleteMessage(deleteTargetMessage._id, scope).catch(() => { });
      setMessages((prev) => prev.filter((mm) => mm._id !== deleteTargetMessage._id));
      setDeleteConfirmOpen(false);
      setDeleteTargetMessage(null);
    } catch (e: any) {
      try {
        await apiDeleteMessage(deleteTargetMessage._id, scope);
        setMessages((prev) => prev.filter((mm) => mm._id !== deleteTargetMessage._id));
        setDeleteConfirmOpen(false);
        setDeleteTargetMessage(null);
      } catch (err2: any) {
        alert(e?.message || err2?.message || 'Failed to delete');
      }
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('sehatkor_token');
    if (!token || !isOpen) return;
    let sc: any;
    try { sc = getSocket(); } catch { return; }
    const onMessageDeleted = (evt: any) => {
      if (evt?.conversationId === conversationId) {
        setMessages((prev) => prev.map((mm) =>
          mm._id === evt.messageId
            ? { ...mm, isDeleted: true, text: 'This message was deleted' }
            : mm
        ));
      }
    };
    sc.on('message_deleted', onMessageDeleted);
    return () => { sc?.off('message_deleted', onMessageDeleted); };
  }, [conversationId, isOpen, user, activeUser]);

  const startLongPress = (mId: string, e: React.TouchEvent) => {
    if (!isMobile) return;
    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    const t = e.touches?.[0];
    if (t) {
      lastTouchPointRef.current = { x: t.clientX, y: t.clientY };
      swipeStartRef.current = { x: t.clientX, y: t.clientY };
    }
    longPressTimerRef.current = window.setTimeout(() => {
      setContextMessageId(mId);
      const el = msgElRefs.current[mId];
      const pt = lastTouchPointRef.current;
      try {
        if (el) {
          const event = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: pt?.x ?? undefined,
            clientY: pt?.y ?? undefined,
          } as MouseEventInit);
          el.dispatchEvent(event);
        }
      } catch { }
    }, 450);
  };
  const cancelLongPress = () => {
    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
    lastTouchPointRef.current = null;
    // do not clear swipeStartRef here; we need it for touchend
  };

  const handleTouchEndForSwipe = (m: any, e: React.TouchEvent) => {
    if (!isMobile) return;
    const end = e.changedTouches?.[0];
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!end || !start) return;
    const dx = end.clientX - start.x;
    const dy = end.clientY - start.y;
    // Swipe right to reply (thresholds tuned for chat)
    if (dx > 60 && Math.abs(dy) < 40) {
      setReplyTo(m);
    }
  };

  const initials = (name?: string) => (name ? name.split(" ").map(n => n[0]).slice(0, 2).join("") : "U");

  const normalizedRoleTokens = (role?: string) => {
    const r = (role || "").toLowerCase();
    const tokens = new Set<string>();
    if (!r) return tokens;
    tokens.add(r);
    if (r.includes('clinic') || r.includes('hospital')) {
      tokens.add('clinic');
      tokens.add('hospital');
    }
    if (r.includes('lab')) {
      tokens.add('lab');
      tokens.add('laboratory');
    }
    if (r.includes('pharm')) {
      tokens.add('pharmacy');
      tokens.add('chemist');
    }
    if (r.includes('doctor')) tokens.add('doctor');
    if (r.includes('patient')) tokens.add('patient');
    return tokens;
  };

  const myId = useMemo(() => (user as any)?.id || (user as any)?._id, [user]);

  const displayUsers = useMemo(() => {
    const otherIdFromConv = (c: any) => {
      const parts = (c.participants || []) as any[];
      const other = parts.find((p: any) => (p?._id || p) !== myId);
      return (other && (other as any)._id) ? (other as any)._id : (other as any);
    };

    // Filter users based on search query
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? users.filter((u: any) => {
        const name = (u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const role = (u.role || '').toLowerCase();
        if (name.includes(q) || email.includes(q) || role.includes(q)) return true;
        const tokens = normalizedRoleTokens(u.role);
        return tokens.has(q);
      })
      : users;

    const rank = new Map<string, number>();
    conversations.forEach((c, idx) => {
      const otherId = otherIdFromConv(c);
      if (otherId) rank.set(String(otherId), idx);
    });

    return [...filtered].sort((a: any, b: any) => {
      const ra = rank.has(a._id) ? rank.get(a._id)! : Number.POSITIVE_INFINITY;
      const rb = rank.has(b._id) ? rank.get(b._id)! : Number.POSITIVE_INFINITY;
      if (ra !== rb) return ra - rb;
      const an = (a.name || '').toLowerCase();
      const bn = (b.name || '').toLowerCase();
      if (an < bn) return -1;
      if (an > bn) return 1;
      return 0;
    });
  }, [users, searchQuery, conversations, myId]);

  const openChatWith = async (user: any) => {
    if (isMobile || isMediumScreen) {
      setShowUserList(false);
    }
    setActiveUser(user);
    setHasSelectedUser(true);
    const conv = await getOrCreateConversation(user._id);
    setConversationId(conv._id);

    const sc = getSocket();
    sc.emit("join_conversation", conv._id);
    setConversations((prev) => {
      const next = [...prev];
      const idx = next.findIndex((c) => c._id === conv._id);
      if (idx !== -1) {
        const item = { ...next[idx] };
        next.splice(idx, 1);
        next.unshift(item);
      } else {
        next.unshift({ ...conv, unreadCount: 0 });
      }
      return next;
    });
    const msgs = await fetchMessages(conv._id);
    // hydrate replyTo from replyToId using local map
    const map = new Map<string, any>();
    for (const m of msgs) map.set(String(m._id), m);
    const hydrated = msgs.map((m: any) => {
      if (m.replyToId) {
        const ref = map.get(String(m.replyToId));
        if (ref) return { ...m, replyTo: ref };
      }
      return m;
    });
    setMessages(hydrated);
    try { await markAsRead(conv._id); } catch { }
    setConversations((prev) => {
      const idx = prev.findIndex(c => c._id === conv._id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], unreadCount: 0 };
      return next;
    });
  };

  // Global chat opener: listens for 'sehatkor:open-chat' custom events
  useEffect(() => {
    const handler = async (evt: Event) => {
      const e = evt as CustomEvent<{ serviceName?: string; providerName?: string; providerId?: string }>;
      const detail = e.detail || {};
      const token = localStorage.getItem('sehatkor_token');
      if (!token) {
        setUsersError('Please login to use chat');
        setIsOpen(true);
        return;
      }

      setIsOpen(true);
      try {
        // Ensure we have a fresh list of users and conversations
        setLoadingUsers(true);
        const [usersList, convs] = await Promise.all([getConnectedUsers(), fetchConversations()]);
        setUsers(usersList);
        setConversations(convs);

        // Try to find connected user by providerId first
        const pid = (detail.providerId || '').trim();
        let target = pid ? usersList.find((u: any) => String(u._id) === String(pid)) : null;
        if (!target && detail.providerName) {
          const nameLc = detail.providerName.toLowerCase();
          target = usersList.find((u: any) => (u.name || '').toLowerCase() === nameLc);
        }

        if (target) {
          await openChatWith(target);
          return;
        }

        // Not connected: switch to Connections tab only. Do NOT auto-send or prefill search.
        setActiveTab('connections');
        // autofocus the connections search so user can type immediately
        setTimeout(() => {
          try { connectionsSearchInputRef.current?.focus(); } catch { }
        }, 0);
        toast({ title: 'Not connected', description: 'Connection section opened. Please send a request to connect first.' });
      } finally {
        setLoadingUsers(false);
      }
    };

    window.addEventListener('sehatkor:open-chat', handler as EventListener);
    return () => window.removeEventListener('sehatkor:open-chat', handler as EventListener);
  }, [toast, openChatWith]);

  const handleSend = () => {
    if (!message.trim() || !conversationId || !activeUser) return;
    setSending(true);
    const sc = getSocket();
    const clientNonce = `${myId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const payload = {
      conversationId,
      recipientId: activeUser._id,
      type: 'text',
      text: message.trim(),
      replyToId: replyTo?._id || undefined,
      clientNonce,
    } as any;
    sc.emit('send_message', payload, (resp: any) => {
      setSending(false);
      if (resp?.success) {
        setMessage("");
        setReplyTo(null);
        setConversations((prev) => {
          const next = [...prev];
          const idx = next.findIndex((c) => c._id === conversationId);
          const lm = {
            text: payload.text,
            type: 'text',
            sender: myId,
            createdAt: new Date().toISOString(),
            replyToId: payload.replyToId,
            replyTo: replyTo
              ? {
                _id: replyTo._id,
                type: replyTo.type,
                text: replyTo.text,
                fileUrl: replyTo.fileUrl,
              }
              : undefined,
          } as any;
          if (idx !== -1) {
            const item = { ...next[idx], lastMessage: lm };
            next.splice(idx, 1);
            next.unshift(item);
          } else {
            next.unshift({
              _id: conversationId,
              participants: [
                { _id: myId },
                { _id: activeUser._id },
              ],
              unreadCount: 0,
              lastMessage: lm,
              updatedAt: new Date().toISOString(),
            });
          }
          return next;
        });
      }
    });
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>, kind: 'image') => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !conversationId || !activeUser) return;

    if (!file.type.startsWith('image/')) {
      alert('Only images are allowed.');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setPendingAttachment({ file, kind, previewUrl });
  };

  const cancelPendingAttachment = () => {
    if (pendingAttachment?.previewUrl) URL.revokeObjectURL(pendingAttachment.previewUrl);
    setPendingAttachment(null);
  };

  const sendPendingAttachment = async () => {
    if (!pendingAttachment || !conversationId || !activeUser) return;
    try {
      setSending(true);
      const uploaded = await uploadFile(pendingAttachment.file);
      const sc = getSocket();
      const clientNonce = `${myId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      sc.emit('send_message', {
        conversationId,
        recipientId: activeUser._id,
        type: 'image',
        fileUrl: uploaded.url,
        fileName: pendingAttachment.file.name,
        fileSize: pendingAttachment.file.size,
        replyToId: replyTo?._id || undefined,
        clientNonce,
      });
      setReplyTo(null);
      setConversations((prev) => {
        const next = [...prev];
        const idx = next.findIndex((c) => c._id === conversationId);
        const lm = {
          text: pendingAttachment.file.name,
          type: 'image',
          sender: myId,
          createdAt: new Date().toISOString(),
          replyToId: replyTo?._id || undefined,
          replyTo: replyTo
            ? {
              _id: replyTo._id,
              type: replyTo.type,
              text: replyTo.text,
              fileUrl: replyTo.fileUrl,
            }
            : undefined,
        } as any;
        if (idx !== -1) {
          const item = { ...next[idx], lastMessage: lm };
          next.splice(idx, 1);
          next.unshift(item);
        } else {
          next.unshift({
            _id: conversationId,
            participants: [
              { _id: myId },
              { _id: activeUser._id },
            ],
            unreadCount: 0,
            lastMessage: lm,
            updatedAt: new Date().toISOString(),
          });
        }
        return next;
      });
    } finally {
      setSending(false);
      cancelPendingAttachment();
    }
  };



  const onClearChatForMe = async () => {
    if (!conversationId || clearingChat) return;
    setClearingChat(true);
    try {
      // Get all messages in the conversation and mark them as deleted for current user
      const messagesToClear = messages.filter(m => {
        const myId = (user as any)?.id || (user as any)?._id;
        const senderId = (m as any)?.sender?._id || (m as any)?.sender;
        // Only clear messages that are not already deleted for me
        return !m.deletedFor?.includes(myId);
      });

      // Clear messages for current user by calling delete API with scope 'me'
      await Promise.all(
        messagesToClear.map(m => apiDeleteMessage(m._id, 'me'))
      );

      // Remove messages from local state
      setMessages([]);

      // Update conversation to show no unread messages for current user
      setConversations((prev) => prev.map((c) =>
        String(c._id) === String(conversationId)
          ? { ...c, unreadCount: 0 }
          : c
      ));

      toast({ title: 'Chat cleared', description: 'Messages cleared for you only.' });
      setClearChatOpen(false);
    } catch (e: any) {
      toast({ title: 'Failed to clear chat', description: e?.message || 'Try again later', variant: 'destructive' });
    } finally {
      setClearingChat(false);
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      cameraStreamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        const v = cameraVideoRef.current as any;
        if (v) {
          v.srcObject = stream;
          v.play?.();
        }
      }, 0);
    } catch (e) {
      alert('Unable to access camera. Please allow camera permission or use gallery.');
    }
  };

  const closeCamera = () => {
    const stream = cameraStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    const v = cameraVideoRef.current as any;
    if (v) v.srcObject = null;
    setCameraOpen(false);
  };

  const capturePhoto = async () => {
    try {
      const v = cameraVideoRef.current as HTMLVideoElement | null;
      if (!v) return;
      const width = v.videoWidth || 1280;
      const height = v.videoHeight || 720;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(v, 0, 0, width, height);
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve as any, 'image/jpeg', 0.92));
      if (!blob) return;
      const fileName = `camera-${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(blob);
      setPendingAttachment({ file, kind: 'image', previewUrl });
    } finally {
      closeCamera();
    }
  };

  const onChangeMyAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    // Use dedicated avatar upload endpoint which persists and returns updated user
    const uploaded = await uploadProfileImage(file);
    if (uploaded?.user?.avatar || uploaded?.avatar || uploaded?.url) {
      const avatarUrl = uploaded?.user?.avatar || uploaded?.avatar || uploaded?.url;
      updateCurrentUser({ avatar: avatarUrl });
    }
  };

  return (
    <>
      {/* Blurred backdrop effect for ALL screen sizes */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`fixed ${isOpen
        ? (isMobile || isMediumScreen)
          ? 'inset-0 flex items-center justify-center p-2 z-50'
          : 'bottom-3 right-3 z-50'
        : 'bottom-3 right-3 z-50'
        }`}>
        {isOpen && (
          <Card className={`${(isMobile || isMediumScreen)
            ? 'w-full h-full max-h-[100vh]'
            : hasSelectedUser ? 'w-[36rem] lg:w-[42rem] h-[28rem]' : 'w-64 lg:w-72 h-[28rem]'
            } flex shadow-xl rounded-2xl border bg-white/95 backdrop-blur-md overflow-hidden`}>

            {/* Users Sidebar */}
            <div className={`${(isMobile || isMediumScreen) && !showUserList
              ? 'hidden'
              : 'flex'
              } ${(isMobile || isMediumScreen)
                ? 'w-full'
                : hasSelectedUser ? 'w-64 lg:w-72 border-r' : 'w-full'
              } bg-white/80 flex-col h-full transition-all duration-300 relative`}>
              <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-50 border border-red-100 rounded-lg">
                      <Stethoscope className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold leading-tight">Chats</div>
                      <div className="text-[10px] text-muted-foreground leading-tight">Verified users</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-0.5 bg-gray-100 p-0.5 rounded-lg mt-3">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'chat'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <MessageCircle className="w-3 h-3 inline mr-1" />
                    Chat
                  </button>
                  <button
                    onClick={() => setActiveTab('connections')}
                    className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'connections'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <UserPlus className="w-3 h-3 inline mr-1" />
                    Connections
                    {pendingRequestsCount > 0 && (
                      <span className="ml-1 bg-red-500 text-white rounded-full text-[10px] px-1.5 py-0.5">
                        {pendingRequestsCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 px-3">
                {activeTab === 'chat' ? (
                  <>
                    {/* Search Input for Chat Section */}
                    <div className="p-3 space-y-3">
                      <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by name or role (doctor, hospital, lab, pharmacy)"
                          className="pl-9"
                          disabled={loadingUsers}
                        />
                      </div>
                      {usersError && (
                        <div className="mx-4 my-3">
                          <div className="bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 border border-red-100 rounded-xl p-6 text-center shadow-sm">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <LogIn className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-2">Login Required</h3>
                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                              Please login to your account to start chatting with verified healthcare professionals
                            </p>
                            <Button
                              onClick={() => window.location.href = '/login'}
                              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                            >
                              <LogIn className="w-4 h-4 mr-2" />
                              Login Now
                            </Button>
                          </div>
                        </div>
                      )}
                      {!loadingUsers && !usersError && users.length === 0 && (
                        <div className="text-xs text-muted-foreground">No verified users found</div>
                      )}
                    </div>

                    {loadingUsers ? (
                      <div className="space-y-1 py-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg">
                            <div className="relative">
                              <Skeleton className="h-12 w-12 rounded-full" />
                              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-gray-200" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-3 w-10 rounded-full" />
                              </div>
                              <Skeleton className="h-3 w-32" />
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              <Skeleton className="h-3 w-8" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {displayUsers.map((u) => {
                          const conv = conversations.find(c => (c.participants || []).some((p: any) => (p?._id || p) === u._id));
                          const unread = conv?.unreadCount || 0;
                          const isOnline = onlineIds.includes(String((u as any)._id));
                          return (
                            <ContextMenu key={u._id}>
                              <ContextMenuTrigger asChild>
                                <button
                                  onClick={() => openChatWith(u)}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gradient-to-r hover:from-gray-50 hover:to-red-25 relative transition-all duration-300 rounded-lg ${activeUser?._id === u._id ? 'bg-gradient-to-r from-red-50 to-red-100 shadow-sm' : 'hover:shadow-sm'}`}
                                >
                                  <div className={`relative ${isOnline ? 'p-[2.5px] rounded-full bg-gradient-to-br from-rose-400 via-rose-300 to-sky-500 ring-1 ring-rose-300/45 shadow-[0_0_6px_rgba(244,63,94,0.08)]' : ''}`}>
                                    <Avatar className={`h-12 w-12 rounded-full shadow ${isOnline ? 'bg-white' : 'ring-2 ring-white'}`}>
                                      {u?.avatar && <AvatarImage src={u.avatar} alt={u.name} />}
                                      <AvatarFallback className="bg-gradient-to-br from-red-100 to-red-200 text-red-700 text-base font-semibold">
                                        {initials(u.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ${isOnline ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1 min-w-0">
                                      <span className="text-[11px] sm:text-xs font-semibold text-gray-800 leading-tight whitespace-nowrap flex-auto min-w-0">
                                        {u.name.split(' ').slice(0, 2).join(' ')}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {(() => {
                                        const conv = conversations.find(c => (c.participants || []).some((p: any) => (p?._id || p) === u._id));
                                        const last = conv?.lastMessage;
                                        if (!last) return <span className="truncate">{u.email}</span>;
                                        const lastSender = (last as any)?.sender?._id || (last as any)?.sender;
                                        const mine = String(lastSender) === String(myId);
                                        return (
                                          <div className="flex items-center gap-1">
                                            <span className="inline-flex items-center gap-1">
                                              <span className={`h-1.5 w-1.5 rounded-full ${mine ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                              <span className={`${mine ? 'text-blue-600' : 'text-emerald-700'} ${last.type === 'image' ? 'text-[11px]' : ''}`}>
                                                {last.type === 'image' ?
                                                  (mine ? 'Photo Sent' : 'Photo Received') :
                                                  (mine ? 'Sent' : 'Received')
                                                }
                                              </span>
                                            </span>
                                            {last.type === 'image' ? (
                                              <span className="inline-flex items-center gap-0.5 truncate">
                                                <ImageIcon className="w-3 h-3 text-red-500" />
                                              </span>
                                            ) : (
                                              <span className="truncate">{firstWords((last.text || ''), 3)}</span>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end gap-1">
                                    <div className="scale-75">
                                      <UserBadge role={u.role} />
                                    </div>
                                    {(() => {
                                      const conv = conversations.find(c => (c.participants || []).some((p: any) => (p?._id || p) === u._id));
                                      const last = conv?.lastMessage;
                                      if (last?.createdAt) {
                                        return <span className="text-xs text-gray-400 font-medium">{formatTime(last.createdAt)}</span>;
                                      }
                                      return null;
                                    })()}
                                    {unread > 0 && (
                                      <span className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-xs px-2 py-1 min-w-[20px] text-center leading-none shadow-sm font-medium">{unread > 99 ? '99+' : unread}</span>
                                    )}
                                  </div>
                                </button>
                              </ContextMenuTrigger>
                              <ContextMenuContent className="w-auto min-w-0 rounded-2xl border border-gray-200/70 bg-gradient-to-b from-white via-white to-gray-50/90 backdrop-blur-xl backdrop-saturate-150 shadow-[0_12px_50px_rgba(0,0,0,0.15)] ring-1 ring-white/70 p-1.5">
                                <ContextMenuItem
                                  onSelect={() => onRemoveUser(u)}
                                  className="group gap-2.5 rounded-xl px-2.5 py-1.5 h-auto text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/80 focus:bg-red-50 transition-all duration-200 cursor-pointer"
                                >
                                  <span className="inline-flex items-center justify-center rounded-full bg-red-100/80 text-red-600 p-1 transition-all duration-200 group-hover:scale-110 group-hover:bg-red-200/90 group-hover:shadow-sm">
                                    <UserX className="w-3.5 h-3.5" />
                                  </span>
                                  <span className="font-medium text-sm whitespace-nowrap">Remove</span>
                                </ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenu>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-2 px-2 sm:px-4">
                    <ConnectionRequests onConnectionAccepted={handleConnectionAccepted} />
                  </div>
                )}
              </div>

              {/* Current user profile bottom section */}
              <div className="p-3 mt-auto border-t bg-white/90 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar onClick={() => user?.avatar && setAvatarPreviewOpen(true)} className="h-8 w-8 ring-2 ring-red-100 cursor-zoom-in">
                      {user?.avatar && <AvatarImage src={user.avatar} alt={user?.name} />}
                      <AvatarFallback>
                        <User className="w-4 h-4 text-red-500" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm leading-none">
                      <div className="font-medium truncate max-w-[8rem]">{user?.name || 'Me'}</div>
                      <div className="text-[10px] text-muted-foreground">My profile</div>
                    </div>
                  </div>
                  <button onClick={() => setAvatarOpen(true)} title="Change photo" className="p-2 rounded-md bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-sm">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Avatar preview dialog */}
            <Dialog open={avatarPreviewOpen} onOpenChange={setAvatarPreviewOpen}>
              <DialogContent className="sm:max-w-lg bg-white rounded-xl">
                <div className="w-full max-h-[70vh] overflow-hidden rounded-lg flex items-center justify-center bg-neutral-50">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name || 'Profile'} className="w-full h-full object-contain" />
                  ) : null}
                </div>
              </DialogContent>
            </Dialog>

            {/* Camera dialog */}
            <Dialog open={cameraOpen} onOpenChange={(v) => v ? setCameraOpen(true) : closeCamera()}>
              <DialogContent className="w-screen h-screen sm:w-[95vw] sm:h-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-gradient-to-br from-gray-900 via-black to-gray-900 sm:rounded-2xl p-0 overflow-hidden border-0 sm:border-2 sm:border-gray-700/50 shadow-2xl">
                <div className="relative w-full h-full sm:h-auto sm:aspect-video bg-black sm:rounded-2xl overflow-hidden">
                  {/* Header with title and close button */}
                  <div className="absolute top-0 left-0 right-0 z-20 pt-8 pb-4 px-4 sm:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white font-medium text-sm sm:text-base">Camera Active</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={closeCamera}
                        className="text-white hover:bg-white/20 rounded-full w-8 h-8 sm:w-9 sm:h-9 p-0 text-lg"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>

                  {/* Video feed */}
                  <video
                    ref={cameraVideoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />

                  {/* Camera overlay frame - responsive */}
                  <div className="absolute inset-3 sm:inset-4 border-2 border-white/30 rounded-lg pointer-events-none">
                    <div className="absolute top-0 left-0 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-l-2 border-white rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-r-2 border-white rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-l-2 border-white rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-r-2 border-white rounded-br-lg"></div>
                  </div>

                  {/* Bottom controls - responsive layout */}
                  <div className="absolute bottom-0 left-0 right-0 pb-6 px-6 pt-4 sm:p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                    {/* Mobile layout - optimized positioning */}
                    <div className="flex sm:hidden items-center justify-between">
                      {/* Close button - left side */}
                      <Button
                        variant="outline"
                        onClick={closeCamera}
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm rounded-full w-12 h-12 p-0 transition-all duration-200 text-lg"
                      >
                        ✕
                      </Button>

                      {/* Main capture button - center */}
                      <Button
                        onClick={capturePhoto}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full w-16 h-16 p-0 font-semibold text-2xl"
                      >
                        📷
                      </Button>

                      {/* Switch camera button - right side */}
                      <Button
                        variant="outline"
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm rounded-full w-12 h-12 p-0 transition-all duration-200 text-lg"
                        title="Switch Camera"
                      >
                        🔄
                      </Button>
                    </div>

                    {/* Desktop/tablet layout - enhanced design */}
                    <div className="hidden sm:flex items-center justify-center gap-6 md:gap-8">
                      {/* Close button */}
                      <Button
                        variant="outline"
                        onClick={closeCamera}
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm rounded-full px-5 md:px-6 py-2.5 md:py-3 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <span className="mr-2 text-lg">✕</span>
                        <span className="font-medium">Close</span>
                      </Button>

                      {/* Main capture button - enhanced */}
                      <Button
                        onClick={capturePhoto}
                        className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 rounded-full px-8 md:px-10 py-3 md:py-4 font-bold text-lg border-2 border-white/20"
                      >
                        <span className="mr-3 text-2xl">📷</span>
                        <span className="hidden md:inline">Capture Photo</span>
                        <span className="md:hidden">Capture</span>
                      </Button>

                      {/* Switch camera button - enhanced */}
                      <Button
                        variant="outline"
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm rounded-full w-12 h-12 md:w-14 md:h-14 p-0 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                        title="Switch Camera"
                      >
                        <span className="text-xl md:text-2xl">🔄</span>
                      </Button>
                    </div>

                    {/* Instructions - responsive text */}
                    <div className="text-center mt-3 sm:mt-4">
                      <p className="text-white/70 text-xs sm:text-sm">
                        <span className="hidden sm:inline">Position yourself in the frame and click capture when ready</span>
                        <span className="sm:hidden">Tap the center button to capture</span>
                      </p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <ProfileAvatarDialog open={avatarOpen} onOpenChange={setAvatarOpen} />

            {/* Chat Panel Header */}
            <div className={`${(isMobile || isMediumScreen) && showUserList ? 'hidden' : ''} ${(!isMobile && !isMediumScreen && !hasSelectedUser) ? 'hidden' : 'flex'} flex-1 flex-col transition-all duration-300 h-full`}>
              <div className="sticky top-0 z-10 flex items-center p-3 border-b bg-white/90 backdrop-blur">
                {/* Back button for mobile and medium screens */}
                {(isMobile || isMediumScreen) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUserList(true)}
                    className="mr-2 h-8 w-8 p-0 hover:bg-gray-100 transition-colors text-red-500 hover:text-red-600"
                    aria-label="Back to user list"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                )}

                {/* User Info - Now aligned to left */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {activeUser ? (
                    <>
                      <Avatar className="h-8 w-8 ring-2 ring-red-100">
                        {activeUser?.avatar && <AvatarImage src={activeUser.avatar} alt={activeUser?.name} />}
                        <AvatarFallback>
                          <User className="w-4 h-4 text-red-500" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{activeUser.name}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {/* Online status indicator moved here */}
                          <span className={`inline-flex h-2 w-2 rounded-full ${onlineIds.includes(String((activeUser as any)?._id)) ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                          <UserBadge role={activeUser.role} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-red-50 border border-red-100 rounded-lg">
                        <Stethoscope className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="font-semibold text-sm">SehatKor Chat</div>
                    </div>
                  )}
                </div>
                {activeUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[12rem] rounded-xl border bg-white/95 backdrop-blur-md shadow-2xl p-1">
                      <DropdownMenuItem onSelect={() => setClearChatOpen(true)} className="flex items-center gap-2 text-orange-600 focus:text-orange-700 focus:bg-orange-50">
                        <MessageCircle className="w-4 h-4" />
                        Clear Chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {activeUser ? (
                <>
                  <div
                    ref={listRef}
                    className="flex-1 p-3 overflow-y-auto space-y-2 bg-muted/20"
                    style={{ backgroundImage: `url(${chatPatternUrl})`, backgroundRepeat: 'repeat', backgroundSize: '16px 16px' }}
                  >
                    {messages.length === 0 && (
                      <div className="mb-3 px-1">
                        <div className="flex items-center justify-center mb-2">
                          <div className="flex items-center justify-center w-9 h-9 bg-red-50 border border-red-100 rounded-lg">
                            <Stethoscope className="w-4 h-4 text-red-600" />
                          </div>
                        </div>
                        <div className="space-y-1 text-center text-[11px] text-muted-foreground">
                          <p>Messages are end-to-end private within SehatKor.</p>
                          <p>Be respectful and keep health info confidential.</p>
                          <p>Avoid sharing passwords, OTPs, or sensitive codes.</p>
                          <p>For emergencies, call your local emergency number.</p>
                        </div>
                      </div>
                    )}

                    {messages.map((m, idx) => {
                      const myId = (user as any)?.id || (user as any)?.['_id'];
                      const senderId = (m as any)?.sender?._id || (m as any)?.sender;
                      const mine = senderId === myId;
                      const prev = messages[idx - 1];
                      const showDate = !prev || (new Date(m.createdAt).toDateString() !== new Date(prev.createdAt).toDateString());
                      return (
                        <Fragment key={m._id}>
                          {showDate && (
                            <div className="sticky top-1 z-[1] flex justify-center my-2">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border text-muted-foreground shadow-sm">{formatDateLabel(m.createdAt)}</span>
                            </div>
                          )}
                          <ContextMenu>
                            <ContextMenuTrigger asChild>
                              <div
                                ref={(el) => { msgElRefs.current[m._id] = el; }}
                                onContextMenu={() => { setContextMessageId(m._id); }}
                                onTouchStart={(e) => startLongPress(m._id, e)}
                                onTouchEnd={(e) => { handleTouchEndForSwipe(m, e); cancelLongPress(); }}
                                onTouchMove={cancelLongPress}
                                className={`group relative max-w-[75%] p-2 rounded-2xl text-sm border transition-all ${mine
                                  ? 'ml-auto bg-gray-50 text-gray-900 border-gray-200 shadow-sm hover:shadow'
                                  : 'bg-white text-gray-900 border-gray-200 shadow-sm hover:shadow'} ${m.isDeleted ? 'opacity-60 bg-gray-100' : ''}`}
                              >
                                {/* Quoted reply preview inside bubble */}
                                {m.replyTo || (m.replyToId && messages.find((x) => x._id === m.replyToId)) ? (
                                  <div className={`mb-1 pl-2 pr-2 py-1 border-l-2 ${mine ? 'border-blue-300' : 'border-emerald-300'} text-[11px] text-gray-600/90 bg-white/60 rounded-sm`}>
                                    {(() => {
                                      const refMsg = (m as any).replyTo || messages.find((x) => x._id === (m as any).replyToId);
                                      if (!refMsg) return null;
                                      const isImg = refMsg.type === 'image';
                                      return (
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="font-medium text-gray-700 shrink-0">Reply</span>
                                          {isImg ? (
                                            <div className="flex items-center gap-1 min-w-0">
                                              {refMsg.fileUrl ? (
                                                <img src={refMsg.fileUrl} className="h-8 w-8 rounded border object-cover" alt="Replied" />
                                              ) : (
                                                <ImageIcon className="w-3 h-3 text-red-500" />
                                              )}
                                              <span className="text-gray-700 truncate">Photo</span>
                                            </div>
                                          ) : (
                                            <span className="truncate">{firstWords(refMsg.text || '', 10)}</span>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                ) : null}
                                {m.isDeleted ? (
                                  <div className="text-gray-500 italic text-xs">This message was deleted</div>
                                ) : (
                                  <>
                                    {m.type === 'text' && (
                                      <div className={`whitespace-pre-wrap leading-relaxed ${m.text?.startsWith('🎯 Service Connection Established!')
                                        ? 'text-sm bg-green-50/70 border border-green-200/50 rounded-lg p-2 shadow-sm max-w-[85%]'
                                        : ''}`}>
                                        {m.text?.startsWith('🎯 Service Connection Established!') ? (
                                          <div className="space-y-2">
                                            {m.text.split('\n').map((line, idx) => {
                                              if (line.includes('💡 I am interested in your service:')) {
                                                return (
                                                  <div key={idx} className="font-semibold text-green-800 text-sm">
                                                    {line.replace('💡 I am interested in your service:', '💡 I am interested in your service:')}
                                                  </div>
                                                );
                                              }
                                              if (line.includes('📋 **Service Details:**')) {
                                                return (
                                                  <div key={idx} className="font-semibold text-green-800 text-sm">
                                                    {line}
                                                  </div>
                                                );
                                              }
                                              if (line.includes('• Service:')) {
                                                return (
                                                  <div key={idx} className="text-green-700 text-sm ml-2">
                                                    {line}
                                                  </div>
                                                );
                                              }
                                              if (line.includes('• 🔗 View Details:')) {
                                                const linkMatch = line.match(/• 🔗 View Details: (https?:\/\/[^\s]+)/);
                                                if (linkMatch) {
                                                  return (
                                                    <div key={idx} className="flex items-center gap-2 ml-2">
                                                      <span className="text-green-600">🔗</span>
                                                      <a
                                                        href={linkMatch[1]}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-green-600 hover:text-green-700 underline font-medium transition-colors"
                                                      >
                                                        View Service Details
                                                      </a>
                                                    </div>
                                                  );
                                                }
                                              }
                                              if (line.includes('💬 Ready to discuss')) {
                                                return (
                                                  <div key={idx} className="text-green-700 text-sm italic">
                                                    {line}
                                                  </div>
                                                );
                                              }
                                              return <div key={idx}>{line}</div>;
                                            })}
                                          </div>
                                        ) : (
                                          m.text
                                        )}
                                      </div>
                                    )}
                                    {m.type === 'image' && (
                                      <a href={m.fileUrl} download={(m.fileName || 'image.jpg') as string} target="_blank" rel="noopener" className="block">
                                        <img src={m.fileUrl} className="rounded-xl max-h-56 border shadow-sm" />
                                      </a>
                                    )}
                                    {m.type === 'file' && (
                                      <a href={m.fileUrl} download={(m.fileName || 'file') as string} target="_blank" rel="noopener" className="underline">
                                        {m.fileName || 'Download file'}
                                      </a>
                                    )}
                                  </>
                                )}
                                <div className="mt-1 text-[10px] opacity-70 flex items-center gap-1 justify-end">
                                  <span>{formatTime(m.createdAt)}</span>
                                  {mine && !m.isDeleted && (
                                    <span title={m.readAt ? 'Read' : 'Sent'}>{m.readAt ? '✔✔' : '✔'}</span>
                                  )}
                                </div>
                              </div>
                            </ContextMenuTrigger>
                            {/* Lightweight reply indicator under original message (latest reply preview) */}
                            {(() => {
                              const ch = replyChildrenIndex.get(String(m._id));
                              if (!ch || ch.length === 0) return null;
                              const latest = ch[ch.length - 1];
                              const fromMe = String((latest as any)?.sender?._id || (latest as any)?.sender) === String(myId);
                              const isImg = (latest as any)?.type === 'image';
                              return (
                                <div className={`mt-1 max-w-[70%] ${mine ? 'ml-auto' : ''} text-[11px] text-gray-600 bg-white/70 border rounded-xl px-2 py-1 flex items-center gap-2`}>
                                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${fromMe ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                  <span className={`shrink-0 ${fromMe ? 'text-blue-600' : 'text-emerald-700'}`}>{fromMe ? 'You replied:' : 'Replied:'}</span>
                                  {isImg ? (
                                    <span className="inline-flex items-center gap-1 min-w-0">
                                      {(latest as any)?.fileUrl ? (
                                        <img src={(latest as any).fileUrl} className="h-6 w-6 rounded border object-cover" alt="Reply" />
                                      ) : (
                                        <ImageIcon className="w-3 h-3 text-red-500" />
                                      )}
                                      <span className="truncate">Photo</span>
                                    </span>
                                  ) : (
                                    <span className="truncate">{firstWords(((latest as any)?.text || ''), 10)}</span>
                                  )}
                                </div>
                              );
                            })()}
                            <ContextMenuContent className="min-w-[12rem] rounded-2xl border border-gray-200/70 bg-gradient-to-b from-white to-gray-50/80 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_40px_rgba(0,0,0,0.12)] ring-1 ring-white/60 p-2">
                              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500/90">Message actions</div>
                              <ContextMenuItem onSelect={() => setReplyTo(m)} className="group gap-3 rounded-lg px-3 py-2.5 h-auto text-[13px] hover:bg-gradient-to-r hover:from-gray-50 hover:to-white/60 focus:bg-gray-50 transition-colors">
                                <span className="inline-flex items-center justify-center rounded-full bg-sky-50 text-sky-700 p-1.5 transition-transform duration-150 group-hover:scale-110">
                                  <CornerUpLeft className="w-4 h-4" />
                                </span>
                                <span className="font-medium">Reply</span>
                              </ContextMenuItem>
                              {m.isDeleted ? (
                                <ContextMenuItem disabled className="gap-3 rounded-lg px-3 py-2.5 h-auto text-gray-400">
                                  <span className="inline-flex items-center justify-center rounded-full bg-gray-50 text-gray-400 p-1.5">
                                    <Trash2 className="w-4 h-4" />
                                  </span>
                                  <span className="font-medium">Message deleted</span>
                                </ContextMenuItem>
                              ) : (
                                <>
                                  <ContextMenuItem onSelect={() => onCopyMessage(m)} className="group gap-3 rounded-lg px-3 py-2.5 h-auto hover:bg-gradient-to-r hover:from-gray-50 hover:to-white/60 transition-colors">
                                    <span className="inline-flex items-center justify-center rounded-full bg-indigo-50 text-indigo-700 p-1.5 transition-transform duration-150 group-hover:scale-110">
                                      <Copy className="w-4 h-4" />
                                    </span>
                                    <span className="font-medium">Copy</span>
                                  </ContextMenuItem>
                                  {(m.type === 'image' || m.type === 'file') && m.fileUrl && (
                                    <ContextMenuItem onSelect={() => onDownloadMessage(m)} className="group gap-3 rounded-lg px-3 py-2.5 h-auto hover:bg-gradient-to-r hover:from-gray-50 hover:to-white/60 transition-colors">
                                      <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 text-emerald-700 p-1.5 transition-transform duration-150 group-hover:scale-110">
                                        <Download className="w-4 h-4" />
                                      </span>
                                      <span className="font-medium">Download</span>
                                    </ContextMenuItem>
                                  )}
                                  <ContextMenuItem onSelect={() => onForwardMessage(m)} className="group gap-3 rounded-lg px-3 py-2.5 h-auto hover:bg-gradient-to-r hover:from-gray-50 hover:to-white/60 transition-colors">
                                    <span className="inline-flex items-center justify-center rounded-full bg-violet-50 text-violet-700 p-1.5 transition-transform duration-150 group-hover:scale-110">
                                      <Forward className="w-4 h-4" />
                                    </span>
                                    <span className="font-medium">Forward</span>
                                  </ContextMenuItem>
                                  <div className="h-px bg-gray-100 my-1" />
                                  <ContextMenuItem onSelect={() => onDeleteMessage(m)} className="group gap-3 rounded-lg px-3 py-2.5 h-auto text-red-600 hover:bg-red-50 focus:bg-red-50 transition-colors">
                                    <span className="inline-flex items-center justify-center rounded-full bg-red-50 text-red-600 p-1.5 transition-transform duration-150 group-hover:scale-110">
                                      <Trash2 className="w-4 h-4" />
                                    </span>
                                    <span className="font-medium">Delete</span>
                                  </ContextMenuItem>
                                </>
                              )}
                            </ContextMenuContent>
                          </ContextMenu>
                        </Fragment>
                      );
                    })}
                  </div>

                  <div className="p-1 border-t bg-white/90">
                    {pendingAttachment && (
                      <div className="mb-2 p-2 md:p-3 border rounded-lg bg-white shadow-sm">
                        <div className="flex flex-col items-start gap-3">
                          <img src={pendingAttachment.previewUrl} className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-md border flex-shrink-0" />
                          <div className="flex-1 min-w-0 w-full">
                            <div className="text-xs sm:text-sm font-medium truncate max-w-full">{pendingAttachment.file.name}</div>
                            <div className="text-[10px] sm:text-[11px] text-muted-foreground truncate">{(pendingAttachment.file.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                          <div className="flex items-center gap-2 w-full justify-end">
                            <Button size="sm" variant="secondary" onClick={cancelPendingAttachment} className="whitespace-nowrap flex-1">Remove</Button>
                            <Button size="sm" onClick={sendPendingAttachment} disabled={sending} className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white whitespace-nowrap flex-1">Send</Button>
                          </div>
                        </div>
                      </div>
                    )}
                    {replyTo && (
                      <div className="mb-2 p-2 border rounded-lg bg-white shadow-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-8 rounded bg-rose-300 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] text-gray-600 flex items-center gap-2 min-w-0">
                              <span className="font-medium">Replying to</span>
                              {(() => {
                                const isImg = (replyTo as any)?.type === 'image';
                                if (isImg) return (
                                  <span className="inline-flex items-center gap-1 min-w-0">
                                    {(replyTo as any)?.fileUrl ? (
                                      <img src={(replyTo as any).fileUrl} className="h-6 w-6 rounded border object-cover" alt="Replied" />
                                    ) : (
                                      <ImageIcon className="w-3 h-3 text-red-500" />
                                    )}
                                    <span className="text-gray-700 truncate">Photo</span>
                                  </span>
                                );
                                return <span className="truncate inline-block max-w-[16rem] align-middle">{firstWords((replyTo as any)?.text || '', 10)}</span>;
                              })()}
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setReplyTo(null)}>Cancel</Button>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <label className="p-2 rounded-md cursor-pointer bg-red-600 hover:bg-red-700 text-white shadow-sm" title="Choose from gallery">
                        <ImageIcon className="w-4 h-4 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => onPickFile(e, 'image')} />
                      </label>
                      <button type="button" onClick={openCamera} className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white shadow-sm" title="Capture photo">
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                      <Input
                        placeholder={activeUser ? "Type a message..." : "Pick a user to start chatting"}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={!activeUser || sending}
                        className="rounded-full"
                      />
                      <Button size="sm" onClick={handleSend} disabled={!activeUser || sending} className="p-2 rounded-md cursor-pointer bg-red-600 hover:bg-red-700 text-white shadow-sm">
                        <Send className="w-4 h-4 text-white" />
                      </Button>
                    </div>
                  </div>

                  {/* Forward dialog */}
                  <Dialog open={forwardOpen} onOpenChange={(v) => { if (!forwardSending) setForwardOpen(v as boolean); }}>
                    <DialogContent aria-busy={forwardSending} className="sm:max-w-md rounded-xl bg-white/95 backdrop-blur-md">
                      <DialogTitle>Select user to forward</DialogTitle>
                      {forwardSending && (
                        <DialogDescription className="flex items-center gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Sending...</DialogDescription>
                      )}
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <Input
                            value={forwardQuery}
                            onChange={(e) => setForwardQuery(e.target.value)}
                            placeholder="Search verified users..."
                            className="pl-9"
                            disabled={forwardSending}
                          />
                        </div>
                        <div className="max-h-72 overflow-y-auto pr-1">
                          {displayUsers
                            .filter((u) => (u.name || '').toLowerCase().includes(forwardQuery.trim().toLowerCase()))
                            .map((u) => (
                              <button
                                key={u._id}
                                disabled={forwardSending}
                                onClick={async () => {
                                  if (forwardSending) return;
                                  setForwardSending(true);
                                  setForwardSendingUserId(u._id);
                                  try {
                                    const conv = await getOrCreateConversation(u._id);
                                    const sc = getSocket();
                                    const m = forwardSourceMessage;
                                    const payload: any = { conversationId: conv._id, recipientId: u._id, type: m.type };
                                    if (m.type === 'text') payload.text = m.text;
                                    if (m.type === 'image') { payload.fileUrl = m.fileUrl; payload.fileName = m.fileName; payload.fileSize = m.fileSize; }
                                    await new Promise<void>((resolve) => {
                                      sc.emit('send_message', payload, () => resolve());
                                    });
                                    toast({ title: 'Message forwarded', description: `Sent to ${u.name}` });
                                    setForwardOpen(false);
                                    setForwardSourceMessage(null);
                                  } finally {
                                    setForwardSending(false);
                                    setForwardSendingUserId(null);
                                  }
                                }}
                                className={`w-full flex items-center gap-2 p-2 rounded-lg transition border ${forwardSending ? 'opacity-60' : 'hover:bg-gray-100 border-transparent'}`}
                              >
                                <Avatar className="h-8 w-8 ring-2 ring-red-100">
                                  {u?.avatar && <AvatarImage src={u.avatar} alt={u.name} />}
                                  <AvatarFallback>
                                    <User className="w-4 h-4 text-red-500" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="truncate text-sm">
                                  <div className="font-medium truncate max-w-[14rem]">{u.name}</div>
                                  <div className="text-[10px] text-muted-foreground truncate">{u.email}</div>
                                </div>
                                {forwardSendingUserId === u._id && (
                                  <Loader2 className="ml-auto w-4 h-4 animate-spin" />
                                )}
                              </button>
                            ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>



                  {/* Clear Chat confirm modal */}
                  <Dialog open={clearChatOpen} onOpenChange={(v) => { if (!clearingChat) setClearChatOpen(v as boolean); }}>
                    <DialogContent className="rounded-xl bg-white/95 backdrop-blur-md w-[calc(100%-2rem)] max-w-sm sm:w-[calc(100%-4rem)]">
                      <DialogTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-orange-600" />
                        Clear Chat?
                      </DialogTitle>
                      <DialogDescription>This will clear all messages in this chat for you only. The other person will still see their messages. This cannot be undone.</DialogDescription>
                      <div className="flex items-center gap-2 pt-2">
                        <Button variant="outline" onClick={() => setClearChatOpen(false)} disabled={clearingChat}>
                          Cancel
                        </Button>
                        <Button onClick={onClearChatForMe} disabled={clearingChat} className="bg-orange-600 hover:bg-orange-700 text-white">
                          {clearingChat ? (
                            <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Clearing…</span>
                          ) : (
                            <span className="inline-flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Clear Chat</span>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Delete confirm modal */}
                  <Dialog open={deleteConfirmOpen} onOpenChange={(v) => { if (!deleting) setDeleteConfirmOpen(v as boolean); }}>
                    <DialogContent className="sm:max-w-sm rounded-xl bg-white/95 backdrop-blur-md">
                      <DialogTitle>Delete message?</DialogTitle>
                      <DialogDescription>Choose how you want to delete this message.</DialogDescription>
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="secondary"
                          disabled={!!deleting}
                          onClick={() => doDelete('me')}
                          className="flex-1"
                        >
                          {deleting === 'me' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete for me'}
                        </Button>
                        {(() => {
                          const lastSender = (deleteTargetMessage as any)?.sender?._id || (deleteTargetMessage as any)?.sender;
                          const mine = String(lastSender || '') === String(myId || '');
                          if (!mine) return null;
                          return (
                            <Button
                              disabled={!!deleting}
                              onClick={() => doDelete('everyone')}
                              className="flex-1 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                            >
                              {deleting === 'everyone' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete for everyone'}
                            </Button>
                          );
                        })()}
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <div className="flex-1 bg-muted/20 flex items-center justify-center p-6">
                  <div className="text-center space-y-2">
                    <div className="mx-auto flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-red-50 border border-red-100 rounded-2xl">
                      <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
                    </div>
                    <div className="text-xl sm:text-2xl font-semibold text-gray-800 tracking-wide">SehatKor</div>
                    <div className="text-[10px] text-muted-foreground">Select a user to start chatting</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Remove User Confirmation Modal */}
        <Dialog open={removeUserOpen} onOpenChange={setRemoveUserOpen}>
          <DialogContent className="max-w-md">
            <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-600" />
              Remove Connection
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 space-y-3">
              <div>
                Are you sure you want to remove <span className="font-medium text-gray-900">{removeTargetUser?.name}</span> from your connections?
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 text-xs font-bold">!</span>
                  </div>
                  <div className="text-amber-800 text-xs">
                    <div className="font-medium mb-1">This action cannot be undone:</div>
                    <ul className="space-y-1 text-amber-700">
                      <li>• This user will no longer appear in your chat list</li>
                      <li>• You'll need to send a new connection request to chat again</li>
                      <li>• Your chat history will be preserved</li>
                    </ul>
                  </div>
                </div>
              </div>
            </DialogDescription>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setRemoveUserOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRemoveConnection}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Remove Connection
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {!isOpen && (
          <div className="relative">
            <Button
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full bg-[#00A786] hover:bg-[#008f72] text-white shadow-[0_0_20px_rgba(0,167,134,0.5)] hover:shadow-[0_0_25px_rgba(0,167,134,0.6)] ring-2 ring-white/60 transition-all duration-300 hover:scale-105"
              aria-label="Open SehatKor Chat"
            >
              <Stethoscope className="w-7 h-7 text-white" />
            </Button>
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 text-white rounded-full text-[11px] h-6 w-6 grid place-items-center shadow-[0_0_10px_rgba(59,130,246,0.65),0_0_20px_rgba(99,102,241,0.55)] ring-1 ring-white/40 leading-none">
                {totalUnread}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingChat;