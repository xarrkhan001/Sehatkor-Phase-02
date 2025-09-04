import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockBlogPosts } from "@/data/mockData";
import BlogSkeleton from "@/components/skeletons/BlogSkeleton";
import { Search, Calendar, User, Clock, Eye, ArrowRight, TrendingUp, BookOpen, Stethoscope, Star, Activity, FileText, Users, Award, ChevronRight, Bookmark, Share2 } from "lucide-react";

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading time for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  const categories = ["All", "Health Tips", "Medical", "Mental Health", "Pediatrics", "Nutrition"];

  const stats = [
    { label: "مضامین", value: "50+", icon: FileText },
    { label: "ماہر ڈاکٹرز", value: "25+", icon: Stethoscope },
    { label: "فعال قارئین", value: "10K+", icon: Users },
    { label: "اعلیٰ ریٹنگ", value: "4.9", icon: Award }
  ];

  const filteredPosts = mockBlogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                           post.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const featuredPost = mockBlogPosts[0];

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
              <span className="block text-3xl md:text-4xl font-normal mt-2 text-blue-600">Health Blog</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed mb-12 text-gray-600">
              Expert health insights, medical guidance, and wellness tips from Pakistan's leading healthcare professionals
            </p>
            
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
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

        {/* Featured Article */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Article</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
              <div className="grid lg:grid-cols-5 gap-0">
                <div className="lg:col-span-2 relative h-80 lg:h-auto">
                  <img 
                    src={featuredPost.image || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop'} 
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const featuredImages = [
                        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop',
                        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop',
                        'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=400&fit=crop'
                      ];
                      const randomIndex = Math.floor(Math.random() * featuredImages.length);
                      e.currentTarget.src = featuredImages[randomIndex];
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-gradient-to-r from-blue-500 to-green-500 backdrop-blur-sm text-white border-0 px-4 py-2 text-sm font-medium">
                      Featured
                    </Badge>
                  </div>
                  <div className="absolute top-6 right-6 flex gap-2">
                    <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                      <Bookmark className="w-4 h-4 text-gray-700" />
                    </button>
                    <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                      <Share2 className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-3 p-10 lg:p-12">
                  <div className="flex items-center gap-3 mb-6">
                    <Badge className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1">
                      {featuredPost.category}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>2.5k views</span>
                    </div>
                  </div>
                  
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">{featuredPost.title}</h2>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">{featuredPost.excerpt}</p>
                  
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{featuredPost.author}</div>
                          <div className="text-sm text-gray-500">Medical Expert</div>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-gray-200"></div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(featuredPost.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    Read Full Article
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Search Articles</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full mb-4"></div>
            <p className="text-xl text-gray-600">Find the best articles on topics that interest you</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search health topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl bg-gray-50/50"
                  />
                </div>
                <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-8 h-14 rounded-xl font-semibold shadow-lg">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Search by categories:</h4>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant="ghost"
                      onClick={() => setSelectedCategory(category.toLowerCase())}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        selectedCategory === category.toLowerCase() 
                          ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg hover:shadow-xl" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                      }`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Articles</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full mb-4"></div>
            <p className="text-xl text-gray-600">Quality health articles prepared by medical experts</p>
          </div>
          
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <article key={post.id} className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden group-hover:shadow-xl transition-all duration-500">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={post.image || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop'} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        const fallbackImages = [
                          'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
                          'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop',
                          'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=250&fit=crop',
                          'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&h=250&fit=crop',
                          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop'
                        ];
                        const randomIndex = Math.floor(Math.random() * fallbackImages.length);
                        e.currentTarget.src = fallbackImages[randomIndex];
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-blue-500 to-green-500 backdrop-blur-sm text-white border-0 px-3 py-1 text-xs font-medium">
                        {post.category}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white">
                        <Bookmark className="w-3 h-3 text-gray-700" />
                      </button>
                      <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Eye className="w-3 h-3 text-blue-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{post.author}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(post.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="w-10 h-10 rounded-full text-gray-400 hover:text-white hover:bg-blue-500 transition-all duration-300">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <Card className="text-center py-12 bg-white border shadow-sm">
            <CardContent>
              <div className="text-gray-500 max-w-md mx-auto">
                <div className="bg-blue-50 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Search className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-xl mb-2 font-semibold text-gray-900">No articles found</p>
                <p className="text-gray-600">Try again with different keywords or categories</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Newsletter Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl"></div>
          <div className="relative p-12 text-gray-900 text-center rounded-3xl">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/20 to-green-500/20 backdrop-blur-sm rounded-2xl mb-8">
                <BookOpen className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Health Companion</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join our newsletter and get weekly health insights, expert advice, and updates on the latest medical research
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
                  <span>Weekly Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Free Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Cancel Anytime</span>
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