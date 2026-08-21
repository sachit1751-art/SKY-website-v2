import React, { useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export const SessionManager: React.FC = () => {
  useEffect(() => {
    // Supabase auto-refreshes sessions in the background.
    const interval = setInterval(async () => {
      await supabase.auth.getSession();
    }, 4 * 60 * 1000); // Check every 4 minutes

    return () => clearInterval(interval);
  }, []);

  return null;
};
