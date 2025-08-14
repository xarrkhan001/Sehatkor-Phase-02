import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingChat from "./components/FloatingChat";
import WhatsAppButton from "./components/WhatsAppButton";
import { useAuth } from "./contexts/AuthContext";
import { lazy, Suspense } from "react";
import HomeSkeleton from "./components/skeletons/HomeSkeleton";
import PageSkeleton from "./components/skeletons/PageSkeleton";
import DashboardSkeleton from "./components/skeletons/DashboardSkeleton";
import AdminSkeleton from "./components/skeletons/AdminSkeleton";
import AuthSkeleton from "./components/skeletons/AuthSkeleton";
import ServiceSkeleton from "./components/skeletons/ServiceSkeleton";
import BlogSkeleton from "./components/skeletons/BlogSkeleton";

const HomePage = lazy(() => import("./pages/HomePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RoleBasedDashboard = lazy(() => import("./pages/RoleBasedDashboard"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OAuthCallbackPage = lazy(() => import("./pages/auth/OAuthCallbackPage"));
const DiseaseListPage = lazy(() => import("./pages/DiseaseListPage"));
const DiseaseDetailPage = lazy(() => import("./pages/DiseaseDetailPage"));
const DoctorsPage = lazy(() => import("./pages/DoctorsPage"));
const HospitalsPage = lazy(() => import("./pages/HospitalsPage"));
const LabsPage = lazy(() => import("./pages/LabsPage"));
const PharmaciesPage = lazy(() => import("./pages/PharmaciesPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
import { CompareProvider } from "./contexts/CompareContext";
import ServiceDetailPage from "./pages/ServiceDetailPage";

const queryClient = new QueryClient();

const AppShell = () => {
  const { isAuthenticated } = useAuth();
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Suspense fallback={<HomeSkeleton />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/diseases" element={<DiseaseListPage />} />
            <Route path="/diseases/:slug" element={<Suspense fallback={<ServiceSkeleton />}><DiseaseDetailPage /></Suspense>} />
            <Route path="/search" element={<Suspense fallback={<PageSkeleton />}><SearchPage /></Suspense>} />
            <Route path="/doctors" element={<Suspense fallback={<PageSkeleton />}><DoctorsPage /></Suspense>} />
            <Route path="/hospitals" element={<Suspense fallback={<PageSkeleton />}><HospitalsPage /></Suspense>} />
            <Route path="/labs" element={<Suspense fallback={<PageSkeleton />}><LabsPage /></Suspense>} />
            <Route path="/pharmacies" element={<Suspense fallback={<PageSkeleton />}><PharmaciesPage /></Suspense>} />
            <Route path="/compare" element={<Suspense fallback={<PageSkeleton />}><ComparePage /></Suspense>} />
            <Route path="/service/:id" element={<Suspense fallback={<ServiceSkeleton />}><ServiceDetailPage /></Suspense>} />
            <Route path="/register" element={<Suspense fallback={<AuthSkeleton />}><RegisterPage /></Suspense>} />
            <Route path="/login" element={<Suspense fallback={<AuthSkeleton />}><LoginPage /></Suspense>} />
            <Route path="/auth/callback" element={<Suspense fallback={<AuthSkeleton />}><OAuthCallbackPage /></Suspense>} />
            <Route path="/dashboard" element={<Suspense fallback={<DashboardSkeleton />}><RoleBasedDashboard /></Suspense>} />
            <Route path="/blog" element={<Suspense fallback={<BlogSkeleton />}><BlogPage /></Suspense>} />
            <Route path="/contact" element={<Suspense fallback={<PageSkeleton />}><ContactPage /></Suspense>} />
            <Route path="/admin" element={<Suspense fallback={<AdminSkeleton />}><AdminPanel /></Suspense>} />
            <Route path="*" element={<Suspense fallback={<PageSkeleton />}><NotFound /></Suspense>} />
          </Routes>
        </Suspense>
        {isAuthenticated && <FloatingChat />}
        {isAuthenticated && <WhatsAppButton />}
        <Footer />
      </div>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CompareProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppShell />
        </TooltipProvider>
      </CompareProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
