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
    <div className="min-h-screen bg-gray-50">
      {/* Premium Hero Section */}
      <div className="relative bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-slate-50"></div>
        <div className="relative container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg mb-8">
                <Stethoscope className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
                SehatKor
                <span className="block text-4xl md:text-5xl text-red-500 font-light mt-2">صحت بلاگ</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light">
                پاکستان کے معروف ماہرین سے صحت کی جدید معلومات، طبی رہنمائی اور زندگی بہتر بنانے کے طریقے
              </p>
            </div>
            
            {/* Premium Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="group text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/50 hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                    <div className="text-sm font-medium text-slate-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">

        {/* Premium Featured Article */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">خصوصی مضمون</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200/50">
              <div className="grid lg:grid-cols-5 gap-0">
                <div className="lg:col-span-2 relative h-80 lg:h-auto">
                  <img 
                    src={featuredPost.image} 
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-red-500/90 backdrop-blur-sm text-white border-0 px-4 py-2 text-sm font-medium">
                      خصوصی مضمون
                    </Badge>
                  </div>
                  <div className="absolute top-6 right-6 flex gap-2">
                    <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                      <Bookmark className="w-4 h-4 text-slate-700" />
                    </button>
                    <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                      <Share2 className="w-4 h-4 text-slate-700" />
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-3 p-10 lg:p-12">
                  <div className="flex items-center gap-3 mb-6">
                    <Badge className="bg-red-50 text-red-600 border border-red-200 px-3 py-1">
                      {featuredPost.category}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Eye className="w-4 h-4" />
                      <span>2.5k مطالعہ</span>
                    </div>
                  </div>
                  
                  <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 leading-tight">{featuredPost.title}</h2>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">{featuredPost.excerpt}</p>
                  
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{featuredPost.author}</div>
                          <div className="text-sm text-slate-500">طبی ماہر</div>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-200"></div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(featuredPost.date).toLocaleDateString('ur-PK')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    مکمل مضمون پڑھیں
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Search Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-slate-900 mb-3">مضامین تلاش کریں</h3>
            <p className="text-slate-600">اپنی دلچسپی کے موضوع پر بہترین مضامین تلاش کریں</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-8">
              <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="صحت کے موضوع پر تلاش کریں..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 text-lg border-slate-300 focus:border-red-500 focus:ring-red-500/20 rounded-xl bg-slate-50/50"
                  />
                </div>
                <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 h-14 rounded-xl font-semibold shadow-lg">
                  <Search className="w-5 h-5 mr-2" />
                  تلاش کریں
                </Button>
              </div>

              {/* Premium Categories */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">موضوعات کے ذریعے تلاش کریں:</h4>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant="ghost"
                      onClick={() => setSelectedCategory(category.toLowerCase())}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        selectedCategory === category.toLowerCase() 
                          ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl" 
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                      }`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Articles Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-slate-900 mb-4">تازہ ترین مضامین</h3>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-600 mx-auto rounded-full mb-4"></div>
            <p className="text-lg text-slate-600">ماہرین کی جانب سے تیار کردہ معیاری صحت کے مضامین</p>
          </div>
          
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <article key={post.id} className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden group-hover:shadow-xl transition-all duration-500">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-500/90 backdrop-blur-sm text-white border-0 px-3 py-1 text-xs font-medium">
                        {post.category}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white">
                        <Bookmark className="w-3 h-3 text-slate-700" />
                      </button>
                      <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Eye className="w-3 h-3 text-red-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 leading-tight mb-3 group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{post.author}</div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(post.date).toLocaleDateString('ur-PK')}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="w-10 h-10 rounded-full text-slate-400 hover:text-white hover:bg-red-500 transition-all duration-300">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <Card className="text-center py-12 bg-white border shadow-sm">
            <CardContent>
              <div className="text-gray-500 max-w-md mx-auto">
                <div className="bg-red-50 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Search className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-xl mb-2 font-semibold text-gray-900">کوئی مضمون نہیں ملا</p>
                <p className="text-gray-600">مختلف کلیدی الفاظ یا کیٹگری کے ساتھ دوبارہ کوشش کریں</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Premium Newsletter Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gray-100 rounded-3xl"></div>
          <div className="relative p-12 text-gray-900 text-center rounded-3xl">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 backdrop-blur-sm rounded-2xl mb-8">
                <Stethoscope className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-4xl font-bold mb-4">صحت کی دنیا میں آپ کا ساتھی</h3>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                ہمارے نیوز لیٹر میں شامل ہوں اور ہفتہ وار صحت کی بہترین معلومات، ماہرانہ مشورے اور جدید طبی تحقیق کی اپڈیٹس حاصل کریں
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-6">
                <Input
                  placeholder="آپ کا ای میل ایڈریس"
                  className="flex-1 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 h-14 rounded-xl text-lg"
                />
                <Button variant="secondary" className="bg-red-500 text-white hover:bg-red-600 h-14 px-8 rounded-xl font-bold shadow-lg">
                  مفت سبسکرائب کریں
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>ہفتہ وار اپڈیٹس</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>مفت سروس</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>کسی بھی وقت منسوخ کریں</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;