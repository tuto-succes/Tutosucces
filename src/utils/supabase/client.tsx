import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Custom storage that safely handles SSR and errors
const safeLocalStorage = {
  getItem: (key: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('localStorage getItem error:', e);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('localStorage setItem error:', e);
    }
  },
  removeItem: (key: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('localStorage removeItem error:', e);
    }
  },
};

// Create a singleton Supabase client - MODE DÉMONSTRATION
export const supabase = createClient(
  supabaseUrl,
  publicAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: safeLocalStorage as any,
      debug: false,
    },
    global: {
      headers: {
        'x-client-info': 'tuto-succes-bd',
      },
    },
  }
);

console.log('🎭 Mode démonstration - Supabase désactivé');
