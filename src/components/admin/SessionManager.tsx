import React, { useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export const SessionManager: React.FC = () => {
  useEffect(() => {
    // Supabase auto-refreshes sessions in the background.
    const interval = setInterval(async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[SessionManager] Session refresh error:', error.message);
        }
      } catch (err) {
        console.warn('[SessionManager] Failed periodic session check:', err);
      }
    }, 4 * 60 * 1000); // Check every 4 minutes

    return () => clearInterval(interval);
  }, []);

  return null;
};
