import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

type UserMode = 'patient' | 'provider';

interface ModeContextType {
  currentMode: UserMode;
  switchToPatientMode: () => void;
  switchToProviderMode: () => void;
  canPurchaseServices: boolean;
  isProvider: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const useMode = () => {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentMode, setCurrentMode] = useState<UserMode>('patient');

  // Check if user is a provider (doctor, clinic/hospital, laboratory, pharmacy)
  const isProvider = user?.role && ['doctor', 'clinic/hospital', 'laboratory', 'pharmacy'].includes(user.role);

  useEffect(() => {
    if (user) {
      // Load saved mode from localStorage or default based on user role
      const savedMode = localStorage.getItem(`sehatkor_mode_${user.id}`);
      if (savedMode && (savedMode === 'patient' || savedMode === 'provider')) {
        setCurrentMode(savedMode as UserMode);
      } else {
        // Default mode: providers start in provider mode, patients always in patient mode
        const defaultMode = isProvider ? 'provider' : 'patient';
        setCurrentMode(defaultMode);
      }
    } else {
      // Not logged in, default to patient mode
      setCurrentMode('patient');
    }
  }, [user, isProvider]);

  const switchToPatientMode = () => {
    setCurrentMode('patient');
    if (user) {
      localStorage.setItem(`sehatkor_mode_${user.id}`, 'patient');
    }
  };

  const switchToProviderMode = () => {
    if (isProvider) {
      setCurrentMode('provider');
      if (user) {
        localStorage.setItem(`sehatkor_mode_${user.id}`, 'provider');
      }
    }
  };

  // Can purchase services only in patient mode
  const canPurchaseServices = currentMode === 'patient';

  const value = {
    currentMode,
    switchToPatientMode,
    switchToProviderMode,
    canPurchaseServices,
    isProvider: !!isProvider
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
};
