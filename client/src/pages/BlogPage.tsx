import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BlogSkeleton from "@/components/skeletons/BlogSkeleton";
import { BookOpen, Stethoscope, Users, Award, ShieldCheck, MapPin, Star, Zap, HeartPulse } from "lucide-react";

const BlogPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading time for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: "Verified Providers", value: "1K+", icon: Stethoscope },
    { label: "Active Users", value: "10K+", icon: Users },
    { label: "Platform Rating", value: "4.9", icon: Award },
    { label: "Features", value: "20+", icon: HeartPulse },
  ];

  // Show skeleton while loading
  if (isLoading) {
    return <BlogSkeleton />;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Sehatkor Healthcare Blog",
    "description": "Expert medical insights, health guides, and updates from Pakistan's leading healthcare platform.",
    "url": "https://sehatkor.pk/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Sehatkor",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sehatkor.pk/logo.png"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <SEO
        title="Sehatkor Blog - Healthcare Articles & Medical Guides Pakistan"
        description="Read expert medical articles, health guides, and tips about healthcare in Pakistan. Stay updated with Sehatkor's latest insights on doctors, labs, and hospitals."
        keywords="health blog pakistan, medical articles, doctor guides, lab test information, hospital reviews, sehatkor blog"
        canonical="https://sehatkor.pk/blog"
        jsonLd={jsonLd}
        type="website"
      />
      {/* Hero Section - Professional & SEO Optimized */}
      <section className="relative bg-gradient-to-br from-white via-blue-50/50 to-white overflow-hidden py-20 lg:py-24">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#3b82f6_0.03,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#8b5cf6_0.03,transparent_50%)]"></div>
        </div>

        <div className="relative container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-lg">
              <BookOpen className="w-4 h-4" />
              Pakistan's #1 Healthcare Platform
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Book <span className="text-blue-600">Doctors</span>, <span className="text-blue-600">Hospitals</span>, <span className="text-blue-600">Labs</span> & <span className="text-blue-600">Pharmacies</span> Online
            </h1>

            <p className="text-lg lg:text-xl text-gray-600 font-medium mb-8 max-w-3xl mx-auto">
              Connect with 1000+ verified healthcare providers across Pakistan. 24/7 support available.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {["Online Doctor", "Hospital Booking", "Lab Test", "Pharmacy Delivery"].map((keyword) => (
                <span key={keyword} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  {keyword}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon as any;
                return (
                  <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg mb-3">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">

        {/* Services Section - Compact */}
        <section className="mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Complete Healthcare Solutions</h2>
              <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose SehatKor?</h3>
                <p className="text-gray-600 mb-6">
                  Pakistan's most comprehensive digital healthcare platform with verified providers nationwide.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: ShieldCheck, text: "100% Verified Doctors" },
                    { icon: MapPin, text: "Available Nationwide" },
                    { icon: Star, text: "4.9/5 Rating" },
                    { icon: Zap, text: "Instant Booking" }
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-700">{item.text}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  {["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar"].map((city) => (
                    <span key={city} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      {city}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Our Services</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { title: "Doctor Consultation", icon: Stethoscope },
                    { title: "Hospital Booking", icon: HeartPulse },
                    { title: "Lab Tests", icon: ShieldCheck },
                    { title: "Pharmacy Delivery", icon: HeartPulse }
                  ].map((service, i) => {
                    const Icon = service.icon;
                    return (
                      <div key={i} className="bg-white rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{service.title}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts Section - Compact */}
        <section className="mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Healthcare Articles & Guides</h2>
              <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full mb-4"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Expert medical insights to help you make informed health decisions
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Blog Post 1 */}
              <article className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-300">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <div className="p-6">
                  <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-4 border border-blue-200">
                    Doctor Guide
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                    How to Book Doctor Appointments Online in Pakistan (2025)
                  </h3>
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                    Complete guide to book verified doctors online. Learn about consultations, specialists, and virtual visits.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-600 font-medium">5 min read</span>
                    <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow-md">
                      <Link to="/blog/how-to-book-doctor-online-pakistan">Read Article</Link>
                    </Button>
                  </div>
                </div>
              </article>

              {/* Blog Post 2 */}
              <article className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-green-300">
                <div className="h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
                <div className="p-6">
                  <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold mb-4 border border-green-200">
                    Lab Test Guide
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                    Essential Lab Tests for Health Checkup in Pakistan (2025)
                  </h3>
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                    Important blood tests and screenings for Pakistanis. Includes CBC, lipid profile, and test prices.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-600 font-medium">6 min read</span>
                    <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm shadow-md">
                      <Link to="/blog/best-lab-tests-routine-checkup-pakistan">Read Article</Link>
                    </Button>
                  </div>
                </div>
              </article>

              {/* Blog Post 3 */}
              <article className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-300">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                <div className="p-6">
                  <div className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold mb-4 border border-purple-200">
                    Hospital Ranking
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                    Top 10 Hospitals in Lahore, Karachi, Islamabad (2025)
                  </h3>
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                    Ranking of Pakistan's best hospitals based on patient reviews, facilities, and quality standards.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-600 font-medium">8 min read</span>
                    <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm shadow-md">
                      <Link to="/blog/top-10-hospitals-pakistan-2025">Read Article</Link>
                    </Button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Trust Section - Compact */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Why Trust SehatKor?</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Verified Providers</h4>
                  <p className="text-sm text-gray-600">
                    All doctors, hospitals, labs, and pharmacies are verified and licensed.
                  </p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Trusted by Users</h4>
                  <p className="text-sm text-gray-600">
                    100,000+ Pakistanis trust SehatKor for their healthcare needs.
                  </p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">24/7 Support</h4>
                  <p className="text-sm text-gray-600">
                    Round-the-clock customer support for urgent medical needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Compact */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">Start Your Healthcare Journey</h2>
              <p className="text-lg mb-6 opacity-90">
                Book doctor appointments, order lab tests, or get medicines delivered - all from home.
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% Secure</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4" />
                  <span>Instant Booking</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate('/search')}
                  className="bg-white text-blue-600 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold"
                >
                  Search Services
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg font-semibold"
                >
                  Create Free Account
                </Button>
              </div>

              <p className="text-xs mt-4 opacity-75">
                No fees • No hidden charges • Cancel anytime
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default BlogPage;