import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import SEO from "@/components/SEO";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Stethoscope,
  Zap,
  ShieldCheck,
  Database,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import logoNew from '@/assets/logo-new.png';
import { apiUrl } from '@/config/api';



const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  // Check if user was terminated and show message
  useEffect(() => {
    if (searchParams.get('terminated') === 'true') {
      toast({
        title: "Account Terminated",
        description: "Your account has been terminated by an administrator. Please contact support if you believe this is an error.",
        variant: "destructive",
        duration: 8000,
      });
    }
  }, [searchParams, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      const data = await response.json();
      if (!response.ok) {
        toast({
          title: 'Login Failed',
          description: data.message || 'Invalid email or password',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }
      // Providers: allow login if verified OR allowedToOperate; patients always allowed
      if (["doctor", "clinic/hospital", "laboratory", "pharmacy"].includes(data.user.role) && !data.user.isVerified && !data.user.allowedToOperate) {
        toast({
          title: "Admin Verification Required",
          description: "Your account is pending admin approval. Please wait for verification before logging in.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      // Login success
      await login(data.user, data.token);
      if (data.user.role === 'patient') {
        navigate('/');
      } else {
        navigate('/dashboard');
      }
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${data.user.name || 'user'}!`,
      });
      setIsSubmitting(false);
    } catch (error: any) {
      toast({
        title: 'Login Error',
        description: error.message || 'An error occurred during login.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast({
      title: `${provider} Login`,
      description: `${provider} authentication will be implemented here`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-x-hidden">
      <SEO
        title="Login - Sehatkor | Sign In to Your Healthcare Account"
        description="Login to your Sehatkor account. Access your healthcare dashboard, manage appointments, view medical records. Secure login for patients and healthcare providers."
        canonical="https://sehatkor.pk/login"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Login - Sehatkor",
          "description": "Login page for Sehatkor platform users",
          "url": "https://sehatkor.pk/login"
        }}
      />

      {/* LEFT SIDE: BRANDING & CONTENT */}
      <div className="hidden lg:flex lg:w-[48%] bg-emerald-950 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Decorative Elemets */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-400 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3 mb-16 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform overflow-hidden">
              <img src={logoNew} alt="SehatKor Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic text-white">SehatKor</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h1 className="text-5xl font-black leading-tight tracking-tight">
              Welcome Back to <span className="text-emerald-400 underline decoration-emerald-500/30 underline-offset-8">Smart</span> Healthcare.
            </h1>
            <p className="text-emerald-100/70 text-lg font-medium max-w-md leading-relaxed">
              Pakistan's fastest growing digital health network. Whether you're a doctor or a patient, we bring healthcare to your fingertips.
            </p>

            <div className="space-y-6 pt-6">
              {[
                { icon: Zap, title: "Quick Access", desc: "Access your dashboard and health records instantly." },
                { icon: ShieldCheck, title: "Secure Login", desc: "Your account is protected with enterprise-grade security." },
                { icon: Database, title: "Centralized Data", desc: "All your medical history at one place." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="flex items-start space-x-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-800/50 flex items-center justify-center border border-emerald-700/50">
                    <item.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{item.title}</h3>
                    <p className="text-emerald-100/50 text-xs leading-none mt-1">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 pt-16">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-emerald-900 bg-emerald-700 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="user" className="w-full h-full object-cover grayscale opacity-80" />
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-emerald-400">Trusted by 50,000+ Users</p>
          </div>
          <p className="text-[10px] text-emerald-500/40 uppercase font-black tracking-widest">© 2026 SehatKor Healthcare Network • All rights reserved</p>
        </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="flex-1 bg-white lg:bg-slate-50/50 flex flex-col items-center justify-center py-12 px-4 sm:px-10 lg:px-20 relative overflow-y-auto">
        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <img src={logoNew} alt="SehatKor Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic text-emerald-950">SehatKor</span>
            </Link>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Sign In</h2>
            <p className="text-slate-500 font-medium">Access your professional healthcare dashboard.</p>
          </div>

          <Card className="border shadow-[0_20px_50px_rgba(0,0,0,0.04)] bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardContent className="p-6 sm:p-10 space-y-8">
              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email"
                      className="pl-12 py-6 bg-slate-50/50 border-slate-100 rounded-xl focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-500">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="••••••••"
                      className="pl-12 pr-12 py-6 bg-slate-50/50 border-slate-100 rounded-xl focus:bg-white transition-all"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-9 w-9 p-0 hover:bg-slate-100 rounded-lg text-slate-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 px-1">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-bold text-slate-600 cursor-pointer"
                  >
                    Keep me signed in
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full py-7 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Checking..."
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In Now <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Social Login Section */}
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-100" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-tighter">
                    <span className="bg-white px-4 text-slate-400">or use secure login</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-full max-w-[280px]">
                    <GoogleLogin
                      onSuccess={async (cred) => {
                        try {
                          setGoogleLoading(true);
                          const idToken = cred?.credential as string;
                          if (!idToken) throw new Error('Missing Google credential');

                          const res = await fetch(apiUrl('/api/auth/google'), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ idToken })
                          });
                          const data = await res.json();

                          if (!res.ok) {
                            if (res.status === 403) {
                              toast({
                                title: 'Account Not Verified',
                                description: 'Your account is pending admin approval.',
                                variant: 'destructive'
                              });
                            } else {
                              throw new Error(data.message || 'Google sign-in failed');
                            }
                          } else {
                            if (["doctor", "clinic/hospital", "laboratory", "pharmacy"].includes(data.user.role) && !data.user.isVerified && !data.user.allowedToOperate) {
                              toast({
                                title: 'Admin Verification Required',
                                description: 'Pending approval.',
                                variant: 'destructive'
                              });
                              return;
                            }
                            await login({ ...data.user, id: data.user._id }, data.token);
                            navigate(data.user.role === 'patient' ? '/' : '/dashboard');
                          }
                        } catch (err: any) {
                          toast({ title: 'Failed', description: err.message, variant: 'destructive' });
                        } finally {
                          setGoogleLoading(false);
                        }
                      }}
                      theme="outline"
                      shape="pill"
                      width="280px"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-slate-500 font-medium">
              New to SehatKor?{" "}
              <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-black uppercase text-xs tracking-widest ml-1 underline decoration-2 underline-offset-4">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;