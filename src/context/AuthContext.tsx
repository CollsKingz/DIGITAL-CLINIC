import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, Clinic, AppNotification } from '../types/schema';
import { DEMO_PERSONAS, INITIAL_CLINICS } from '../services/mockData';
import { ClinicService } from '../services/clinicService';

interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  clinic: Clinic;
  setRole: (role: UserRole) => void;
  setClinic: (clinic: Clinic) => void;
  switchPersona: (role: UserRole) => void;
  notifications: AppNotification[];
  unreadCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  sendAlert: (title: string, body: string, targetUserId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(DEMO_PERSONAS.patient);
  const [role, setRoleState] = useState<UserRole>('patient');
  const [clinic, setClinic] = useState<Clinic>(INITIAL_CLINICS[0]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Listen to notifications for current user
  useEffect(() => {
    const unsubscribe = ClinicService.subscribeNotifications(user.uid, (items) => {
      setNotifications(items);
    });
    return () => unsubscribe();
  }, [user.uid]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (DEMO_PERSONAS[newRole]) {
      setUser(DEMO_PERSONAS[newRole]);
    }
  };

  const switchPersona = (newRole: UserRole) => {
    setRole(newRole);
  };

  const markNotificationRead = async (id: string) => {
    await ClinicService.markNotificationRead(id);
  };

  const sendAlert = async (title: string, body: string, targetUserId?: string) => {
    await ClinicService.sendNotification({
      userId: targetUserId || user.uid,
      title,
      body,
      type: 'queue_update'
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider value={{
      user,
      role,
      clinic,
      setRole,
      setClinic,
      switchPersona,
      notifications,
      unreadCount,
      markNotificationRead,
      sendAlert
    }}>
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
