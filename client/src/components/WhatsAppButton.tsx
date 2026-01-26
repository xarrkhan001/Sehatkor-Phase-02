import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// Minimal WhatsApp logo SVG (white glyph). Button provides the green background.
const WhatsAppIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    {/* Outer bubble outline (transparent – we only render the glyph in white) */}
    <path fill="none" d="M0 0h32v32H0z" />
    {/* WhatsApp phone + bubble glyph (white). Using currentColor so it follows text color. */}
    <path d="M19.11 17.03c-.32-.16-1.86-.92-2.15-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1.01 1.24-.19.21-.37.24-.69.08-.32-.16-1.33-.49-2.53-1.57-.93-.83-1.56-1.85-1.74-2.16-.18-.32-.02-.49.14-.65.14-.14.32-.37.47-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.98-2.34-.26-.63-.52-.54-.71-.55-.18-.01-.4-.01-.62-.01-.21 0-.56.08-.86.4-.29.32-1.13 1.1-1.13 2.69 0 1.59 1.16 3.13 1.32 3.35.16.21 2.28 3.48 5.53 4.86.77.33 1.37.53 1.84.68.77.25 1.47.21 2.02.13.62-.09 1.86-.76 2.12-1.49.26-.73.26-1.35.18-1.49-.08-.13-.29-.21-.61-.37zM26.47 5.53C23.92 3 20.61 1.67 17.08 1.67 9.76 1.67 3.81 7.63 3.81 14.94c0 2.33.61 4.61 1.76 6.62L3 29l7.6-2.49c1.96 1.07 4.17 1.64 6.48 1.64 7.32 0 13.27-5.96 13.27-13.27 0-3.53-1.33-6.84-3.88-9.35zm-9.39 20.8c-2.04 0-4.04-.55-5.79-1.58l-.42-.25-4.51 1.48 1.48-4.38-.27-.45c-1.11-1.83-1.7-3.94-1.7-6.08 0-6.52 5.31-11.82 11.85-11.82 3.16 0 6.13 1.23 8.36 3.46 2.23 2.22 3.47 5.19 3.47 8.35 0 6.52-5.31 11.82-11.85 11.82z" />
  </svg>
);

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
    const phoneNumber = "+923141521115"; // SehatKor Official WhatsApp Number
    const message = "Hello SehatKor Team! I would like to inquire about your healthcare services. Please assist me.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Hide on mobile and md when chat is open
  const shouldHide = chatOpen && (isMobile || isMediumScreen);

  return shouldHide ? null : (
    <Button
      onClick={handleWhatsAppClick}
      aria-label="Contact on WhatsApp"
      className="fixed bottom-4 left-4 z-40 w-14 h-14 rounded-full text-white shadow-xl ring-2 ring-white/50 bg-[#25D366] hover:bg-[#1ebe57] transition-all duration-300 hover:scale-105"
    >
      <WhatsAppIcon className="w-10 h-10" />
    </Button>
  );
};

export default WhatsAppButton;