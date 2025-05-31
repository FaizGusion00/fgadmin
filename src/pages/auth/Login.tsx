
import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, LogIn, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/dashboard";
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const fillDemoCredentials = () => {
    form.setValue("email", "admin@example.com");
    form.setValue("password", "password");
    toast.info("Demo credentials filled. Click Sign In to continue.");
  };
  
  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    const success = await login(values.email, values.password);
    setSubmitting(false);
    
    if (success) {
      toast.success("Welcome back! Redirecting to dashboard...");
      navigate(from);
    }
  };
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to your FGAdmin account</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="form-field">
                <FormLabel className="text-sm font-medium text-foreground">Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="name@example.com" 
                    type="email" 
                    className="form-input"
                    autoComplete="email"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="form-field">
                <FormLabel className="text-sm font-medium text-foreground">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="••••••••" 
                      type={showPassword ? "text" : "password"} 
                      className="form-input pr-12"
                      autoComplete="current-password"
                      {...field} 
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </FormControl>
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full btn-gradient h-12 text-base font-medium"
            disabled={submitting || loading}
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <LogIn className="mr-2 h-5 w-5" />
                Sign In
              </div>
            )}
          </Button>
        </form>
      </Form>
      
      <div className="mt-8 relative flex items-center">
        <div className="flex-grow border-t border-border"></div>
        <span className="mx-4 flex-shrink text-sm text-muted-foreground font-medium">or</span>
        <div className="flex-grow border-t border-border"></div>
      </div>
      
      <Button 
        type="button" 
        variant="outline" 
        className="w-full mt-6 h-12 border-2 hover:bg-muted/50 transition-all"
        onClick={fillDemoCredentials}
      >
        <Sparkles className="mr-2 h-5 w-5" />
        Use demo account
      </Button>
      
      <div className="mt-6 text-center text-sm">
        <p className="text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-semibold hover:text-primary/80 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
      
      <div className="mt-8 text-center text-sm p-4 bg-muted/30 rounded-xl border">
        <p className="font-semibold text-foreground mb-2">Demo credentials</p>
        <p className="text-muted-foreground">Email: admin@example.com</p>
        <p className="text-muted-foreground">Password: password</p>
      </div>
    </AuthLayout>
  );
};

export default Login;
