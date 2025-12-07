import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, Role } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, role: Role) => Promise<boolean>; // Changed to return success status
  signup: (name: string, email: string, role: Role) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial Seed Data
const SEED_ADMIN: User = {
  id: 'admin-seed',
  name: 'System Admin',
  email: 'admin@nexus.com',
  role: 'admin',
  avatar: 'https://ui-avatars.com/api/?name=System+Admin&background=6366f1&color=fff'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for active session
    const sessionUser = localStorage.getItem('nexus_session_user');
    
    // Ensure user database exists
    const usersDB = localStorage.getItem('nexus_users_db');
    if (!usersDB) {
      localStorage.setItem('nexus_users_db', JSON.stringify([SEED_ADMIN]));
    }

    if (sessionUser) {
      setAuth({
        user: JSON.parse(sessionUser),
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuth(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const usersDB: User[] = JSON.parse(localStorage.getItem('nexus_users_db') || '[]');
    const foundUser = usersDB.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (foundUser) {
      localStorage.setItem('nexus_session_user', JSON.stringify(foundUser));
      setAuth({
        user: foundUser,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, role: Role): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const usersDB: User[] = JSON.parse(localStorage.getItem('nexus_users_db') || '[]');
    
    if (usersDB.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return false; // User exists
    }

    const newUser: User = {
      id: `usr-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`
    };

    usersDB.push(newUser);
    localStorage.setItem('nexus_users_db', JSON.stringify(usersDB));
    
    // Auto login after signup
    localStorage.setItem('nexus_session_user', JSON.stringify(newUser));
    setAuth({
      user: newUser,
      isAuthenticated: true,
      isLoading: false,
    });
    
    return true;
  };

  const logout = () => {
    localStorage.removeItem('nexus_session_user');
    setAuth({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};