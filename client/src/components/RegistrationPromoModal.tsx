import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, LogIn, CheckCircle2, Star, ShieldCheck, Gift, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import logoNew from '@/assets/logo-new.png';

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
                <div className="fixed inset-0 z-[1000] flex items-center justify-center md:p-4 bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                    {/* Add Google Font for Urdu */}
                    <style>
                        {`
                        @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
                        .font-urdu-premium {
                            font-family: 'Noto Nastaliq Urdu', serif;
                        }
                        .ad-gradient-overlay {
                            background: linear-gradient(180deg, rgba(6, 78, 59, 0.2) 0%, rgba(6, 78, 59, 0.95) 100%);
                        }
                        @keyframes ticker-scroll {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); }
                        }
                        .ticker-track {
                            display: flex;
                            width: max-content;
                            animation: ticker-scroll 55s linear infinite;
                        }
                        `}
                    </style>

                    {/* MOBILE INTERSTITIAL AD VIEW - PERFECTED FLYER STYLE */}
                    <div className="block md:hidden fixed inset-0 w-full h-full bg-white z-[1001] flex flex-col overflow-hidden">
                        {/* Top Visual Section (Balanced height) */}
                        <div className="relative h-[52%] w-full overflow-hidden">
                            <div className="absolute inset-0 z-0">
                                <img 
                                    src="/healthcare_promo_bg.png" 
                                    alt="Healthcare Ad" 
                                    className="w-full h-full object-cover object-[center_15%]"
                                />
                                <div className="absolute inset-0 bg-emerald-900/40 mix-blend-multiply"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                            </div>
                            
                            {/* Slanted Bottom Edge */}
                            <div className="absolute bottom-[-1px] left-0 w-full h-10 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 100%)' }}></div>
                            
                            {/* Close Button - Glassmorphism */}
                            <button 
                                onClick={handleDismiss}
                                className="absolute top-5 right-5 z-50 p-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white shadow-xl"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Premium Ribbon */}
                            <div className="absolute top-8 left-0 z-30 bg-emerald-500 text-white px-4 py-1.5 rounded-r-full shadow-lg border-y border-r border-emerald-400">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.15em]">Premium Access</span>
                                </div>
                            </div>

                            {/* Floating "FREE" Badge - Restored to Original Size */}
                            <motion.div 
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: -12 }}
                                transition={{ delay: 0.5, type: "spring" }}
                                className="absolute bottom-1 right-6 z-30 w-20 h-20 bg-red-600 rounded-full flex flex-col items-center justify-center text-white shadow-[0_10px_25px_rgba(220,38,38,0.5)] border-4 border-white transform -rotate-12"
                            >
                                <span className="text-[8px] font-black uppercase tracking-tighter opacity-80">Join For</span>
                                <span className="text-xl font-black font-urdu-premium -mt-0.5 leading-none">مفت</span>
                                <span className="text-[7px] font-black uppercase tracking-widest opacity-80">Limited</span>
                            </motion.div>
                        </div>

                        {/* Bottom Content Section (Compact & Clean) */}
                        <div className="flex-1 px-7 pt-1 pb-14 flex flex-col justify-between bg-white">
                            <motion.div 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-2.5"
                            >
                                <div className="space-y-0.5">
                                    <h3 className="text-emerald-600 text-[8px] font-black uppercase tracking-[0.3em]">Official Launch</h3>
                                    <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                                        Behtar Sehat, <br/>
                                        <span className="text-emerald-600">Behtar Mustaqbil.</span>
                                    </h2>
                                </div>

                                <div className="p-3 bg-emerald-50/50 rounded-[1.2rem] border border-emerald-100 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                    <p className="text-slate-700 text-[13px] font-bold font-urdu-premium leading-[1.6] text-right" dir="rtl">
                                        صحت کور پاکستان کا نمبر 1 ڈیجیٹل ہیلتھ کیئر پلیٹ فارم ہے۔ ابھی اکاؤنٹ بنائیں اور تمام سہولیات مفت پائیں۔
                                    </p>
                                </div>

                                {/* Features Row - Compact */}
                                <div className="flex justify-between gap-2 px-1">
                                    {[
                                        { icon: ShieldCheck, text: "Secure" },
                                        { icon: Star, text: "Verified" },
                                        { icon: TrendingUp, text: "Fast" }
                                    ].map((f, i) => (
                                        <div key={i} className="flex items-center gap-1 opacity-60">
                                            <f.icon className="w-3 h-3 text-emerald-600" />
                                            <span className="text-[7px] font-black uppercase tracking-wider text-slate-500">{f.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            <div className="space-y-2 mt-auto">
                                <Link to="/register" onClick={handleDismiss}>
                                    <Button className="w-full h-11 rounded-[0.8rem] bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 py-4 transition-all active:scale-95">
                                        <span className="font-urdu-premium">ابھی رجسٹریشن کریں</span>
                                        <UserPlus className="w-3.5 h-3.5" />
                                    </Button>
                                </Link>
                                
                                <Link to="/login" onClick={handleDismiss} className="block text-center py-0.5">
                                    <div className="inline-flex items-center gap-2 text-slate-400">
                                        <span className="text-[11px] font-bold font-urdu-premium">پہلے سے اکاؤنٹ ہے؟</span>
                                        <span className="text-[11px] font-black text-emerald-600 underline underline-offset-4 font-urdu-premium">لاگ ان کریں</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* DESKTOP & MOBILE NEWS TICKER / MARQUEE */}
                    <div className="fixed bottom-0 left-0 w-full z-[1002] overflow-hidden" style={{ background: 'linear-gradient(90deg, #0f172a 0%, #134e4a 50%, #0f172a 100%)', borderTop: '1px solid rgba(52,211,153,0.25)', boxShadow: '0 -8px 30px rgba(0,0,0,0.5)' }}>
                        <div className="py-2.5 overflow-hidden">
                            <div className="ticker-track">
                                {/* First copy */}
                                <div className="flex items-center gap-10 pr-10 text-white/90 font-urdu-premium text-[12px] md:text-[14px] font-bold">
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="w-5 h-5 bg-white rounded-md p-0.5 flex items-center justify-center">
                                            <img src={logoNew} alt="Logo" className="w-full h-full object-contain" />
                                        </div>
                                        <span className="text-emerald-400 font-black text-[11px] md:text-[13px] uppercase tracking-widest">SehatKor</span>
                                    </div>
                                    <span className="shrink-0">صحت کور: پاکستان کا جدید ترین ڈیجیٹل ہیلتھ کیئر پلیٹ فارم</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                    <span className="shrink-0">بہترین ڈاکٹروں سے آن لائن مشورہ حاصل کریں</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                    <span className="shrink-0">لیبارٹری ٹیسٹ اور ادویات پر خصوصی رعایت پائیں</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                    <span className="shrink-0">ہمارا مشن: ہر پاکستانی کے لیے سستی اور معیاری صحت کی سہولیات</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                    <span className="shrink-0">تصدیق شدہ ڈاکٹر، لیبز اور ہسپتال ایک ہی جگہ پر</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                    <span className="shrink-0">صحت کور کے ساتھ اپنا اور اپنے پیاروں کا مستقبل محفوظ بنائیں</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="w-5 h-5 bg-white rounded-md p-0.5 flex items-center justify-center">
                                            <img src={logoNew} alt="Logo" className="w-full h-full object-contain" />
                                        </div>
                                        <span className="text-emerald-400 font-black text-[11px] md:text-[13px] uppercase tracking-widest">SehatKor</span>
                                    </div>
                                </div>
                                {/* Duplicate copy for seamless loop */}
                                <div className="flex items-center gap-10 pr-10 text-white/90 font-urdu-premium text-[12px] md:text-[14px] font-bold">
                                    <span className="shrink-0">صحت کور: پاکستان کا جدید ترین ڈیجیٹل ہیلتھ کیئر پلیٹ فارم</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                    <span className="shrink-0">بہترین ڈاکٹروں سے آن لائن مشورہ حاصل کریں</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                    <span className="shrink-0">لیبارٹری ٹیسٹ اور ادویات پر خصوصی رعایت پائیں</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                    <span className="shrink-0">ہمارا مشن: ہر پاکستانی کے لیے سستی اور معیاری صحت کی سہولیات</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                    <span className="shrink-0">تصدیق شدہ ڈاکٹر، لیبز اور ہسپتال ایک ہی جگہ پر</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                    <span className="shrink-0">صحت کور کے ساتھ اپنا اور اپنے پیاروں کا مستقبل محفوظ بنائیں</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DESKTOP MODAL VIEW */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 100 }}
                        transition={{ type: "spring", damping: 20, stiffness: 120 }}
                        className="hidden md:block relative w-full max-w-3xl overflow-hidden bg-white rounded-[2.5rem] shadow-[0_45px_130px_rgba(0,0,0,0.5)] border border-white/20"
                    >
                        <div className="flex flex-col md:flex-row min-h-[480px]">
                            <div className="hidden md:flex md:w-[46%] bg-slate-900 relative overflow-hidden group border-r border-white/5">
                                <div className="absolute inset-0 z-0 text-center">
                                    <img 
                                        src="/healthcare_promo_bg.png" 
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
                            <div className="w-full md:w-[60%] p-8 md:p-10 flex flex-col justify-center relative bg-white">
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
                                    <p className="text-slate-600 text-[15px] md:text-[16px] leading-[1.8] font-bold font-urdu-premium text-right" dir="rtl">
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
