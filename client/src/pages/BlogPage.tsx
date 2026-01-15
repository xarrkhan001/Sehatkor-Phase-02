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

  const jsonLd = [
    {
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
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Abuzar",
      "jobTitle": ["Software Engineer", "Full Stack Developer", "CEO"],
      "worksFor": {
        "@type": "Organization",
        "name": "ASH Cloud",
        "url": "https://ash-cloud-official-bpmr.vercel.app/"
      },
      "url": "https://abuzar-portfolio-lat.vercel.app/",
      "image": "https://sehatkor.pk/abuzar-ceo.jpg",
      "sameAs": [
        "https://www.linkedin.com/company/ashcloudofficial/",
        "https://ash-cloud-official-bpmr.vercel.app/"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Syed Haris Shah",
      "jobTitle": ["Software Engineer", "Full Stack Developer"],
      "worksFor": {
        "@type": "Organization",
        "name": "ASH Cloud",
        "url": "https://ash-cloud-official-bpmr.vercel.app/"
      },
      "url": "https://portfolio22-lilac.vercel.app/",
      "image": "https://sehatkor.pk/haris-photo.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <SEO
        title="Sehatkor Blog - Healthcare Articles & Medical Guides Pakistan"
        description="Read expert medical articles, health guides, and tips about healthcare in Pakistan. Stay updated with Sehatkor's latest insights on doctors, labs, and hospitals."
        keywords="health blog pakistan, medical articles, doctor guides, lab test information, hospital reviews, sehatkor blog, Abuzar Software Engineer, Syed Haris Shah, ASH Cloud CEO, full stack developers Pakistan, sehatkor developers, MERN stack developer, web development company Pakistan, React JS experts, Node JS developers, website banwane ke liye, best software house Pakistan, Abuzar CEO ASH Cloud, Haris Shah developer"
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

        {/* About the Developer Section */}
        <section className="mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Developers of Sehatkor.pk</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-green-500 mx-auto rounded-full"></div>
              <p className="text-lg text-gray-600 mt-4">The brilliant minds who developed this platform</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Abuzar - Software Engineer & CEO */}
              <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-red-500 to-blue-500"></div>
                <div className="p-8 flex flex-col items-center text-center h-full">
                  <div className="flex-shrink-0 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-blue-500 rounded-2xl blur-lg opacity-30"></div>
                      <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                        <img
                          src="/abuzar-ceo.jpg"
                          alt="Abuzar - Software Engineer & CEO"
                          className="w-full h-full object-cover object-top scale-110"
                        />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Abuzar</h3>
                  <div className="flex flex-col gap-0.5 mb-3">
                    <p className="text-blue-600 font-semibold">Software Engineer & Full Stack Developer</p>
                    <p className="text-blue-500 font-medium text-sm">CEO of ASH Cloud</p>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md mb-4">
                    <span>ASH Cloud</span>
                  </div>

                  <p className="text-gray-600 mb-6 text-sm leading-relaxed flex-grow">
                    Passionate about creating innovative healthcare solutions that connect patients with quality medical services across Pakistan.
                  </p>

                  <div className="w-full space-y-3">
                    <a href="tel:+923429752032" className="flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-colors text-sm text-gray-700 font-medium">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      +923429752032
                    </a>

                    <a href="tel:+923178521144" className="flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-colors text-sm text-gray-700 font-medium">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      +923178521144
                    </a>

                    <a href="mailto:abuzarktk123@gmail.com" className="flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm text-gray-700 font-medium">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      abuzarktk123@gmail.com
                    </a>

                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      <a href="https://abuzar-portfolio-lat.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                        Portfolio
                      </a>
                      <a href="https://ash-cloud-official-bpmr.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg>
                        ASH Cloud
                      </a>
                      <a href="https://www.linkedin.com/company/ashcloudofficial/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" /></svg>
                        LinkedIn
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Syed Haris Shah - Member */}
              <div className="bg-gradient-to-br from-white via-green-50/30 to-blue-50/30 rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-green-500 to-blue-500"></div>
                <div className="p-8 flex flex-col items-center text-center h-full">
                  <div className="flex-shrink-0 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur-lg opacity-30"></div>
                      <img
                        src="/haris-photo.jpg"
                        alt="Syed Haris Shah - Member of ASH Cloud"
                        className="relative w-40 h-40 rounded-2xl object-cover border-4 border-white shadow-lg"
                      />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Syed Haris Shah</h3>
                  <p className="text-green-600 font-semibold mb-3">Software Engineer & Full Stack Developer</p>

                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md mb-4">
                    <span>ASH Cloud</span>
                  </div>

                  <p className="text-gray-600 mb-6 text-sm leading-relaxed flex-grow">
                    A dedicated team member contributing to the development and success of ASH Cloud's innovative digital solutions.
                  </p>

                  <div className="w-full space-y-3">
                    <a href="mailto:syedharryshah1@gmail.com" className="flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm text-gray-700 font-medium">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      syedharryshah1@gmail.com
                    </a>

                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      <a href="https://portfolio22-lilac.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                        Portfolio
                      </a>
                      <a href="https://ash-cloud-official-bpmr.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg>
                        ASH Cloud
                      </a>
                      <a href="https://www.linkedin.com/company/ashcloudofficial/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" /></svg>
                        LinkedIn
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ASH Cloud Services - Shared */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 lg:p-8 border border-blue-100 max-w-5xl mx-auto shadow-sm">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
                ASH Cloud Services Provided
              </h4>
              <p className="text-gray-600 mb-6 text-center max-w-2xl mx-auto">
                Full-stack development company providing comprehensive digital solutions including web, mobile, desktop, and AI technologies.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 shadow-sm hover:border-blue-300 hover:text-blue-600 transition-colors cursor-default">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                  </svg>
                  Web Applications
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 shadow-sm hover:border-green-300 hover:text-green-600 transition-colors cursor-default">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Mobile Apps
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 shadow-sm hover:border-purple-300 hover:text-purple-600 transition-colors cursor-default">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                  </svg>
                  Desktop Apps
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 shadow-sm hover:border-orange-300 hover:text-orange-600 transition-colors cursor-default">
                  <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                  AI Solutions
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 shadow-sm hover:border-red-300 hover:text-red-600 transition-colors cursor-default">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Online Services
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 shadow-sm hover:border-gray-400 hover:text-gray-900 transition-colors cursor-default">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Offline Solutions
                </span>
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