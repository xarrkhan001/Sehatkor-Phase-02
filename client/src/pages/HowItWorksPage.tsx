import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Search,
  UserPlus,
  Calendar,
  CreditCard,
  CheckCircle,
  Star,
  Shield,
  MessageCircle,
  Stethoscope,
  Hospital,
  FlaskConical,
  Pill,
  ArrowRight,
  Users,
  FileText,
  Clock,
  MapPin,
  Phone,
  Video,
  Home
} from "lucide-react";

const HowItWorksPage = () => {
  const [userType, setUserType] = useState<"patient" | "provider">("patient");

  const patientSteps = [
    {
      step: 1,
      icon: Search,
      title: "Search for Healthcare Services",
      description: "Use our smart search to find doctors, hospitals, labs, or pharmacies near you. Filter by location, specialty, price, and ratings.",
      details: [
        "Search by specialty (Cardiologist, Pediatrician, etc.)",
        "Filter by city and area",
        "Compare prices and ratings",
        "View provider profiles and reviews"
      ]
    },
    {
      step: 2,
      icon: Star,
      title: "Compare & Choose",
      description: "Compare multiple providers side-by-side. Read verified patient reviews and check ratings to make an informed decision.",
      details: [
        "Compare up to 3 providers at once",
        "Read verified patient reviews",
        "Check availability and timings",
        "View detailed service information"
      ]
    },
    {
      step: 3,
      icon: Calendar,
      title: "Book Appointment",
      description: "Book your appointment instantly with just a few clicks. Choose your preferred date, time, and consultation type.",
      details: [
        "Select date and time slot",
        "Choose online or physical consultation",
        "Add notes for the provider",
        "Get instant confirmation"
      ]
    },
    {
      step: 4,
      icon: CreditCard,
      title: "Secure Payment",
      description: "Pay securely using EasyPaisa, JazzCash, or other integrated payment methods. Get digital receipts instantly.",
      details: [
        "Multiple payment options",
        "Secure encrypted transactions",
        "Digital receipts and invoices",
        "Refund protection"
      ]
    },
    {
      step: 5,
      icon: Video,
      title: "Get Healthcare",
      description: "Attend your consultation (online or physical), get prescriptions, and communicate with your provider via chat.",
      details: [
        "Online video consultations",
        "Physical appointments",
        "Real-time chat with providers",
        "Digital prescriptions"
      ]
    },
    {
      step: 6,
      icon: Star,
      title: "Rate & Review",
      description: "Share your experience by rating and reviewing the service. Help other patients make better decisions.",
      details: [
        "Rate your experience (1-5 stars)",
        "Write detailed reviews",
        "Upload photos (optional)",
        "Help improve healthcare quality"
      ]
    }
  ];

  const providerSteps = [
    {
      step: 1,
      icon: UserPlus,
      title: "Register Your Practice",
      description: "Sign up as a healthcare provider. Choose your category: Doctor, Hospital/Clinic, Laboratory, or Pharmacy.",
      details: [
        "Create provider account",
        "Choose your category",
        "Add basic information",
        "Verify email and phone"
      ]
    },
    {
      step: 2,
      icon: FileText,
      title: "Complete Verification",
      description: "Submit your credentials and documents for verification. Our team will verify your licenses and qualifications.",
      details: [
        "Upload PMDC/relevant licenses",
        "Submit qualification documents",
        "Provide practice address proof",
        "Wait for admin approval (24-48 hours)"
      ]
    },
    {
      step: 3,
      icon: Stethoscope,
      title: "Add Services",
      description: "List your services with detailed information, pricing, and availability. Add multiple locations if needed.",
      details: [
        "Add service details and pricing",
        "Set availability and timings",
        "Upload service images",
        "Add multiple locations/branches"
      ]
    },
    {
      step: 4,
      icon: Calendar,
      title: "Manage Bookings",
      description: "Receive and manage patient bookings through your dashboard. Accept or reschedule appointments as needed.",
      details: [
        "View incoming bookings",
        "Accept/reject appointments",
        "Reschedule if needed",
        "Set automatic confirmations"
      ]
    },
    {
      step: 5,
      icon: MessageCircle,
      title: "Communicate with Patients",
      description: "Use our built-in chat system to communicate with patients. Share prescriptions and medical advice securely.",
      details: [
        "Real-time chat with patients",
        "Share digital prescriptions",
        "Send follow-up reminders",
        "Maintain patient records"
      ]
    },
    {
      step: 6,
      icon: CreditCard,
      title: "Receive Payments",
      description: "Get paid securely through our platform. Track your earnings and generate financial reports.",
      details: [
        "Automatic payment processing",
        "Weekly/monthly payouts",
        "Financial reports and analytics",
        "Transparent fee structure"
      ]
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Verified Providers",
      description: "All healthcare providers are verified and licensed"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support for assistance"
    },
    {
      icon: MapPin,
      title: "Location-Based",
      description: "Find healthcare services near your location"
    },
    {
      icon: Phone,
      title: "Multiple Channels",
      description: "Book via website, app, or phone call"
    }
  ];

  const currentSteps = userType === "patient" ? patientSteps : providerSteps;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Helmet>
        <title>How It Works - Sehatkor | Complete Guide to Online Healthcare Booking</title>
        <meta 
          name="description" 
          content="Learn how Sehatkor works. Step-by-step guide for patients to book doctors, hospitals, labs & pharmacies online. Guide for healthcare providers to register and manage services. آن لائن ڈاکٹر بک کرنے کا طریقہ۔" 
        />
        <meta 
          name="keywords" 
          content="how to book doctor online Pakistan, sehatkor guide, online appointment booking guide, healthcare booking process, doctor booking steps, کیسے کام کرتا ہے, آن لائن ڈاکٹر بکنگ کا طریقہ, how to use sehatkor, patient guide, provider guide, healthcare platform tutorial" 
        />
        <link rel="canonical" href="https://sehatkor.pk/how-it-works" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Book Healthcare Services on Sehatkor",
            "description": "Complete guide to booking doctors, hospitals, labs, and pharmacies online in Pakistan",
            "step": patientSteps.map(step => ({
              "@type": "HowToStep",
              "position": step.step,
              "name": step.title,
              "text": step.description,
              "itemListElement": step.details.map((detail, idx) => ({
                "@type": "HowToDirection",
                "position": idx + 1,
                "text": detail
              }))
            }))
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
            Complete Guide
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">Sehatkor</span> Works
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Your complete guide to booking healthcare services online in Pakistan
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
            پاکستان میں آن لائن طبی خدمات بک کرنے کی مکمل رہنمائی
          </p>

          {/* User Type Toggle */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={() => setUserType("patient")}
              variant={userType === "patient" ? "default" : "outline"}
              className={userType === "patient" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <Users className="w-4 h-4 mr-2" />
              For Patients
            </Button>
            <Button
              onClick={() => setUserType("provider")}
              variant={userType === "provider" ? "default" : "outline"}
              className={userType === "provider" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Stethoscope className="w-4 h-4 mr-2" />
              For Providers
            </Button>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {userType === "patient" ? "Patient Journey" : "Provider Journey"}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {userType === "patient" 
                ? "Follow these simple steps to book and receive healthcare services"
                : "Get started as a healthcare provider on Sehatkor"}
            </p>
          </div>

          <div className="space-y-8">
            {currentSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="border-2 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          userType === "patient" ? "bg-blue-100" : "bg-green-100"
                        }`}>
                          <Icon className={`w-8 h-8 ${
                            userType === "patient" ? "text-blue-600" : "text-green-600"
                          }`} />
                        </div>
                        <div className={`mt-2 text-center font-bold text-lg ${
                          userType === "patient" ? "text-blue-600" : "text-green-600"
                        }`}>
                          Step {step.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{step.title}</CardTitle>
                        <CardDescription className="text-base text-gray-600 mb-4">
                          {step.description}
                        </CardDescription>
                        <ul className="space-y-2">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Sehatkor?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make healthcare accessible, affordable, and reliable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who trust Sehatkor for their healthcare needs
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link to="/search">
                <Search className="w-5 h-5 mr-2" />
                Search Services
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/register">
                <UserPlus className="w-5 h-5 mr-2" />
                Register Now
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
