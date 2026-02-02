
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
    Smartphone
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

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <HomeSkeleton />;
    }

    const services = [
        {
            icon: Stethoscope,
            title: "ماہر ڈاکٹرز",
            description: "پاکستان کے بہترین اور مستند ڈاکٹرز",
            gradient: "from-blue-500 to-blue-600",
            lightBg: "bg-blue-50",
            border: "group-hover:border-blue-200",
            text: "text-blue-600",
            shadow: "group-hover:shadow-blue-200/50",
            link: "/doctors"
        },
        {
            icon: FlaskConical,
            title: "لیب ٹیسٹ",
            description: "گھر بیٹھے سیمپل دیں",
            gradient: "from-emerald-500 to-emerald-600",
            lightBg: "bg-emerald-50",
            border: "group-hover:border-emerald-200",
            text: "text-emerald-600",
            shadow: "group-hover:shadow-emerald-200/50",
            link: "/labs"
        },
        {
            icon: Pill,
            title: "ادویات",
            description: "فوری ہوم ڈیلیوری",
            gradient: "from-teal-500 to-teal-600",
            lightBg: "bg-teal-50",
            border: "group-hover:border-teal-200",
            text: "text-teal-600",
            shadow: "group-hover:shadow-teal-200/50",
            link: "/pharmacies"
        },
        {
            icon: Scissors,
            title: "سرجریز",
            description: "جدید سرجیکل سہولیات",
            gradient: "from-orange-500 to-orange-600",
            lightBg: "bg-orange-50",
            border: "group-hover:border-orange-200",
            text: "text-orange-600",
            shadow: "group-hover:shadow-orange-200/50",
            link: "/search"
        },
        {
            icon: Video,
            title: "ویڈیو مشاورت",
            description: "آن لائن چیک اپ",
            gradient: "from-indigo-500 to-indigo-600",
            lightBg: "bg-indigo-50",
            border: "group-hover:border-indigo-200",
            text: "text-indigo-600",
            shadow: "group-hover:shadow-indigo-200/50",
            link: "/doctors?type=video"
        },
        {
            icon: Activity,
            title: "ہیلتھ کیئر",
            description: "مکمل صحت کی دیکھ بھال",
            gradient: "from-rose-500 to-rose-600",
            lightBg: "bg-rose-50",
            border: "group-hover:border-rose-200",
            text: "text-rose-600",
            shadow: "group-hover:shadow-rose-200/50",
            link: "/services"
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

            {/* Hero Section - Professional Dark Theme */}
            <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-36 overflow-hidden">
                {/* DARKISH PROFESSIONAL BACKGROUND */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 z-0">
                    {/* Abstract Glows */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px]"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto text-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                        >
                            <Badge className="mb-8 bg-white/10 text-emerald-300 hover:bg-white/20 border border-white/10 px-4 py-1.5 text-base rounded-full shadow-sm gap-2 backdrop-blur-sm">
                                <Star className="w-4 h-4 text-emerald-300 fill-emerald-300" />
                                پاکستان کا سب سے بڑا ہیلتھ نیٹ ورک
                            </Badge>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-8 tracking-wide drop-shadow-xl">
                                آپ کی صحت، <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">ہماری ذمہ داری</span>
                            </h1>

                            <p className="text-lg md:text-2xl text-slate-300 leading-loose mb-10 max-w-3xl mx-auto font-light">
                                بہترین ڈاکٹرز، جدید لیبارٹریز اور مستند ادویات تک آسان رسائی۔
                                <br className="hidden md:block" />
                                آج ہی صحت کور کے ساتھ اپنا سفر شروع کریں۔
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-lg mx-auto">
                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg h-16 px-10 rounded-2xl shadow-lg shadow-emerald-900/50 transition-all hover:-translate-y-1"
                                >
                                    <Link to="/search">
                                        <Search className="w-5 h-5 ml-2" />
                                        ڈاکٹر تلاش کریں
                                    </Link>
                                </Button>

                                {!user ? (
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="lg"
                                        className="w-full sm:w-auto border-white/20 bg-white/5 text-white hover:bg-white/10 font-bold text-lg h-16 px-10 rounded-2xl shadow-lg backdrop-blur-sm transition-all hover:-translate-y-1"
                                    >
                                        <Link to="/register">
                                            <UserPlus className="w-5 h-5 ml-2" />
                                            اکاؤنٹ بنائیں
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="lg"
                                        className="w-full sm:w-auto border-white/20 bg-white/5 text-white hover:bg-white/10 font-bold text-lg h-16 px-10 rounded-2xl shadow-lg backdrop-blur-sm transition-all hover:-translate-y-1"
                                    >
                                        <Link to="/">
                                            <Activity className="w-5 h-5 ml-2" />
                                            انگریزی ہوم
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Services Grid - Restored Cards with Better Colors */}
            <section className="relative px-4 -mt-20 mb-20 z-20">
                <div className="container mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                    >
                        {services.map((service, idx) => (
                            <motion.div key={idx} variants={fadeInUp}>
                                <Link to={service.link}>
                                    <Card className={`h-full border-0 shadow-sm group cursor-pointer overflow-hidden relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:bg-none hover:bg-white ring-1 ring-slate-200 ${service.border} ${service.shadow}`}>
                                        {/* Top colorful bar */}
                                        <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${service.gradient}`}></div>

                                        <CardContent className="p-6 flex flex-col items-center text-center h-full justify-center pt-10">
                                            <div className={`w-16 h-16 rounded-2xl ${service.lightBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm bg-white`}>
                                                <service.icon className={`w-8 h-8 ${service.text}`} />
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-slate-900">{service.title}</h3>
                                            <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">{service.description}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Stats Section with Icons */}
            <section className="py-20 bg-white border-y border-slate-100">
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
                        {['کراچی', 'لاہور', 'اسلام آباد', 'پشاور', 'کوئٹہ', 'ملتان'].map((city, idx) => (
                            <Link to="/search" key={idx} className="block group">
                                <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 text-center border border-slate-200 hover:border-emerald-500 hover:bg-none hover:bg-white hover:shadow-lg hover:shadow-emerald-50 transition-all cursor-pointer relative overflow-hidden">
                                    <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <h3 className="font-bold text-slate-700 text-lg group-hover:text-emerald-700 transition-colors relative z-10">{city}</h3>
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
