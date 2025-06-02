import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Calendar from "./pages/Calendar";
import Clients from "./pages/Clients";
import Sales from "./pages/Sales";
import Notes from "./pages/Notes";
import TodoList from "./pages/TodoList";
import Settings from "./pages/Settings";
import RecentActivity from "./pages/RecentActivity";
import Notifications from "./pages/Notifications";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CurrencyProvider>
        <ThemeProvider>
          <TooltipProvider>
            <SidebarProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  
                  {/* Protected routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Dashboard />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/projects" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Projects />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/calendar" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Calendar />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/clients" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Clients />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/sales" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Sales />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/notes" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Notes />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/todos" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <TodoList />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Settings />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/recent-activity" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <RecentActivity />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/notifications" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Notifications />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  
                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </CurrencyProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
