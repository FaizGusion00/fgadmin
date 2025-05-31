
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, UserPlus } from "lucide-react";
import { WaterWaveBackground } from "@/components/WaterWaveBackground";
import { FGAdminLogo } from "@/components/FGAdminLogo";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { signUp, signInWithOAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Terms required",
        description: "Please accept the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
      });
      
      if (result.success) {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        navigate("/login");
      } else {
        toast({
          title: "Registration failed",
          description: result.error || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setLoading(true);
    try {
      const result = await signInWithOAuth(provider);
      if (!result.success) {
        toast({
          title: "Sign up failed",
          description: result.error || `Failed to sign up with ${provider}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-950 dark:to-emerald-950 overflow-hidden">
      {/* Animated Water Wave Background */}
      <WaterWaveBackground />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-emerald-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 w-full max-w-md px-6 py-10 sm:py-16 flex flex-col items-center">
        {/* Logo and Title */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <FGAdminLogo size="lg" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            FGAdmin
          </h1>
          <p className="text-muted-foreground text-lg">IT Company Management</p>
        </div>
        
        {/* Floating Register Card */}
        <Card className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 dark:border-slate-700/30 shadow-2xl shadow-emerald-500/10 dark:shadow-blue-500/10 hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
          <CardContent className="p-8">
            {/* Welcome Header */}
            <div className="text-center space-y-2 mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600 mb-4 shadow-lg">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
              <p className="text-muted-foreground">
                Join FGAdmin and start managing your business
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-11 h-12 bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200 hover:shadow-md focus:shadow-lg"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="pl-11 h-12 bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200 hover:shadow-md focus:shadow-lg"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200 hover:shadow-md focus:shadow-lg"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200 hover:shadow-md focus:shadow-lg"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200 hover:shadow-md focus:shadow-lg"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 rounded border-border"
                  disabled={loading}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-5">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:text-primary/80 transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:text-primary/80 transition-colors">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Create account</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/60 dark:border-slate-700/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/80 dark:bg-slate-900/80 px-3 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-12 bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 hover:shadow-md"
                  disabled={loading}
                  onClick={() => handleOAuthSignIn('google')}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12 bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 hover:shadow-md"
                  disabled={loading}
                  onClick={() => handleOAuthSignIn('github')}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </Button>
              </div>
            </div>

            <div className="mt-8 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link 
                to="/login" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center text-sm">
          <p className="text-muted-foreground">&copy; 2025 FGAdmin. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
