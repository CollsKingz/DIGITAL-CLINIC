import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, Clinic, AppNotification } from '../types/schema';
import { DEMO_PERSONAS, INITIAL_CLINICS } from '../services/mockData';
import { ClinicService } from '../services/clinicService';
import { auth, googleProvider, db } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
  // Firebase Auth additions
  firebaseUser: FirebaseUser | null;
  loadingAuth: boolean;
  signInWithGoogle: () => Promise<UserProfile>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(DEMO_PERSONAS.patient);
  const [role, setRoleState] = useState<UserRole>('patient');
  const [clinic, setClinic] = useState<Clinic>(INITIAL_CLINICS[0]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Fetch or initialize user profile document in Firestore
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setUser(data);
            setRoleState(data.role);
          } else {
            // New user registration profile in Firestore
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Community Member',
              email: fbUser.email || 'user@base45health.org',
              role: 'patient',
              clinicId: INITIAL_CLINICS[0].id,
              phone: fbUser.phoneNumber || '+27 82 000 0000',
              idNumber: '9501015800084',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUser(newProfile);
            setRoleState('patient');
          }
        } catch (err) {
          console.warn('[Firebase Auth Sync] Firestore read fallback:', err);
        }
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to notifications for current user
  useEffect(() => {
    const unsubscribe = ClinicService.subscribeNotifications(user.uid, (items) => {
      setNotifications(items);
    });
    return () => unsubscribe();
  }, [user.uid]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (!firebaseUser && DEMO_PERSONAS[newRole]) {
      setUser(DEMO_PERSONAS[newRole]);
    } else {
      setUser(prev => ({ ...prev, role: newRole }));
    }
  };

  const switchPersona = (newRole: UserRole) => {
    setRole(newRole);
  };

  const signInWithGoogle = async (): Promise<UserProfile> => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const fbUser = res.user;
      const userDocRef = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(userDocRef);

      let profile: UserProfile;
      if (snap.exists()) {
        profile = snap.data() as UserProfile;
      } else {
        profile = {
          uid: fbUser.uid,
          fullName: fbUser.displayName || 'Google Member',
          email: fbUser.email || '',
          role: 'patient',
          clinicId: INITIAL_CLINICS[0].id,
          phone: fbUser.phoneNumber || '+27 82 555 1234',
          idNumber: '9001015000081',
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, profile);
      }
      setUser(profile);
      setRoleState(profile.role);
      return profile;
    } catch (err) {
      console.error('[Google Auth Error]:', err);
      throw err;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setFirebaseUser(null);
    setUser(DEMO_PERSONAS.patient);
    setRoleState('patient');
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
      sendAlert,
      firebaseUser,
      loadingAuth,
      signInWithGoogle,
      signOut
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

