import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserBadge from "@/components/UserBadge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
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
  BadgeCheck
} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const allNavItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Services", href: "/search", icon: Grid3X3 },
    { name: "Doctors", href: "/doctors", icon: UserCircle },
    { name: "Hospitals", href: "/hospitals", icon: Hospital },
    { name: "Labs", href: "/labs", icon: FlaskConical },
    { name: "Pharmacies", href: "/pharmacies", icon: Pill },
    { name: "Blog", href: "/blog", icon: BookOpen },
    { name: "Contact", href: "/contact", icon: Phone },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, requiresAuth: true },
    { name: "Register", href: "/register", icon: UserPlus, requiresAuth: false },
    { name: "Login", href: "/login", icon: LogIn, requiresAuth: false },
  ];

  // Filter navigation items based on authentication status
  const navItems = allNavItems.filter(item => {
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
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
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
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-all duration-300 ${
                    isActive(item.href) 
                      ? "text-white drop-shadow-sm" 
                      : "text-gray-500 group-hover:text-red-500 group-hover:scale-110 group-hover:drop-shadow-sm"
                  }`} />
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
                <DropdownMenuContent align="end" className="w-72 bg-white border shadow-xl rounded-2xl mt-2 p-0 overflow-hidden">
                  <DropdownMenuLabel className="font-normal px-4 pt-4 pb-3 bg-gradient-to-br from-red-50 to-white">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                        <AvatarImage src={(user as any).avatar} alt={user.name} />
                        <AvatarFallback className="bg-red-100 text-red-700 font-semibold">
                          {user.name?.charAt(0) ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-none text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs leading-none text-gray-500 truncate">{user.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <UserBadge role={(user as any).role} />
                          {user.isVerified && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                              <BadgeCheck className="h-3 w-3" /> Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-100" />
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
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Icon className={`w-5 h-5 transition-all duration-300 ${
              isActive(item.href) 
                ? "text-white drop-shadow-sm" 
                : "text-gray-500 group-hover:text-red-500 group-hover:scale-110 group-hover:drop-shadow-sm"
            }`} />
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
            <div className="mt-2 flex items-center gap-2">
              <UserBadge role={(user as any).role} />
              {user.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </span>
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