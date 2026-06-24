import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getCoachMessage, chatWithCoach } from '../lib/openrouter';

export function useCoach(userId, logs, prefs) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
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

  // Auto-coach when new meals appear
  useEffect(() => {
    if (!userId || !prefs || logs.length === 0) return;
    if (!prefs.mfp_username) return;
    if (logs.length <= prevLogCount.current) return;
    prevLogCount.current = logs.length;

    const trigger = async () => {
      setLoading(true);
      try {
        const message = await getCoachMessage(logs, prefs.daily_goal_calories, prefs);
        const { data } = await supabase
          .from('coaching_history')
          .insert({ user_id: userId, coach_message: message, role: 'assistant' })
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
  }, [logs.length, userId, prefs?.daily_goal_calories, prefs?.dietary_notes, prefs?.mfp_username]);

  // User asks the coach a question
  const sendMessage = useCallback(async (text) => {
    if (!userId || !text.trim() || sending) return;
    setSending(true);

    // Persist + optimistically show the user's message
    const { data: userMsg } = await supabase
      .from('coaching_history')
      .insert({ user_id: userId, coach_message: text.trim(), role: 'user' })
      .select()
      .single();

    const history = [...messages, userMsg].map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.coach_message,
    }));
    setMessages(prev => [...prev, userMsg]);

    try {
      const reply = await chatWithCoach(history, logs, prefs?.daily_goal_calories, prefs);
      const { data: botMsg } = await supabase
        .from('coaching_history')
        .insert({ user_id: userId, coach_message: reply, role: 'assistant' })
        .select()
        .single();
      if (botMsg) setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error('Chat error:', e);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        coach_message: "Couldn't reach the coach. Try again.",
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
    }
  }, [userId, messages, logs, prefs, sending]);

  return { messages, loading, sending, sendMessage };
}
