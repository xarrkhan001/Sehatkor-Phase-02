import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BlogSkeleton from "@/components/skeletons/BlogSkeleton";
import { BookOpen, Stethoscope, Users, Award, Image as ImageIcon, ShieldCheck, MapPin, Star, Zap, HeartPulse } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading time for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Screenshots to display in gallery using real assets
  const screenshots = [
    {
      src: web1,
      title: "Homepage Hero (Pharmacy Setting)",
      description:
        "Your Health, Our Priority — universal search to find doctors, hospitals, labs, and pharmacies across Pakistan.",
    },
    {
      src: web2,
      title: "Homepage Hero (Doctors Group)",
      description:
        "Clean hero layout designed to inspire trust with prominent search and primary actions.",
    },
    {
      src: web3,
      title: "Diseases & Symptoms",
      description:
        "Quick-access disease chips to explore symptoms, causes, and prevention details.",
    },
    {
      src: web4,
      title: "Our Services Overview",
      description:
        "Health Checkups, Medical Treatments, Surgeries, Lab Tests, and Medicines — all in one place.",
    },
    {
      src: web5,
      title: "Smart Compare",
      description:
        "Compare the same service across providers by price, location, and rating to decide confidently.",
    },
    {
      src: web6,
      title: "Why Choose SehatKor?",
      description:
        "Core value pillars: Easy Booking, Location-Based Search, Verified Reviews, Secure & Private.",
    },
    {
      src: web7,
      title: "We’re Here to Help",
      description:
        "Multiple support channels — Live Chat, Phone Support, and Emergency Help for urgent needs.",
    },
    {
      src: web8,
      title: "Contact & Message Form",
      description:
        "Contact information and a ‘Send us a Message’ form to reach our team within 24 hours.",
    },
    {
      src: web9,
      title: "About SehatKor (Hero)",
      description:
        "Pakistan’s premier healthcare platform — seamless, secure, and affordable medical services.",
    },
    {
      src: web10,
      title: "About Us Details",
      description:
        "Mission-driven, patient-centered, and transparent — bridging patients and providers for impact.",
    },
    {
      src: web11,
      title: "Comprehensive Healthcare Services",
      description:
        "End-to-end coverage: medical consultations, hospital services, laboratory tests, and pharmacy services.",
    },
    {
      src: web12,
      title: "Provider Dashboard – Pharmacy",
      description:
        "Manage inventory, orders, and wallet with clear stats for available balance and total earnings.",
    },
    {
      src: web13,
      title: "Secure Sign In",
      description:
        "Modern authentication with email/password and Google sign-in options.",
    },
    {
      src: web14,
      title: "Provider Registration",
      description:
        "Unified registration for patients, doctors, clinics/hospitals, laboratories, and pharmacies.",
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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-100/30 rounded-full blur-3xl"></div>
        </div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl shadow-lg mb-8">
              <BookOpen className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-gray-900">
              SehatKor
              <span className="block text-3xl md:text-4xl font-normal mt-2 text-blue-600">Platform Overview</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed mb-12 text-gray-600">
              Pakistan’s first smart healthcare marketplace — find, compare, and book doctors, hospitals/clinics, laboratories, and pharmacies in one place.
            </p>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon as any;
                return (
                  <div key={index} className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80 transition-all duration-300 shadow-lg">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-gray-700 font-medium">{stat.label}</div>
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

        {/* Screenshots Gallery */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Screenshots & Walkthrough</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full mb-4"></div>
            <p className="text-xl text-gray-600">The screenshots you shared are displayed here exactly, with detailed captions.</p>
          </div>

          {/* Uniform Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {screenshots.map((shot, idx) => (
              <div
                key={shot.title}
                className="group relative cursor-pointer"
                onClick={() => openPreviewAt(idx)}
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden group-hover:shadow-2xl group-hover:border-blue-200/70 transition-all duration-500">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={(shot as any).src}
                      alt={shot.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 text-gray-800 px-4 py-2 rounded-xl shadow flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <span className="font-medium">Preview</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight mb-3">{shot.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {shot.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Preview Modal */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-5xl p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle className="text-2xl">{previewItem?.title}</DialogTitle>
            </DialogHeader>
            <div className="px-6 pb-6 text-gray-600">{previewItem?.description}</div>
            <div className="relative bg-black/80 flex items-center justify-center max-h-[70vh]">
              {previewItem?.src && (
                <img
                  src={previewItem.src}
                  alt={previewItem.title}
                  className="max-h-[70vh] w-full object-contain"
                />
              )}
              {/* Nav Buttons */}
              <button
                aria-label="Previous"
                onClick={goPrev}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow"
              >
                ‹
              </button>
              <button
                aria-label="Next"
                onClick={goNext}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow"
              >
                ›
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* CTA */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to explore SehatKor?</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-600 mb-8">Search services, compare providers, and book instantly.</p>
            <div className="flex items-center justify-center gap-4">
              <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg">
                Search Services
              </Button>
              <Button variant="outline" className="px-8 py-3 rounded-xl font-semibold border-gray-300">
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