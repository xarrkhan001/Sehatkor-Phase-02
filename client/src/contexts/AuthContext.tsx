import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'clinic/hospital' | 'laboratory' | 'pharmacy';
  isVerified: boolean;
  avatar?: string;
}

type UserMode = 'patient' | 'provider';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'isVerified'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateCurrentUser: (partial: Partial<User>) => void;
  mode: UserMode;
  toggleMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<UserMode>('patient');

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('sehatkor_current_user') || localStorage.getItem('sehatkor_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      // Set initial mode
      const savedMode = localStorage.getItem('sehatkor_user_mode') as UserMode;
      if (savedMode) {
        setMode(savedMode);
      } else if (parsedUser.role !== 'patient') {
        setMode('provider');
      } else {
        setMode('patient');
      }
    }
  }, []);

  const login = async (userOrEmail: any, tokenOrPassword?: string): Promise<boolean> => {
    if (typeof userOrEmail === 'string') {
      // Old method: login with email and password
      const users = JSON.parse(localStorage.getItem('sehatkor_users') || '[]');
      const foundUser = users.find((u: any) => u.email === userOrEmail && u.password === tokenOrPassword);
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('sehatkor_current_user', JSON.stringify(userWithoutPassword));
        return true;
      }
      return false;
    } else {
      // New method: login with user object and token
      const userData = userOrEmail;
      const token = tokenOrPassword;

      const normalizedUser = { ...userData, id: userData.id || userData._id };
      setUser(normalizedUser);
      localStorage.setItem('sehatkor_current_user', JSON.stringify(normalizedUser));
      if (token) {
        localStorage.setItem('sehatkor_token', token);
      }
      return true;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'isVerified'> & { password: string }): Promise<boolean> => {
    try {
      // Check if user already exists
      const users = JSON.parse(localStorage.getItem('sehatkor_users') || '[]');
      const existingUser = users.find((u: any) => u.email === userData.email);
      
      if (existingUser) {
        return false; // User already exists
      }

      // Create new user
      const newUser = {
        ...userData,
        id: Date.now().toString(),
        isVerified: userData.role === 'patient' // Patients are auto-verified, others need approval
      };

      // Save to users list
      users.push(newUser);
      localStorage.setItem('sehatkor_users', JSON.stringify(users));

      // Auto login after registration
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('sehatkor_user', JSON.stringify(userWithoutPassword));
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setMode('patient');
    localStorage.removeItem('sehatkor_current_user');
    localStorage.removeItem('sehatkor_user');
    localStorage.removeItem('sehatkor_user_mode');
    localStorage.removeItem('sehatkor_token');
  };

  const toggleMode = () => {
    if (user?.role === 'patient') return; // Patients can't switch modes
    setMode(prevMode => {
      const newMode = prevMode === 'provider' ? 'patient' : 'provider';
      localStorage.setItem('sehatkor_user_mode', newMode);
      return newMode;
    });
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    mode,
    toggleMode,
    updateCurrentUser: (partial: Partial<User>) => {
      setUser((prev) => {
        const next = { ...(prev as User), ...partial } as User;
        localStorage.setItem('sehatkor_current_user', JSON.stringify(next));
        return next;
      });
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};