import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Base45Logo } from '../brand/Base45Logo';
import { ShieldCheck, CheckCircle2, Lock, X } from 'lucide-react';

export const GoogleAuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { switchPersona, sendAlert } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [signedInUser, setSignedInUser] = useState<string | null>(null);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setTimeout(async () => {
      setIsLoading(false);
      setSignedInUser('Madihlaba T. (madihlabatc77@gmail.com)');
      switchPersona('patient');
      await sendAlert(
        "Google Authentication Successful",
        "Signed in via Google OAuth (madihlabatc77@gmail.com)."
      );
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150 relative">

        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-block">
            <Base45Logo variant="badge" size="lg" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Sign in to Base 45 Health</h3>
            <p className="text-xs text-slate-500">Secure Single Sign-On powered by Google Identity Services</p>
          </div>
        </div>

        {signedInUser ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-900">Authenticated via Google!</h4>
            <p className="text-xs text-emerald-700">{signedInUser}</p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer w-full"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-xs transition-all flex items-center justify-center space-x-3 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {/* Official Google Multicolor G Logo */}
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>{isLoading ? 'Verifying Google Account...' : 'Continue with Google'}</span>
            </button>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2.5 text-[11px] text-slate-500">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>HIPAA & POPIA compliant OAuth 2.0 SSL encryption.</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
