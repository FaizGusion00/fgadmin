
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-fg-purple/10 to-fg-blue/10">
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-fg-light-purple/10 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-fg-purple/10 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md px-6 py-10 sm:py-16 flex flex-col items-center">
        <div className="mb-8 text-center">
          <div className="inline-block p-2 bg-white rounded-2xl shadow-sm mb-3">
            <h1 className="text-3xl font-bold gradient-text">FGAdmin</h1>
          </div>
          <p className="text-muted-foreground">IT Company Admin Management</p>
        </div>
        
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100/80 overflow-hidden">
          <div className="p-6 sm:p-8">
            {children}
          </div>
        </div>
        
        <div className="mt-6 text-sm text-center text-muted-foreground">
          <p>&copy; 2025 FGAdmin. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
