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
import GlobalConnectionListener from "./components/GlobalConnectionListener";
import VerificationNotificationModal from "./components/VerificationNotificationModal";
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
const BlogHowToBookDoctor = lazy(() => import("./pages/blog/how-to-book-doctor-online-pakistan"));
const BlogBestLabTests = lazy(() => import("./pages/blog/best-lab-tests-routine-checkup-pakistan"));
const BlogTopHospitals = lazy(() => import("./pages/blog/top-10-hospitals-pakistan-2025"));
const KarachiPage = lazy(() => import("./pages/locations/KarachiPage"));
const LahorePage = lazy(() => import("./pages/locations/LahorePage"));
const IslamabadPage = lazy(() => import("./pages/locations/IslamabadPage"));
const PeshawarPage = lazy(() => import("./pages/locations/PeshawarPage"));
const MardanPage = lazy(() => import("./pages/locations/MardanPage"));
const SwatPage = lazy(() => import("./pages/locations/SwatPage"));
const ChitralPage = lazy(() => import("./pages/locations/ChitralPage"));
const NosheraPage = lazy(() => import("./pages/locations/NosheraPage"));
const SwabiPage = lazy(() => import("./pages/locations/SwabiPage"));
const AzadKashmirPage = lazy(() => import("./pages/locations/AzadKashmirPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminPartners = lazy(() => import("./pages/AdminPartners"));
const AdminHeroImages = lazy(() => import("./pages/AdminHeroImages"));
const AdminVerifications = lazy(() => import("./pages/AdminVerifications"));
const AdminDocuments = lazy(() => import("./pages/AdminDocuments"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
const AdminUserManagement = lazy(() => import("./pages/AdminUserManagement"));
const AdminRecommendedServices = lazy(() => import("./pages/AdminRecommendedServices"));
const AdminEntities = lazy(() => import("./pages/AdminEntities"));
const DevelopersPage = lazy(() => import("./pages/DevelopersPage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const DisclaimerPage = lazy(() => import("./pages/DisclaimerPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const UrduHomePage = lazy(() => import("./pages/UrduHomePage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const CookiesPage = lazy(() => import("./pages/CookiesPage"));
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
const WeightLossPage = lazy(() => import("./pages/WeightLossPage"));

const InvoiceDetailPage = lazy(() => import("./pages/InvoiceDetailPage"));
import { CompareProvider } from "./contexts/CompareContext";
import { SocketProvider } from "./context/SocketContext";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import { HelmetProvider } from 'react-helmet-async';

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
            <Route path="/urdu" element={<Suspense fallback={<HomeSkeleton />}><UrduHomePage /></Suspense>} />
            <Route path="/faq" element={<Suspense fallback={<PageSkeleton />}><FAQPage /></Suspense>} />
            <Route path="/cookies" element={<Suspense fallback={<PageSkeleton />}><CookiesPage /></Suspense>} />
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
            <Route path="/weight-loss" element={<Suspense fallback={<PageSkeleton />}><WeightLossPage /></Suspense>} />
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
            <Route path="/blog/how-to-book-doctor-online-pakistan" element={<Suspense fallback={<BlogSkeleton />}><BlogHowToBookDoctor /></Suspense>} />
            <Route path="/blog/best-lab-tests-routine-checkup-pakistan" element={<Suspense fallback={<BlogSkeleton />}><BlogBestLabTests /></Suspense>} />
            <Route path="/blog/top-10-hospitals-pakistan-2025" element={<Suspense fallback={<BlogSkeleton />}><BlogTopHospitals /></Suspense>} />
            <Route path="/karachi" element={<Suspense fallback={<PageSkeleton />}><KarachiPage /></Suspense>} />
            <Route path="/lahore" element={<Suspense fallback={<PageSkeleton />}><LahorePage /></Suspense>} />
            <Route path="/islamabad" element={<Suspense fallback={<PageSkeleton />}><IslamabadPage /></Suspense>} />
            <Route path="/peshawar" element={<Suspense fallback={<PageSkeleton />}><PeshawarPage /></Suspense>} />
            <Route path="/mardan" element={<Suspense fallback={<PageSkeleton />}><MardanPage /></Suspense>} />
            <Route path="/swat" element={<Suspense fallback={<PageSkeleton />}><SwatPage /></Suspense>} />
            <Route path="/chitral" element={<Suspense fallback={<PageSkeleton />}><ChitralPage /></Suspense>} />
            <Route path="/noshera" element={<Suspense fallback={<PageSkeleton />}><NosheraPage /></Suspense>} />
            <Route path="/swabi" element={<Suspense fallback={<PageSkeleton />}><SwabiPage /></Suspense>} />
            <Route path="/azad-kashmir" element={<Suspense fallback={<PageSkeleton />}><AzadKashmirPage /></Suspense>} />
            <Route path="/about" element={<Suspense fallback={<PageSkeleton />}><AboutPage /></Suspense>} />
            <Route path="/contact" element={<Suspense fallback={<PageSkeleton />}><ContactPage /></Suspense>} />
            <Route path="/developers" element={<Suspense fallback={<PageSkeleton />}><DevelopersPage /></Suspense>} />
            <Route path="/how-it-works" element={<Suspense fallback={<PageSkeleton />}><HowItWorksPage /></Suspense>} />
            <Route path="/disclaimer" element={<Suspense fallback={<PageSkeleton />}><DisclaimerPage /></Suspense>} />
            <Route path="/privacy" element={<Suspense fallback={<PageSkeleton />}><PrivacyPolicyPage /></Suspense>} />
            <Route path="/admin" element={<Suspense fallback={<AdminSkeleton />}><AdminPanel /></Suspense>} />
            <Route path="/admin/partners" element={<Suspense fallback={<AdminSkeleton />}><AdminPartners /></Suspense>} />
            <Route path="/admin/hero-images" element={<Suspense fallback={<AdminSkeleton />}><AdminHeroImages /></Suspense>} />
            <Route path="/admin/verifications" element={<Suspense fallback={<AdminSkeleton />}><AdminVerifications /></Suspense>} />
            <Route path="/admin/documents" element={<Suspense fallback={<AdminSkeleton />}><AdminDocuments /></Suspense>} />
            <Route path="/admin/payments" element={<Suspense fallback={<AdminSkeleton />}><AdminPayments /></Suspense>} />
            <Route path="/admin/user-management" element={<Suspense fallback={<AdminSkeleton />}><AdminUserManagement /></Suspense>} />
            <Route path="/admin/recommended-services" element={<Suspense fallback={<AdminSkeleton />}><AdminRecommendedServices /></Suspense>} />
            <Route path="/admin/entities" element={<Suspense fallback={<AdminSkeleton />}><AdminEntities /></Suspense>} />
            <Route path="*" element={<Suspense fallback={<PageSkeleton />}><NotFound /></Suspense>} />
          </Routes>
        </Suspense>
        <FloatingChat />
        <WhatsAppButton />
        <GlobalConnectionListener />
        <VerificationNotificationModal />
        <Footer />
      </div>
    </BrowserRouter>
  );
};

const App = () => (
  <HelmetProvider>
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
  </HelmetProvider>
);

export default App;
