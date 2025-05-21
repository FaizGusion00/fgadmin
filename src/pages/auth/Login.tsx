
import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, LogIn } from "lucide-react";

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
  
  // Get return URL from location state or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Auto-fill demo credentials when "Use demo account" is clicked
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
      toast.success("Login successful! Redirecting...");
      navigate(from);
    }
  };
  
  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold gradient-text">Welcome back</h1>
        <p className="text-muted-foreground mt-1">Sign in to your FGAdmin account</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="name@example.com" 
                    type="email" 
                    className="h-11"
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
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="••••••••" 
                      type={showPassword ? "text" : "password"} 
                      className="h-11 pr-10"
                      autoComplete="current-password"
                      {...field} 
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff size={18} aria-hidden="true" />
                      ) : (
                        <Eye size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full btn-gradient h-11 mt-6"
            disabled={submitting || loading}
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </div>
            )}
          </Button>
        </form>
      </Form>
      
      <div className="mt-8 relative flex items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="mx-2 flex-shrink text-sm text-gray-400">or</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>
      
      <Button 
        type="button" 
        variant="outline" 
        className="w-full mt-4"
        onClick={fillDemoCredentials}
      >
        Use demo account
      </Button>
      
      <div className="mt-6 text-center text-sm">
        <p>
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
      
      <div className="mt-8 text-center text-xs text-muted-foreground p-4 bg-slate-50 rounded-lg">
        <p className="font-medium">Demo credentials</p>
        <p>Email: admin@example.com</p>
        <p>Password: password</p>
      </div>
    </AuthLayout>
  );
};

export default Login;
