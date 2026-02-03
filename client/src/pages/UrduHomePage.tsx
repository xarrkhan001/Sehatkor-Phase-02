
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
            link: "/search?q=weight",
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
            title: "ہیلتھ پلس",
            subtitle: "ایڈوانس کیئر",
            link: "/services",
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
                            <div className="bg-gray-100 p-1 rounded-none shadow-xl border border-gray-400 flex flex-col md:flex-row items-center gap-0 max-w-3xl mx-auto transform transition-all hover:scale-[1.005]">
                                {/* Location */}
                                <div className="relative w-full md:w-[30%] border-b md:border-b-0 md:border-l border-gray-200">
                                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 w-4 h-4 pointer-events-none z-10" />
                                    <select className="w-full h-10 bg-transparent border-none pr-9 pl-2 text-gray-700 font-bold focus:ring-0 cursor-pointer text-sm outline-none relative z-20">
                                        <option>پاکستان بھر میں</option>
                                        <option>کراچی</option>
                                        <option>لاہور</option>
                                        <option>اسلام آباد</option>
                                    </select>
                                </div>

                                {/* Main Search Input */}
                                <div className="relative w-full md:w-[50%]">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none md:hidden" />
                                    <input
                                        type="text"
                                        placeholder="ڈاکٹر، ہسپتال تلاش کریں..."
                                        className="w-full h-10 px-3 pr-9 md:pr-3 bg-transparent border-none text-gray-800 placeholder:text-gray-400 text-sm focus:ring-0 outline-none"
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {/* Search Button */}
                                <Button className="w-full md:w-[20%] h-10 rounded-none bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm m-0 md:ml-1" asChild>
                                    <Link to={`/search?q=${searchQuery}`}>
                                        <Search className="w-4 h-4 ml-1" />
                                        تلاش
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Bento Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {heroCards.map((card) => (
                                <Link
                                    to={card.link}
                                    key={card.id}
                                    className={`relative group overflow-hidden rounded-2xl shadow-lg border border-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${card.bg} ${card.gridClass}`}
                                >
                                    <div className="p-5 relative z-10 h-full flex flex-col items-start text-right w-full">
                                        <h3 className={`font-black text-xl md:text-2xl ${card.text} mb-1 leading-none`}>
                                            {card.title}
                                        </h3>
                                        <p className={`font-bold text-sm ${card.subText} mb-4`}>
                                            {card.subtitle}
                                        </p>

                                        {card.hasBadge && (
                                            <Badge className="bg-red-500 hover:bg-red-600 text-white border-none animate-pulse">
                                                NEW
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Image */}
                                    <img
                                        src={card.image}
                                        alt={card.title}
                                        className={`transition-transform duration-500 group-hover:scale-105 ${card.imgClass}`}
                                        loading="lazy"
                                    />

                                    {/* Gradient Overlay for Text Readability if needed */}
                                    {!card.isTall && <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/10 pointer-events-none"></div>}
                                </Link>
                            ))}
                        </div>

                    </motion.div>
                </div>
            </section>

            {/* Stats Section with Icons - Shifted Up slightly to bridge the gap if needed, or normal padding */}
            <section className="pt-16 pb-20 bg-white border-b border-slate-100">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center group p-6 rounded-3xl hover:bg-slate-50/80 transition-all duration-300 hover:shadow-inner border border-transparent hover:border-slate-100">
                                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform`}>
                                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                                </div>
                                <h3 className="text-3xl lg:text-4xl font-black text-slate-800 mb-2 font-sans tracking-tight">
                                    {stat.number}
                                </h3>
                                <p className="text-slate-500 font-bold text-lg">{stat.label}</p>
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
