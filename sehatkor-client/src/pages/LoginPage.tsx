import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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

// Add SVGs for Google and Facebook
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <g>
      <path d="M44.5 20H24V28.5H36.9C35.5 33.1 31.2 36.5 24 36.5C16.3 36.5 10 30.2 10 22.5C10 14.8 16.3 8.5 24 8.5C27.2 8.5 30 9.6 32.1 11.5L38.1 5.5C34.5 2.2 29.6 0 24 0C10.7 0 0 10.7 0 24C0 37.3 10.7 48 24 48C36.6 48 47.1 37.7 47.1 24C47.1 22.3 46.9 21.1 46.6 20H44.5Z" fill="#FFC107"/>
      <path d="M6.3 14.7L13.5 19.6C15.3 15.2 19.3 12 24 12C26.5 12 28.7 12.9 30.4 14.3L36.2 8.5C32.7 5.5 28.1 3.5 24 3.5C15.7 3.5 8.6 8.9 6.3 14.7Z" fill="#FF3D00"/>
      <path d="M24 44.5C31.1 44.5 37.1 40.2 39.6 34.2L32.8 29.7C31.2 32.7 27.9 34.5 24 34.5C19.3 34.5 15.3 31.3 13.5 26.9L6.3 31.8C8.6 37.6 15.7 44.5 24 44.5Z" fill="#4CAF50"/>
      <path d="M46.6 20H44.5V20H24V28.5H36.9C36.2 30.7 34.8 32.6 32.8 34.2L39.6 38.7C43.1 35.5 46.6 30.7 46.6 24C46.6 22.9 46.5 21.9 46.6 20Z" fill="#1976D2"/>
    </g>
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <rect width="32" height="32" rx="16" fill="#1877F3"/>
    <path d="M22 16.1C22 13.1 19.9 11 16.9 11C14.1 11 12 13.1 12 16.1C12 18.7 13.7 20.6 16.1 20.9V17.2H14.7V16.1H16.1V15.2C16.1 13.9 16.8 13.3 18 13.3C18.5 13.3 18.9 13.4 19 13.4V14.7H18.3C17.7 14.7 17.6 15 17.6 15.3V16.1H19L18.8 17.2H17.6V20.9C20 20.6 22 18.7 22 16.1Z" fill="white"/>
  </svg>
);

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

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
      const response = await fetch('http://localhost:4000/api/auth/login', {
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
      // Block unverified providers (except patients)
      if (["doctor", "clinic", "laboratory", "pharmacy"].includes(data.user.role) && !data.user.isVerified) {
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
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to your SehatKor account
          </p>
        </div>

        <Card className="card-healthcare">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Social Login */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center rounded-full border-2 border-gray-200 bg-white hover:bg-gray-50 shadow-sm font-semibold text-base py-3"
                onClick={() => handleSocialLogin("Google")}
              >
                <GoogleIcon />
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center rounded-full border-2 border-gray-200 bg-white hover:bg-gray-50 shadow-sm font-semibold text-base py-3"
                onClick={() => handleSocialLogin("Facebook")}
              >
                <FacebookIcon />
                Continue with Facebook
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

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
                    className="pl-10"
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
                    className="pl-10 pr-10"
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
                className="w-full py-6 text-lg"
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