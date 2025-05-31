
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full filter blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full filter blur-2xl animate-pulse animation-delay-2000"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md px-6 py-8 flex flex-col items-center">
        {/* Logo and branding */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 dark:border-slate-700/50 mb-4">
            <h1 className="text-4xl font-bold gradient-text">FGAdmin</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">IT Company Admin Management</p>
        </div>
        
        {/* Main content card */}
        <div className="w-full glass-panel overflow-hidden">
          <div className="p-8">
            {children}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; 2025 FGAdmin. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
