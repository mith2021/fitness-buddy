import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useFoodLog(userId) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTodayLogs = useCallback(async () => {
    if (!userId) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', today.toISOString())
      .order('created_at', { ascending: true });

    if (!error) setLogs(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchTodayLogs();

    // Realtime subscription — updates when MFP sync fires
    const channel = supabase
      .channel('food_logs_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'food_logs',
        filter: `user_id=eq.${userId}`
      }, () => fetchTodayLogs())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId, fetchTodayLogs]);

  const totalCalories = logs.reduce((sum, l) => sum + (l.calories || 0), 0);
  const totalProtein = logs.reduce((sum, l) => sum + (l.protein || 0), 0);
  const totalCarbs = logs.reduce((sum, l) => sum + (l.carbs || 0), 0);
  const totalFat = logs.reduce((sum, l) => sum + (l.fat || 0), 0);

  return { logs, loading, totalCalories, totalProtein, totalCarbs, totalFat, refetch: fetchTodayLogs };
}
