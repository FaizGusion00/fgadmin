
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-fg-purple/5 to-fg-blue/5">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">FGAdmin</h1>
        <p className="text-muted-foreground text-center mt-2">IT Company Admin Management</p>
      </div>
      
      <div className="w-full max-w-md p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100">
        {children}
      </div>
    </div>
  );
};
