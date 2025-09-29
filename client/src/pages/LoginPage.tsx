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
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn,
  Stethoscope,
  Chrome,
  Facebook
} from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-3">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 shadow-lg shadow-red-500/20">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight">SehatKor</h1>
          <p className="text-sm text-muted-foreground">Welcome back — sign in to continue</p>
        </div>

        <Card className="border shadow-xl shadow-black/5 bg-white/70 backdrop-blur-sm rounded-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10 focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal"
                  >
                    Remember me
                  </Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full py-6 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Signing In..."
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Social Login Section */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/80 backdrop-blur px-2 text-muted-foreground rounded-md">or continue with</span>
                </div>
              </div>

              <div className="flex justify-center">
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
                            description: 'Your account is pending admin approval. Please wait for verification.',
                            variant: 'destructive'
                          });
                        } else {
                          throw new Error(data.message || 'Google sign-in failed');
                        }
                      } else {
                        // Providers: allow login if verified OR allowedToOperate on Google login too
                        if (["doctor", "clinic/hospital", "laboratory", "pharmacy"].includes(data.user.role) && !data.user.isVerified && !data.user.allowedToOperate) {
                          toast({
                            title: 'Admin Verification Required',
                            description: 'Your account is pending admin approval. Please wait for verification before logging in.',
                            variant: 'destructive'
                          });
                          return;
                        }
                        // Successful login
                        await login({ ...data.user, id: data.user._id }, data.token);
                        if (data.user.role === 'patient') {
                          navigate('/');
                        } else {
                          navigate('/dashboard');
                        }
                        toast({
                          title: 'Welcome back!',
                          description: `Signed in successfully as ${data.user.name}`,
                        });
                      }
                    } catch (err: any) {
                      toast({
                        title: 'Google Sign-in Failed',
                        description: err.message || 'Please try again',
                        variant: 'destructive'
                      });
                    } finally {
                      setGoogleLoading(false);
                    }
                  }}
                  onError={() => {
                    toast({
                      title: 'Google Sign-in Failed',
                      description: 'Please try again',
                      variant: 'destructive'
                    });
                  }}
                  theme="filled_blue"
                  shape="rectangular"
                  size="large"
                  text="signin_with"
                />
              </div>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Create one here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;