import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BlogSkeleton from "@/components/skeletons/BlogSkeleton";
import { BookOpen, Stethoscope, Users, Award, Image as ImageIcon, ShieldCheck, MapPin, Star, Zap, HeartPulse, Monitor, Laptop } from "lucide-react";

// Screenshots from assets
import web1 from "@/assets/web1.PNG?url";
import web2 from "@/assets/web2.PNG?url";
import web3 from "@/assets/web3.PNG?url";
import web4 from "@/assets/web4.PNG?url";
import web5 from "@/assets/web5.PNG?url";
import web6 from "@/assets/web6.PNG?url";
import web7 from "@/assets/web7.PNG?url";
import web8 from "@/assets/web8.PNG?url";
import web9 from "@/assets/web9.PNG?url";
import web10 from "@/assets/web10.PNG?url";
import web11 from "@/assets/web11.PNG?url";
import web12 from "@/assets/web12.PNG?url";
import web13 from "@/assets/web13.PNG?url";
import web14 from "@/assets/web14.PNG?url";

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

  // Screenshots to display in gallery using real assets with device types
  const screenshots = [
    {
      src: web1,
      title: "Homepage Hero (Pharmacy Setting)",
      description:
        "Your Health, Our Priority — universal search to find doctors, hospitals, labs, and pharmacies across Pakistan.",
      device: "desktop"
    },
    {
      src: web2,
      title: "Homepage Hero (Doctors Group)",
      description:
        "Clean hero layout designed to inspire trust with prominent search and primary actions.",
      device: "laptop"
    },
    {
      src: web3,
      title: "Diseases & Symptoms",
      description:
        "Quick-access disease chips to explore symptoms, causes, and prevention details.",
      device: "desktop"
    },
    {
      src: web4,
      title: "Our Services Overview",
      description:
        "Health Checkups, Medical Treatments, Surgeries, Lab Tests, and Medicines — all in one place.",
      device: "laptop"
    },
    {
      src: web5,
      title: "Smart Compare",
      description:
        "Compare the same service across providers by price, location, and rating to decide confidently.",
      device: "desktop"
    },
    {
      src: web6,
      title: "Why Choose SehatKor?",
      description:
        "Core value pillars: Easy Booking, Location-Based Search, Verified Reviews, Secure & Private.",
      device: "laptop"
    },
    {
      src: web7,
      title: "We're Here to Help",
      description:
        "Multiple support channels — Live Chat, Phone Support, and Emergency Help for urgent needs.",
      device: "desktop"
    },
    {
      src: web8,
      title: "Contact & Message Form",
      description:
        "Contact information and a 'Send us a Message' form to reach our team within 24 hours.",
      device: "laptop"
    },
    {
      src: web9,
      title: "About SehatKor (Hero)",
      description:
        "Pakistan's premier healthcare platform — seamless, secure, and affordable medical services.",
      device: "desktop"
    },
    {
      src: web10,
      title: "About Us Details",
      description:
        "Mission-driven, patient-centered, and transparent — bridging patients and providers for impact.",
      device: "laptop"
    },
    {
      src: web11,
      title: "Comprehensive Healthcare Services",
      description:
        "End-to-end coverage: medical consultations, hospital services, laboratory tests, and pharmacy services.",
      device: "desktop"
    },
    {
      src: web12,
      title: "Provider Dashboard – Pharmacy",
      description:
        "Manage inventory, orders, and wallet with clear stats for available balance and total earnings.",
      device: "laptop"
    },
    {
      src: web13,
      title: "Secure Sign In",
      description:
        "Modern authentication with email/password and Google sign-in options.",
      device: "desktop"
    },
    {
      src: web14,
      title: "Provider Registration",
      description:
        "Unified registration for patients, doctors, clinics/hospitals, laboratories, and pharmacies.",
      device: "laptop"
    },
  ];

  const stats = [
    { label: "Verified Providers", value: "1K+", icon: Stethoscope },
    { label: "Active Users", value: "10K+", icon: Users },
    { label: "Platform Rating", value: "4.9", icon: Award },
    { label: "Features", value: "20+", icon: HeartPulse },
  ];

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<{ src: string; title: string; description: string } | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number>(-1);

  const openPreviewAt = (index: number) => {
    setPreviewIndex(index);
    setPreviewItem(screenshots[index] as any);
    setPreviewOpen(true);
  };

  // Device Frame Component
  const DeviceFrame = ({ src, device, title }: { src: string; device: string; title: string }) => {
    if (device === "laptop") {
      return (
        <div className="relative mx-auto" style={{ maxWidth: "350px" }}>
          {/* Laptop Frame */}
          <div className="relative">
            {/* Screen */}
            <div className="bg-gray-700 rounded-t-lg p-1.5 shadow-2xl">
              <div className="bg-gray-700 rounded-md overflow-hidden" style={{ aspectRatio: "16/10" }}>
                <img
                  src={src}
                  alt={title}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>
            </div>
            {/* Keyboard Base with visible keys */}
            <div className="relative bg-gradient-to-b from-gray-600 to-gray-700 rounded-b-lg shadow-lg px-3 py-2">
              {/* Keyboard Keys Pattern */}
              <div className="flex gap-0.5 mb-1">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex-1 h-1 bg-gray-800/40 rounded-sm"></div>
                ))}
              </div>
              <div className="flex gap-0.5">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex-1 h-1 bg-gray-800/40 rounded-sm"></div>
                ))}
              </div>
              {/* Trackpad */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-500/50 rounded-sm"></div>
            </div>
            {/* Laptop Icon Badge */}
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white p-1.5 rounded-lg shadow-lg">
              <Laptop className="w-3 h-3" />
            </div>
          </div>
        </div>
      );
    }

    // Desktop Monitor (Large Screen)
    return (
      <div className="relative mx-auto" style={{ maxWidth: "380px" }}>
        {/* Monitor Frame */}
        <div className="relative">
          {/* Screen */}
          <div className="bg-gray-700 rounded-lg p-2 shadow-2xl">
            <div className="bg-gray-700 rounded-md overflow-hidden" style={{ aspectRatio: "16/9" }}>
              <img
                src={src}
                alt={title}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
          </div>
          {/* Stand */}
          <div className="relative mx-auto w-16 h-10 flex flex-col items-center">
            <div className="w-1.5 h-6 bg-gradient-to-b from-gray-600 to-gray-500"></div>
            <div className="w-20 h-2 bg-gradient-to-b from-gray-600 to-gray-700 rounded-md shadow-lg"></div>
          </div>
          {/* Monitor Icon Badge */}
          <div className="absolute top-2 -right-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white p-1.5 rounded-lg shadow-lg">
            <Monitor className="w-3 h-3" />
          </div>
        </div>
      </div>
    );
  };

  const goNext = () => {
    if (previewIndex < 0) return;
    const i = (previewIndex + 1) % screenshots.length;
    setPreviewIndex(i);
    setPreviewItem(screenshots[i] as any);
  };

  const goPrev = () => {
    if (previewIndex < 0) return;
    const i = (previewIndex - 1 + screenshots.length) % screenshots.length;
    setPreviewIndex(i);
    setPreviewItem(screenshots[i] as any);
  };

  // Show skeleton while loading
  if (isLoading) {
    return <BlogSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section - Ultra Modern Design */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden min-h-[70vh] flex items-center">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            {/* Badge with Animation */}
            <div className="flex justify-center mb-8 animate-bounce-slow">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-white p-5 rounded-2xl ring-1 ring-gray-900/5">
                  <BookOpen className="w-10 h-10 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Title with 3D Effect */}
            <div className="text-center mb-6 space-y-4">
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter relative">
                <span className="relative inline-block">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 blur-2xl opacity-30"></span>
                  <span className="relative bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent drop-shadow-sm">
                    SehatKor
                  </span>
                </span>
              </h1>
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-600"></div>
                <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                  Platform Overview
                </p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-purple-600"></div>
              </div>
            </div>

            {/* Description with Highlight */}
            <p className="text-center text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-14">
              Pakistan's <span className="font-semibold text-blue-600">first smart healthcare marketplace</span> — find, compare, and book doctors, hospitals/clinics, laboratories, and pharmacies in one place.
            </p>

            {/* Stats - Premium Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon as any;
                const gradients = [
                  'from-blue-500 to-cyan-500',
                  'from-purple-500 to-pink-500',
                  'from-green-500 to-emerald-500',
                  'from-orange-500 to-red-500'
                ];
                const gradient = gradients[index];
                return (
                  <div
                    key={index}
                    className="group relative"
                  >
                    {/* Glow Effect */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500`}></div>

                    {/* Card */}
                    <div className="relative bg-white rounded-2xl p-6 shadow-lg ring-1 ring-gray-900/5 hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-1">
                      <div className="text-center space-y-3">
                        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className={`text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">

        {/* About SehatKor */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About SehatKor</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">What is SehatKor?</h3>
              <p className="text-gray-700 leading-relaxed">
                SehatKor is a comprehensive healthcare platform that connects you with verified providers across Pakistan. You can easily search, compare, and book doctors, hospitals/clinics, laboratories, and pharmacies. Smart capabilities like location-based search, verified reviews, real-time pricing, and powerful provider dashboards make it a complete end‑to‑end solution.
              </p>
              <ul className="mt-6 space-y-3 text-gray-700">
                <li className="flex gap-3"><ShieldCheck className="w-5 h-5 text-green-600 mt-0.5" /> Verified providers and secure data</li>
                <li className="flex gap-3"><MapPin className="w-5 h-5 text-blue-600 mt-0.5" /> Location-based smart search</li>
                <li className="flex gap-3"><Star className="w-5 h-5 text-yellow-500 mt-0.5" /> Genuine ratings and reviews</li>
                <li className="flex gap-3"><Zap className="w-5 h-5 text-indigo-600 mt-0.5" /> Fast booking and easy payments</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border border-gray-200 p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Key Modules</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "Doctors", desc: "Consultations, variants, online/physical", icon: Stethoscope },
                  { title: "Hospitals/Clinics", desc: "Surgery and treatment services", icon: HeartPulse },
                  { title: "Laboratories", desc: "Home sampling and test bookings", icon: ShieldCheck },
                  { title: "Pharmacies", desc: "Inventory, orders, and home delivery", icon: ImageIcon },
                ].map((m, i) => {
                  const Icon = m.icon as any;
                  return (
                    <div key={i} className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{m.title}</div>
                        <div className="text-sm text-gray-600">{m.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Platform Gallery */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Platform Preview</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full mb-4"></div>
            <p className="text-xl text-gray-600">Explore our comprehensive healthcare platform with detailed feature highlights.</p>
          </div>

          {/* Device Mockup Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {screenshots.map((shot, idx) => {
              const isLaptop = (shot as any).device === "laptop";

              // Subtle background colors array
              const bgColors = [
                'bg-blue-50',
                'bg-purple-50',
                'bg-green-50',
                'bg-orange-50',
                'bg-pink-50',
                'bg-indigo-50',
                'bg-teal-50',
                'bg-rose-50',
                'bg-cyan-50',
                'bg-amber-50',
                'bg-lime-50',
                'bg-violet-50',
                'bg-sky-50',
                'bg-emerald-50'
              ];

              const cardBg = bgColors[idx % bgColors.length];

              return (
                <div
                  key={shot.title}
                  className="group relative"
                >
                  {/* Glow Effect */}
                  <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Card Container */}
                  <div className={`relative ${cardBg} rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden group-hover:shadow-xl group-hover:border-blue-300/50 transition-all duration-500 flex flex-col h-full`}>
                    {/* Content Area - Compact */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Device Frame */}
                      <div className="relative mb-4 flex-shrink-0 transform group-hover:-translate-y-2 transition-transform duration-300">
                        <DeviceFrame src={(shot as any).src} device={(shot as any).device} title={shot.title} />
                      </div>

                      {/* Content */}
                      <div className="text-center flex-1 flex flex-col justify-start">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">{shot.title}</h3>
                        <p className="text-gray-600 leading-relaxed text-xs">
                          {shot.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        {/* Blog Posts Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Health Articles & Guides</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full mb-4"></div>
            <p className="text-xl text-gray-600">Expert healthcare guides to help you make informed decisions</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Blog Post 1 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2"></div>
              <div className="p-6">
                <Badge className="mb-3 bg-blue-100 text-blue-700">Health Guide</Badge>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How to Book Doctor Appointments Online in Pakistan
                </h3>
                <p className="text-gray-600 mb-4">
                  Complete 2025 guide to book verified doctors online. Save time, avoid queues, and consult from home.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">5 min read</span>
                  <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Link to="/blog/how-to-book-doctor-online-pakistan">Read More</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Blog Post 2 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-2"></div>
              <div className="p-6">
                <Badge className="mb-3 bg-green-100 text-green-700">Lab Test Guide</Badge>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Best Lab Tests for Routine Health Checkup
                </h3>
                <p className="text-gray-600 mb-4">
                  Essential blood tests every Pakistani should consider. Complete guide with prices and online booking.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">6 min read</span>
                  <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                    <Link to="/blog/best-lab-tests-routine-checkup-pakistan">Read More</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Blog Post 3 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2"></div>
              <div className="p-6">
                <Badge className="mb-3 bg-purple-100 text-purple-700">Hospital Guide</Badge>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Top 10 Hospitals in Lahore, Karachi, Islamabad
                </h3>
                <p className="text-gray-600 mb-4">
                  Complete 2025 ranking of Pakistan's best hospitals with specialties, facilities, and booking guide.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">8 min read</span>
                  <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Link to="/blog/top-10-hospitals-pakistan-2025">Read More</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to explore SehatKor?</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-600 mb-8">Search services, compare providers, and book instantly.</p>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => navigate('/search')}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
              >
                Search Services
              </Button>
              <Button
                onClick={() => navigate('/about')}
                variant="outline"
                className="px-8 py-3 rounded-xl font-semibold border-gray-300"
              >
                About Us
              </Button>
            </div>
          </div>
        </section>

        {/* Note for missing images */}
        <div className="text-center text-sm text-gray-500 mt-6">
          If any screenshot does not load, please add the file in the <code className="bg-gray-100 px-1 rounded">client/public/images/</code> folder with the same file name.
        </div>

        {/* Newsletter Section (kept for engagement) */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl"></div>
          <div className="relative p-12 text-gray-900 text-center rounded-3xl">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/20 to-green-500/20 backdrop-blur-sm rounded-2xl mb-8">
                <BookOpen className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Health Companion</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Get the latest updates and feature announcements straight to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-6">
                <Input
                  placeholder="Your email address"
                  className="flex-1 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 h-14 rounded-xl text-lg"
                />
                <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white h-14 px-8 rounded-xl font-bold shadow-lg">
                  Subscribe Free
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>No spam</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default BlogPage;