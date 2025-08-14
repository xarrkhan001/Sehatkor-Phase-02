import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const WhatsAppButton = () => {
  const isMobile = useIsMobile();
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMediumScreen(window.innerWidth >= 640 && window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent)?.detail as { isOpen?: boolean } | undefined;
      if (detail && typeof detail.isOpen === 'boolean') setChatOpen(!!detail.isOpen);
    };
    window.addEventListener('sehatkor:chat-open-changed', handler as EventListener);
    return () => window.removeEventListener('sehatkor:chat-open-changed', handler as EventListener);
  }, []);
  const handleWhatsAppClick = () => {
    const phoneNumber = "+923001234567"; // Replace with actual WhatsApp number
    const message = "Hi! I need help with SehatKor services.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Hide on mobile and md when chat is open
  const shouldHide = chatOpen && (isMobile || isMediumScreen);

  return shouldHide ? null : (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-4 left-4 z-40 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-strong"
    >
      <MessageCircle className="w-6 h-6" />
    </Button>
  );
};

export default WhatsAppButton;