import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserBadge from "@/components/UserBadge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  Repeat
} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, mode, toggleMode } = useAuth();

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

  const handleModeToggle = () => {
    const newMode = mode === 'patient' ? 'provider' : 'patient';
    toggleMode();

    // Only navigate if user is currently on a dashboard page
    const isDashboardPage = location.pathname.startsWith('/dashboard');
    
    if (isDashboardPage) {
      if (newMode === 'patient') {
        navigate('/dashboard/patient');
      } else {
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
    { name: "Blog", href: "/blog", icon: BookOpen, color: "text-indigo-600" },
    { name: "Contact", href: "/contact", icon: Phone, color: "text-emerald-600" },
    { name: "Dashboard", href: "", icon: LayoutDashboard, color: "text-slate-600", requiresAuth: true },
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
  };

  return (
    <nav className={`${location.pathname === '/' ? 'fixed' : 'sticky'} top-0 z-50 w-full border-b overflow-visible transition-all duration-300 ${
      location.pathname === '/' && isScrolled 
        ? 'bg-white/50 backdrop-blur-xl shadow-xl border-gray-200/30' 
        : 'bg-white/95 backdrop-blur-md shadow-sm border-gray-200'
    }`}>
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
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200"
                      : "text-gray-800 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-all duration-300 ${
                    isActive(item.href) 
                      ? "text-white drop-shadow-sm" 
                      : `${item.color} group-hover:text-red-500 group-hover:scale-110 group-hover:drop-shadow-sm`
                  }`} strokeWidth={2.5} />
                  <span className=" transition-all duration-300">{item.name}</span>
                </Link>
              );
            })}
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
                <DropdownMenuContent align="end" className="w-60 bg-white border shadow-xl rounded-2xl mt-2 p-0 overflow-hidden" sideOffset={5} alignOffset={-10}>
                  <DropdownMenuLabel className="font-normal px-4 pt-4 pb-3 bg-white">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                        <AvatarImage src={user.avatar || (user as any).avatar} alt={user.name} />
                        <AvatarFallback className="bg-red-100 text-red-700 font-semibold">
                          {user.name?.charAt(0) ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 space-y-2">
                        <p className="text-sm font-semibold leading-none text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs leading-none text-gray-500 truncate">{user.email}</p>
                        <div className="mt-2 flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <UserBadge role={(user as any).role} />
                            {user.isVerified && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                                <BadgeCheck className="h-3 w-3" /> Verified
                              </span>
                            )}
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
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  {user && user.role !== 'patient' && (
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent px-4 py-3 rounded-xl mx-2 my-2 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <div className={`p-1.5 rounded-lg mr-3 transition-all duration-300 ${
                            mode === 'patient' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-red-100 text-red-600'
                          }`}>
                            <Repeat className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                              {mode === 'patient' ? 'Patient Mode' : 'Provider Mode'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {mode === 'patient' ? 'Switch to Provider' : 'Switch to Patient'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Switch
                            checked={mode === 'patient'}
                            onCheckedChange={handleModeToggle}
                            aria-label="Toggle mode"
                            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-red-500"
                          />
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 px-4 py-2 rounded-lg mx-2 my-2">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

           {/* Mobile Menu */}
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetTrigger asChild>
    <Button variant="ghost" size="sm" className="md:hidden w-10 h-10 p-0 rounded-xl hover:bg-gray-100 transition-all duration-300">
      <Menu className="w-5 h-5 text-gray-600" />
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-80 bg-white">
    <div className="flex items-center mb-6"> {/* Removed justify-between since we only have one element now */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
          <Stethoscope className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">SehatKor</span>
      </div>
      {/* Removed the custom close button */}
    </div>
    
    <div className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setIsOpen(false)}
            className={`group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
              isActive(item.href)
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                : "text-gray-800 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Icon className={`w-5 h-5 transition-all duration-300 ${
              isActive(item.href) 
                ? "text-white drop-shadow-sm" 
                : `${item.color} group-hover:text-red-500 group-hover:scale-110 group-hover:drop-shadow-sm`
            }`} strokeWidth={2.5} />
            <span className="group-hover:font-semibold transition-all duration-300">{item.name}</span>
          </Link>
        );
      })}
      
      {user && (
        <>
          <div className="border-t border-gray-200 my-4"></div>
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <UserBadge role={(user as any).role} />
                {user.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </span>
                )}
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
              setIsOpen(false);
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