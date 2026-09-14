import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { isOfflinePersistenceEnabled } from '../../lib/firebase';

export const OfflineNetworkBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-amber-600 text-white px-4 py-2 border-b border-amber-700 flex items-center justify-between text-xs font-semibold shadow-inner animate-in slide-in-from-top duration-200">
      <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center space-x-2">
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
          <span>
            You are currently working offline. Firestore offline persistence is enabled — your queue management changes are saved locally in IndexedDB and will auto-sync when network reconnects.
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-2 bg-amber-700/60 px-2.5 py-1 rounded-lg border border-amber-500/40 text-[11px]">
          <RefreshCw className="w-3 h-3 animate-spin text-amber-200" />
          <span>Local Cache Active</span>
        </div>
      </div>
    </div>
  );
};
