import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, LogIn, CheckCircle2, Star, ShieldCheck, Gift, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";

const RegistrationPromoModal = () => {
    const { isAuthenticated } = useAuth();
    const { pathname } = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

    useEffect(() => {
        // Reset dismissal state when navigating away from home page
        if (pathname !== '/') {
            setHasBeenDismissed(false);
            setIsOpen(false);
            return;
        }

        if (!isAuthenticated && !hasBeenDismissed) {
            setIsOpen(true);
        }
    }, [isAuthenticated, pathname, hasBeenDismissed]);

    const handleDismiss = () => {
        setIsOpen(false);
        setHasBeenDismissed(true);
    };

    if (isAuthenticated || pathname !== '/') return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    {/* Add Google Font for Urdu */}
                    <style>
                        {`
                        @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
                        .font-urdu-premium {
                            font-family: 'Noto Nastaliq Urdu', serif;
                        }
                        `}
                    </style>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 100 }}
                        transition={{ type: "spring", damping: 20, stiffness: 120 }}
                        className="relative w-full max-w-3xl overflow-hidden bg-white rounded-[2.5rem] shadow-[0_45px_130px_rgba(0,0,0,0.5)] border border-white/20"
                    >
                        {/* AD BANNER STYLE LAYOUT */}
                        <div className="flex flex-col md:flex-row min-h-[480px]">
                            
                            {/* Visual Ad Section - Increased Width */}
                            <div className="hidden md:flex md:w-[46%] bg-slate-900 relative overflow-hidden group border-r border-white/5">
                                {/* Background Image with Overlay */}
                                <div className="absolute inset-0 z-0 text-center">
                                    <img 
                                        src="https://images.unsplash.com/photo-1576091160550-21735999181c?auto=format&fit=crop&q=80&w=1000" 
                                        alt="Healthcare" 
                                        className="w-full h-full object-cover opacity-40 scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 via-slate-900/40 to-transparent"></div>
                                </div>

                                <div className="relative z-10 h-full p-8 flex flex-col justify-between text-white">
                                    <div className="space-y-3">
                                        <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                                            <Sparkles className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <h3 className="text-xl font-black leading-tight tracking-tight">
                                            Trusted by <br/> <span className="text-emerald-400">10k+ Residents</span>
                                        </h3>
                                    </div>

                                    {/* Middle Content - Filling the void */}
                                    <div className="space-y-5 py-4">
                                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Security</p>
                                                <p className="text-[11px] font-bold text-white/90">100% Privacy Protected</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                                            <Star className="w-6 h-6 text-emerald-400" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Status</p>
                                                <p className="text-[11px] font-bold text-white/90">Elite Digital Services</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <ul className="grid grid-cols-1 gap-2">
                                            {["Verified Labs", "Top Doctors", "24/7 Care"].map((item, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider bg-white/5 py-1.5 px-3 rounded-lg border border-white/5">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Content Ad Section (Urdu) */}
                            <div className="w-full md:w-[60%] p-8 md:p-10 flex flex-col justify-center relative bg-white">
                                {/* Close button */}
                                <button 
                                    onClick={handleDismiss}
                                    className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-red-50 transition-all text-slate-300 hover:text-red-500 border border-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                    <div className="space-y-6 text-left" dir="ltr">
                                        <div className="flex justify-start">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full text-red-600 text-[8px] font-black uppercase tracking-widest border border-red-100 shadow-sm animate-pulse">
                                                <ShieldCheck className="w-3.5 h-3.5" /> 
                                                <span className="font-urdu-premium mt-0.5">مکمل رسائی کے لیے ضروری ہے</span>
                                            </div>
                                        </div>

                                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-[1.4] mb-2">
                                            <span className="block">Behtar Sehat,</span>
                                            <span className="text-emerald-600 relative inline-block">
                                                Behtar Mustaqbil
                                                <div className="absolute -bottom-1 left-0 w-full h-2 bg-emerald-100 -z-10 rounded-full"></div>
                                            </span>
                                        </h2>
                                        <p className="text-slate-600 text-[15px] md:text-[16px] leading-[1.8] font-bold font-urdu-premium" dir="rtl">
                                            صحت کور پاکستان کا نمبر 1 ڈیجیٹل ہیلتھ کیئر پلیٹ فارم ہے۔ آپ ہمارے پلیٹ فارم سے تبہی فائدہ اٹھا سکیں گے جب آپ رجسٹر ہوں گے۔
                                        </p>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <Link to="/register" onClick={handleDismiss}>
                                            <Button className="w-full h-15 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-black shadow-xl shadow-emerald-500/20 transform transition-all hover:scale-[1.02] py-7">
                                                <UserPlus className="w-6 h-6 ml-3" />
                                                <span className="font-urdu-premium">مفت رجسٹریشن کریں</span>
                                            </Button>
                                        </Link>
                                        
                                        <div className="flex items-center gap-4 py-1">
                                            <div className="h-[1px] bg-slate-50 flex-1"></div>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] font-urdu-premium">یا پھر</span>
                                            <div className="h-[1px] bg-slate-50 flex-1"></div>
                                        </div>

                                        <Link to="/login" onClick={handleDismiss}>
                                            <Button variant="ghost" className="w-full h-12 rounded-xl border border-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 text-lg font-black font-urdu-premium">
                                                پہلے سے اکاؤنٹ موجود ہے؟ لاگ ان کریں
                                            </Button>
                                        </Link>
                                    </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default RegistrationPromoModal;
