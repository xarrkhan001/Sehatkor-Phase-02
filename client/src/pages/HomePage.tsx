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
  Stethoscope,
  TestTube,
  Pill,
  Scissors
} from "lucide-react";
import { popularDiseases } from "@/data/diseases";

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentHero, setCurrentHero] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [heroImages, setHeroImages] = useState<string[]>([]);

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
      } catch {}
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
      color: "text-blue-700",
      bgGradient: "bg-gradient-to-br from-blue-100 via-blue-200 to-indigo-200",
      hoverGradient: "hover:from-blue-200 hover:via-blue-250 hover:to-indigo-250"
    },
    {
      icon: TestTube,
      title: "Lab Tests",
      description: "Book lab tests and get results delivered to your home",
      color: "text-emerald-700",
      bgGradient: "bg-gradient-to-br from-emerald-100 via-green-200 to-teal-200",
      hoverGradient: "hover:from-emerald-200 hover:via-green-250 hover:to-teal-250"
    },
    {
      icon: Pill,
      title: "Medicines",
      description: "Order medicines online with home delivery options",
      color: "text-purple-700",
      bgGradient: "bg-gradient-to-br from-purple-100 via-violet-200 to-indigo-200",
      hoverGradient: "hover:from-purple-200 hover:via-violet-250 hover:to-indigo-250"
    },
    {
      icon: Scissors,
      title: "Surgeries",
      description: "Find qualified surgeons and surgical facilities",
      color: "text-orange-700",
      bgGradient: "bg-gradient-to-br from-orange-100 via-amber-200 to-yellow-200",
      hoverGradient: "hover:from-orange-200 hover:via-amber-250 hover:to-yellow-250"
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
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive healthcare services to meet all your medical needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className={`group relative overflow-hidden border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 ${service.bgGradient} ${service.hoverGradient}`}>
                  {/* Subtle overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-gray-50/20 pointer-events-none"></div>
                  
                  <CardHeader className="relative text-center pb-3 sm:pb-4 pt-6">
                    <div className="mx-auto mb-4 w-16 h-16 sm:w-20 sm:h-20 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-white/60 group-hover:scale-105 transition-transform duration-300">
                      <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${service.color}`} />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-800">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative text-center pb-6">
                    <CardDescription className="text-sm sm:text-base leading-relaxed text-gray-600 font-normal">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                  
                  {/* Subtle shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 pointer-events-none"></div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Explorer (styled section) */}
      <section 
        className="relative py-20 sm:py-24 overflow-hidden animate-gradient-x"
        style={{
          backgroundColor: '#e1ecff'
        }}
      >
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-blue-100/10"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/8 rounded-full blur-lg animate-ping"></div>
        
        {/* Glass morphism container */}
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
          
          {/* Content wrapper with gradient glass effect */}
          <div 
            className="backdrop-blur-md rounded-2xl border border-white/40 shadow-xl p-6 sm:p-8"
            style={{
              backgroundColor: 'rgba(225, 236, 255, 0.8)'
            }}
          >
            <CompareExplorer />
          </div>
        </div>

      </section>

      {/* Partners Marquee below the compare section */}
      <PartnersMarquee speed="normal" />

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white">
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