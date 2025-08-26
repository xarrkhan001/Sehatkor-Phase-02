import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  Headphones,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  HeartPulse,
  Stethoscope
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const ContactPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const API_BASE = (import.meta as any)?.env?.VITE_API_URL || "http://localhost:4000";
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to send message");
      }
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "",
        message: ""
      });
    } catch (err: any) {
      toast({
        title: "Failed to send",
        description: err?.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Call Us",
      details: ["+92 21 1234 5678", "+92 300 1234567"],
      description: "Mon-Fri 9AM-6PM"
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["support@sehatkor.com", "info@sehatkor.com"],
      description: "24/7 Support"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["Karachi, Pakistan", "Multiple Locations"],
      description: "Main Office"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon-Fri: 9AM-6PM", "Sat-Sun: 10AM-4PM"],
      description: "Customer Support"
    }
  ];

  const quickHelp = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      action: "Start Chat",
      color: "text-blue-500",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100"
    },
    {
      icon: PhoneCall,
      title: "Phone Support",
      description: "Speak directly with our healthcare experts",
      action: "Call Now",
      color: "text-green-600",
      bg: "bg-green-50",
      iconBg: "bg-green-100"
    },
    {
      icon: AlertTriangle,
      title: "Emergency Help",
      description: "For urgent medical emergencies",
      action: "Emergency Line",
      color: "text-red-600",
      bg: "bg-red-50",
      iconBg: "bg-red-100"
    }
  ];

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 text-gray-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            We're Here to Help
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto"
          >
            Get in touch with our healthcare professionals for any questions or concerns
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 -mt-10">
        {/* Quick Help Section */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {quickHelp.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div key={index} variants={fadeIn}>
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className={`mx-auto mb-6 w-20 h-20 ${item.iconBg} rounded-2xl flex items-center justify-center`}>
                      <Icon className={`w-10 h-10 ${item.color}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                    <p className="mt-4 text-sm text-gray-500">{item.action}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Value Props Section */}
        <section className="mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Professional Support</h3>
              <p className="text-gray-600">Certified healthcare experts ready to guide you with clarity and care.</p>
            </div>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Fast Response</h3>
              <p className="text-gray-600">We typically respond within 24 hours to all inquiries and complaints.</p>
            </div>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure & Confidential</h3>
              <p className="text-gray-600">Your personal information is protected and handled with utmost privacy.</p>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Contact Information</h2>
              <p className="text-gray-600 mb-8">
                We're here to help and answer any questions you might have. We look forward to hearing from you.
              </p>
            </div>

            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div key={index} className="flex items-start space-x-4 group">
                  <div className="p-3 bg-blue-100 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{info.title}</h3>
                    <div className="space-y-1 mt-1">
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-gray-600">{detail}</p>
                      ))}
                    </div>
                    <p className="text-sm text-blue-600 mt-1">{info.description}</p>
                  </div>
                </div>
              );
            })}
            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-medium mb-1">Do you offer home services?</h4>
              <p className="text-sm text-muted-foreground">
                Many of our providers offer home services. Look for the "Home Service" badge when searching.
              </p>
            </div>

            {/* Emergency Contact */}
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <h3 className="text-lg font-semibold text-red-700">Emergency Contact</h3>
                </div>
                <div className="rounded-md bg-red-50 border border-red-100 text-red-700 text-sm p-3 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  For medical emergencies, dial 1122 immediately.
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="w-full p-8">
                  <CardHeader className="px-0 pt-0">
                    <div className="inline-flex items-center mb-2">
                      <Stethoscope className="w-6 h-6 text-blue-600 mr-2" />
                      <span className="text-blue-600 font-medium">Get in Touch</span>
                    </div>
                    <CardTitle className="text-3xl font-bold text-gray-800">Send us a Message</CardTitle>
                    <CardDescription className="text-gray-600">
                      Fill out the form and our team will get back to you within 24 hours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-gray-700 font-medium">Full Name *</Label>
                          <Input
                            id="name"
                            className="h-12"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-gray-700 font-medium">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            className="h-12"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
                          <Input
                            id="phone"
                            className="h-12"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            placeholder="+92 300 1234567"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-gray-700 font-medium">How can we help?</Label>
                          <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Inquiry</SelectItem>
                              <SelectItem value="appointment">Appointment Booking</SelectItem>
                              <SelectItem value="prescription">Prescription Refill</SelectItem>
                              <SelectItem value="billing">Billing & Insurance</SelectItem>
                              <SelectItem value="technical">Technical Support</SelectItem>
                              <SelectItem value="complaint">Complaint</SelectItem>
                              <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-gray-700 font-medium">Subject</Label>
                        <Input
                          id="subject"
                          className="h-12"
                          value={formData.subject}
                          onChange={(e) => handleInputChange("subject", e.target.value)}
                          placeholder="What's this about?"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="message" className="text-gray-700 font-medium">Your Message *</Label>
                          <span className="text-sm text-gray-500">{formData.message.length}/1000</span>
                        </div>
                        <Textarea
                          id="message"
                          className="min-h-[150px]"
                          value={formData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          placeholder="Please provide details about your inquiry..."
                          maxLength={1000}
                          required
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between pt-4">
                        <p className="text-sm text-gray-500 mb-4 sm:mb-0">
                          We'll get back to you within 24 hours
                        </p>
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full sm:w-auto px-8 py-6 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="bg-gray-50 px-0 py-4 border-t">
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                      <span>Your information is secure and will be kept confidential</span>
                    </div>
                  </CardFooter>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Map Section removed as requested */}
      </div>
    </div>
  );
};

export default ContactPage;