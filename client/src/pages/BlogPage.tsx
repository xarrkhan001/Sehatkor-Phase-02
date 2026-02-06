import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BlogSkeleton from "@/components/skeletons/BlogSkeleton";
import { BookOpen, ArrowRight, Clock } from "lucide-react";

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
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Sehatkor Blog - Healthcare Articles & Medical Guides Pakistan"
        description="Read expert medical articles, health guides, and tips about healthcare in Pakistan. Stay updated with Sehatkor's latest insights on doctors, labs, and hospitals."
        keywords="health blog pakistan, medical articles, doctor guides, lab test information, hospital reviews, sehatkor blog, healthcare tips, medical advice, health news, patient education, wellness articles"
        canonical="https://sehatkor.pk/blog"
        jsonLd={jsonLd}
        type="website"
      />

      {/* Hero Section - Professional with Black & Green Theme + Healthcare Image */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-teal-50 overflow-hidden py-20 lg:py-28 border-b border-gray-100">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#10b981_0.1,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#14b8a6_0.1,transparent_50%)]"></div>
        </div>

        {/* Healthcare Icons Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-16 h-16 text-emerald-200 opacity-20">
            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" /></svg>
          </div>
          <div className="absolute top-40 right-20 w-20 h-20 text-teal-200 opacity-20">
            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
          </div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 text-emerald-200 opacity-20">
            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" /></svg>
          </div>
        </div>

        <div className="relative container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold mb-6 shadow-lg">
                  <BookOpen className="w-4 h-4" />
                  Healthcare Knowledge Hub
                </div>

                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight">
                  <span className="text-gray-900">Your Health, </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                    Our Priority!
                  </span>
                </h1>

                <p className="text-lg lg:text-xl text-gray-700 font-medium mb-8 leading-relaxed">
                  Discover expert medical insights, comprehensive health guides, and trusted wellness advice
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-emerald-100">
                    <div className="text-2xl font-bold text-emerald-600">50+</div>
                    <div className="text-xs text-gray-600 font-medium">Articles</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-emerald-100">
                    <div className="text-2xl font-bold text-emerald-600">10K+</div>
                    <div className="text-xs text-gray-600 font-medium">Readers</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-emerald-100">
                    <div className="text-2xl font-bold text-emerald-600">Expert</div>
                    <div className="text-xs text-gray-600 font-medium">Verified</div>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative hidden lg:block">
                <div className="relative z-10">
                  <img
                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=600&fit=crop&q=80"
                    alt="Professional male doctor with stethoscope"
                    className="rounded-3xl shadow-2xl border-4 border-white w-full h-[400px] object-cover object-[center_20%]"
                  />
                  {/* Subtle Dark Overlay */}
                  <div className="absolute inset-0 bg-black/5 rounded-3xl"></div>
                  {/* Floating Badge */}
                  <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-2xl shadow-xl z-10">
                    <div className="text-2xl font-bold">Trusted</div>
                    <div className="text-sm opacity-90">Healthcare Info</div>
                  </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-200 rounded-full opacity-20 blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-teal-200 rounded-full opacity-20 blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12 lg:py-16">

        {/* Blog Posts Section - Professional Cards */}
        <section className="mb-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Latest Healthcare Articles</h2>
              <div className="w-20 h-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 mx-auto rounded-full mb-4"></div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Comprehensive guides to help you make informed health decisions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Blog Post 1 */}
              <article className="group relative bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl shadow-lg border-2 border-emerald-100 overflow-hidden hover:shadow-2xl hover:border-emerald-300 transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_100%] group-hover:animate-gradient"></div>
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop&q=80"
                    alt="Doctor consultation"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-8">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-xs font-bold mb-4 border-2 border-emerald-200 shadow-sm">
                    📋 Doctor Guide
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-emerald-600 transition-colors duration-300">
                    How to Book Doctor Appointments Online in Pakistan
                  </h3>
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    Complete guide to book verified doctors online. Learn about consultations, specialists, and virtual visits.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>5 min read</span>
                    </div>
                    <Button asChild size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Link to="/blog/how-to-book-doctor-online-pakistan" className="flex items-center gap-2">
                        Read More
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>

              {/* Blog Post 2 */}
              <article className="group relative bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl shadow-lg border-2 border-emerald-100 overflow-hidden hover:shadow-2xl hover:border-emerald-300 transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_100%] group-hover:animate-gradient"></div>
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop&q=80"
                    alt="Lab tests"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-8">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-xs font-bold mb-4 border-2 border-emerald-200 shadow-sm">
                    🔬 Lab Test Guide
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-emerald-600 transition-colors duration-300">
                    Essential Lab Tests for Health Checkup in Pakistan
                  </h3>
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    Important blood tests and screenings for Pakistanis. Includes CBC, lipid profile, and test prices.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>6 min read</span>
                    </div>
                    <Button asChild size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Link to="/blog/best-lab-tests-routine-checkup-pakistan" className="flex items-center gap-2">
                        Read More
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>

              {/* Blog Post 3 */}
              <article className="group relative bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl shadow-lg border-2 border-emerald-100 overflow-hidden hover:shadow-2xl hover:border-emerald-300 transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_100%] group-hover:animate-gradient"></div>
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop&q=80"
                    alt="Hospital building"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-8">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-xs font-bold mb-4 border-2 border-emerald-200 shadow-sm">
                    🏥 Hospital Ranking
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-emerald-600 transition-colors duration-300">
                    Top 10 Hospitals in Lahore, Karachi, Islamabad
                  </h3>
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    Ranking of Pakistan's best hospitals based on patient reviews, facilities, and quality standards.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>8 min read</span>
                    </div>
                    <Button asChild size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Link to="/blog/top-10-hospitals-pakistan-2025" className="flex items-center gap-2">
                        Read More
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>


              {/* Blog Post 4 - Dengue Fever */}
              <article className="group relative bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl shadow-lg border-2 border-emerald-100 overflow-hidden hover:shadow-2xl hover:border-emerald-300 transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_100%] group-hover:animate-gradient"></div>
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&h=300&fit=crop&q=80"
                    alt="Dengue prevention"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-8">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-xs font-bold mb-4 border-2 border-emerald-200 shadow-sm">
                    ⚠️ Health Alert
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-emerald-600 transition-colors duration-300">
                    Dengue Fever in Pakistan: Complete Guide 2026
                  </h3>
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    Everything about dengue symptoms, treatment, prevention, and when to see a doctor in Pakistan.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>8 min read</span>
                    </div>
                    <Button asChild size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Link to="/blog/dengue-fever-pakistan-complete-guide" className="flex items-center gap-2">
                        Read More
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>

              {/* Blog Post 5 - Diabetes Management */}
              <article className="group relative bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl shadow-lg border-2 border-emerald-100 overflow-hidden hover:shadow-2xl hover:border-emerald-300 transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_100%] group-hover:animate-gradient"></div>
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1571772996211-2f02c9727629?w=400&h=300&fit=crop&q=80"
                    alt="Diabetes management"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-8">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-xs font-bold mb-4 border-2 border-emerald-200 shadow-sm">
                    💉 Chronic Disease
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-emerald-600 transition-colors duration-300">
                    Diabetes Management in Pakistan: Complete Guide
                  </h3>
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    Control blood sugar naturally with diet, exercise, and treatment options available in Pakistan.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>10 min read</span>
                    </div>
                    <Button asChild size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Link to="/blog/diabetes-management-pakistan-complete-guide" className="flex items-center gap-2">
                        Read More
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>

              {/* Blog Post 6 - Heart Disease */}
              <article className="group relative bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl shadow-lg border-2 border-emerald-100 overflow-hidden hover:shadow-2xl hover:border-emerald-300 transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_100%] group-hover:animate-gradient"></div>
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&h=300&fit=crop&q=80"
                    alt="Heart health"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-8">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-xs font-bold mb-4 border-2 border-emerald-200 shadow-sm">
                    ❤️ Critical Health
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-emerald-600 transition-colors duration-300">
                    Heart Disease in Pakistan: Complete Guide 2026
                  </h3>
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    Prevention, symptoms, treatment options, and finding the best cardiologists in Pakistan.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>9 min read</span>
                    </div>
                    <Button asChild size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Link to="/blog/heart-disease-pakistan-complete-guide" className="flex items-center gap-2">
                        Read More
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>

              {/* Blog Post 7 - Pregnancy Care */}
              <article className="group relative bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl shadow-lg border-2 border-emerald-100 overflow-hidden hover:shadow-2xl hover:border-emerald-300 transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_100%] group-hover:animate-gradient"></div>
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=300&fit=crop&q=80"
                    alt="Pregnancy care"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-8">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-xs font-bold mb-4 border-2 border-emerald-200 shadow-sm">
                    🤰 Women's Health
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-emerald-600 transition-colors duration-300">
                    Pregnancy Care in Pakistan: Complete Guide 2026
                  </h3>
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    Complete prenatal care guide - checkups, diet, tests, delivery options, and finding gynecologists.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>10 min read</span>
                    </div>
                    <Button asChild size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Link to="/blog/pregnancy-care-pakistan-complete-guide" className="flex items-center gap-2">
                        Read More
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>

              {/* Blog Post 8 - Child Fever */}
              <article className="group relative bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl shadow-lg border-2 border-emerald-100 overflow-hidden hover:shadow-2xl hover:border-emerald-300 transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_100%] group-hover:animate-gradient"></div>
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop&q=80"
                    alt="Child healthcare"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-8">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-xs font-bold mb-4 border-2 border-emerald-200 shadow-sm">
                    👶 Child Health
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-emerald-600 transition-colors duration-300">
                    Child Fever: When to See a Doctor in Pakistan
                  </h3>
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    Complete parent's guide - fever ranges, medication dosage, warning signs, and when to rush to doctor.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>8 min read</span>
                    </div>
                    <Button asChild size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Link to="/blog/child-fever-when-to-see-doctor-pakistan" className="flex items-center gap-2">
                        Read More
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>

              {/* Blog Post 9 - Blood Test at Home */}
              <article className="group relative bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl shadow-lg border-2 border-emerald-100 overflow-hidden hover:shadow-2xl hover:border-emerald-300 transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02]">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_100%] group-hover:animate-gradient"></div>
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=300&fit=crop&q=80"
                    alt="Blood test at home"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-8">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-xs font-bold mb-4 border-2 border-emerald-200 shadow-sm">
                    🩸 Lab Services
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-emerald-600 transition-colors duration-300">
                    Blood Test at Home in Pakistan: Complete Guide 2026
                  </h3>
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    Home sample collection guide - how it works, best labs, prices, and booking process.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>7 min read</span>
                    </div>
                    <Button asChild size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Link to="/blog/blood-test-at-home-pakistan-guide" className="flex items-center gap-2">
                        Read More
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* CTA Section - Professional */}
        <section className="mb-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-10 lg:p-12 text-center text-white shadow-2xl">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
              <p className="text-lg mb-8 opacity-95 max-w-2xl mx-auto">
                Book appointments with verified doctors, order lab tests, or get medicines delivered - all from the comfort of your home.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/search')}
                  className="bg-white text-emerald-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Explore Services
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg transition-all"
                >
                  Get Started Free
                </Button>
              </div>

              <p className="text-sm mt-6 opacity-90">
                ✓ 100% Verified Providers  •  ✓ Secure Platform  •  ✓ 24/7 Support
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default BlogPage;