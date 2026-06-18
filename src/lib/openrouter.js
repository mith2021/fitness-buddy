const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const buildCoachPrompt = (todayLogs, dailyGoal, preferences) => `
User logged: ${todayLogs.map(l => `${l.meal_name} (${l.calories}cal)`).join(', ')}
Today total: ${todayLogs.reduce((sum, l) => sum + l.calories, 0)}cal
Goal: ${dailyGoal}cal
Notes: ${preferences?.dietary_notes || 'none'}

Respond in exactly 2 sentences: [status reality check] [next move].
Format: [emoji] [suggestion]
Terse. Honest. No fluff.
`.trim();

export async function getCoachMessage(todayLogs, dailyGoal, preferences) {
  const prompt = buildCoachPrompt(todayLogs, dailyGoal, preferences);

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Verdict',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-6',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content.trim();
}
