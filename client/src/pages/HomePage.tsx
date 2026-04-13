import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SearchServices from "@/components/SearchServices";
import CompareTray from "@/components/CompareTray";
import PartnersMarquee from "@/components/PartnersMarquee";
import CompareExplorer from "@/components/CompareExplorer";
import PageLoader from "@/components/PageLoader";
import HomeCTA from "@/components/HomeCTA";
import SEO from "@/components/SEO";
import FeaturedHealthcare from "@/components/FeaturedHealthcare";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { popularDiseases } from "@/data/diseases";
import {
  Search,
  UserPlus,
  Calendar,
  Stethoscope,
  Activity,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Star,
  Smartphone,
  MapPin,
  ArrowLeft,
  FlaskConical,
  Pill,
  Scissors,
  Clock,
  UserCheck,
  Zap,
  HeartHandshake,
  UserRound,
  Phone,
  X,
  HeartPulse,
  Baby,
  Smile,
  Bone,
  Sparkles,
  Video,
  Building2,
  Camera,
  Dumbbell,
  Microscope
} from "lucide-react";

// Animations
const fadeInUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileHelpline, setShowMobileHelpline] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  const heroCards = [
    {
      id: 1,
      title: "Online Video Consultation",
      subtitle: "PMC Verified Doctors",
      link: "/doctors?type=video",
      bg: "bg-gradient-to-br from-white to-blue-50/50",
      borderColor: "border-blue-100/80",
      accent: "bg-blue-600/10",
      text: "text-slate-900",
      subText: "text-blue-600",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400&h=400",
      glow: "shadow-blue-500/10",
      icon: Video,
      themeColor: "blue"
    },
    {
      id: 2,
      title: "Book Clinic Appointment",
      subtitle: "100% Secure Booking",
      link: "/doctors",
      bg: "bg-gradient-to-br from-white to-amber-50/50",
      borderColor: "border-amber-100/80",
      accent: "bg-amber-600/10",
      text: "text-slate-900",
      subText: "text-amber-600",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400&h=400",
      glow: "shadow-amber-500/10",
      icon: Building2,
      themeColor: "amber"
    },
    {
      id: 3,
      title: "Get Instant Doctor",
      subtitle: "Instant Response",
      link: "/doctors",
      bg: "bg-gradient-to-br from-white to-emerald-50/50",
      borderColor: "border-emerald-100/80",
      accent: "bg-emerald-600/10",
      text: "text-slate-900",
      subText: "text-emerald-600",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400",
      glow: "shadow-emerald-500/10",
      hasBadge: true,
      icon: Zap,
      themeColor: "emerald"
    },
    {
      id: 4,
      title: "Weight Loss",
      subtitle: "Expert Guidance",
      link: "/weight-loss",
      bg: "bg-gradient-to-br from-white to-rose-50/50",
      borderColor: "border-rose-100/80",
      accent: "bg-rose-600/10",
      text: "text-slate-900",
      subText: "text-rose-600",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=400&h=400",
      glow: "shadow-rose-500/10",
      icon: Activity,
      themeColor: "rose"
    },
    {
      id: 5,
      title: "Lab Tests",
      subtitle: "Home Sampling",
      link: "/labs",
      bg: "bg-gradient-to-br from-white to-violet-50/50",
      borderColor: "border-violet-100/80",
      accent: "bg-violet-600/10",
      text: "text-slate-900",
      subText: "text-violet-600",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400&h=400",
      glow: "shadow-violet-500/10",
      icon: FlaskConical,
      themeColor: "violet"
    },
    {
      id: 6,
      title: "Buy Medicine Online",
      subtitle: "Express Delivery",
      link: "/pharmacies",
      bg: "bg-gradient-to-br from-white to-cyan-50/50",
      borderColor: "border-cyan-100/80",
      accent: "bg-cyan-600/10",
      text: "text-slate-900",
      subText: "text-cyan-600",
      image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=400&h=400",
      glow: "shadow-cyan-500/10",
      icon: Pill,
      themeColor: "cyan"
    }
  ];

  const stats = [
    { number: "50,000+", label: "Registered Users" },
    { number: "2,000+", label: "Healthcare Providers" },
    { number: "100,000+", label: "Successful Bookings" },
    { number: "50+", label: "Cities Covered" }
  ];

  const services = [
    {
      icon: Stethoscope,
      title: "Medical Treatments",
      description: "Find best doctors and clinics for specialized treatments",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverBgColor: "hover:bg-blue-100"
    },
    {
      icon: FlaskConical,
      title: "Lab Tests",
      description: "Book home sampling tests with trusted labs",
      color: "text-green-600",
      bgColor: "bg-green-50",
      hoverBgColor: "hover:bg-green-100"
    },
    {
      icon: Scissors,
      title: "Surgeries",
      description: "Expert surgeons and modern surgical facilities",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      hoverBgColor: "hover:bg-orange-100"
    },
    {
      icon: ShieldCheck,
      title: "Health Checkups",
      description: "Preventive health packages for you and family",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      hoverBgColor: "hover:bg-emerald-100"
    },
    {
      icon: Pill,
      title: "Medicines",
      description: "Genuine medicines delivered to your doorstep",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      hoverBgColor: "hover:bg-purple-100"
    },
    {
      icon: HeartHandshake,
      title: "Home Care",
      description: "Nursing and patient care services at home",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      hoverBgColor: "hover:bg-pink-100"
    }
  ];

  const whyChooseUs = [
    {
      icon: UserCheck,
      title: "PMC Verified Doctors",
      description: "Connect with 100% verified and qualified healthcare professionals.",
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      icon: ShieldCheck,
      title: "Secure & Private",
      description: "Your health data is encrypted and kept 100% confidential.",
      color: "text-emerald-600",
      bg: "bg-emerald-100"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Our support team is available round the clock to assist you.",
      color: "text-purple-600",
      bg: "bg-purple-100"
    },
    {
      icon: Zap,
      title: "Instant Booking",
      description: "Book appointments instantly without any waiting time.",
      color: "text-amber-600",
      bg: "bg-amber-100"
    }
  ];

  const diseaseIntro = popularDiseases;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <SEO
        title="Sehatkor - Pakistan's #1 Healthcare Platform | Online Doctor Pakistan"
        description="Pakistan's trusted healthcare platform. Book verified doctors, home lab tests, and medicines online in Karachi, Lahore, Islamabad. Your health, our priority."
        keywords="online doctor Pakistan, book doctor online, doctor appointment Pakistan, home lab test, online pharmacy Pakistan, Sehatkor, best doctors Pakistan"
        canonical="https://sehatkor.pk/"
        lang="en"
        dir="ltr"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Sehatkor",
          "url": "https://sehatkor.pk/",
          "inLanguage": "en-PK",
          "description": "Pakistan's largest health network. Facilitating doctors, lab tests, and medicines.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://sehatkor.pk/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />

      {/* Hero Section - Balanced Optimization */}
      <section className="relative pt-20 md:pt-22 pb-6 md:pb-10 lg:pt-24 lg:pb-14 overflow-visible">
        {/* BACKGROUND - Enhanced Layered Aesthetic */}
        <div className="absolute inset-0 bg-slate-50/80 z-0 rounded-b-[3rem] lg:rounded-b-[5rem] overflow-hidden shadow-[inset_0_-2px_10px_rgba(0,0,0,0.02)]">
          {/* Main Mesh Gradient Blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[70%] bg-emerald-100/40 rounded-full blur-[120px]"></div>
          <div className="absolute top-[10%] right-[-5%] w-[40%] h-[50%] bg-blue-100/30 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[10%] w-[50%] h-[40%] bg-indigo-50/40 rounded-full blur-[120px]"></div>
          
          {/* Subtle Subtle Grid Accent */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0f172a 1.5px, transparent 1.5px)', backgroundSize: '56px 56px' }}></div>
          
          {/* Bottom Accent Line */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-200/40 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="max-w-7xl mx-auto"
          >
            {/* Welcome Greeting - Refined Professional Look */}
            <div className="flex items-center gap-3 mt-2 -ml-1 mb-1 relative z-20 md:mb-0 md:mt-0 md:ml-0 md:absolute md:left-4 md:top-0 group cursor-default">
              <div className="p-0.5 bg-white rounded-full shadow-md border border-emerald-50 group-hover:shadow-emerald-100 transition-shadow">
                <Avatar className="h-8 w-8 md:h-12 md:w-12 border-2 border-emerald-50/50">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs md:text-lg flex items-center justify-center">
                    {user ? <UserRound className="w-4 h-4 md:w-6 md:h-6 text-white" /> : "G"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-left">
                <p className="text-xs md:text-base font-extrabold text-slate-800 leading-none">
                  Welcome to SehatKor
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[9px] md:text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    {user ? "Your Health Partner" : "Guest User"}
                  </p>
                </div>
              </div>
            </div>

            {/* Helpline Widget - Desktop Only (Right Side) */}
            {/* Helpline Widget - Desktop Only (Right Side) - Highly Professional Redesign */}
            <div className="hidden md:flex items-center gap-3 absolute right-4 top-0 z-20 bg-white/80 backdrop-blur-md pl-1.5 pr-5 py-1.5 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_8px_25px_rgba(16,185,129,0.12)] hover:border-emerald-200 transition-all duration-500 cursor-pointer group hover:-translate-y-1">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 ring-2 ring-white">
                <Phone className="w-4 h-4 text-white fill-white/10" />
              </div>
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-[0.1em] text-emerald-600 font-extrabold leading-none mb-1">24/7 Helpline</p>
                <p className="text-sm font-black text-slate-700 leading-none transition-colors tracking-tight">+92 314 1521115</p>
              </div>
            </div>

            {/* Header Content - Balanced Spacing */}
            <div className="text-center mb-5 md:mb-8">
              <div className="absolute right-4 top-0 mt-3 md:static md:mt-0 flex items-center justify-center gap-1 md:gap-2 mb-1 md:mb-4">
                <ShieldCheck className="w-3.5 h-3.5 md:w-5 md:h-5 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-700 md:text-lg">
                  <span className="md:hidden">Pakistan's #1 Platform</span>
                  <span className="hidden md:inline">Pakistan's #1 Health Platform</span>
                </span>
              </div>

              <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-slate-900 leading-tight pt-6 md:pt-0 mb-4 md:mb-3">
                Health Issues? <span className="text-emerald-600">We Have The Solution!</span>
              </h1>

              {/* Supporting Tagline - Balanced */}
              <p className="hidden md:block text-center text-[15px] text-slate-500 mb-6 px-4 font-normal tracking-wide opacity-90 mx-auto max-w-2xl">
                Connecting you with top medical specialists, online consultations, and trusted healthcare services across Pakistan.
              </p>

              {/* Search Bar Block - Sharper, Themed Look */}
              <SearchServices
                hideCategory
                hideLocationIcon
                className="!bg-slate-50/80 !backdrop-blur-md !p-2 !rounded-lg !shadow-[0_15px_40px_rgba(0,0,0,0.04)] !border !border-slate-200/60 max-w-3xl mx-auto transform transition-all duration-300 hover:bg-slate-100/90 hover:border-emerald-200/50"
              />
            </div>

            {/* Bento Grid Layout - Mobile: Marham Style (Video left 2cols, 2 cards right 3cols), Desktop: Bento Grid */}
            <div className="grid grid-cols-5 md:grid-cols-12 gap-3 md:gap-4 pt-2 md:pt-1">
              {/* Video Consultation - Left side, spans 2 rows on mobile, 2 columns wide */}
              <Link
                to={heroCards[0].link}
                className={`relative group overflow-hidden rounded-2xl md:rounded-[2.5rem] ${heroCards[0].bg} border-2 ${heroCards[0].borderColor} shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 
                  col-span-2 row-span-2 h-auto md:col-span-3 md:row-span-2 md:h-full group`}
              >
                {/* Decorative Pattern Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/20 rounded-bl-[100%] transition-transform duration-700 group-hover:scale-125"></div>
                
                <div className="p-3 md:pt-4 md:px-6 md:pb-6 relative z-20 h-full flex flex-col items-start text-left max-w-[75%] md:max-w-[70%]">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-1 md:mb-2 group-hover:rotate-6 transition-transform">
                    <Video className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <h3 className="font-black text-[12px] md:text-2xl text-slate-800 mb-0.5 md:mb-1 leading-tight">
                    Online Video <br /> Consultation
                  </h3>
                  <div className="flex items-center gap-1.5 -translate-y-0.5 md:-translate-y-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <p className="font-bold text-[8px] md:text-sm text-blue-600 uppercase tracking-wide leading-tight">
                      {heroCards[0].subtitle}
                    </p>
                  </div>
                </div>
                
                <div className="absolute -bottom-1 -right-1 md:bottom-4 md:right-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400/30 blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img
                      src={heroCards[0].image}
                      alt={heroCards[0].title}
                      className="relative w-16 h-16 md:w-40 md:h-40 object-cover object-top rounded-full border-[4px] md:border-[8px] border-white shadow-xl transition-all duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </div>
              </Link>

              <Link
                to={heroCards[1].link}
                className={`relative group overflow-hidden rounded-2xl md:rounded-[2.5rem] ${heroCards[1].bg} border-2 ${heroCards[1].borderColor} shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-2 
                  col-span-3 h-28 md:col-span-4 md:h-[150px]`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/20 rounded-bl-[100%] transition-transform duration-700 group-hover:scale-125"></div>
                <div className="p-4 md:p-6 relative z-20 h-full flex flex-col items-start text-left max-w-[70%] md:max-w-[65%]">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-2 md:mb-3 group-hover:rotate-6 transition-transform">
                    <Building2 className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                  </div>
                  <h3 className="font-black text-[12px] md:text-xl text-slate-800 mb-1 leading-tight">
                    Book Clinic <br /> Appointment
                  </h3>
                  <p className="font-bold text-[9px] md:text-sm text-amber-600 uppercase tracking-wide">
                    {heroCards[1].subtitle}
                  </p>
                </div>
                
                <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4">
                  <img
                    src={heroCards[1].image}
                    alt={heroCards[1].title}
                    className="w-14 h-14 md:w-24 md:h-24 object-cover rounded-full border-[3px] md:border-[5px] border-white shadow-xl transition-all duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </Link>

              <Link
                to={heroCards[2].link}
                className={`relative group overflow-hidden rounded-2xl md:rounded-[2.5rem] ${heroCards[2].bg} border-2 ${heroCards[2].borderColor} shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 
                  col-span-3 h-28 md:col-span-5 md:h-[150px]`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/20 rounded-bl-[100%] transition-transform duration-700 group-hover:scale-125"></div>
                <div className="p-4 md:p-6 relative z-20 h-full flex flex-col items-start text-left max-w-[70%] md:max-w-[75%]">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-2 md:mb-3 group-hover:rotate-6 transition-transform">
                    <Zap className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-black text-[12px] md:text-xl text-slate-800 mb-1 leading-tight">
                    {heroCards[2].title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[9px] md:text-sm text-emerald-600 uppercase tracking-wide">
                      {heroCards[2].subtitle}
                    </p>
                    <Badge className="bg-emerald-600 text-white border-none text-[8px] md:text-[10px] px-2 py-0.5 font-black uppercase ring-2 ring-emerald-50">
                      NEW
                    </Badge>
                  </div>
                </div>
                
                <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4">
                  <img
                    src={heroCards[2].image}
                    alt={heroCards[2].title}
                    className="w-14 h-14 md:w-24 md:h-24 object-cover rounded-full border-[3px] md:border-[5px] border-white shadow-xl transition-all duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </Link>

              {/* Remaining cards - Alternating widths, last card full width */}
              {heroCards.slice(3).map((card, index) => {
                const Icon = card.icon;
                return (
                  <Link
                    to={card.link}
                    key={card.id}
                    className={`relative group overflow-hidden rounded-2xl md:rounded-[2rem] ${card.bg} border-2 ${card.borderColor} shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-${card.themeColor}-500/10 hover:-translate-y-2 
                      ${index === 2 ? 'col-span-5' : index % 2 === 0 ? 'col-span-2' : 'col-span-3'} h-28 md:col-span-3 md:h-[150px]`}
                  >
                    <div className={`p-4 md:p-6 relative z-20 h-full flex flex-col items-start text-left max-w-[70%] md:max-w-[65%]`}>
                      <div className={`w-7 h-7 md:w-10 md:h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-2.5 md:mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-4 h-4 md:w-5 md:h-5 ${card.subText}`} />
                      </div>
                      <h3 className={`font-black text-[11px] md:text-lg text-slate-800 mb-1 leading-tight`}>
                        {card.title}
                      </h3>
                      <p className={`font-bold text-[8px] md:text-xs ${card.subText} uppercase tracking-wide`}>
                        {card.subtitle}
                      </p>
                    </div>
                    
                    <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-12 h-12 md:w-24 md:h-24 object-cover rounded-full border-[3px] md:border-[4px] border-white shadow-lg transition-all duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>

          </motion.div>
        </div>
      </section>

      {/* Stats Section - Professional Sober Redesign */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { number: "10,000+", label: "Registered Users", icon: UserRound },
              { number: "2,000+", label: "Expert Doctors", icon: UserCheck },
              { number: "20k+", label: "Bookings Done", icon: CheckCircle2 },
              { number: "50+", label: "Cities Covered", icon: MapPin }
            ].map((stat, index) => (
              <div key={index} className="flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="mb-4 p-4 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-100 transition-colors shadow-sm">
                  <stat.icon className="w-8 h-8" />
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-gray-600 mb-2 tracking-tight">
                  {stat.number}
                </h3>
                <p className="text-gray-500 font-bold text-xs md:text-sm uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Searches Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gray-50/50 -z-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Popular <span className="text-emerald-600">Specialties</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find the right specialist for your needs from our most requested healthcare categories.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {[
              {
                title: "Cardiologist",
                desc: "Heart Specialist",
                icon: HeartPulse,
                link: "/doctors?specialty=Cardiologist",
                color: "text-red-600",
                bg: "bg-red-50",
                border: "group-hover:border-red-200",
                shadow: "group-hover:shadow-red-500/10"
              },
              {
                title: "Pediatrician",
                desc: "Child Specialist",
                icon: Baby,
                link: "/doctors?specialty=Pediatrician",
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "group-hover:border-blue-200",
                shadow: "group-hover:shadow-blue-500/10"
              },
              {
                title: "Gynecologist",
                desc: "Women's Health",
                icon: Activity,
                link: "/doctors?specialty=Gynecologist",
                color: "text-pink-600",
                bg: "bg-pink-50",
                border: "group-hover:border-pink-200",
                shadow: "group-hover:shadow-pink-500/10"
              },
              {
                title: "Dermatologist",
                desc: "Skin Specialist",
                icon: Sparkles,
                link: "/doctors?specialty=Dermatologist",
                color: "text-amber-600",
                bg: "bg-amber-50",
                border: "group-hover:border-amber-200",
                shadow: "group-hover:shadow-amber-500/10"
              },
              {
                title: "Dentist",
                desc: "Dental Care",
                icon: Smile,
                link: "/doctors?specialty=Dentist",
                color: "text-teal-600",
                bg: "bg-teal-50",
                border: "group-hover:border-teal-200",
                shadow: "group-hover:shadow-teal-500/10"
              },
              {
                title: "Orthopedic",
                desc: "Bone Specialist",
                icon: Bone,
                link: "/doctors?specialty=Orthopedic",
                color: "text-indigo-600",
                bg: "bg-indigo-50",
                border: "group-hover:border-indigo-200",
                shadow: "group-hover:shadow-indigo-500/10"
              }
            ].map((item, index) => (
              <Link to={item.link} key={index} className="group relative block w-full">
                <div className={`h-full bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] ${item.shadow} transition-all duration-300 overflow-hidden flex flex-col items-center pt-8 pb-6 px-4 text-center hover:-translate-y-1.5 ${item.border}`}>

                  {/* Decorative Background Blend */}
                  <div className={`absolute top-0 inset-x-0 h-24 ${item.bg} rounded-b-[100%] opacity-60 scale-x-150 -translate-y-[40%] group-hover:scale-x-125 transition-transform duration-700 ease-out`}></div>

                  {/* Image Container */}
                  {/* Icon Container */}
                  <div className={`relative w-20 h-20 mb-5 rounded-full flex items-center justify-center bg-white shadow-md group-hover:scale-105 transition-transform duration-500 z-10 border-4 border-white`}>
                    <div className={`absolute inset-0 rounded-full opacity-20 ${item.bg}`}></div>
                    <item.icon className={`w-9 h-9 ${item.color}`} />
                  </div>

                  {/* Text Content */}
                  <div className="relative z-10 flex flex-col items-center">
                    <h3 className={`text-lg font-black text-gray-900 group-hover:${item.color} transition-colors mb-1`}>
                      {item.title}
                    </h3>
                    <div className="h-0.5 w-6 bg-gray-200 rounded-full mb-2 group-hover:bg-current group-hover:w-12 transition-all duration-300"></div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* City Searches - Styled */}
          {/* City Searches - Styled */}
          <div className="mt-20 pt-10 border-t border-gray-100/60 relative">
            {/* Background blur decoration */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-emerald-50/30 blur-[100px] -z-10 rounded-full pointer-events-none"></div>

            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 tracking-tight">
                Find Doctors by <span className="text-emerald-600">City</span>
              </h3>
              <p className="text-sm md:text-base text-gray-500 max-w-lg mx-auto">
                Access top-rated healthcare providers in major cities across Pakistan.
              </p>
            </div>

            <div className="flex flex-wrap md:flex-nowrap justify-center gap-3 md:gap-4 max-w-6xl mx-auto overflow-x-auto pb-4 px-2">
              {["Karachi", "Lahore", "Islamabad", "Peshawar", "Mardan", "Swat"].map((city) => (
                <Link
                  key={city}
                  to={`/${city.toLowerCase()}`}
                  className="group relative px-6 py-4 bg-white rounded-[2rem] shadow-sm hover:shadow-md border border-emerald-100/50 hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden text-center whitespace-nowrap min-w-[150px] flex-1 max-w-[200px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors duration-300 flex-shrink-0 z-10 shadow-sm border border-transparent group-hover:border-emerald-200">
                    <MapPin className="w-5 h-5" />
                  </div>

                  <span className="font-bold text-slate-800 group-hover:text-emerald-800 transition-colors z-10 text-base">
                    {city}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FeaturedHealthcare />

      {/* Diseases & Symptoms Section */}
      <section className="py-20 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Diseases & <span className="text-emerald-600">Symptoms</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore common diseases, their symptoms, causes, and prevention. Click to view details.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-4 px-2 md:px-0">
            {diseaseIntro.map((d) => {
              const Icon = d.icon as any;
              return (
                <Link key={d.slug} to={`/all-diseases`} className="group relative">
                  <div className={`h-full p-4 rounded-3xl bg-white border border-gray-100/50 shadow-sm hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2 relative overflow-hidden`}>

                    {/* Soft Hover Gradient Background */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b ${d.bgClass.replace('100', '50')} to-transparent pointer-events-none`}></div>

                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm ${d.bgClass} relative z-10`}>
                      <Icon className={`w-7 h-7 ${d.colorClass} stroke-[1.5px]`} />
                    </div>

                    <span className="font-bold text-gray-700 text-xs md:text-sm group-hover:text-gray-900 transition-colors line-clamp-2 leading-tight relative z-10">
                      {d.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-2 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all">
              <Link to="/all-diseases">View all diseases</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Our Services Section - Redesigned */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
              Our <span className="text-emerald-600">Services</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Comprehensive healthcare services designed to meet all your medical needs with quality and care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              // Determine link based on service title
              let link = "/search";
              if (service.title === "Medical Treatments") link = "/doctors";
              if (service.title === "Lab Tests") link = "/labs";
              if (service.title === "Medicines") link = "/pharmacies";
              if (service.title === "Surgeries") link = "/doctors?type=surgeon";

              return (
                <Link to={link} key={index} className="group relative bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer block">
                  {/* Gradient Blobs */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.bgColor.replace('bg-', 'from-').replace('50', '100')} to-transparent opacity-20 rounded-bl-[100%] transition-transform duration-500 group-hover:scale-125`}></div>

                  <div className={`relative z-10 w-16 h-16 rounded-2xl ${service.bgColor} flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300 shadow-sm ring-1 ring-black/5`}>
                    <Icon className={`w-8 h-8 ${service.color}`} />
                  </div>

                  <h3 className="relative z-10 text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                    {service.title}
                  </h3>

                  <p className="relative z-10 text-gray-600 leading-relaxed mb-8 min-h-[48px]">
                    {service.description}
                  </p>

                  <div className="relative z-10 flex items-center text-sm font-bold text-emerald-600  transition-all duration-300 group-hover:translate-x-2">
                    Learn More <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Smart Compare Explorer - With Section Title & Fixes */}
      <section className="py-16 bg-white relative z-10">
        <div className="container mx-auto px-4 text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
            Compare Prices & <span className="text-emerald-600">Services</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Smartly compare rates and ratings of doctors, labs, and pharmacies to make informed decisions.
          </p>
        </div>
        <div className="relative z-20">
          <CompareExplorer />
        </div>
      </section>

      {/* Partners Marquee */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <PartnersMarquee />
      </section>

      {/* Why Choose Sehatkor - New Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
              Why Choose <span className="text-emerald-600">Sehatkor?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We are committed to providing you with the best healthcare experience in Pakistan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 text-white shadow-md transform group-hover:scale-110 transition-transform duration-300 ${item.bg}`}>
                    <Icon className={`w-8 h-8 ${item.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <HomeCTA />

      <CompareTray />

    </div>
  );
};

export default HomePage;