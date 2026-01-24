import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  MapPin
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
    { name: "Home", href: "/", icon: Home, color: "text-blue-600" },
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
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg group-hover:shadow-red-200 group-hover:scale-105 transition-all duration-300">
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
                  className={`group flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${isActive(item.href)
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200"
                    : "text-gray-800 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                >
                  <Icon className={`w-4 h-4 transition-all duration-300 ${isActive(item.href)
                    ? "text-white drop-shadow-sm"
                    : `${item.color} group-hover:text-red-500 group-hover:scale-110 group-hover:drop-shadow-sm`
                    }`} strokeWidth={2.5} />
                  <span className=" transition-all duration-300">{item.name}</span>
                </Link>
              );
            })}

            {/* Locations Dropdown for Desktop */}
            <div className="hidden lg:block relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="group flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 text-gray-800 hover:text-gray-900 hover:bg-gray-100">
                    <MapPin className="w-4 h-4 text-red-500 group-hover:scale-110 transition-all duration-300" strokeWidth={2.5} />
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
                    className={`group flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${isActive(item.href)
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200"
                      : "text-gray-800 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                  >
                    <Icon className={`w-4 h-4 transition-all duration-300 ${isActive(item.href)
                      ? "text-white drop-shadow-sm"
                      : `${item.color} group-hover:text-red-500 group-hover:scale-110 group-hover:drop-shadow-sm`
                      }`} strokeWidth={2.5} />
                    <span className=" transition-all duration-300">{item.name}</span>
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
                    className="w-10 h-10 p-0 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-200"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 bg-gray-50/95 backdrop-blur-xl border border-gray-100/40 shadow-xl rounded-2xl mt-3 p-0 overflow-hidden animate-in slide-in-from-top-2 duration-300" sideOffset={8} alignOffset={-15}>
                  {/* Header Section with Enhanced Gray Gradient */}
                  <div className="relative bg-gradient-to-br from-gray-200 via-blue-200 to-blue-300 px-6 py-5 border-b border-blue-300/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-transparent"></div>
                    <DropdownMenuLabel className="font-normal relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="relative p-1 bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-400/50 mt-1">
                          <Avatar
                            className="h-16 w-16 shadow-xl cursor-pointer transition-all duration-300 hover:scale-105"
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
                            <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-bold text-xl">
                              {user.name?.charAt(0) ?? 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="space-y-1">
                            <p className="text-base font-bold leading-tight text-gray-900 truncate">{user.name}</p>
                            <p className="text-sm leading-tight text-gray-600 truncate">{user.email}</p>
                          </div>

                          {/* Provider Type & Verification Section */}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-start gap-1.5">
                              <div className="rounded-full px-1.5 py-0.5 h-5 flex items-center min-w-fit">
                                <UserBadge role={(user as any).role} />
                              </div>
                              {(() => {
                                const verified = Boolean(navVerification?.isVerified);
                                const status = navVerification?.status;
                                if (verified) {
                                  return (
                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-green-200 to-green-300 border border-green-400/50 px-1.5 py-0.5 text-xs font-medium text-green-900 h-5 min-w-fit">
                                      <BadgeCheck className="h-2.5 w-2.5" /> Verified
                                    </span>
                                  );
                                }
                                if (user.role !== 'patient' && status === 'pending') {
                                  return (
                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-200 to-orange-300 border border-orange-400/50 px-1.5 py-0.5 text-xs font-medium text-orange-900 h-5 min-w-fit">
                                      <X className="h-2.5 w-2.5" /> Pending
                                    </span>
                                  );
                                }
                                if (user.role !== 'patient' && !verified) {
                                  return (
                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-red-200 to-rose-300 border border-red-400/50 px-1.5 py-0.5 text-xs font-medium text-red-900 h-5 min-w-fit">
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
                                <div className="bg-gradient-to-r from-blue-100 to-indigo-200 border border-blue-300/50 rounded-lg px-2 py-1.5 overflow-hidden">
                                  <p className="text-xs font-medium text-blue-900 whitespace-nowrap truncate">
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
              <SheetContent side="right" className="w-80 bg-gray-50/95 backdrop-blur-md overflow-y-auto">
                <div className="flex items-center mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                      <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">SehatKor</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${isActive(item.href)
                          ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                          : "text-gray-800 hover:text-gray-900 hover:bg-gray-100"
                          }`}
                      >
                        <Icon className={`w-5 h-5 transition-all duration-300 ${isActive(item.href)
                          ? "text-white drop-shadow-sm"
                          : `${item.color} group-hover:text-red-500 group-hover:scale-110 group-hover:drop-shadow-sm`
                          }`} strokeWidth={2.5} />
                        <span className="group-hover:font-semibold transition-all duration-300">{item.name}</span>
                      </Link>
                    );
                  })}

                  {/* Locations Section - Collapsible */}
                  <div className="border-t border-gray-200 my-4"></div>
                  <div>
                    <button
                      onClick={() => setIsLocationsExpanded(!isLocationsExpanded)}
                      className="group flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-gray-100 text-gray-800"
                    >
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-red-500 group-hover:scale-110 transition-all duration-300" strokeWidth={2.5} />
                        <span className="group-hover:font-semibold transition-all duration-300">Locations</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isLocationsExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isLocationsExpanded && (
                      <div className="px-4 py-3 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-2 gap-2">
                          <Link to="/karachi" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                            <MapPin className="w-3 h-3 text-blue-600" />
                            <span className="text-xs font-medium text-gray-900">Karachi</span>
                          </Link>
                          <Link to="/lahore" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                            <MapPin className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-medium text-gray-900">Lahore</span>
                          </Link>
                          <Link to="/islamabad" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                            <MapPin className="w-3 h-3 text-purple-600" />
                            <span className="text-xs font-medium text-gray-900">Islamabad</span>
                          </Link>
                          <Link to="/peshawar" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                            <MapPin className="w-3 h-3 text-orange-600" />
                            <span className="text-xs font-medium text-gray-900">Peshawar</span>
                          </Link>
                          <Link to="/mardan" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 transition-colors">
                            <MapPin className="w-3 h-3 text-teal-600" />
                            <span className="text-xs font-medium text-gray-900">Mardan</span>
                          </Link>
                          <Link to="/swat" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span className="text-xs font-medium text-gray-900">Swat</span>
                          </Link>
                          <Link to="/chitral" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors">
                            <MapPin className="w-3 h-3 text-indigo-600" />
                            <span className="text-xs font-medium text-gray-900">Chitral</span>
                          </Link>
                          <Link to="/noshera" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors">
                            <MapPin className="w-3 h-3 text-rose-600" />
                            <span className="text-xs font-medium text-gray-900">Noshera</span>
                          </Link>
                          <Link to="/swabi" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors">
                            <MapPin className="w-3 h-3 text-amber-600" />
                            <span className="text-xs font-medium text-gray-900">Swabi</span>
                          </Link>
                          <Link to="/azad-kashmir" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 transition-colors col-span-2">
                            <MapPin className="w-3 h-3 text-cyan-600" />
                            <span className="text-xs font-medium text-gray-900">Azad Kashmir</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {user && (
                    <>
                      <div className="border-t border-gray-200 my-4"></div>
                      <div className="px-4 py-2">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <div className="mt-2 flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <UserBadge role={(user as any).role} />
                            {(() => {
                              const verified = Boolean(navVerification?.isVerified);
                              const status = navVerification?.status;
                              if (verified) {
                                return (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                                    <BadgeCheck className="h-3 w-3" /> Verified
                                  </span>
                                );
                              }
                              if (user.role !== 'patient' && status === 'pending') {
                                return (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                                    <X className="h-3 w-3" /> Pending
                                  </span>
                                );
                              }
                              if (user.role !== 'patient' && !verified) {
                                return (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                                    <X className="h-3 w-3" /> Unverified
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                          {user?.specialization && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-[9px] font-normal">
                                {user.specialization} Specialist
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-300 w-full"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </>
                  )}
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