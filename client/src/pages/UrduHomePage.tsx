
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CompareTray from "@/components/CompareTray";
import HomeSkeleton from "@/components/skeletons/HomeSkeleton";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
    Search,
    UserPlus,
    Calendar,
    Stethoscope,
    FlaskConical,
    Pill,
    Scissors,
    Activity,
    Video,
    CheckCircle2,
    ArrowRight,
    ShieldCheck,
    Star,
    Smartphone,
    MapPin,
    ChevronDown
} from "lucide-react";

// Animations
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const UrduHomePage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <HomeSkeleton />;
    }

    const heroCards = [
        {
            id: 1,
            title: "ویڈیو مشاورت",
            subtitle: "پی ایم سی تصدیق شدہ", // Shortened for fit
            link: "/doctors?type=video",
            bg: "bg-sky-100", // Light Blue
            text: "text-sky-900",
            subText: "text-sky-700",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400", // Female Doctor
            gridClass: "md:col-span-3 md:row-span-2 h-56 md:h-full flex-col",
            imgClass: "absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-4 border-white shadow-lg",
        },
        {
            id: 2,
            title: "کلینک پر چیک اپ",
            subtitle: "اپائنٹمنٹ بک کریں",
            link: "/doctors",
            bg: "bg-orange-100", // Peach
            text: "text-orange-900",
            subText: "text-orange-700",
            image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400", // Male Doctor
            gridClass: "md:col-span-4 h-32 md:h-36",
            imgClass: "absolute bottom-3 left-4 w-24 h-24 md:w-32 md:h-32 object-cover rounded-full border-4 border-white shadow-lg",
            isTall: false
        },
        {
            id: 3,
            title: "فوری ڈاکٹر",
            subtitle: "ایک کلک میں آرام",
            link: "/doctors",
            bg: "bg-emerald-100", // Mint Green
            text: "text-emerald-900",
            subText: "text-emerald-700",
            image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=400", // Female Doc
            gridClass: "md:col-span-5 h-32 md:h-36",
            imgClass: "absolute bottom-3 left-6 w-24 h-24 md:w-32 md:h-32 object-cover rounded-full border-4 border-white shadow-lg",
            hasBadge: true
        },
        {
            id: 4,
            title: "وزن میں کمی",
            subtitle: "صحت مند زندگی",
            link: "/weight-loss",
            bg: "bg-yellow-100", // Light Yellow
            text: "text-yellow-900",
            subText: "text-yellow-700",
            image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=300&h=300", // Fitness/Trainer
            gridClass: "md:col-span-3 h-32 md:h-36",
            imgClass: "absolute bottom-2 left-2 w-16 h-16 md:w-20 md:h-20 object-cover rounded-full border-2 border-white/50 shadow-md",
        },
        {
            id: 5,
            title: "لیب ٹیسٹ",
            subtitle: "گھر سے سیمپل",
            link: "/labs",
            bg: "bg-blue-100", // Light Blue
            text: "text-blue-900",
            subText: "text-blue-700",
            image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=300&h=300", // Lab
            gridClass: "md:col-span-3 h-32 md:h-36",
            imgClass: "absolute bottom-2 left-2 w-16 h-16 md:w-20 md:h-20 object-cover rounded-full border-2 border-white/50 shadow-md",
        },
        {
            id: 6,
            title: "آن لائن فارمیسی",
            subtitle: "اصلی ادویات",
            link: "/pharmacies",
            bg: "bg-pink-100", // Light Pink
            text: "text-pink-900",
            subText: "text-pink-700",
            image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300&h=300", // Meds/Heart
            gridClass: "md:col-span-3 h-32 md:h-36",
            imgClass: "absolute bottom-2 left-2 w-16 h-16 md:w-20 md:h-20 object-cover rounded-full border-2 border-white/50 shadow-md",
        }
    ];

    const stats = [
        { number: "50K+", label: "مطمئن مریض", icon: UserPlus, color: "text-blue-600", bg: "bg-blue-100" },
        { number: "3K+", label: "مستند ڈاکٹرز", icon: Stethoscope, color: "text-emerald-600", bg: "bg-emerald-100" },
        { number: "24/7", label: "فوری سروس", icon: Activity, color: "text-indigo-600", bg: "bg-indigo-100" },
        { number: "100%", label: "محفوظ ڈیٹا", icon: ShieldCheck, color: "text-rose-600", bg: "bg-rose-100" }
    ];

    const howItWorks = [
        {
            step: "01",
            title: "ڈاکٹر تلاش کریں",
            desc: "اپنی بیماری یا ضرورت کے مطابق ماہر ڈاکٹر کا انتخاب کریں",
            icon: Search,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            step: "02",
            title: "وقت کا تعین",
            desc: "اپنی سہولت کے مطابق اپائنٹمنٹ کا وقت طے کریں",
            icon: Calendar,
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            step: "03",
            title: "تصدیق حاصل کریں",
            desc: "ایس ایم ایس اور ای میل کے ذریعے کنفرمیشن حاصل کریں",
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden font-[nastaliq]" dir="rtl" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
            <SEO
                title="صحت کور - پاکستان کا نمبر ون ہیلتھ کیئر پلیٹ فارم | Online Doctor Pakistan"
                description="ڈاکٹرز، لیب ٹیسٹ اور ادویات کی آن لائن بکنگ۔ صحت کور کے ساتھ بہترین طبی سہولیات اب آپ کی پہنچ میں۔ ابھی اپائنٹمنٹ بک کریں۔"
                keywords="آن لائن ڈاکٹر, ڈاکٹر کی اپائنٹمنٹ, لیب ٹیسٹ, گھر پر لیب ٹیسٹ, ادویات, صحت کور, پاکستان, ہسپتال, بہترین ڈاکٹرز, doctors in pakistan, online doctor urdu, sehatkor urdu"
                canonical="https://sehatkor.pk/urdu"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    "name": "Sehatkor Urdu",
                    "url": "https://sehatkor.pk/urdu",
                    "inLanguage": "ur-PK",
                    "description": "پاکستان کا سب سے بڑا ہیلتھ نیٹ ورک۔ ڈاکٹرز، لیب ٹیسٹ اور ادویات کی سہولت۔",
                    "potentialAction": {
                        "@type": "SearchAction",
                        "target": "https://sehatkor.pk/search?q={search_term_string}",
                        "query-input": "required name=search_term_string"
                    }
                }}
            />

            {/* Hero Section - Redesigned with Bento Grid */}
            <section className="relative pt-6 pb-12 lg:pt-10 lg:pb-16 overflow-visible">
                {/* BACKGROUND - Gray 200 as requested */}
                <div className="absolute inset-0 bg-gray-100 z-0 rounded-b-[2rem] lg:rounded-b-[3rem] shadow-sm overflow-hidden">
                    {/* Subtle White Glows for depth */}
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/60 rounded-full blur-[120px]"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        className="max-w-7xl mx-auto"
                    >
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-300 text-emerald-700 mb-4 text-sm shadow-sm">
                                <span>پاکستان کا نمبر 1 ہیلتھ پلیٹ فارم</span>
                            </div>

                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-3">
                                صحت کے مسائل؟ <span className="text-emerald-600">ہمارے پاس حل ہے!</span>
                            </h1>

                            {/* Search Bar Block - SHARP CORNERS (No rounding) */}
                            <div className="bg-gray-100 p-1 rounded-none shadow-xl border border-gray-400 flex flex-row items-center gap-0 max-w-3xl mx-auto transform transition-all hover:scale-[1.005]">
                                {/* Location */}
                                <div className="relative w-auto md:w-[30%] border-l border-gray-200">
                                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 w-4 h-4 pointer-events-none z-10" />
                                    <select className="w-full h-10 bg-transparent border-none pr-9 pl-2 text-gray-700 font-bold focus:ring-0 cursor-pointer text-sm outline-none relative z-20">
                                        <option>پاکستان بھر میں</option>
                                        <option>کراچی</option>
                                        <option>لاہور</option>
                                        <option>اسلام آباد</option>
                                    </select>
                                </div>

                                {/* Main Search Input */}
                                <div className="relative flex-1 md:w-[50%] border-l border-gray-200">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none md:hidden" />
                                    <input
                                        type="text"
                                        placeholder="ڈاکٹر، ہسپتال تلاش کریں..."
                                        className="w-full h-10 px-3 pr-9 md:pr-3 bg-transparent border-none text-gray-800 placeholder:text-gray-400 text-sm focus:ring-0 outline-none"
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {/* Search Button */}
                                <Button className="w-auto md:w-[20%] h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm m-0 md:ml-1" asChild>
                                    <Link to={`/search?q=${searchQuery}`}>
                                        <Search className="w-4 h-4 ml-1" />
                                        <span className="hidden md:inline">تلاش</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Bento Grid Layout - Mobile: Marham Style (Video right 2cols, 2 cards left 3cols - RTL), Desktop: Bento Grid */}
                        <div className="grid grid-cols-5 md:grid-cols-12 gap-2 md:gap-4">
                            {/* Video Consultation - Right side (RTL), spans 2 rows on mobile, 2 columns wide */}
                            <Link
                                to={heroCards[0].link}
                                className={`relative group overflow-hidden rounded-xl md:rounded-2xl shadow-lg border border-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${heroCards[0].bg} 
                                    col-span-2 row-span-2 h-auto md:col-span-3 md:row-span-2 md:h-full`}
                            >
                                <div className="p-3 md:p-5 relative z-10 h-full flex flex-col items-start text-right w-full">
                                    <h3 className={`font-black text-sm md:text-2xl ${heroCards[0].text} mb-0.5 md:mb-1 leading-tight`}>
                                        {heroCards[0].title}
                                    </h3>
                                    <p className={`font-bold text-[10px] md:text-sm ${heroCards[0].subText} mb-2 md:mb-4`}>
                                        {heroCards[0].subtitle}
                                    </p>
                                </div>
                                <img
                                    src={heroCards[0].image}
                                    alt={heroCards[0].title}
                                    className="absolute bottom-2 left-2 w-20 h-20 md:left-1/2 md:-translate-x-1/2 md:bottom-4 md:w-40 md:h-40 object-cover rounded-full border-2 md:border-4 border-white shadow-lg transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/10 pointer-events-none"></div>
                            </Link>

                            {/* Clinic Visit - Left side (RTL), top, 3 columns wide */}
                            <Link
                                to={heroCards[1].link}
                                className={`relative group overflow-hidden rounded-xl md:rounded-2xl shadow-lg border border-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${heroCards[1].bg} 
                                    col-span-3 h-24 md:col-span-4 md:h-36`}
                            >
                                <div className="p-3 md:p-5 relative z-10 h-full flex flex-col items-start text-right w-full">
                                    <h3 className={`font-black text-sm md:text-2xl ${heroCards[1].text} mb-0.5 md:mb-1 leading-tight`}>
                                        {heroCards[1].title}
                                    </h3>
                                    <p className={`font-bold text-[10px] md:text-sm ${heroCards[1].subText} mb-1 md:mb-4`}>
                                        {heroCards[1].subtitle}
                                    </p>
                                </div>
                                <img
                                    src={heroCards[1].image}
                                    alt={heroCards[1].title}
                                    className="absolute bottom-1.5 left-1.5 w-14 h-14 md:bottom-3 md:left-4 md:w-32 md:h-32 object-cover rounded-full border-2 md:border-4 border-white shadow-lg transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/10 pointer-events-none"></div>
                            </Link>

                            {/* Instant Doctor - Left side (RTL), bottom, 3 columns wide */}
                            <Link
                                to={heroCards[2].link}
                                className={`relative group overflow-hidden rounded-xl md:rounded-2xl shadow-lg border border-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${heroCards[2].bg} 
                                    col-span-3 h-24 md:col-span-5 md:h-36`}
                            >
                                <div className="p-3 md:p-5 relative z-10 h-full flex flex-col items-start text-right w-full">
                                    <h3 className={`font-black text-sm md:text-2xl ${heroCards[2].text} mb-0.5 md:mb-1 leading-tight`}>
                                        {heroCards[2].title}
                                    </h3>
                                    <p className={`font-bold text-[10px] md:text-sm ${heroCards[2].subText} mb-1 md:mb-4`}>
                                        {heroCards[2].subtitle}
                                    </p>
                                    {heroCards[2].hasBadge && (
                                        <Badge className="bg-red-500 hover:bg-red-600 text-white border-none animate-pulse text-[9px] px-1.5 py-0.5 md:text-xs md:px-2 md:py-1">
                                            NEW
                                        </Badge>
                                    )}
                                </div>
                                <img
                                    src={heroCards[2].image}
                                    alt={heroCards[2].title}
                                    className="absolute bottom-1.5 left-1.5 w-14 h-14 md:bottom-3 md:left-6 md:w-32 md:h-32 object-cover rounded-full border-2 md:border-4 border-white shadow-lg transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/10 pointer-events-none"></div>
                            </Link>

                            {/* Remaining cards - Alternating widths, last card full width */}
                            {heroCards.slice(3).map((card, index) => (
                                <Link
                                    to={card.link}
                                    key={card.id}
                                    className={`relative group overflow-hidden rounded-xl md:rounded-2xl shadow-lg border border-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${card.bg} 
                                        ${index === 2 ? 'col-span-5' : index % 2 === 0 ? 'col-span-2' : 'col-span-3'} h-24 md:col-span-3 md:h-36`}
                                >
                                    <div className="p-3 md:p-5 relative z-10 h-full flex flex-col items-start text-right w-full">
                                        <h3 className={`font-black text-sm md:text-2xl ${card.text} mb-0.5 md:mb-1 leading-tight`}>
                                            {card.title}
                                        </h3>
                                        <p className={`font-bold text-[10px] md:text-sm ${card.subText} mb-1 md:mb-4`}>
                                            {card.subtitle}
                                        </p>
                                    </div>
                                    <img
                                        src={card.image}
                                        alt={card.title}
                                        className="absolute bottom-1.5 left-1.5 w-14 h-14 md:bottom-3 md:left-2 md:w-20 md:h-20 object-cover rounded-full border-2 md:border-4 border-white shadow-lg transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/10 pointer-events-none"></div>
                                </Link>
                            ))}
                        </div>

                    </motion.div>
                </div>
            </section>

            {/* Stats Section with Icons - Shifted Up slightly to bridge the gap if needed, or normal padding */}
            {/* Stats Section - Redesigned */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-50 opacity-80 z-0"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="relative group p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.bg.replace('bg-', 'from-')} to-white/0 opacity-20 rounded-bl-[4rem] transition-transform group-hover:scale-110`}></div>

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className={`w-16 h-16 rounded-2xl ${stat.bg} flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform shadow-sm`}>
                                        <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-black text-slate-800 mb-2 font-sans tracking-tight">
                                        {stat.number}
                                    </h3>
                                    <p className="text-slate-600 font-bold text-base md:text-lg">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-24 bg-teal-50/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-4">صحت کور کیسے کام کرتا ہے؟</h2>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                            تین آسان مراحل میں اپنی صحت کا خیال رکھیں
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {howItWorks.map((item, idx) => (
                            <div key={idx} className="relative p-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-[2rem] shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-2 hover:bg-none hover:bg-white transition-all duration-300 group overflow-hidden hover:border-emerald-200">
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.bg.replace('bg-', 'from-').replace('50', '100')} to-transparent opacity-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>

                                <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform relative z-10 ring-1 ring-slate-100 bg-white`}>
                                    <item.icon className={`w-8 h-8 ${item.color}`} />
                                </div>

                                <h3 className="text-2xl font-bold text-slate-800 mb-3 relative z-10">{item.title}</h3>
                                <p className="text-slate-600 leading-loose text-lg relative z-10">{item.desc}</p>

                                <div className="absolute bottom-4 left-6 text-7xl font-black text-slate-300/50 group-hover:text-slate-50 group-hover:drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)] transition-all -z-0 font-sans opacity-50">
                                    {item.step}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Cities - Clean Grid */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-slate-100 pb-8">
                        <div className="text-right">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">مقبول شہر</h2>
                            <p className="text-lg text-slate-500">پاکستان بھر میں دستیاب</p>
                        </div>
                        <Link to="/search" className="hidden md:inline-flex items-center px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm hover:shadow-md">
                            تمام شہر دیکھیں <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { name: 'کراچی', bg: 'bg-blue-50', hover: 'hover:bg-blue-100', text: 'text-blue-700' },
                            { name: 'لاہور', bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100', text: 'text-emerald-700' },
                            { name: 'اسلام آباد', bg: 'bg-teal-50', hover: 'hover:bg-teal-100', text: 'text-teal-700' },
                            { name: 'پشاور', bg: 'bg-violet-50', hover: 'hover:bg-violet-100', text: 'text-violet-700' },
                            { name: 'کوئٹہ', bg: 'bg-amber-50', hover: 'hover:bg-amber-100', text: 'text-amber-700' },
                            { name: 'ملتان', bg: 'bg-rose-50', hover: 'hover:bg-rose-100', text: 'text-rose-700' }
                        ].map((city, idx) => (
                            <Link to="/search" key={idx} className="block group">
                                <div className={`relative overflow-hidden rounded-2xl p-6 text-center border border-transparent transition-all duration-300 ${city.bg} ${city.hover} hover:scale-105 hover:shadow-lg`}>
                                    <h3 className={`font-black text-lg md:text-xl ${city.text} transition-colors relative z-10`}>{city.name}</h3>
                                    {/* Decorative subtle circle background */}
                                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/40 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Link to="/search" className="inline-flex w-full justify-center px-6 py-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-emerald-600 hover:text-white transition-colors">
                            تمام شہر دیکھیں
                        </Link>
                    </div>
                </div>
            </section>

            {/* App Download - Professional Dark Gradient */}
            <section className="py-24 relative overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <span className="inline-block py-1.5 px-4 rounded-full bg-slate-700/50 text-emerald-400 text-sm font-bold mb-8 border border-slate-700">
                        COMING SOON
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                        صحت کی دنیا، <span className="text-emerald-400">آپ کے ہاتھ میں</span>
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-loose">
                        ہماری موبائل ایپ جلد آرہی ہے۔ اپائنٹمنٹس، رپورٹس اور ادویات کا ریکارڈ اب ایک کلک کی دوری پر۔
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <div className="h-14 px-8 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors cursor-not-allowed gap-2">
                            <Smartphone className="w-5 h-5 text-slate-400" />
                            <span className="text-slate-300 font-sans font-bold">App Store</span>
                        </div>
                        <div className="h-14 px-8 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors cursor-not-allowed gap-2">
                            <Smartphone className="w-5 h-5 text-slate-400" />
                            <span className="text-slate-300 font-sans font-bold">Google Play</span>
                        </div>
                    </div>
                </div>
            </section>

            <CompareTray />
        </div>
    );
};

export default UrduHomePage;
