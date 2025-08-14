import { Link } from "react-router-dom";
import { 
  Stethoscope, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  TestTube,
  Pill,
  Calendar,
  Shield,
  Heart,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const services = [
    { name: "Find Doctors", href: "/search", icon: Stethoscope },
    { name: "Lab Tests", href: "/search", icon: TestTube },
    { name: "Medicines", href: "/search", icon: Pill },
    { name: "Book Appointments", href: "/search", icon: Calendar }
  ];

  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "How it Works", href: "/how-it-works" },
    { name: "Healthcare Providers", href: "/providers" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/faq" },
    { name: "Help Center", href: "/help" }
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Disclaimer", href: "/disclaimer" }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">SehatKor</span>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              Pakistan's trusted healthcare platform connecting patients with quality medical services. 
              Find doctors, book appointments, order medicines, and manage your health - all in one place.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-white/5 rounded-lg backdrop-blur-sm">
                <div className="text-xl font-bold text-red-400">50K+</div>
                <div className="text-xs text-gray-400">Users</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg backdrop-blur-sm">
                <div className="text-xl font-bold text-green-400">2K+</div>
                <div className="text-xs text-gray-400">Providers</div>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-3">
              <Button size="sm" variant="ghost" className="w-10 h-10 p-0 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="w-10 h-10 p-0 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="w-10 h-10 p-0 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="w-10 h-10 p-0 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300">
                <Linkedin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Heart className="w-5 h-5 text-red-400 mr-2" />
              Our Services
            </h3>
            <ul className="space-y-3">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <li key={index}>
                    <Link 
                      to={service.href} 
                      className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-300 group"
                    >
                      <Icon className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">{service.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Users className="w-5 h-5 text-blue-400 mr-2" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Shield className="w-5 h-5 text-green-400 mr-2" />
              Stay Connected
            </h3>
            
            {/* Contact Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="w-4 h-4 text-green-400" />
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>support@sehatkor.com</span>
              </div>
              <div className="flex items-start space-x-3 text-gray-300">
                <MapPin className="w-4 h-4 text-red-400 mt-1" />
                <span>Lahore, Karachi, Islamabad<br />& 47+ cities across Pakistan</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-3">
              <h4 className="font-medium text-white">Health Newsletter</h4>
              <p className="text-sm text-gray-400">Get health tips & updates</p>
              <div className="flex space-x-2">
                <Input 
                  type="email" 
                  placeholder="Your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
                />
                <Button size="sm" className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © 2024 SehatKor. All rights reserved. | Connecting Pakistan with Quality Healthcare
            </div>
            
            {/* Legal Links */}
            <div className="flex flex-wrap items-center space-x-6 text-sm">
              {legalLinks.map((link, index) => (
                <Link 
                  key={index}
                  to={link.href} 
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 space-y-2 md:space-y-0">
              <div>🏥 Licensed Healthcare Platform | 🔒 SSL Secured | 💊 Verified Providers</div>
              <div>Made with ❤️ for healthier Pakistan</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;