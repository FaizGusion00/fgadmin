
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from "sonner";

// Define types for our auth user
export type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  avatarUrl?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
};

// Mock database of users for demo purposes
// In a real application, this would be stored in a database
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin+User&background=4318FF&color=fff'
  }
];

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for saved user session on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('fgadmin_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('fgadmin_user');
      }
    }
    setLoading(false);
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('fgadmin_user', JSON.stringify(user));
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Mock authentication - find user with matching email
      const foundUser = MOCK_USERS.find(u => u.email === email.toLowerCase());
      
      // In a real app, you would verify the password hash here
      if (foundUser && password === 'password') {
        setUser(foundUser);
        toast.success(`Welcome back, ${foundUser.name}!`);
        return true;
      } else {
        setError('Invalid email or password');
        toast.error('Invalid email or password');
        return false;
      }
    } catch (err) {
      const errorMsg = 'An error occurred during login';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Check if user already exists
      const userExists = MOCK_USERS.some(u => u.email === email.toLowerCase());
      
      if (userExists) {
        setError('A user with this email already exists');
        toast.error('A user with this email already exists');
        return false;
      }
      
      // In a real app, you would:
      // 1. Hash the password
      // 2. Store the user in a database
      // 3. Generate a proper ID
      
      // Create new user
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 11),
        email: email.toLowerCase(),
        name,
        role: 'user',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4318FF&color=fff`
      };
      
      // Add user to mock database (would be a real API call)
      MOCK_USERS.push(newUser);
      
      // Auto-login the user
      setUser(newUser);
      toast.success('Registration successful!');
      return true;
    } catch (err) {
      const errorMsg = 'An error occurred during registration';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fgadmin_user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
