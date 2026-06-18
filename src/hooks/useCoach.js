import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getCoachMessage } from '../lib/openrouter';

export function useCoach(userId, logs, prefs) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const prevLogCount = useRef(0);

  // Load today's coaching history
  useEffect(() => {
    if (!userId) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    supabase
      .from('coaching_history')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data || []));
  }, [userId]);

  // Trigger coach when new meals appear
  useEffect(() => {
    if (!userId || !prefs || logs.length === 0) return;
    if (logs.length <= prevLogCount.current) return;
    prevLogCount.current = logs.length;

    const trigger = async () => {
      setLoading(true);
      try {
        const message = await getCoachMessage(logs, prefs.daily_goal_calories, prefs);
        const { data } = await supabase
          .from('coaching_history')
          .insert({ user_id: userId, coach_message: message })
          .select()
          .single();
        if (data) setMessages(prev => [...prev, data]);
      } catch (e) {
        console.error('Coach error:', e);
      } finally {
        setLoading(false);
      }
    };

    trigger();
  }, [logs.length, userId, prefs]);

  return { messages, loading };
}
