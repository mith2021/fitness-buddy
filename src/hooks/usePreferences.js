import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULTS = {
  daily_goal_calories: 2000,
  dietary_notes: '',
  mfp_username: '',
  mfp_password: '',
};

export function usePreferences(userId) {
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data) setPrefs({ ...DEFAULTS, ...data });
        setLoading(false);
      });
  }, [userId]);

  const save = async (updates) => {
    const merged = { ...prefs, ...updates, user_id: userId, id: prefs.id || crypto.randomUUID(), updated_at: new Date().toISOString() };
    const { error } = await supabase
      .from('user_preferences')
      .upsert(merged, { onConflict: 'user_id' });
    if (!error) setPrefs(merged);
    return { error };
  };

  return { prefs, loading, save };
}
