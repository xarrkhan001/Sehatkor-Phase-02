import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Heart, 
  Shield, 
  Users, 
  Stethoscope, 
  Hospital, 
  TestTube, 
  Pill, 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle, 
  Zap,
  Globe,
  Award,
  TrendingUp,
  Smartphone,
  CreditCard,
  MessageCircle,
  Search,
  Calendar,
  UserCheck,
  Building,
  FlaskConical,
  ShoppingBag,
  ArrowRight,
  Target,
  Eye,
  Lightbulb,
  BookOpen
} from "lucide-react";
import { Link } from "react-router-dom";

const AboutPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { icon: Users, label: "Healthcare Providers", value: "1000+", color: "text-blue-600", description: "Verified doctors, hospitals, labs & pharmacies" },
    { icon: Heart, label: "Patients Served", value: "50,000+", color: "text-red-500", description: "Successful consultations & treatments" },
    { icon: MapPin, label: "Cities Covered", value: "25+", color: "text-green-600", description: "Major cities across Pakistan" },
    { icon: Star, label: "Average Rating", value: "4.8/5", color: "text-yellow-500", description: "Based on verified patient reviews" }
  ];

  const features = [
    {
      icon: Search,
      title: "Smart Search & Discovery",
      description: "Advanced search engine with location-based filtering, category sorting, and real-time results across all healthcare services."
    },
    {
      icon: Calendar,
      title: "Seamless Booking System",
      description: "One-click booking for medical consultations, lab tests, surgeries, and medicine orders with instant confirmation."
    },
    {
      icon: CreditCard,
      title: "Integrated Payment Solutions",
      description: "Secure payment processing with EasyPaisa and JazzCash integration, digital wallets, and automated billing."
    },
    {
      icon: MessageCircle,
      title: "Real-time Communication",
      description: "Built-in chat system connecting patients with providers, WhatsApp integration, and instant notifications."
    },
    {
      icon: Shield,
      title: "Verified Provider Network",
      description: "Rigorous verification process ensuring all healthcare providers are licensed, qualified, and trustworthy."
    },
    {
      icon: Star,
      title: "Comprehensive Rating System",
      description: "Transparent review and rating system with verified patient feedback and quality badges for providers."
    }
  ];

  const services = [
    {
      icon: Stethoscope,
      title: "Medical Consultations",
      description: "Connect with qualified doctors for consultations, treatments, and medical advice",
      types: ["Online Consultations", "Physical Appointments", "Specialist Treatments", "Emergency Care"],
      color: "bg-blue-50 border-blue-200"
    },
    {
      icon: Hospital,
      title: "Hospital Services",
      description: "Access comprehensive hospital and clinic services across multiple departments",
      types: ["Surgery Procedures", "Emergency Services", "Specialized Departments", "Inpatient Care"],
      color: "bg-green-50 border-green-200"
    },
    {
      icon: TestTube,
      title: "Laboratory Tests",
      description: "Book diagnostic tests and lab services with home sample collection",
      types: ["Blood Tests", "Imaging Services", "Pathology", "Home Collection"],
      color: "bg-purple-50 border-purple-200"
    },
    {
      icon: Pill,
      title: "Pharmacy Services",
      description: "Order medicines online with home delivery and prescription management",
      types: ["Prescription Medicines", "OTC Products", "Home Delivery", "Stock Management"],
      color: "bg-orange-50 border-orange-200"
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To democratize healthcare access in Pakistan by connecting patients with quality healthcare providers through innovative technology solutions."
    },
    {
      icon: Eye,
      title: "Our Vision",
      description: "To become Pakistan's leading healthcare platform, making quality healthcare accessible, affordable, and convenient for everyone."
    },
    {
      icon: Lightbulb,
      title: "Our Values",
      description: "Transparency, Quality, Innovation, and Patient-first approach drive everything we do in transforming healthcare delivery."
    }
  ];

  const techStack = [
    { name: "React + TypeScript", category: "Frontend" },
    { name: "Node.js + Express", category: "Backend" },
    { name: "MongoDB", category: "Database" },
    { name: "Socket.IO", category: "Real-time" },
    { name: "Cloudinary", category: "Storage" },
    { name: "JWT Authentication", category: "Security" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10"></div>
        <div className={`max-w-6xl mx-auto text-center relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            Pakistan's Premier Healthcare Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">SehatKor</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing healthcare delivery in Pakistan through innovative technology, connecting patients with verified healthcare providers for seamless, secure, and affordable medical services.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!user ? (
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  Join SehatKor <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/blog">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800">
                  <BookOpen className="mr-2 w-4 h-4" />
                  Read Our Blog
                </Button>
              </Link>
            )}
            <Link to="/search">
              <Button size="lg" variant="outline" className="border-2 border-blue-200 hover:bg-blue-50">
                Explore Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 mb-4 ${stat.color}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-800 font-semibold mb-2">{stat.label}</div>
                <div className="text-sm text-gray-600 leading-relaxed">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Foundation</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built on strong principles and driven by the vision to transform healthcare accessibility in Pakistan
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-green-100 mb-4 mx-auto">
                    <value.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive Healthcare Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From medical consultations to pharmacy services, we cover all aspects of healthcare delivery
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className={`border-2 ${service.color} hover:shadow-lg transition-all duration-300`}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-white shadow-sm">
                      <service.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">{service.title}</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">{service.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {service.types.map((type, typeIndex) => (
                      <Badge key={typeIndex} variant="secondary" className="bg-white/80 text-gray-700">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced technology features designed to provide the best healthcare experience
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white">
                <CardHeader className="pb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Detailed Company Story */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Born from the vision to bridge the gap between patients and quality healthcare providers in Pakistan
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl border border-blue-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">The Challenge</h3>
                <p className="text-gray-700 leading-relaxed">
                  Healthcare accessibility in Pakistan faced significant challenges - patients struggled to find verified providers, 
                  compare services, and book appointments efficiently. Traditional methods were time-consuming and often unreliable, 
                  leading to delayed treatments and suboptimal healthcare experiences.
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-2xl border border-green-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">The Solution</h3>
                <p className="text-gray-700 leading-relaxed">
                  SehatKor was created to revolutionize this landscape by providing a comprehensive digital platform that connects 
                  patients with verified healthcare providers. Our technology-driven approach ensures transparency, convenience, 
                  and quality in every healthcare interaction.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Award className="w-6 h-6 text-purple-600" />
                    Quality Assurance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Every healthcare provider on our platform undergoes rigorous verification including license validation, 
                    credential checks, and quality assessments to ensure patients receive the best care possible.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Globe className="w-6 h-6 text-orange-600" />
                    Nationwide Reach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    From major metropolitan areas to smaller cities, SehatKor's network spans across Pakistan, 
                    bringing quality healthcare access to communities that need it most.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How SehatKor Works</h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Simple, secure, and efficient healthcare service delivery in just a few steps
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Search & Discover", description: "Find healthcare providers and services near you using our smart search with location-based filtering and category sorting", icon: Search },
              { step: "2", title: "Compare & Choose", description: "Compare services, read verified reviews, check ratings, and select the best option for your specific needs", icon: Star },
              { step: "3", title: "Book & Pay", description: "Book appointments instantly and pay securely using EasyPaisa, JazzCash, or other integrated payment methods", icon: CreditCard },
              { step: "4", title: "Get Care", description: "Receive quality healthcare services, communicate via chat, and rate your experience to help others", icon: Heart }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6 text-2xl font-bold relative">
                  {step.step}
                  <div className="absolute -bottom-2 -right-2 bg-white/30 rounded-full p-2">
                    <step.icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="opacity-90 leading-relaxed text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Impact Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Impact on Pakistani Healthcare</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transforming lives through accessible, quality healthcare delivery across Pakistan
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4 mx-auto">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Patient Empowerment</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Empowering patients with choice, transparency, and control over their healthcare decisions through comprehensive provider information and verified reviews.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Patient Satisfaction</span>
                    <span className="font-semibold text-green-600">95%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Repeat Users</span>
                    <span className="font-semibold text-blue-600">78%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 mx-auto">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Provider Growth</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Supporting healthcare providers with digital tools, patient management systems, and streamlined payment processing to grow their practice.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Provider Revenue Increase</span>
                    <span className="font-semibold text-green-600">40%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">New Patients per Provider</span>
                    <span className="font-semibold text-blue-600">+150/month</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4 mx-auto">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Healthcare Quality</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Raising healthcare standards through provider verification, patient feedback systems, and continuous quality monitoring across our network.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Verified Providers</span>
                    <span className="font-semibold text-green-600">100%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Quality Score</span>
                    <span className="font-semibold text-blue-600">4.8/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Transform Your Healthcare Experience?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of patients and healthcare providers who trust SehatKor for their medical needs
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!user ? (
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-8">
                  Get Started Today <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/blog">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 px-8">
                  <BookOpen className="mr-2 w-4 h-4" />
                  Read Our Blog
                </Button>
              </Link>
            )}
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:bg-gray-50 px-8">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
