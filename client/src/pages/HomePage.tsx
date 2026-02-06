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
import HomeSkeleton from "@/components/skeletons/HomeSkeleton";
import HomeCTA from "@/components/HomeCTA";
import SEO from "@/components/SEO";
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
  UserRound
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

const HomePage = () => {
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
      title: "Online Video Consultation",
      subtitle: "PMC Verified",
      link: "/doctors?type=video",
      bg: "bg-sky-100",
      text: "text-sky-900",
      subText: "text-sky-700",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
      id: 2,
      title: "Book Clinic Appointment",
      subtitle: "Book Appointment",
      link: "/doctors",
      bg: "bg-orange-100",
      text: "text-orange-900",
      subText: "text-orange-700",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
      id: 3,
      title: "Get Instant Doctor",
      subtitle: "One Click Relief",
      link: "/doctors",
      bg: "bg-emerald-100",
      text: "text-emerald-900",
      subText: "text-emerald-700",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=400",
      hasBadge: true
    },
    {
      id: 4,
      title: "Weight Loss",
      subtitle: "Healthy Life",
      link: "/weight-loss",
      bg: "bg-yellow-100",
      text: "text-yellow-900",
      subText: "text-yellow-700",
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=300&h=300",
    },
    {
      id: 5,
      title: "Lab Tests",
      subtitle: "Home Sample",
      link: "/labs",
      bg: "bg-blue-100",
      text: "text-blue-900",
      subText: "text-blue-700",
      image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=300&h=300",
    },
    {
      id: 6,
      title: "Buy Medicine Online",
      subtitle: "Genuine Medicines",
      link: "/pharmacies",
      bg: "bg-pink-100",
      text: "text-pink-900",
      subText: "text-pink-700",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300&h=300",
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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <SEO
        title="Sehatkor - Pakistan's #1 Healthcare Platform | Online Doctor Pakistan"
        description="Book doctors, lab tests, and medicines online. Best healthcare facilities now within your reach to Sehatkor. Book an appointment now."
        keywords="online doctor, doctor appointment, lab test, home lab test, medicines, Sehatkor, Pakistan, hospital, best doctors, doctors in pakistan, online doctor karachi, sehatkor english"
        canonical="https://sehatkor.pk/"
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

      {/* Hero Section */}
      <section className="relative pt-16 md:pt-20 pb-8 md:pb-12 lg:pt-24 lg:pb-16 overflow-visible">
        {/* BACKGROUND */}
        <div className="absolute inset-0 bg-gray-100 z-0 rounded-b-[2rem] lg:rounded-b-[3rem] shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-white/60 rounded-full blur-[120px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="max-w-7xl mx-auto"
          >
            {/* Welcome Greeting - Always generic green icon and Welcome text */}
            <div className="flex items-center gap-2 mt-2 -ml-1 mb-1 relative z-20 md:mb-0 md:mt-0 md:ml-0 md:absolute md:left-4 md:top-0">
              <div className="p-0.5 bg-white rounded-full shadow-md">
                <Avatar className="h-8 w-8 md:h-11 md:w-11 border-2 border-emerald-50">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs md:text-lg flex items-center justify-center">
                    {user ? <UserRound className="w-4 h-4 md:w-6 md:h-6 text-white" /> : "G"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-left">
                <p className="text-xs md:text-base font-bold text-gray-900 leading-none">
                  Welcome
                </p>
                <p className="text-[9px] md:text-xs text-gray-500 font-medium mt-0.5">
                  Glad to have you here
                </p>
              </div>
            </div>

            {/* Header Content */}
            <div className="text-center mb-2 md:mb-8">
              <div className="absolute right-4 top-0 mt-3 md:static md:mt-0 flex items-center justify-center gap-1 md:gap-2 mb-1 md:mb-4">
                <ShieldCheck className="w-3.5 h-3.5 md:w-5 md:h-5 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-700 md:text-lg">
                  <span className="md:hidden">Pakistan's #1 Platform</span>
                  <span className="hidden md:inline">Pakistan's #1 Health Platform</span>
                </span>
              </div>

              <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-1 md:mb-3">
                Health Issues? <span className="text-emerald-600">We Have The Solution!</span>
              </h1>

              {/* Search Bar Block */}
              <SearchServices
                hideCategory
                hideLocationIcon
                className="!bg-gray-100 !p-1 !rounded-none !shadow-xl !border !border-gray-400 max-w-3xl mx-auto transform transition-all hover:scale-[1.005]"
              />
            </div>

            {/* Bento Grid Layout - Mobile: Marham Style (Video left 2cols, 2 cards right 3cols), Desktop: Bento Grid */}
            <div className="grid grid-cols-5 md:grid-cols-12 gap-2 md:gap-4">
              {/* Video Consultation - Left side, spans 2 rows on mobile, 2 columns wide */}
              <Link
                to={heroCards[0].link}
                className={`relative group overflow-hidden rounded-xl md:rounded-2xl shadow-lg border border-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${heroCards[0].bg} 
                  col-span-2 row-span-2 h-auto md:col-span-3 md:row-span-2 md:h-full`}
              >
                <div className="p-3 md:p-5 relative z-20 h-full flex flex-col items-start text-left w-full md:max-w-[65%]">
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
                  className="absolute bottom-2 right-2 w-20 h-20 md:right-1/2 md:translate-x-1/2 md:bottom-4 md:w-40 md:h-40 object-cover rounded-full border-2 md:border-4 border-white shadow-lg transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/10 pointer-events-none"></div>
              </Link>

              {/* Clinic Visit - Right side, top, 3 columns wide */}
              <Link
                to={heroCards[1].link}
                className={`relative group overflow-hidden rounded-xl md:rounded-2xl shadow-lg border border-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${heroCards[1].bg} 
                  col-span-3 h-24 md:col-span-4 md:h-36`}
              >
                <div className="p-3 md:p-5 relative z-20 h-full flex flex-col items-start text-left w-full md:max-w-[65%]">
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
                  className="absolute bottom-1.5 right-1.5 w-14 h-14 md:bottom-3 md:right-4 md:w-32 md:h-32 object-cover rounded-full border-2 md:border-4 border-white shadow-lg transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/10 pointer-events-none"></div>
              </Link>

              {/* Instant Doctor - Right side, bottom, 3 columns wide */}
              <Link
                to={heroCards[2].link}
                className={`relative group overflow-hidden rounded-xl md:rounded-2xl shadow-lg border border-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${heroCards[2].bg} 
                  col-span-3 h-24 md:col-span-5 md:h-36`}
              >
                <div className="p-3 md:p-5 relative z-20 h-full flex flex-col items-start text-left w-full md:max-w-[65%]">
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
                  className="absolute bottom-1.5 right-1.5 w-14 h-14 md:bottom-3 md:right-4 md:w-32 md:h-32 object-cover rounded-full border-2 md:border-4 border-white shadow-lg transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/10 pointer-events-none"></div>
              </Link>

              {/* Remaining cards - Alternating widths, last card full width */}
              {heroCards.slice(3).map((card, index) => (
                <Link
                  to={card.link}
                  key={card.id}
                  className={`relative group overflow-hidden rounded-xl md:rounded-2xl shadow-lg border border-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${card.bg} 
                    ${index === 2 ? 'col-span-5' : index % 2 === 0 ? 'col-span-2' : 'col-span-3'} h-24 md:col-span-3 md:h-36`}
                >
                  <div className="p-3 md:p-5 relative z-20 h-full flex flex-col items-start text-left w-full md:max-w-[60%]">
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
                    className="absolute bottom-1.5 right-1.5 w-14 h-14 md:bottom-3 md:right-4 md:w-32 md:h-32 object-cover rounded-full border-2 md:border-4 border-white shadow-lg transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/10 pointer-events-none"></div>
                </Link>
              ))}
            </div>

          </motion.div>
        </div>
      </section>

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
                img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300&h=300",
                link: "/doctors?specialty=Cardiologist",
                color: "text-red-600",
                bg: "bg-red-50",
                border: "group-hover:border-red-200"
              },
              {
                title: "Pediatrician",
                desc: "Child Specialist",
                img: "https://plus.unsplash.com/premium_photo-1661764878654-3d0fc2eefcca?auto=format&fit=crop&q=80&w=300&h=300",
                link: "/doctors?specialty=Pediatrician",
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "group-hover:border-blue-200"
              },
              {
                title: "Gynecologist",
                desc: "Women's Health",
                img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=300&h=300",
                link: "/doctors?specialty=Gynecologist",
                color: "text-pink-600",
                bg: "bg-pink-50",
                border: "group-hover:border-pink-200"
              },
              {
                title: "Dermatologist",
                desc: "Skin Specialist",
                img: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=300&h=300",
                link: "/doctors?specialty=Dermatologist",
                color: "text-amber-600",
                bg: "bg-amber-50",
                border: "group-hover:border-amber-200"
              },
              {
                title: "Dentist",
                desc: "Dental Care",
                img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=300&h=300",
                link: "/doctors?specialty=Dentist",
                color: "text-teal-600",
                bg: "bg-teal-50",
                border: "group-hover:border-teal-200"
              },
              {
                title: "Orthopedic",
                desc: "Bone Specialist",
                img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=300&h=300",
                link: "/doctors?specialty=Orthopedic",
                color: "text-indigo-600",
                bg: "bg-indigo-50",
                border: "group-hover:border-indigo-200"
              }
            ].map((item, index) => (
              <Link to={item.link} key={index} className="group relative">
                <div className={`h-full bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col items-center p-4 text-center hover:-translate-y-1 ${item.border}`}>
                  <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden shadow-inner ring-4 ring-gray-50 group-hover:scale-105 transition-transform duration-500">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className={`font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mb-1`}>{item.title}</h3>
                  <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* City Searches - Styled */}
          <div className="mt-16">
            <h3 className="text-xl font-bold mb-8 text-center text-gray-900">Find Doctors by City</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {["Karachi", "Lahore", "Islamabad", "Peshawar", "Mardan", "Swat", "Multan", "Faisalabad"].map((city) => (
                <Link
                  key={city}
                  to={`/${city.toLowerCase()}`}
                  className="px-6 py-3 bg-white rounded-full shadow-sm text-gray-600 font-medium border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 hover:shadow-md hover:bg-emerald-50 transition-all duration-300 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 opacity-70" />
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {diseaseIntro.map((d) => {
              const Icon = d.icon as any;
              return (
                <Link key={d.slug} to={`/all-diseases`} className="group">
                  <div className={`h-full p-4 rounded-2xl border border-gray-100 bg-white hover:border-emerald-200 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center group-hover:-translate-y-1`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 ${d.bgClass}`}>
                      <Icon className={`w-6 h-6 ${d.colorClass}`} />
                    </div>
                    <span className="font-bold text-gray-800 text-sm group-hover:text-emerald-700 transition-colors line-clamp-2 md:line-clamp-1">
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