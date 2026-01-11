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
import { apiUrl } from "@/config/api";
import heroImage from "@/assets/healthcare-hero-bg.jpg";
import heroImage2 from "@/assets/hero1.jpg";
import heroImage3 from "@/assets/hero2.png";
import heroImage4 from "@/assets/hero3.png";
import heroImage5 from "@/assets/hero4.png";
import { Helmet } from 'react-helmet-async';

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
  Scissors
} from "lucide-react";

import { popularDiseases } from "@/data/diseases";


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
    // Simulate loading time for initial page load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
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
    <div className="min-h-screen bg-background overflow-x-hidden pt-16">
      <Helmet>
        <title>Sehatkor - آنلائن ڈاکٹر اپائنٹمنٹ پاکستان | Book Best Doctors Online</title>
        <meta name="description" content="Pakistan's #1 healthcare platform. Book verified doctors online in Karachi, Lahore, Islamabad. آنلائن ڈاکٹر بک کریں۔ 24/7 support, instant appointments, lowest fees." />
        <meta name="keywords" content="online doctor Pakistan, doctor appointment, آنلائن ڈاکٹر, book doctor online, doctor near me, best doctor Karachi, best doctor Mardan, best doctor Peshawar, Lahore doctor, Islamabad hospital, lady doctor, child specialist, skin doctor, heart specialist, online consultation, lab test home, pharmacy delivery, sehatkor, marham alternative, oladoc alternative, PMDC verified doctors, 24/7 doctor helpline, video consultation, emergency doctor, prescription online, affordable healthcare Pakistan" />
        <link rel="canonical" href="https://sehatkor.pk/" />
        <meta property="og:title" content="Sehatkor - Pakistan's #1 Healthcare Platform" />
        <meta property="og:description" content="Book verified doctors online in Karachi, Lahore, Islamabad. 24/7 support, instant appointments, lowest fees." />
        <meta property="og:url" content="https://sehatkor.pk/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sehatkor.pk/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sehatkor - Book Best Doctors Online in Pakistan" />
        <meta name="twitter:description" content="Pakistan's #1 healthcare platform. Book verified doctors, hospitals, labs. 24/7 support." />
      </Helmet>
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
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${currentHero === idx ? 'opacity-100' : 'opacity-0'}`}
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: 'cover',
                backgroundPosition: idx === 4 && !heroImages.length ? (isMobile ? 'center center' : 'center -160px') : 'center center',
                backgroundRepeat: 'no-repeat'
              }}
            />
          ))}
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 sm:bg-black/50 z-10"></div>
        <div className="container mx-auto relative  z-20 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center lg:mt-16 w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold mb-4 lg:mt- sm:mb-6 leading-tight text-white/80">
              Your Health, Our Priority
            </h1>
            <p className="text-base font-thin sm:text-lg md:text-xl lg:text-xl mb-6 sm:mb-8 text-white/70 leading-relaxed max-w-3xl mx-auto">
              Find, compare, and book healthcare services across Pakistan with SehatKor
            </p>


            {/* Search Component */}
            <div className="mt-4 sm:mt-6 relative z-10 w-full max-w-2xl mx-auto">
              <SearchServices hideCategory hideLocationIcon light />
            </div>

            <div className="flex flex-row sm:flex-row gap-2 lg:gap-4 justify-center mt-4 sm:mt-8 w-full max-w-2xl mx-auto">
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
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diseases & Symptoms Section */}
      <section className="py-16 sm:py-20 bg-white">
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
      </section>

      {/* Services Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
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
      </section>

      {/* Comparison Explorer (styled section) */}
      <section
        className="relative py-20 sm:py-24 overflow-hidden bg-gradient-to-br from-slate-300 via-zinc-200 to-slate-100"
      >
        {/* Subtle overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(34,211,238,0.17),transparent_62%),radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.15),transparent_62%)]" />

        {/* Decorative elements (very subtle) */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/70 rounded-full blur-2xl"></div>
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

      </section>

      {/* Partners Marquee below the compare section */}
      <PartnersMarquee speed="normal" />

      {/* Features Section (About) */}
      <section id="about" className="py-16 sm:py-20 bg-white scroll-mt-24">
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
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gray-100 text-gray-900">
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
      </section>
      <CompareTray />
    </div>
  );
};

export default HomePage;