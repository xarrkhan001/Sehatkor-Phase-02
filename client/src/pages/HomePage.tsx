import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SearchServices from "@/components/SearchServices";
import CompareTray from "@/components/CompareTray";
import PartnersMarquee from "@/components/PartnersMarquee";
import CompareExplorer from "@/components/CompareExplorer";
import HomeSkeleton from "@/components/skeletons/HomeSkeleton";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { apiUrl } from "@/config/api";
import heroImage from "@/assets/healthcare-hero-bg.jpg";
import heroImage2 from "@/assets/hero1.jpg";
import heroImage3 from "@/assets/hero2.png";
import heroImage4 from "@/assets/hero3.png";
import heroImage5 from "@/assets/hero4.png";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";

import { useAuth } from "@/contexts/AuthContext";

import {
  Search,
  UserPlus,
  Calendar,
  MapPin,
  Star,
  CheckCircle,
  Heart,
  Shield,
  Clock,
  Users,
  Info,
  Stethoscope,
  FlaskConical,
  Plus,
  Pill,
  Scissors,
  Activity
} from "lucide-react";

import { popularDiseases } from "@/data/diseases";

// Animation variants for smooth, professional animations
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" }
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};



// Red circle with white medical cross, stylable via text-*/currentColor for the circle
const MedicalPlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <circle cx="32" cy="32" r="28" fill="currentColor" />
    {/* Vertical bar of cross */}
    <rect x="28" y="18" width="8" height="28" rx="1.5" fill="#ffffff" />
    {/* Horizontal bar of cross */}
    <rect x="18" y="28" width="28" height="8" rx="1.5" fill="#ffffff" />
  </svg>
);

const heroAltTexts = [
  "Find Best Doctors & Specialists",
  "Top Hospitals and Clinics in Pakistan",
  "Diagnostic Labs & Home Sampling",
  "Online Pharmacy & Medicine Delivery",
  "Emergency Healthcare Services"
];

// Floating particle component for the background
const FloatingParticle = ({ children, delay, duration, x, y, scale }: { children: React.ReactNode, delay: number, duration: number, x: any, y: any, scale: number }) => (
  <motion.div
    initial={{ opacity: 0, x: 0, y: 0, scale: 0, rotate: 0 }}
    animate={{
      opacity: [0.2, 0.5, 0.2],
      x: x,
      y: y,
      scale: [scale * 0.9, scale, scale * 0.9],
      rotate: [0, 180, 360]
    }}
    transition={{
      duration: duration,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut",
      repeatType: "reverse"
    }}
    className="absolute z-[15] pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
  >
    {children}
  </motion.div>
);

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentHero, setCurrentHero] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const { user } = useAuth();

  const scrollToAbout = () => {
    try {
      const el = document.getElementById('about');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch { }
  };

  // Rotate hero background images every 5 seconds based on available images
  useEffect(() => {
    const total = heroImages.length || 5;
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Track mobile viewport to adjust hero4 positioning
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener ? mq.addEventListener('change', update) : mq.addListener(update);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', update) : mq.removeListener(update);
    };
  }, []);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Fetch hero images from backend (public endpoint)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(apiUrl('/api/hero-images'));
        const data = await res.json();
        if (res.ok && data?.success && Array.isArray(data.images)) {
          const urls = data.images.map((i: any) => i?.url).filter((u: any) => typeof u === 'string' && !!u);
          setHeroImages(urls);
        }
      } catch { }
    };
    load();
  }, []);

  if (isLoading) {
    return <HomeSkeleton />;
  }

  const features = [
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Book appointments, tests, and surgeries with just a few clicks"
    },
    {
      icon: MapPin,
      title: "Location-Based Search",
      description: "Find healthcare services near you with our smart location finder"
    },
    {
      icon: Star,
      title: "Verified Reviews",
      description: "Read genuine reviews from verified patients to make informed decisions"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health data is protected with enterprise-grade security"
    }
  ];

  const services = [
    {
      icon: Stethoscope,
      title: "Medical Treatments",
      description: "Find doctors and clinics for all types of medical treatments",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverBgColor: "hover:bg-blue-100"
    },
    {
      icon: FlaskConical,
      title: "Lab Tests",
      description: "Book lab tests and get results delivered to your home",
      color: "text-green-600",
      bgColor: "bg-green-50",
      hoverBgColor: "hover:bg-green-100"
    },
    {
      icon: Scissors,
      title: "Surgeries",
      description: "Find qualified surgeons and surgical facilities",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      hoverBgColor: "hover:bg-orange-100"
    },
    {
      icon: Shield,
      title: "Health Checkups",
      description: "Comprehensive health screenings and preventive care",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      hoverBgColor: "hover:bg-emerald-100"
    },
    {
      icon: Pill,
      title: "Medicines",
      description: "Order medicines online with home delivery options",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      hoverBgColor: "hover:bg-purple-100"
    }
  ];

  const stats = [
    { number: "50,000+", label: "Registered Users" },
    { number: "2,000+", label: "Healthcare Providers" },
    { number: "100,000+", label: "Successful Bookings" },
    { number: "50+", label: "Cities Covered" }
  ];

  const diseaseIntro = popularDiseases;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pt-16 relative">
      {/* Refined Gentle Flash Intro - Subtle Light Reveal */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="fixed inset-0 z-[100] pointer-events-none bg-white"
        style={{
          background: "radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 80%)",
        }}
      />









      <SEO
        title="آنلائن ڈاکٹر اپائنٹمنٹ پاکستان | Book Best Doctors, Hospitals & Labs Online"
        description="Pakistan's #1 healthcare platform - Sehatkor. Book PMDC verified doctors, top hospitals, diagnostic labs & pharmacies online in Karachi, Lahore, Islamabad, Peshawar, Mardan. آنلائن ڈاکٹر، ہسپتال، لیب اور فارمیسی بک کریں۔ 24/7 support, instant appointments, home services, lowest fees guaranteed."
        keywords="online doctor Pakistan, book doctor online Pakistan, آنلائن ڈاکٹر پاکستان, best healthcare platform Pakistan, PMDC verified doctors, doctor appointment online, ڈاکٹر بک کریں, آنلائن ہسپتال, find doctor near me, best doctors Karachi, best doctors Lahore, best doctors Islamabad, best doctors Peshawar, best doctors Mardan, کراچی میں ڈاکٹر, لاہور میں ڈاکٹر, اسلام آباد میں ڈاکٹر, پشاور میں ڈاکٹر, مردان میں ڈاکٹر, cardiologist Pakistan, pediatrician Pakistan, gynecologist Pakistan, dermatologist Pakistan, dentist Pakistan, general physician Pakistan, lady doctor Pakistan, child specialist Pakistan, ماہر امراض قلب, بچوں کا ڈاکٹر, خواتین کا ڈاکٹر, جلد کا ڈاکٹر, best hospitals Pakistan, hospital booking online, ہسپتال تلاش کریں, lab test Pakistan, diagnostic lab near me, لیب ٹیسٹ, blood test home, online pharmacy Pakistan, medicine delivery, آنلائن فارمیسی, دوائی ڈیلیوری, healthcare services Pakistan, medical consultation online, 24/7 doctor helpline, emergency doctor, sehatkor, affordable healthcare Pakistan, home sample collection, prescription medicine delivery, marham alternative, oladoc alternative, doctor ki fees, ڈاکٹر کی فیس, sasta doctor, سستا ڈاکٹر, cheap doctor, free checkup, مفت چیک اپ, bukhar ka ilaj, بخار کا علاج, fever treatment, pet dard ka doctor, پیٹ درد کا ڈاکٹر, stomach pain doctor, sir dard ka ilaj, سر درد کا علاج, headache treatment, zukam ka ilaj, زکام کا علاج, cold treatment, khansi ka ilaj, کھانسی کا علاج, cough treatment, sugar ka doctor, شوگر کا ڈاکٹر, diabetes doctor, blood pressure doctor, بلڈ پریشر ڈاکٹر, BP doctor, dil ka doctor, دل کا ڈاکٹر, heart doctor, jigar ka doctor, جگر کا ڈاکٹر, liver doctor, kidney doctor, گردے کا ڈاکٹر, haddi ka doctor, ہڈی کا ڈاکٹر, bone doctor, jild ka doctor, جلد کا ڈاکٹر, skin doctor, ankh ka doctor, آنکھ کا ڈاکٹر, eye doctor, kan ka doctor, کان کا ڈاکٹر, ENT doctor, dant ka doctor, دانت کا ڈاکٹر, teeth doctor, bacho ka doctor, بچوں کا ڈاکٹر, baby doctor, pregnancy doctor, حمل کا ڈاکٹر, maternity doctor, delivery doctor, ڈیلیوری ڈاکٹر, operation doctor, آپریشن ڈاکٹر, surgery doctor, emergency hospital, ایمرجنسی ہسپتال, raat ko doctor, رات کو ڈاکٹر, night doctor, Sunday doctor, اتوار کو ڈاکٹر, weekend doctor, cheap hospital, سستا ہسپتال, government hospital, سرکاری ہسپتال, private hospital, پرائیویٹ ہسپتال, ghar par doctor, گھر پر ڈاکٹر, home visit doctor, online doctor consultation, آنلائن ڈاکٹر مشورہ, video call doctor, ویڈیو کال ڈاکٹر, phone par doctor, فون پر ڈاکٹر, teleconsultation, medicine ghar mangwao, دوائی گھر منگواؤ, medicine home delivery, dawai online, دوائی آنلائن, buy medicine online, test ghar par, ٹیسٹ گھر پر, home test, blood test ghar par, بلڈ ٹیسٹ گھر پر, home blood test, x-ray kahan ho, ایکسرے کہاں ہو, where to get xray, ultrasound near me, الٹراساؤنڈ میرے قریب, COVID test kahan, کووڈ ٹیسٹ کہاں, where COVID test, vaccine kahan milegi, ویکسین کہاں ملے گی, vaccination center, injection ghar par, انجیکشن گھر پر, home injection, drip ghar par, ڈرپ گھر پر, IV at home, nurse ghar par, نرس گھر پر, home nurse, physiotherapy home, فزیوتھراپی گھر پر, health checkup package, ہیلتھ چیک اپ پیکیج, full body checkup, مکمل جسم کا چیک اپ, routine checkup, معمول کا چیک اپ, medical certificate, میڈیکل سرٹیفکیٹ, fitness certificate, فٹنس سرٹیفکیٹ, prescription online, نسخہ آنلائن, online prescription, report online dekho, رپورٹ آنلائن دیکھو, view report online, doctor rating, ڈاکٹر کی ریٹنگ, best reviewed doctor, بہترین ریویو والا ڈاکٹر, top rated doctor, experienced doctor, تجربہ کار ڈاکٹر, senior doctor, سینئر ڈاکٹر, specialist doctor, ماہر ڈاکٹر, MBBS doctor, ایم بی بی ایس ڈاکٹر, FCPS doctor, ایف سی پی ایس ڈاکٹر, verified doctor, تصدیق شدہ ڈاکٹر, licensed doctor, لائسنس یافتہ ڈاکٹر, qualified doctor, قابل ڈاکٹر, trustworthy doctor, قابل اعتماد ڈاکٹر, family doctor, فیملی ڈاکٹر, home doctor, گھریلو ڈاکٹر, urgent care, فوری علاج, instant appointment, فوری اپائنٹمنٹ, same day appointment, اسی دن اپائنٹمنٹ, walk-in clinic, واک ان کلینک, no waiting doctor, بغیر انتظار ڈاکٹر, quick consultation, فوری مشورہ, telemedicine Pakistan, ٹیلی میڈیسن پاکستان, digital health Pakistan, ڈیجیٹل صحت پاکستان, health app Pakistan, صحت ایپ پاکستان, medical app, میڈیکل ایپ, doctor booking app, ڈاکٹر بکنگ ایپ, hospital app, ہسپتال ایپ, lab booking app, لیب بکنگ ایپ, pharmacy app, فارمیسی ایپ"
        canonical="https://sehatkor.pk/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Sehatkor",
            "alternateName": "صحت کور",
            "url": "https://sehatkor.pk",
            "logo": "https://sehatkor.pk/logo.png",
            "description": "Pakistan's leading online healthcare platform connecting patients with verified doctors, hospitals, labs, and pharmacies",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "PK"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Service",
              "availableLanguage": ["English", "Urdu"]
            },
            "sameAs": [
              "https://www.facebook.com/sehatkor",
              "https://www.twitter.com/sehatkor"
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Sehatkor",
            "url": "https://sehatkor.pk",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://sehatkor.pk/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How do I book a doctor appointment on Sehatkor?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Simply search for your desired doctor, select a time slot, and confirm your appointment. You can book online or call our helpline."
                }
              },
              {
                "@type": "Question",
                "name": "Is Sehatkor available in all cities of Pakistan?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sehatkor is available in major cities including Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, and expanding to other cities."
                }
              },
              {
                "@type": "Question",
                "name": "Are the doctors on Sehatkor verified?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, all doctors on Sehatkor are verified with PMDC registration and their credentials are thoroughly checked."
                }
              },
              {
                "@type": "Question",
                "name": "How much does a doctor consultation cost on Sehatkor?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Doctor consultation fees vary from PKR 500-3000 depending on the specialist and consultation type. We offer affordable healthcare options."
                }
              },
              {
                "@type": "Question",
                "name": "Can I get online prescription from Sehatkor doctors?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, our verified doctors can provide online prescriptions after proper consultation. Prescriptions are sent digitally and can be used at any pharmacy."
                }
              },
              {
                "@type": "Question",
                "name": "Does Sehatkor offer lab tests at home?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, we provide home sample collection for lab tests. Our trained technicians visit your home for sample collection and deliver reports online."
                }
              },
              {
                "@type": "Question",
                "name": "How can I find the best doctors near me in Pakistan?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Use our search feature to find top-rated doctors by specialty, location, and availability. Filter by reviews, experience, and consultation fees."
                }
              },
              {
                "@type": "Question",
                "name": "Is Sehatkor better than marham.pk and oladoc.com?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sehatkor offers comprehensive healthcare services with 24/7 support, verified doctors, competitive pricing, and services across all major Pakistani cities."
                }
              },
              {
                "@type": "Question",
                "name": "What payment methods are accepted on Sehatkor?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We accept multiple payment methods including JazzCash, Easypaisa, credit/debit cards, and bank transfers for your convenience."
                }
              },
              {
                "@type": "Question",
                "name": "Can I book hospital appointments through Sehatkor?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, we partner with top hospitals across Pakistan. You can book appointments, schedule surgeries, and get hospital information through our platform."
                }
              }
            ]
          }
        ]}
      />
      {/* Hero Section */}
      <section
        className="relative overflow-visible py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 px-4 text-white min-h-[70vh] sm:min-h-[75vh] md:min-h-[80vh] lg:min-h-[85vh] hero-section hero-background"
        style={{
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)'
        }}
      >
        {/* Background slider layers (dynamic with fallback) */}
        <div className="absolute inset-0 z-0">
          {(
            (heroImages && heroImages.length > 0)
              ? heroImages
              : [heroImage, heroImage2, heroImage3, heroImage4, heroImage5]
          ).map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={heroAltTexts[idx] || "Sehatkor Healthcare Services"}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out backdrop-blur-sm ${currentHero === idx ? 'opacity-100' : 'opacity-0'}`}
              style={{
                objectPosition: idx === 4 && !heroImages.length ? (isMobile ? 'center center' : 'center -160px') : 'center center',
                filter: 'blur(2px)',
              }}
              loading={idx === 0 ? "eager" : "lazy"}
            />
          ))}
        </div>

        {/* Animated Background Particles - Medical Texture */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 10, duration: 2, ease: "easeOut" }}
          className="absolute inset-0 overflow-hidden pointer-events-none z-[15] mix-blend-overlay"
        >
          {/* Top Left Area */}
          <div className="absolute top-10 left-10">
            <FloatingParticle delay={0} duration={15} x={20} y={-20} scale={1.2}>
              <Plus className="w-8 h-8 text-white/40" />
            </FloatingParticle>
          </div>
          <div className="absolute top-20 left-[15%]">
            <FloatingParticle delay={1} duration={18} x={-30} y={30} scale={1.5}>
              <div className="w-12 h-12 border-2 border-white/20 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-white/30" />
              </div>
            </FloatingParticle>
          </div>

          {/* Top Right Area */}
          <div className="absolute top-16 right-[10%]">
            <FloatingParticle delay={2} duration={20} x={30} y={-30} scale={1}>
              <Activity className="w-16 h-16 text-emerald-100/30" />
            </FloatingParticle>
          </div>
          <div className="absolute top-32 right-[25%]">
            <FloatingParticle delay={3} duration={16} x={-20} y={-40} scale={1.4}>
              <div className="w-10 h-10 border border-dashed border-white/40 rounded-full"></div>
            </FloatingParticle>
          </div>

          {/* Bottom Left Area */}
          <div className="absolute bottom-32 left-[8%]">
            <FloatingParticle delay={4} duration={22} x={40} y={-20} scale={1.3}>
              <div className="w-12 h-6 border-2 border-white/30 rounded-full rotate-45"></div>
            </FloatingParticle>
          </div>

          {/* Bottom Right Area */}
          <div className="absolute bottom-20 right-[15%]">
            <FloatingParticle delay={5} duration={14} x={-20} y={20} scale={0.8}>
              <div className="grid grid-cols-2 gap-1">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
              </div>
            </FloatingParticle>
          </div>
        </motion.div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/65 z-10"></div>
        <div className="container mx-auto relative z-20 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
          <div className="max-w-5xl mx-auto text-center w-full">
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight text-white drop-shadow-xl"
            >
              Find Best <span className="bg-gradient-to-r from-slate-300 via-emerald-400 to-slate-300 bg-clip-text text-transparent drop-shadow-md">Healthcare Services</span> in Pakistan
              <span className="block mt-3 sm:mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-white drop-shadow-xl leading-relaxed" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
                پاکستان میں <span className="bg-gradient-to-r from-slate-300 via-emerald-400 to-slate-300 bg-clip-text text-transparent drop-shadow-md">بہترین طبی سہولیات</span> تلاش کریں
              </span>
            </motion.h1>
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 text-slate-100 leading-relaxed max-w-4xl mx-auto font-medium drop-shadow-lg tracking-wide"
            >
              Your Complete Health Partner. Connect with top-rated providers for all your medical needs.
              <span className="block mt-3 text-xs sm:text-sm md:text-base lg:text-lg text-slate-100/90" style={{ fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: '2.0' }}>
                آپ کا مکمل ہیلتھ پارٹنر۔ بہترین ڈاکٹرز، ہسپتال، لیبز اور ادویات کی خدمات ایک ہی جگہ۔
              </span>
            </motion.p>


            {/* Search Component */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={scaleIn}
              transition={{ delay: 0.4 }}
              className="mt-4 sm:mt-6 relative z-10 w-full max-w-2xl mx-auto"
            >
              <SearchServices hideCategory hideLocationIcon light />
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.6 }}
              className="flex flex-row sm:flex-row gap-2 lg:gap-4 justify-center mt-4 sm:mt-8 w-full max-w-2xl mx-auto"
            >
              <Button
                asChild
                className="bg-white text-primary hover:bg-white/90 
    px-2 sm:px-6 py-1.5 sm:py-3 
    text-[11px] sm:text-base 
    flex-1 sm:flex-none
    "
              >
                <Link to="/search" className="flex items-center justify-center">
                  <Search className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  Search Services
                </Link>
              </Button>

              {!user ? (
                <Button
                  asChild
                  variant="outline"
                  className="border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-red-600 
      px-2 sm:px-6 py-1.5 sm:py-3 
      text-[11px] sm:text-base 
      flex-1 sm:flex-none"
                >
                  <Link to="/register" className="flex items-center justify-center">
                    <UserPlus className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    Register Now
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  className="border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-blue-600 
      px-2 sm:px-6 py-1.5 sm:py-3 
      text-[11px] sm:text-base 
      flex-1 sm:flex-none"
                >
                  <Link to="/about" className="flex items-center justify-center">
                    <Info className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    About Us
                  </Link>
                </Button>
              )}
            </motion.div>

          </div>
        </div>
      </section >

      {/* Stats Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="py-12 sm:py-16 bg-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="relative">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 group-hover:text-emerald-600 transition-colors">
                    {stat.number}
                  </div>
                  <div className="absolute inset-0 bg-emerald-100 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-full"></div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section >

      {/* Popular Searches Section - SEO Optimized */}
      < section className="py-12 sm:py-16 bg-gradient-to-br from-emerald-50 via-white to-blue-50" >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-gray-800">Popular Searches</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Quick access to the most searched healthcare services in Pakistan
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Specialty Searches */}
            <Link to="/doctors?specialty=Cardiologist" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-red-200 bg-white">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">❤️</div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-800 group-hover:text-red-600 transition-colors">Cardiologist</h3>
                  <p className="text-xs text-muted-foreground mt-1">Heart Specialist</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/doctors?specialty=Pediatrician" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 bg-white">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">👶</div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-800 group-hover:text-blue-600 transition-colors">Pediatrician</h3>
                  <p className="text-xs text-muted-foreground mt-1">Child Specialist</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/doctors?specialty=Gynecologist" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-pink-200 bg-white">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">👩‍⚕️</div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-800 group-hover:text-pink-600 transition-colors">Gynecologist</h3>
                  <p className="text-xs text-muted-foreground mt-1">Lady Doctor</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/doctors?specialty=Dermatologist" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200 bg-white">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">🧴</div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-800 group-hover:text-purple-600 transition-colors">Dermatologist</h3>
                  <p className="text-xs text-muted-foreground mt-1">Skin Specialist</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/doctors?specialty=Dentist" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-teal-200 bg-white">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">🦷</div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-800 group-hover:text-teal-600 transition-colors">Dentist</h3>
                  <p className="text-xs text-muted-foreground mt-1">Dental Care</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/doctors?specialty=Orthopedic" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-200 bg-white">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">🦴</div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-800 group-hover:text-orange-600 transition-colors">Orthopedic</h3>
                  <p className="text-xs text-muted-foreground mt-1">Bone Specialist</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* City Searches */}
          <div className="mt-8 sm:mt-10">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center text-gray-800">Search by City</h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              <Link to="/karachi" className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-sm sm:text-base font-medium text-gray-700 hover:text-emerald-700">
                Karachi Doctors
              </Link>
              <Link to="/lahore" className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-sm sm:text-base font-medium text-gray-700 hover:text-emerald-700">
                Lahore Doctors
              </Link>
              <Link to="/islamabad" className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-sm sm:text-base font-medium text-gray-700 hover:text-emerald-700">
                Islamabad Doctors
              </Link>
              <Link to="/peshawar" className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-sm sm:text-base font-medium text-gray-700 hover:text-emerald-700">
                Peshawar Doctors
              </Link>
              <Link to="/mardan" className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-sm sm:text-base font-medium text-gray-700 hover:text-emerald-700">
                Mardan Doctors
              </Link>
            </div>
          </div>
        </div>
      </section >

      {/* Diseases & Symptoms Section */}
      < section className="py-16 sm:py-20 bg-white" >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Diseases & Symptoms</h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore common diseases, their symptoms, causes, and prevention. Click to view details.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 lg:gap-5">
            {diseaseIntro.map((d) => {
              const Icon = d.icon as any;
              return (
                <Link key={d.slug} to={`/all-diseases`} className="group">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:shadow-md transition-all ring-1 ${d.bgClass} ${d.ringClass}`}>
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${d.colorClass}`} />
                  </div>
                  <div className="text-center text-xs sm:text-sm mt-2 font-medium leading-tight">{d.name}</div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <Button asChild variant="outline" size="sm" className="text-sm">
              <Link to="/all-diseases">View all diseases</Link>
            </Button>
          </div>
        </div>
      </section >

      {/* Services Section */}
      < section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20" >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-800">Our Services</h2>
            <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive healthcare services to meet all your medical needs
            </p>
          </div>

          {/* New Layout: 4 left cards + 2 right cards */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Left Column - 3 stacked cards */}
              <div className="lg:col-span-6 space-y-4">
                {services.slice(0, 3).map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <Card key={index} className={`group border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ${service.bgColor} ${service.hoverBgColor} min-h-[120px]`}>
                      <CardContent className="p-6 flex items-center">
                        <div className={`w-12 h-12 rounded-lg ${service.bgColor === 'bg-blue-50' ? 'bg-blue-100' :
                          service.bgColor === 'bg-green-50' ? 'bg-green-100' :
                            service.bgColor === 'bg-indigo-50' ? 'bg-indigo-100' :
                              service.bgColor === 'bg-orange-50' ? 'bg-orange-100' : 'bg-gray-100'
                          } flex items-center justify-center mr-4 flex-shrink-0`}>
                          <Icon className={`w-6 h-6 ${service.color}`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-800 mb-2">{service.title}</CardTitle>
                          <CardDescription className="text-sm text-gray-600 leading-relaxed">
                            {service.description}
                          </CardDescription>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Right Column - 2 large cards */}
              <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.slice(3).map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <Card key={index + 3} className={`group border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ${service.bgColor} ${service.hoverBgColor} h-full min-h-[250px]`}>
                      <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                        <div className={`w-16 h-16 rounded-lg ${service.bgColor === 'bg-emerald-50' ? 'bg-emerald-100' :
                          service.bgColor === 'bg-purple-50' ? 'bg-purple-100' : 'bg-gray-100'
                          } flex items-center justify-center mb-6`}>
                          <Icon className={`w-8 h-8 ${service.color}`} />
                        </div>
                        <CardTitle className="text-2xl font-semibold text-gray-800 mb-4">{service.title}</CardTitle>
                        <CardDescription className="text-base text-gray-600 leading-relaxed">
                          {service.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Comparison Explorer (styled section) */}
      < section
        className="relative py-20 sm:py-24 overflow-hidden bg-gradient-to-br from-slate-300 via-zinc-200 to-slate-100"
      >
        {/* Subtle overlay */}
        < div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(34,211,238,0.17),transparent_62%),radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.15),transparent_62%)]" />

        {/* Decorative elements (very subtle) */}
        < div className="absolute top-10 left-10 w-20 h-20 bg-white/70 rounded-full blur-2xl" ></div >
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-cyan-300/35 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-indigo-300/30 rounded-full blur-2xl"></div>

        {/* Container (no inner card) */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-8 text-center">
            <Badge
              variant="secondary"
              className="mb-4 bg-white/40 backdrop-blur-sm border-white/50 text-gray-800 hover:bg-white/60 transition-all duration-300"
            >
              Smart Compare
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 drop-shadow-lg">
              Compare Providers for the Same Service
            </h2>
            <p className="text-gray-700 text-lg sm:text-xl mt-4 max-w-3xl mx-auto drop-shadow-md">
              Pick the same product across providers and see price, location, and rating differences
            </p>
          </div>

          <CompareExplorer />
        </div>

      </section >

      {/* Partners Marquee below the compare section */}
      < PartnersMarquee speed="normal" />

      {/* Features Section (About) */}
      < section id="about" className="py-16 sm:py-20 bg-white scroll-mt-24" >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Why Choose SehatKor?</h2>
            <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              We're committed to making healthcare accessible, affordable, and reliable for everyone
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section >

      {/* CTA Section */}
      < section className="py-16 sm:py-20 bg-gray-100 text-gray-900" >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-gray-600 max-w-2xl mx-auto">
            Join thousands of users who trust SehatKor for their healthcare needs
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Button asChild size="lg" className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base w-full sm:w-auto">
              <Link to="/register">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Get Started
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gray-400 text-gray-700 hover:bg-gray-200 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base w-full sm:w-auto">
              <Link to="/search">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Find Services
              </Link>
            </Button>
          </div>
        </div>
      </section >
      <CompareTray />
    </div >
  );
};

export default HomePage;