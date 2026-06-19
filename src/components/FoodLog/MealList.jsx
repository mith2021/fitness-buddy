const CATEGORY_ORDER = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

function groupByCategory(logs) {
  const grouped = {};
  for (const log of logs) {
    const cat = log.mfp_meal_category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(log);
  }
  return grouped;
}

export default function MealList({ logs }) {
  if (!logs.length) {
    return (
      <div className="card text-center py-10">
        <p className="text-gray-400">No meals synced yet.</p>
        <p className="text-xs text-gray-500 mt-1">MFP syncs every 2 hours.</p>
      </div>
    );
  }

  const grouped = groupByCategory(logs);
  const categories = [...CATEGORY_ORDER, ...Object.keys(grouped).filter(k => !CATEGORY_ORDER.includes(k))];

  return (
    <div className="space-y-3">
      {categories.filter(c => grouped[c]).map(category => {
        const categoryCalories = grouped[category].reduce((s, l) => s + l.calories, 0);
        return (
          <div key={category} className="card">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{category}</h3>
              <span className="text-sm font-semibold text-white">{categoryCalories} cal</span>
            </div>
            <div className="space-y-0.5">
              {grouped[category].map((log, i) => (
                <div
                  key={log.id}
                  className={`flex justify-between items-center py-2 ${i < grouped[category].length - 1 ? 'border-b border-[#2a2a2a]' : ''}`}
                >
                  <span className="text-sm text-white">{log.meal_name}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-yellow-400">{log.protein}p</span>
                    <span className="text-cyan-400">{log.carbs}c</span>
                    <span className="text-purple-400">{log.fat}f</span>
                    <span className="text-white font-semibold w-12 text-right">{log.calories}</span>
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
