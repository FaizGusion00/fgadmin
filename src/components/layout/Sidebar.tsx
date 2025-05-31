
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu, 
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";

import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  LineChart, 
  Calendar, 
  FileText, 
  ListTodo, 
  BookOpen, 
  Settings, 
  LogOut
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export const AppSidebar = () => {
  const { state } = useSidebar(); // Using state instead of collapsed
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { logout } = useAuth();
  
  // Initial open states for sidebar groups
  const [groupOpenStates, setGroupOpenStates] = useState({
    dashboard: true,
    projects: false,
    clients: false,
    tools: false,
  });
  
  // Function to handle toggling a group
  const toggleGroup = (group: keyof typeof groupOpenStates) => {
    setGroupOpenStates(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };
  
  // Helper function to determine if a route or its children are active
  const isRouteActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Helper function to get NavLink classes based on active state
  const getLinkClasses = ({ isActive }: { isActive: boolean }) => {
    return isActive ? "nav-link active" : "nav-link";
  };
  
  // Add a small delay when navigating to improve UX
  const handleNavigation = (callback?: () => void) => {
    // Small delay for visual feedback
    setTimeout(() => {
      if (callback) callback();
    }, 150);
  };

  return (
    <Sidebar
      className={`h-screen ${
        collapsed ? "w-[70px] transition-all duration-300" : "w-64 transition-all duration-300"
      }`}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <div className="text-xl font-bold gradient-text">FGAdmin</div>
        )}
        <SidebarTrigger className="hover:bg-slate-100 rounded-md p-1" />
      </div>

      <SidebarContent className="p-2">
        {/* Dashboard Group */}
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "sr-only" : ""}`}>
            Dashboard
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive('/dashboard')}>
                  <NavLink 
                    to="/dashboard" 
                    className={getLinkClasses}
                    onClick={() => handleNavigation()}
                  >
                    <LayoutDashboard size={18} />
                    {!collapsed && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Projects Group */}
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "sr-only" : ""}`}>
            Projects
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive('/projects')}>
                  <NavLink 
                    to="/projects" 
                    className={getLinkClasses}
                    onClick={() => handleNavigation()}
                  >
                    <FolderKanban size={18} />
                    {!collapsed && <span>Projects</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive('/calendar')}>
                  <NavLink 
                    to="/calendar" 
                    className={getLinkClasses}
                    onClick={() => handleNavigation()}
                  >
                    <Calendar size={18} />
                    {!collapsed && <span>Calendar</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Clients Group */}
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "sr-only" : ""}`}>
            Business
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive('/clients')}>
                  <NavLink 
                    to="/clients" 
                    className={getLinkClasses}
                    onClick={() => handleNavigation()}
                  >
                    <Users size={18} />
                    {!collapsed && <span>Clients</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive('/sales')}>
                  <NavLink 
                    to="/sales" 
                    className={getLinkClasses}
                    onClick={() => handleNavigation()}
                  >
                    <LineChart size={18} />
                    {!collapsed && <span>Sales</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Tools Group */}
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "sr-only" : ""}`}>
            Tools
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive('/notes')}>
                  <NavLink 
                    to="/notes" 
                    className={getLinkClasses}
                    onClick={() => handleNavigation()}
                  >
                    <FileText size={18} />
                    {!collapsed && <span>Notes</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive('/todos')}>
                  <NavLink 
                    to="/todos" 
                    className={getLinkClasses}
                    onClick={() => handleNavigation()}
                  >
                    <ListTodo size={18} />
                    {!collapsed && <span>To-Do List</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {/* Bottom section */}
      <div className="mt-auto p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isRouteActive('/settings')}>
                  <NavLink 
                    to="/settings" 
                    className={getLinkClasses}
                    onClick={() => handleNavigation()}
                  >
                    <Settings size={18} />
                    {!collapsed && <span>Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleNavigation(logout)}
                >
                  <LogOut size={18} />
                  {!collapsed && <span>Logout</span>}
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </div>
    </Sidebar>
  );
};
