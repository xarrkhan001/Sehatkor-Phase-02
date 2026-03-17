import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserBadge from "@/components/UserBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import {
  Menu,
  X,
  Stethoscope,
  Home,
  Globe,
  Grid3X3,
  UserPlus,
  LogIn,
  BookOpen,
  Phone,
  LayoutDashboard,
  LogOut,
  User,
  Hospital,
  FlaskConical,
  Pill,
  UserCircle,
  BadgeCheck,
  Repeat,
  ChevronDown,
  MapPin,
  HelpCircle,
  FileText,
  Shield,
  ChevronRight,
  Info
} from "lucide-react";
import { apiUrl } from '@/config/api';
import logoNew from '@/assets/logo-new.png';

const Navbar = () => {
  const { user, logout, mode, toggleMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInfoDropdownOpen, setIsInfoDropdownOpen] = useState(false);
  const [navVerification, setNavVerification] = useState<{ isVerified: boolean; status?: string } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    if (location.pathname === '/') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        if (!user || user.role === 'patient') {
          setNavVerification(null);
          return;
        }
        const token = localStorage.getItem('sehatkor_token');
        if (!token) return;

        const res = await fetch(apiUrl('/api/verification/my-status'), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setNavVerification({
            isVerified: Boolean(data?.user?.isVerified),
            status: data?.registrationVerification?.status
          });
        }
      } catch (e) {
        setNavVerification(null);
      }
    };
    fetchStatus();
  }, [user]);

  const handleModeToggle = () => {
    toggleMode();
    const isDashboardPage = location.pathname.startsWith('/dashboard');
    if (isDashboardPage) {
      if (mode === 'patient') {
        switch (user?.role) {
          case 'doctor': navigate('/dashboard/doctor'); break;
          case 'clinic/hospital': navigate('/dashboard/clinic'); break;
          case 'laboratory': navigate('/dashboard/laboratory'); break;
          case 'pharmacy': navigate('/dashboard/pharmacy'); break;
          default: navigate('/');
        }
      } else {
        navigate('/dashboard/patient');
      }
    }
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === 'patient' || mode === 'patient') return "/dashboard/patient";
    switch (user.role) {
      case 'doctor': return '/dashboard/doctor';
      case 'clinic/hospital': return '/dashboard/clinic';
      case 'laboratory': return '/dashboard/laboratory';
      case 'pharmacy': return '/dashboard/pharmacy';
      default: return '/login';
    }
  };

  const allNavItems = [
    { name: "Overview", href: "/", icon: Home, color: "text-blue-600" },
    { name: "مرکزی صفحہ", href: "/urdu", icon: Globe, color: "text-blue-600" },
    { name: "Services", href: "/search", icon: Grid3X3, color: "text-purple-600" },
    { name: "Doctors", href: "/doctors", icon: UserCircle, color: "text-green-600" },
    { name: "Hospitals", href: "/hospitals", icon: Hospital, color: "text-red-600" },
    { name: "Labs", href: "/labs", icon: FlaskConical, color: "text-orange-600" },
    { name: "Pharmacies", href: "/pharmacies", icon: Pill, color: "text-teal-600" },
    { name: "About", href: "/about", icon: BadgeCheck, color: "text-blue-500" },
    { name: "Blog", href: "/blog", icon: BookOpen, color: "text-indigo-600" },
    { name: "Contact", href: "/contact", icon: Phone, color: "text-emerald-600" },
    { name: "Dashboard", href: getDashboardPath(), icon: LayoutDashboard, color: "text-slate-600", requiresAuth: true },
    { name: "Developers", href: "/developers", icon: User, color: "text-purple-600" },
  ];

  const navItems = allNavItems.filter(item => {
    if (item.requiresAuth === true) return !!user;
    return true;
  });

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav
      dir="ltr"
      className={`${location.pathname === '/' ? 'fixed' : 'sticky'} top-0 z-50 w-full border-b overflow-visible transition-all duration-300 ${location.pathname === '/' && isScrolled
        ? 'bg-gray-50/40 backdrop-blur-xl shadow-xl border-gray-100/40'
        : 'bg-gray-50/70 backdrop-blur-md shadow-sm border-gray-100/60'
        }`}
    >
      <div className="container mx-auto px-4 relative">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-50 rounded-xl shadow-sm group-hover:shadow-emerald-100 group-hover:scale-105 transition-all duration-300 overflow-hidden">
              <img src={logoNew} alt="SehatKor Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">SehatKor</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.filter(item => !['مرکزی صفحہ', 'Developers', 'Blog', 'Contact', 'Dashboard'].includes(item.name)).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${isActive(item.href)
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200"
                    : "text-gray-800 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                >
                  <Icon className={`w-4 h-4 transition-all duration-300 ${isActive(item.href) ? "text-white" : `${item.color} group-hover:text-emerald-500`}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Locations Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group flex items-center space-x-2 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50/50">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>Locations</span>
                  <ChevronDown className="w-3 h-3 text-gray-400 group-hover:rotate-180 transition-transform" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] mt-2 p-2 rounded-2xl overflow-hidden">
                <div className="flex flex-col gap-1">
                  {['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Mardan', 'Chitral', 'Swat', 'Noshera'].map(city => (
                    <Link
                      key={city}
                      to={`/${city.toLowerCase()}`}
                      className={`flex items-center group/item gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive(`/${city.toLowerCase()}`)
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50 shadow-sm shadow-emerald-50'
                        : 'hover:bg-emerald-50/40 text-gray-600 hover:text-emerald-600'}`}
                    >
                      <div className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${isActive(`/${city.toLowerCase()}`) ? 'bg-emerald-100' : 'bg-gray-50 group-hover/item:bg-emerald-100/50'}`}>
                        <MapPin className={`w-3.5 h-3.5 ${isActive(`/${city.toLowerCase()}`) ? 'text-emerald-600' : 'text-gray-400 group-hover/item:text-emerald-500'}`} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest">{city}</span>
                      {isActive(`/${city.toLowerCase()}`) && (
                        <div className="ml-auto w-1 h-1 rounded-full bg-emerald-500" />
                      )}
                    </Link>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Information Dropdown */}
            <DropdownMenu open={isInfoDropdownOpen} onOpenChange={setIsInfoDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button className="group flex items-center space-x-1 px-2.5 py-2 rounded-xl transition-all duration-300 hover:scale-105 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50/50">
                  <BadgeCheck className="w-5 h-5 text-emerald-500" />
                  <ChevronDown className="w-3 h-3 text-gray-400 group-hover:rotate-180 transition-transform" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl mt-2 p-2 rounded-2xl">
                <Link to="/urdu" className={`flex items-center gap-4 p-3 rounded-xl mb-1 transition-all ${isActive('/urdu') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'hover:bg-emerald-50/50'}`}>
                  <Globe className="w-5 h-5 text-emerald-500" />
                  <div className="flex-1">
                    <span className="block font-[nastaliq] text-lg leading-none pt-1">مرکزی صفحہ</span>
                    <span className="text-[10px] text-gray-400 uppercase font-black">Urdu Version</span>
                  </div>
                </Link>
                <DropdownMenuSeparator className="bg-gray-100" />
                {['About', 'Blog', 'Contact', 'Developers'].map(name => {
                  const itm = allNavItems.find(i => i.name === name);
                  if (!itm) return null;
                  return (
                    <Link key={name} to={itm.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-all group">
                      <itm.icon className={`w-4 h-4 ${itm.color} transition-transform group-hover:scale-110`} />
                      <span className="text-[11px] font-black uppercase tracking-widest text-gray-700 group-hover:text-emerald-600">{name}</span>
                    </Link>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User Profile / Mobile Toggle */}
          <div className="flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex p-1 rounded-full outline-none">
                    <Avatar className="h-9 w-9 ring-2 ring-white shadow-md">
                      <AvatarImage src={user.avatar || (user as any).avatar} />
                      <AvatarFallback className="bg-emerald-500 text-white font-bold">{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 bg-white border border-gray-100 shadow-2xl rounded-2xl mt-2 p-0 overflow-hidden">
                  <div className="p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <p className="font-bold truncate">{user.name}</p>
                    <p className="text-xs opacity-80 truncate mb-2">{user.email}</p>
                    <span className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {user.role === 'patient' ? '🩺 Patient'
                        : user.role === 'doctor' ? '👨‍⚕️ Doctor'
                          : user.role === 'clinic/hospital' ? '🏥 Clinic'
                            : user.role === 'laboratory' ? '🔬 Lab'
                              : user.role === 'pharmacy' ? '💊 Pharmacy'
                                : user.role}
                      {user.role !== 'patient' && mode === 'patient' && (
                        <span className="ml-1 bg-blue-400/30 border border-blue-300/30 rounded px-1">Patient Mode</span>
                      )}
                    </span>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link to={getDashboardPath()} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
                    </Link>
                    {user.role !== 'patient' && (
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <Repeat className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold uppercase tracking-widest">Patient Mode</span>
                        </div>
                        <Switch checked={mode === 'patient'} onCheckedChange={handleModeToggle} />
                      </div>
                    )}
                    <DropdownMenuSeparator className="bg-gray-100" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 transition-all">
                      <LogOut className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/register">
                  <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-5 py-2 rounded-xl font-bold uppercase text-xs tracking-widest transition-all">
                    Register
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-bold uppercase text-xs tracking-widest transition-all">
                    Login
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Trigger */}
            <Button variant="ghost" size="sm" className="md:hidden w-10 h-10 p-0 rounded-xl hover:bg-emerald-50" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6 text-emerald-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Full Screen Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-white flex flex-col h-[100dvh] w-screen overflow-hidden"
            style={{ touchAction: 'none' }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-10 h-10 bg-emerald-50 rounded-xl shadow-md overflow-hidden">
                  <img src={logoNew} alt="SehatKor Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">SehatKor</span>
              </Link>
              <Button variant="ghost" onClick={() => setIsMobileMenuOpen(false)} className="rounded-full w-10 h-10 p-0 hover:bg-red-50 text-gray-400 hover:text-red-500">
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-5" style={{ touchAction: 'pan-y' }}>
              {user ? (
                <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 flex items-center gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                    <AvatarImage src={user.avatar || (user as any).avatar} />
                    <AvatarFallback className="bg-emerald-500 text-white font-bold">{user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black text-gray-900 truncate">{user.name}</h3>
                    <span className="inline-flex items-center gap-1 mt-1 mb-2 bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {user.role === 'patient' ? '🩺 Patient'
                        : user.role === 'doctor' ? '👨‍⚕️ Doctor'
                          : user.role === 'clinic/hospital' ? '🏥 Clinic'
                            : user.role === 'laboratory' ? '🔬 Lab'
                              : user.role === 'pharmacy' ? '💊 Pharmacy'
                                : user.role}
                      {user.role !== 'patient' && mode === 'patient' && (
                        <span className="ml-1 bg-blue-100 text-blue-600 rounded px-1">· Patient Mode</span>
                      )}
                    </span>
                    <div className="mt-1 flex gap-2">
                      <Link to={getDashboardPath()} onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white px-3 py-1.5 rounded-lg">Dashboard</Link>
                      <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest bg-white border border-red-100 text-red-500 px-3 py-1.5 rounded-lg">Logout</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center"><LogIn className="w-4 h-4" /></div>
                      <div>
                        <span className="block font-black uppercase text-xs tracking-widest">Sign In</span>
                        <span className="text-[10px] opacity-80">Already have an account</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 bg-white border-2 border-emerald-200 rounded-2xl text-emerald-700 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center"><UserPlus className="w-4 h-4 text-emerald-600" /></div>
                      <div>
                        <span className="block font-black uppercase text-xs tracking-widest">Create Account</span>
                        <span className="text-[10px] text-gray-500">Register as patient or provider</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-emerald-400" />
                  </Link>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Main Menu</h4>
                <div className="grid grid-cols-1 gap-0.5">
                  {navItems.filter(i => i.name !== 'Dashboard').map((item, idx) => (
                    <motion.div key={item.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + idx * 0.05 }}>
                      <Link
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive(item.href) ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'hover:bg-gray-50 text-gray-600'}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive(item.href) ? 'bg-white shadow-sm text-emerald-500' : 'bg-gray-100/80 text-gray-400'}`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className={`${item.name === 'مرکزی صفحہ' ? 'font-[nastaliq] text-xl pt-1' : 'text-[11px] font-black uppercase tracking-widest'}`}>{item.name}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Popular Cities</h4>
                <div className="grid grid-cols-3 gap-2">
                  {['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Mardan', 'Chitral'].map(city => (
                    <Link key={city} to={`/${city.toLowerCase()}`} onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-1 py-2.5 px-1 bg-gray-50 rounded-xl border border-gray-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all group">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                      <span className="text-[9px] font-black uppercase tracking-tighter text-gray-600 group-hover:text-emerald-700">{city}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
                {[
                  { name: "Support", icon: HelpCircle, href: "/contact" },
                  { name: "Privacy", icon: Shield, href: "/privacy" },
                  { name: "Terms", icon: FileText, href: "/disclaimer" },
                  { name: "About", icon: Info, href: "/about" }
                ].map(link => (
                  <Link key={link.name} to={link.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-400 hover:text-emerald-500 transition-colors">
                    <link.icon className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;