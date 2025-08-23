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

  // Rotate hero background images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
      color: "text-blue-500"
    },
    {
      icon: TestTube,
      title: "Lab Tests",
      description: "Book lab tests and get results delivered to your home",
      color: "text-green-500"
    },
    {
      icon: Pill,
      title: "Medicines",
      description: "Order medicines online with home delivery options",
      color: "text-purple-500"
    },
    {
      icon: Scissors,
      title: "Surgeries",
      description: "Find qualified surgeons and surgical facilities",
      color: "text-red-500"
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
        {/* Background slider layers */}
        <div className="absolute inset-0 z-0">
          <div
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${currentHero === 0 ? 'opacity-100' : 'opacity-0'}`}
            style={{
              backgroundImage: `url(${heroImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${currentHero === 1 ? 'opacity-100' : 'opacity-0'}`}
            style={{
              backgroundImage: `url(${heroImage2})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${currentHero === 2 ? 'opacity-100' : 'opacity-0'}`}
            style={{
              backgroundImage: `url(${heroImage3})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${currentHero === 3 ? 'opacity-100' : 'opacity-0'}`}
            style={{
              backgroundImage: `url(${heroImage4})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${currentHero === 4 ? 'opacity-100' : 'opacity-0'}`}
            style={{
              backgroundImage: `url(${heroImage5})`,
              backgroundSize: 'cover',
              backgroundPosition: isMobile ? 'center center' : 'center -160px',
              backgroundRepeat: 'no-repeat'
            }}
          />
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
                <Card key={index} className="card-healthcare hover:shadow-medium transition-all duration-300 border-0">
                  <CardHeader className="text-center pb-3 sm:pb-4">
                    <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-accent rounded-full flex items-center justify-center">
                      <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${service.color}`} />
                    </div>
                    <CardTitle className="text-lg sm:text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-sm sm:text-base leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Explorer (styled section) */}
      <section className="py-16 bg-gradient-to-br from-rose-50 via-sky-50 to-emerald-50 bg-fixed mx-[calc(50%-50vw)]">
        {/* Fixed top/bottom gradient bands to blend into viewport edges */}
        <div className="pointer-events-none fixed inset-x-0 top-0 h-40 bg-gradient-to-b from-rose-50 via-sky-50 to-transparent -z-10" />
        <div className="pointer-events-none fixed inset-x-0 bottom-0 h-40 bg-gradient-to-t from-emerald-50 via-sky-50 to-transparent -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 text-center">
            <Badge variant="secondary" className="mb-2">Smart Compare</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Compare Providers for the Same Service</h2>
            <p className="text-muted-foreground mt-2">Pick the same product across providers and see price, location, and rating differences</p>
          </div>
          <CompareExplorer />
        </div>
      </section>

      {/* Partners Marquee below the compare section */}
      <PartnersMarquee />

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