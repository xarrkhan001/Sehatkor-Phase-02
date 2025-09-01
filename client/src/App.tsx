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
import ScrollToTop from "./components/ScrollToTop";
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
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const DashboardRedirectPage = lazy(() => import("./pages/DashboardRedirectPage"));
const PatientDashboard = lazy(() => import("./pages/dashboards/PatientDashboard"));
const DoctorDashboard = lazy(() => import("./pages/dashboards/DoctorDashboard"));
const ClinicDashboard = lazy(() => import("./pages/dashboards/ClinicDashboard"));
const LaboratoryDashboard = lazy(() => import("./pages/dashboards/LaboratoryDashboard"));
const PharmacyDashboard = lazy(() => import("./pages/dashboards/PharmacyDashboard"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminVerifications = lazy(() => import("./pages/AdminVerifications"));
const AdminDocuments = lazy(() => import("./pages/AdminDocuments"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
const AdminUserManagement = lazy(() => import("./pages/AdminUserManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OAuthCallbackPage = lazy(() => import("./pages/auth/OAuthCallbackPage"));
const DiseaseListPage = lazy(() => import("./pages/DiseaseListPage"));
const DiseaseDetailPage = lazy(() => import("./pages/DiseaseDetailPage"));
const AllDiseasesPage = lazy(() => import("./pages/AllDiseasesPage"));
const DoctorsPage = lazy(() => import("./pages/DoctorsPage"));
const HospitalsPage = lazy(() => import("./pages/HospitalsPage"));
const LabsPage = lazy(() => import("./pages/LabsPage"));
const PharmaciesPage = lazy(() => import("./pages/PharmaciesPage"));
const ProviderProfilePage = lazy(() => import("./pages/ProviderProfilePage"));
const PatientProfilePage = lazy(() => import("./pages/PatientProfilePage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const InvoiceDetailPage = lazy(() => import("./pages/InvoiceDetailPage"));
import { CompareProvider } from "./contexts/CompareContext";
import { SocketProvider } from "./context/SocketContext";
import ServiceDetailPage from "./pages/ServiceDetailPage";

const queryClient = new QueryClient();

const AppShell = () => {
  const { isAuthenticated } = useAuth();
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <ScrollToTop behavior="smooth" />
        <Navbar />
        <Suspense fallback={<HomeSkeleton />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/diseases" element={<DiseaseListPage />} />
            <Route path="/diseases/:slug" element={<Suspense fallback={<ServiceSkeleton />}><DiseaseDetailPage /></Suspense>} />
            <Route path="/search" element={<Suspense fallback={<PageSkeleton />}><SearchPage /></Suspense>} />
            <Route path="/all-diseases" element={<Suspense fallback={<PageSkeleton />}><AllDiseasesPage /></Suspense>} />
            <Route path="/doctors" element={<Suspense fallback={<PageSkeleton />}><DoctorsPage /></Suspense>} />
            <Route path="/hospitals" element={<Suspense fallback={<PageSkeleton />}><HospitalsPage /></Suspense>} />
            <Route path="/labs" element={<Suspense fallback={<PageSkeleton />}><LabsPage /></Suspense>} />
            <Route path="/pharmacies" element={<Suspense fallback={<PageSkeleton />}><PharmaciesPage /></Suspense>} />
            <Route path="/provider/:providerId" element={<Suspense fallback={<PageSkeleton />}><ProviderProfilePage /></Suspense>} />
            <Route path="/patient/:patientId" element={<Suspense fallback={<PageSkeleton />}><PatientProfilePage /></Suspense>} />
            <Route path="/compare" element={<Suspense fallback={<PageSkeleton />}><ComparePage /></Suspense>} />
            <Route path="/payment" element={<Suspense fallback={<PageSkeleton />}><PaymentPage /></Suspense>} />
            <Route path="/invoice/:invoiceId" element={<Suspense fallback={<PageSkeleton />}><InvoiceDetailPage /></Suspense>} />
            <Route path="/service/:id" element={<Suspense fallback={<ServiceSkeleton />}><ServiceDetailPage /></Suspense>} />
            <Route path="/register" element={<Suspense fallback={<AuthSkeleton />}><RegisterPage /></Suspense>} />
            <Route path="/login" element={<Suspense fallback={<AuthSkeleton />}><LoginPage /></Suspense>} />
            <Route path="/forgot-password" element={<Suspense fallback={<AuthSkeleton />}><ForgotPasswordPage /></Suspense>} />
            <Route path="/reset-password/:token" element={<Suspense fallback={<AuthSkeleton />}><ResetPasswordPage /></Suspense>} />
            <Route path="/auth/callback" element={<Suspense fallback={<AuthSkeleton />}><OAuthCallbackPage /></Suspense>} />
            <Route path="/dashboard" element={<Suspense fallback={<DashboardSkeleton />}><DashboardRedirectPage /></Suspense>} />
            <Route path="/dashboard/patient" element={<Suspense fallback={<DashboardSkeleton />}><PatientDashboard /></Suspense>} />
            <Route path="/dashboard/doctor" element={<Suspense fallback={<DashboardSkeleton />}><DoctorDashboard /></Suspense>} />
            <Route path="/dashboard/clinic" element={<Suspense fallback={<DashboardSkeleton />}><ClinicDashboard /></Suspense>} />
            <Route path="/dashboard/laboratory" element={<Suspense fallback={<DashboardSkeleton />}><LaboratoryDashboard /></Suspense>} />
            <Route path="/dashboard/pharmacy" element={<Suspense fallback={<DashboardSkeleton />}><PharmacyDashboard /></Suspense>} />
            <Route path="/blog" element={<Suspense fallback={<BlogSkeleton />}><BlogPage /></Suspense>} />
            <Route path="/contact" element={<Suspense fallback={<PageSkeleton />}><ContactPage /></Suspense>} />
            <Route path="/admin" element={<Suspense fallback={<AdminSkeleton />}><AdminPanel /></Suspense>} />
            <Route path="/admin/verifications" element={<Suspense fallback={<AdminSkeleton />}><AdminVerifications /></Suspense>} />
            <Route path="/admin/documents" element={<Suspense fallback={<AdminSkeleton />}><AdminDocuments /></Suspense>} />
            <Route path="/admin/payments" element={<Suspense fallback={<AdminSkeleton />}><AdminPayments /></Suspense>} />
            <Route path="/admin/user-management" element={<Suspense fallback={<AdminSkeleton />}><AdminUserManagement /></Suspense>} />
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
      <SocketProvider>
        <CompareProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppShell />
          </TooltipProvider>
        </CompareProvider>
      </SocketProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
