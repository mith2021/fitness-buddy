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

const buildSystemPrompt = (todayLogs, dailyGoal, preferences) => {
  const totalCal = todayLogs.reduce((s, l) => s + l.calories, 0);
  const totalProtein = todayLogs.reduce((s, l) => s + (l.protein || 0), 0);
  const totalCarbs = todayLogs.reduce((s, l) => s + (l.carbs || 0), 0);
  const totalFat = todayLogs.reduce((s, l) => s + (l.fat || 0), 0);
  const meals = todayLogs.length
    ? todayLogs.map(l =>
        `- ${l.meal_name} [${l.mfp_meal_category || 'meal'}]: ${l.calories}cal, ${l.protein || 0}g protein, ${l.carbs || 0}g carbs, ${l.fat || 0}g fat`
      ).join('\n')
    : '(nothing logged yet today)';

  return `
You are Verdict, a direct, no-BS fitness and nutrition coach. You have the user's
real MyFitnessPal food log for today. Answer their questions accurately using ONLY
this data — never invent foods or numbers they didn't log. Do the math correctly.

Today's food log:
${meals}

Totals so far: ${totalCal} cal | ${totalProtein}g protein | ${totalCarbs}g carbs | ${totalFat}g fat
Daily calorie goal: ${dailyGoal || 2000} cal (${(dailyGoal || 2000) - totalCal} remaining)
User notes/goals: ${preferences?.dietary_notes || 'none'}

Be specific and concise. Reference actual foods and numbers. If asked something the
data can't answer, say so plainly. No filler, no disclaimers.
`.trim();
};

// Multi-turn chat. `history` is an array of { role: 'user'|'assistant', content }.
export async function chatWithCoach(history, todayLogs, dailyGoal, preferences) {
  const system = buildSystemPrompt(todayLogs, dailyGoal, preferences);

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
      max_tokens: 400,
      messages: [
        { role: 'system', content: system },
        ...history.map(m => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content.trim();
}
