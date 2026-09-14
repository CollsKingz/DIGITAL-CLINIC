import React from 'react';
import * as Sentry from '@sentry/react';
import { AlertTriangle } from 'lucide-react';

// Add this button component to your app to test Sentry's error tracking
export function ErrorButton() {
  return (
    <button
      onClick={() => {
        throw new Error('This is your first error!');
      }}
      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all flex items-center space-x-1 cursor-pointer"
      title="Test Sentry error tracking"
    >
      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
      <span>Break the world</span>
    </button>
  );
}
