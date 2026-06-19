const CATEGORY_ORDER = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const CATEGORY_ICONS = {
  Breakfast: '☕',
  Lunch: '🥗',
  Dinner: '🍽️',
  Snacks: '🍎',
  Other: '🍴',
};

function groupByCategory(logs) {
  const grouped = {};
  for (const log of logs) {
    const cat = log.mfp_meal_category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(log);
  }
  return grouped;
}

function itemSummary(items) {
  if (!items.length) return '';
  if (items.length === 1) return items[0].meal_name;
  return `${items[0].meal_name} and ${items.length - 1} more`;
}

export default function MealList({ logs }) {
  if (!logs.length) {
    return (
      <div className="card text-center py-10">
        <p className="text-[#8b95a8]">No meals synced yet.</p>
        <p className="text-xs text-[#8b95a8] opacity-60 mt-1">MFP syncs every 2 hours.</p>
      </div>
    );
  }

  const grouped = groupByCategory(logs);
  const categories = [...CATEGORY_ORDER, ...Object.keys(grouped).filter(k => !CATEGORY_ORDER.includes(k))];

  return (
    <div className="space-y-3">
      <h2 className="text-white font-bold text-lg px-1">Diary</h2>
      {categories.filter(c => grouped[c]).map(category => {
        const items = grouped[category];
        const categoryCalories = items.reduce((s, l) => s + (l.calories || 0), 0);
        const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.Other;

        return (
          <div key={category} className="card">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-base">{category}</h3>
                <p className="text-[#8b95a8] text-sm truncate">{itemSummary(items)}</p>
              </div>
              <span className="text-white font-bold text-base tabular-nums shrink-0">{categoryCalories} cal</span>
            </div>

            <div className="border-t border-[#2a2d38] pt-3 space-y-2">
              {items.map((log, i) => (
                <div key={log.id} className="flex justify-between items-center">
                  <span className="text-sm text-[#c8cfd9] flex-1 min-w-0 truncate pr-3">{log.meal_name}</span>
                  <div className="flex items-center gap-2.5 text-xs shrink-0">
                    <span className="text-[#f59e0b] tabular-nums">{log.protein}p</span>
                    <span className="text-[#10b981] tabular-nums">{log.carbs}c</span>
                    <span className="text-[#c084fc] tabular-nums">{log.fat}f</span>
                    <span className="text-white font-semibold tabular-nums w-10 text-right">{log.calories}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
