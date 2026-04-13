import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Phone, X, Stethoscope, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoNew from '@/assets/logo-new.png';

const WhatsAppIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    <path fill="none" d="M0 0h32v32H0z" />
    <path d="M19.11 17.03c-.32-.16-1.86-.92-2.15-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1.01 1.24-.19.21-.37.24-.69.08-.32-.16-1.33-.49-2.53-1.57-.93-.83-1.56-1.85-1.74-2.16-.18-.32-.02-.49.14-.65.14-.14.32-.37.47-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.98-2.34-.26-.63-.52-.54-.71-.55-.18-.01-.4-.01-.62-.01-.21 0-.56.08-.86.4-.29.32-1.13 1.1-1.13 2.69 0 1.59 1.16 3.13 1.32 3.35.16.21 2.28 3.48 5.53 4.86.77.33 1.37.53 1.84.68.77.25 1.47.21 2.02.13.62-.09 1.86-.76 2.12-1.49.26-.73.26-1.35.18-1.49-.08-.13-.29-.21-.61-.37zM26.47 5.53C23.92 3 20.61 1.67 17.08 1.67 9.76 1.67 3.81 7.63 3.81 14.94c0 2.33.61 4.61 1.76 6.62L3 29l7.6-2.49c1.96 1.07 4.17 1.64 6.48 1.64 7.32 0 13.27-5.96 13.27-13.27 0-3.53-1.33-6.84-3.88-9.35zm-9.39 20.8c-2.04 0-4.04-.55-5.79-1.58l-.42-.25-4.51 1.48 1.48-4.38-.27-.45c-1.11-1.83-1.7-3.94-1.7-6.08 0-6.52 5.31-11.82 11.85-11.82 3.16 0 6.13 1.23 8.36 3.46 2.23 2.22 3.47 5.19 3.47 8.35 0 6.52-5.31 11.82-11.85 11.82z" />
  </svg>
);

export const FloatingHelpMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync unread count from FloatingChat if needed
  useEffect(() => {
    // This is optional since FloatingChat usually handles its own badge, 
    // but we can listen for updates if we want to show it on the main menu button.
  }, []);

  const handleWhatsAppClick = () => {
    const phoneNumber = "+923141521115";
    const message = "Hello SehatKor Team! I would like to inquire about your healthcare services.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    setIsOpen(false);
  };

  const handleChatClick = () => {
    window.dispatchEvent(new CustomEvent('sehatkor:open-chat'));
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {/* Menu Options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="flex flex-col items-end gap-3 mb-2"
          >
            {/* WhatsApp Option */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 group"
            >
              <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 text-slate-700 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                WhatsApp Support
              </span>
              <Button
                onClick={handleWhatsAppClick}
                className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#1ebe57] text-white shadow-lg shadow-green-500/20 ring-2 ring-white"
              >
                <WhatsAppIcon className="w-7 h-7" />
              </Button>
            </motion.div>

            {/* SehatKor Chat Option */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 group"
            >
              <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 text-slate-700 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                SehatKor Chat
              </span>
              <Button
                onClick={handleChatClick}
                className="w-12 h-12 rounded-full bg-white hover:bg-gray-50 text-emerald-600 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500 p-0 overflow-hidden"
              >
                <img src={logoNew} alt="SehatKor Chat" className="w-8 h-8 object-contain" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center ${
            isOpen 
            ? "bg-slate-800 hover:bg-slate-900 rotate-90" 
            : "bg-emerald-600 hover:bg-emerald-700 animate-pulse-slow"
          } text-white ring-4 ring-white/30`}
        >
          {isOpen ? <X className="w-7 h-7" /> : <MessageSquare className="w-7 h-7" />}
        </Button>
        {!isOpen && (
            <div className="absolute -top-1 -right-1 flex h-4 w-4">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-4 w-4 bg-red-400"></span>
            </div>
        )}
      </motion.div>
    </div>
  );
};

// Add CSS for pulse-slow if not defined
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse-slow {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.95; transform: scale(1.02); }
  }
  .animate-pulse-slow {
    animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;
document.head.appendChild(style);

export default FloatingHelpMenu;
