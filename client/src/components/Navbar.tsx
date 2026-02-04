import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserBadge from "@/components/UserBadge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu";
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
  Shield
} from "lucide-react";
import { apiUrl } from '@/config/api';

const Navbar = () => {
  const { user, logout, mode, toggleMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInfoDropdownOpen, setIsInfoDropdownOpen] = useState(false);
  const [isLocationsExpanded, setIsLocationsExpanded] = useState(false);
  const [isDesktopLocationsExpanded, setIsDesktopLocationsExpanded] = useState(false);
  const [navVerification, setNavVerification] = useState<{ isVerified: boolean; status?: string } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    // Only add scroll listener on homepage
    if (location.pathname === '/') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [location.pathname]);

  // Fetch provider verification status from backend to ensure accurate badge
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        if (!user || user.role === 'patient') {
          setNavVerification(null);
          return;
        }
        const token = localStorage.getItem('sehatkor_token');
        if (!token) {
          setNavVerification(null);
          return;
        }
        const res = await fetch(apiUrl('/api/verification/my-status'), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          setNavVerification(null);
          return;
        }
        const data = await res.json();
        const isVerified = Boolean(data?.user?.isVerified);
        const status = data?.registrationVerification?.status as string | undefined;
        setNavVerification({ isVerified, status });
      } catch (e) {
        setNavVerification(null);
      }
    };
    fetchStatus();
  }, [user]);

  const handleModeToggle = () => {
    toggleMode();

    // Only navigate if user is currently on a dashboard page
    const isDashboardPage = location.pathname.startsWith('/dashboard');

    if (isDashboardPage) {
      if (mode === 'patient') {
        switch (user?.role) {
          case 'doctor':
            navigate('/dashboard/doctor');
            break;
          case 'clinic/hospital':
            navigate('/dashboard/clinic');
            break;
          case 'laboratory':
            navigate('/dashboard/laboratory');
            break;
          case 'pharmacy':
            navigate('/dashboard/pharmacy');
            break;
          default:
            navigate('/');
        }
      } else {
        navigate('/dashboard/patient');
      }
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
    { name: "Dashboard", href: "", icon: LayoutDashboard, color: "text-slate-600", requiresAuth: true },
    { name: "Developers", href: "/developers", icon: User, color: "text-purple-600" },
    { name: "Register", href: "/register", icon: UserPlus, color: "text-cyan-600", requiresAuth: false },
    { name: "Login", href: "/login", icon: LogIn, color: "text-violet-600", requiresAuth: false },
  ];

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === 'patient' || mode === 'patient') {
      return "/dashboard/patient";
    }
    switch (user.role) {
      case 'doctor':
        return '/dashboard/doctor';
      case 'clinic/hospital':
        return '/dashboard/clinic';
      case 'laboratory':
        return '/dashboard/laboratory';
      case 'pharmacy':
        return '/dashboard/pharmacy';
      default:
        return '/login';
    }
  };

  // Filter navigation items based on authentication status
  const navItems = allNavItems
    .map(item => {
      if (item.name === "Dashboard") {
        return { ...item, href: getDashboardPath() };
      }
      return item;
    })
    .filter(item => {
      if (item.requiresAuth === false) {
        return !user; // Show login/register only when not logged in
      }
      if (item.requiresAuth === true) {
        return user; // Show dashboard only when logged in
      }
      return true; // Show other items always
    });

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`${location.pathname === '/' ? 'fixed' : 'sticky'} top-0 z-50 w-full border-b overflow-visible transition-all duration-300 ${location.pathname === '/' && isScrolled
      ? 'bg-gray-50/40 backdrop-blur-xl shadow-xl border-gray-100/40'
      : 'bg-gray-50/70 backdrop-blur-md shadow-sm border-gray-100/60'
      }`}>
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }
        `}
      </style>
      <div className="container mx-auto px-4 relative">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg group-hover:shadow-emerald-200 group-hover:scale-105 transition-all duration-300">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">SehatKor</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              // Group About, Developers, Blog, Contact into dropdown for large screens only
              if (['About', 'Developers', 'Blog', 'Contact'].includes(item.name)) {
                return null; // Don't render these individually
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center space-x-2 px-2 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${isActive(item.href)
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200"
                    : "text-gray-800 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                >
                  <Icon className={`w-4 h-4 transition-all duration-300 ${isActive(item.href)
                    ? "text-white drop-shadow-sm"
                    : `${item.color} group-hover:text-emerald-500 group-hover:scale-110 group-hover:drop-shadow-sm`
                    }`} strokeWidth={2.5} />
                  <span className={`transition-all duration-300 ${item.name === "مرکزی صفحہ" ? "text-base font-[nastaliq]" : ""}`}>{item.name}</span>
                </Link>
              );
            })}

            {/* Locations Dropdown for Desktop */}
            <div className="hidden lg:block relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="group flex items-center space-x-2 px-2 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 text-gray-800 hover:text-gray-900 hover:bg-gray-100">
                    <MapPin className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-all duration-300" strokeWidth={2.5} />
                    <span>Locations</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end" className="w-64 max-h-[80vh] overflow-y-auto custom-scrollbar bg-gray-50/95 backdrop-blur-xl border border-gray-100/40 shadow-xl rounded-2xl mt-2 p-2 animate-in slide-in-from-top-2 duration-300">
                  <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-gray-500">Major Cities</DropdownMenuLabel>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { name: 'Karachi', path: '/karachi', color: 'text-blue-600', bg: 'bg-blue-100' },
                      { name: 'Lahore', path: '/lahore', color: 'text-green-600', bg: 'bg-green-100' },
                      { name: 'Islamabad', path: '/islamabad', color: 'text-purple-600', bg: 'bg-purple-100' },
                      { name: 'Peshawar', path: '/peshawar', color: 'text-orange-600', bg: 'bg-orange-100' },
                    ].map((city) => (
                      <DropdownMenuItem key={city.name} asChild className="rounded-lg">
                        <Link to={city.path} className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                          <MapPin className={`w-3 h-3 ${city.color}`} />
                          <span className="text-xs font-medium text-gray-700">{city.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>

                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-gray-500">KPK & Others</DropdownMenuLabel>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { name: 'Mardan', path: '/mardan', color: 'text-teal-600', bg: 'bg-teal-100' },
                      { name: 'Swat', path: '/swat', color: 'text-emerald-600', bg: 'bg-emerald-100' },
                      { name: 'Chitral', path: '/chitral', color: 'text-indigo-600', bg: 'bg-indigo-100' },
                      { name: 'Noshera', path: '/noshera', color: 'text-rose-600', bg: 'bg-rose-100' },
                      { name: 'Swabi', path: '/swabi', color: 'text-amber-600', bg: 'bg-amber-100' },
                      { name: 'Azad Kashmir', path: '/azad-kashmir', color: 'text-cyan-600', bg: 'bg-cyan-100' }
                    ].map((city) => (
                      <DropdownMenuItem key={city.name} asChild className="rounded-lg">
                        <Link to={city.path} className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                          <MapPin className={`w-3 h-3 ${city.color}`} />
                          <span className="text-xs font-medium text-gray-700">{city.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Info Dropdown for large screens only */}
            <div className="hidden lg:block relative">
              <div className="flex items-center">
                {/* Dropdown Arrow - Separate clickable area */}
                <DropdownMenu open={isInfoDropdownOpen} onOpenChange={setIsInfoDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <button className="group flex items-center justify-center w-8 h-10 rounded-xl text-sm font-medium transition-all duration-300 ml-1 text-gray-800 hover:text-gray-900 hover:bg-gray-100">
                      <ChevronDown className={`w-3 h-3 transition-all duration-200 ${isInfoDropdownOpen ? 'rotate-180' : ''
                        } text-gray-500 group-hover:text-red-500`} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 max-h-80 overflow-y-auto custom-scrollbar bg-gray-50/95 backdrop-blur-xl border border-gray-100/40 shadow-xl rounded-2xl mt-3 p-0 animate-in slide-in-from-top-2 duration-300" sideOffset={8} alignOffset={-15}>
                    <div className="p-1">
                      <DropdownMenuItem asChild className="rounded-lg">
                        <Link to="/about" className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
                            <BadgeCheck className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">About</span>
                            <p className="text-xs text-gray-500">Our mission & vision</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg">
                        <Link to="/blog" className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50">
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Blog</span>
                            <p className="text-xs text-gray-500">Health articles & tips</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg">
                        <Link to="/contact" className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50">
                            <Phone className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Contact</span>
                            <p className="text-xs text-gray-500">Get in touch with us</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg">
                        <Link to="/developers" className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Developers</span>
                            <p className="text-xs text-gray-500">Meet our development team</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg">
                        <Link to="/how-it-works" className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-50">
                            <HelpCircle className="w-4 h-4 text-cyan-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">How it Works</span>
                            <p className="text-xs text-gray-500">Learn how to use Sehatkor</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg">
                        <Link to="/disclaimer" className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50">
                            <FileText className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Disclaimer</span>
                            <p className="text-xs text-gray-500">Legal information</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg">
                        <Link to="/privacy" className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50">
                            <Shield className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Privacy Policy</span>
                            <p className="text-xs text-gray-500">Your data protection</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Show individual items for medium screens */}
            <div className="lg:hidden flex items-center space-x-1">
              {['About', 'Developers', 'Blog', 'Contact'].map((itemName) => {
                const item = allNavItems.find(nav => nav.name === itemName);
                if (!item) return null;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center space-x-2 px-2 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${isActive(item.href)
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200"
                      : "text-gray-800 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                  >
                    <Icon className={`w-4 h-4 transition-all duration-300 ${isActive(item.href)
                      ? "text-white drop-shadow-sm"
                      : `${item.color} group-hover:text-red-500 group-hover:scale-110 group-hover:drop-shadow-sm`
                      }`} strokeWidth={2.5} />
                    <span className={`transition-all duration-300 ${item.name === "مرکزی صفحہ" ? "text-base font-[nastaliq]" : ""}`}>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Dropdown or Mobile Menu */}
          <div className="flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 p-0 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-emerald-200 lg:flex hidden"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-gray-50/95 backdrop-blur-xl border border-gray-100/40 shadow-xl rounded-2xl mt-3 p-0 overflow-hidden animate-in slide-in-from-top-2 duration-300" sideOffset={8} alignOffset={-15}>
                  {/* Header Section with Enhanced Teal Gradient */}
                  <div className="relative bg-gradient-to-br from-emerald-400 via-teal-400 to-teal-500 px-6 py-5 border-b border-teal-400/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent"></div>
                    <DropdownMenuLabel className="font-normal relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="relative p-1 bg-gradient-to-b from-white/40 to-white/10 rounded-full shadow-lg shadow-black/10 mt-1">
                          <Avatar
                            className="h-16 w-16 shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 ring-2 ring-white/30"
                            onClick={() => {
                              if (user) {
                                if (user.role === 'patient') {
                                  navigate(`/patient/${user.id}`);
                                } else {
                                  navigate(`/provider/${user.id}`);
                                }
                              }
                            }}
                          >
                            <AvatarImage src={user.avatar || (user as any).avatar} alt={user.name} className="object-cover" />
                            <AvatarFallback className="bg-white text-teal-700 font-bold text-xl">
                              {user.name?.charAt(0) ?? 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="space-y-1">
                            <p className="text-base font-bold leading-tight text-white truncate drop-shadow-sm">{user.name}</p>
                            <p className="text-sm leading-tight text-teal-50 truncate opacity-90">{user.email}</p>
                          </div>

                          {/* Provider Type & Verification Section */}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-start gap-1.5">
                              <div className="flex items-center min-w-fit">
                                <UserBadge role={(user as any).role} className="shadow-sm" />
                              </div>
                              {(() => {
                                const verified = Boolean(navVerification?.isVerified);
                                const status = navVerification?.status;
                                if (verified) {
                                  return (
                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/30 px-1.5 py-0.5 text-xs font-medium text-white h-5 min-w-fit backdrop-blur-md">
                                      <BadgeCheck className="h-2.5 w-2.5" /> Verified
                                    </span>
                                  );
                                }
                                if (user.role !== 'patient' && status === 'pending') {
                                  return (
                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-400/20 border border-orange-300/30 px-1.5 py-0.5 text-xs font-medium text-orange-50 h-5 min-w-fit backdrop-blur-md">
                                      <X className="h-2.5 w-2.5" /> Pending
                                    </span>
                                  );
                                }
                                if (user.role !== 'patient' && !verified) {
                                  return (
                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-red-400/20 border border-red-300/30 px-1.5 py-0.5 text-xs font-medium text-red-50 h-5 min-w-fit backdrop-blur-md">
                                      Unverified
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </div>

                            {/* Specialization Section */}
                            {user?.specialization && (
                              <div className="pt-1">
                                <div className="bg-teal-700/30 border border-teal-300/20 rounded-lg px-2 py-1.5 overflow-hidden backdrop-blur-sm">
                                  <p className="text-xs font-medium text-teal-50 whitespace-nowrap truncate">
                                    {user.specialization} Specialist
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                  </div>

                  {/* Content Section */}
                  <div className="px-3 py-3 bg-white">
                    {user && user.role !== 'patient' && (
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent px-4 py-4 rounded-xl mx-0 my-1 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border border-transparent hover:border-blue-200/60 hover:shadow-md">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <div className={`p-2.5 rounded-xl mr-4 transition-all duration-300 shadow-sm ${mode === 'patient'
                              ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border border-blue-200'
                              : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 border border-gray-200'
                              }`}>
                              <Repeat className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-900">
                                {mode === 'patient' ? 'Patient Mode' : 'Provider Mode'}
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                {mode === 'patient' ? 'Switch to Provider' : 'Switch to Patient'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Switch
                              checked={mode === 'patient'}
                              onCheckedChange={handleModeToggle}
                              aria-label="Toggle mode"
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-400"
                            />
                          </div>
                        </div>
                      </DropdownMenuItem>
                    )}

                    {/* Logout Button */}
                    <DropdownMenuItem onClick={handleLogout} className="text-gray-700 focus:text-red-600 focus:bg-red-50 hover:bg-red-50 px-4 py-3 rounded-xl mx-0 my-1 transition-all duration-300 border border-transparent hover:border-red-200/60 hover:shadow-md group">
                      <div className="flex items-center w-full">
                        <div className="p-2.5 rounded-xl mr-4 bg-gray-100 text-gray-600 group-hover:bg-red-100 group-hover:text-red-600 transition-all duration-300 shadow-sm border border-gray-200 group-hover:border-red-200">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <span className="font-semibold">Logout</span>
                      </div>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden w-10 h-10 p-0 rounded-xl hover:bg-gray-100 transition-all duration-300">
                  <Menu className="w-5 h-5 text-gray-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] sm:w-[400px] p-0 border-r-0 bg-white shadow-2xl overflow-hidden flex flex-col h-full">
                {/* Custom Header Area */}
                <div className="relative bg-white pt-6 pb-2 px-6 shadow-sm z-10">
                  <div className="flex items-center justify-between mb-2">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2 group">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg group-hover:shadow-emerald-200 group-hover:scale-105 transition-all duration-300">
                        <Stethoscope className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent transform origin-left group-hover:scale-105 transition-transform">SehatKor</span>
                    </Link>

                    {/* Close Button */}
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2.5 rounded-full bg-gray-50 border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300 shadow-sm group"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 custom-scrollbar pb-20">
                  {/* User Profile Card (if logged in) */}
                  {user && (
                    <div className="mx-4 mt-6 mb-4">
                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-300 via-teal-300 to-teal-400 text-white shadow-xl shadow-teal-500/20 p-5 border border-teal-400/50 group">
                        {/* Decorative Background Effects */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 opacity-20"></div>

                        <div className="relative z-10 flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-16 w-16 border-2 border-white/30 shadow-md ring-1 ring-white/20">
                              <AvatarImage src={user.avatar || (user as any).avatar} className="object-cover" />
                              <AvatarFallback className="bg-white text-teal-700 font-bold text-xl">
                                {user.name?.charAt(0) ?? 'U'}
                              </AvatarFallback>
                            </Avatar>
                            {/* Verified Badge Absolute */}
                            {navVerification?.isVerified && (
                              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm ring-1 ring-teal-100">
                                <BadgeCheck className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg leading-tight truncate text-white drop-shadow-sm">{user.name}</h3>
                            <p className="text-teal-50 text-xs truncate mb-2 opacity-90">{user.email}</p>

                            <div className="flex flex-wrap gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-medium border border-white/20 uppercase tracking-wide backdrop-blur-md">
                                {user.role}
                              </span>
                              {user.role !== 'patient' && navVerification?.status === 'pending' && (
                                <span className="px-2 py-0.5 rounded-md bg-orange-400/30 text-orange-50 text-[10px] font-medium border border-orange-300/30 backdrop-blur-md">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-2">
                          {/* Dashboard Link */}
                          <Link
                            to={getDashboardPath()}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white hover:bg-teal-50 border border-transparent hover:border-teal-200 transition-all text-xs font-bold text-teal-800 shadow-sm"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-teal-600" />
                            Dashboard
                          </Link>

                          {/* Mode Switch (Simplified) */}
                          {user.role !== 'patient' && (
                            <button
                              onClick={handleModeToggle}
                              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-xs font-bold text-white shadow-sm backdrop-blur-sm"
                            >
                              <Repeat className="w-3.5 h-3.5 text-white" />
                              {mode === 'patient' ? 'Provider' : 'Patient'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Links - Animated */}
                  <div className="px-4 py-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Menu</h4>
                    <motion.div
                      className="space-y-1.5"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: { transition: { staggerChildren: 0.05 } }
                      }}
                    >
                      {navItems.filter(item => !['Dashboard'].includes(item.name)).map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                          <motion.div
                            key={item.name}
                            variants={{
                              hidden: { opacity: 0, x: -10 },
                              visible: { opacity: 1, x: 0 }
                            }}
                          >
                            <Link
                              to={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`relative overflow-hidden flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                                ${active
                                  ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900 shadow-sm border border-emerald-100"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                                }`
                              }
                            >
                              <div className={`
                                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm
                                ${active
                                  ? "bg-white text-emerald-600 shadow-emerald-100"
                                  : "bg-gray-100/80 text-gray-500 group-hover:bg-white group-hover:shadow-md group-hover:scale-110 " + item.color.replace('text-', 'text-')
                                }
                              `}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <span className={`font-medium text-base ${item.name === "مرکزی صفحہ" ? "font-[nastaliq] text-lg mt-1" : ""}`}>
                                {item.name}
                              </span>

                              {active && (
                                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                              )}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </div>

                  {/* Locations Accordion - Enhanced */}
                  <div className="mx-4 mt-4 mb-2">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 overflow-hidden">
                      <button
                        onClick={() => setIsLocationsExpanded(!isLocationsExpanded)}
                        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-red-600" />
                          </div>
                          <span className="font-bold text-gray-800 text-sm">Find by City</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-300 ${isLocationsExpanded ? 'rotate-180 bg-red-100 text-red-600' : 'text-gray-500'}`}>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isLocationsExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="p-3 bg-gray-50/50 grid grid-cols-2 gap-2 border-t border-gray-100">
                              {[
                                { name: 'Karachi', path: '/karachi', color: 'bg-blue-100 text-blue-700' },
                                { name: 'Lahore', path: '/lahore', color: 'bg-green-100 text-green-700' },
                                { name: 'Islamabad', path: '/islamabad', color: 'bg-purple-100 text-purple-700' },
                                { name: 'Peshawar', path: '/peshawar', color: 'bg-orange-100 text-orange-700' },
                                { name: 'Mardan', path: '/mardan', color: 'bg-teal-100 text-teal-700' },
                                { name: 'Swat', path: '/swat', color: 'bg-emerald-100 text-emerald-700' },
                                { name: 'Chitral', path: '/chitral', color: 'bg-indigo-100 text-indigo-700' },
                                { name: 'Noshera', path: '/noshera', color: 'bg-rose-100 text-rose-700' },
                                { name: 'Swabi', path: '/swabi', color: 'bg-amber-100 text-amber-700' },
                                { name: 'Azad Kashmir', path: '/azad-kashmir', color: 'bg-cyan-100 text-cyan-700' },
                              ].map((city) => (
                                <Link
                                  key={city.name}
                                  to={city.path}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className={`flex items-center justify-center px-2 py-2.5 rounded-xl text-xs font-bold leading-none transition-all hover:scale-105 hover:shadow-sm ${city.color}`}
                                >
                                  {city.name}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Support Links */}
                  <div className="px-6 py-4 space-y-3">
                    {[
                      { name: "How it Works", href: "/how-it-works", icon: HelpCircle, color: "text-blue-500" },
                      { name: "Privacy Policy", href: "/privacy", icon: Shield, color: "text-green-500" },
                      { name: "Disclaimer", href: "/disclaimer", icon: FileText, color: "text-amber-500" }
                    ].map((link) => (
                      <Link
                        key={link.name}
                        to={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors group"
                      >
                        <link.icon className={`w-4 h-4 ${link.color} group-hover:scale-110 transition-transform`} />
                        {link.name}
                      </Link>
                    ))}
                  </div>

                  {/* Footer Logout */}
                  {user && (
                    <div className="px-6 pb-6 pt-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full py-3.5 rounded-xl border border-red-100 bg-red-50 text-red-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 hover:shadow-md transition-all active:scale-95"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  )}

                  <div className="h-12"></div> {/* Bottom Spacer */}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;