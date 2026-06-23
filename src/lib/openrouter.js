const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const buildCoachPrompt = (todayLogs, preferences) => {
  const totalCal = todayLogs.reduce((s, l) => s + l.calories, 0);
  const totalProtein = todayLogs.reduce((s, l) => s + (l.protein || 0), 0);
  const totalCarbs = todayLogs.reduce((s, l) => s + (l.carbs || 0), 0);
  const totalFat = todayLogs.reduce((s, l) => s + (l.fat || 0), 0);
  const meals = todayLogs.map(l => `${l.meal_name} (${l.calories}cal, ${l.protein}g protein)`).join('; ');

  return `
You are a direct, no-BS fitness coach. Analyze today's food log and give sharp, actionable advice.

Today's log: ${meals}
Totals: ${totalCal}cal | ${totalProtein}g protein | ${totalCarbs}g carbs | ${totalFat}g fat
User notes: ${preferences?.dietary_notes || 'none'}

Reply in 2-3 sentences max. Start with an emoji. Be specific — reference actual foods they ate. No fluff.
`.trim();
};

export async function getCoachMessage(todayLogs, dailyGoal, preferences) {
  const prompt = buildCoachPrompt(todayLogs, preferences);

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Verdict',
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content.trim();
}
