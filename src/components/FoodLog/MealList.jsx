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
      <div className="card text-center py-8">
        <p className="text-secondary">No meals synced yet.</p>
        <p className="text-xs text-secondary mt-1">MFP syncs every 2 hours.</p>
      </div>
    );
  }

  const grouped = groupByCategory(logs);
  const categories = [...CATEGORY_ORDER, ...Object.keys(grouped).filter(k => !CATEGORY_ORDER.includes(k))];

  return (
    <div className="space-y-3">
      {categories.filter(c => grouped[c]).map(category => (
        <div key={category} className="card">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider">{category}</h3>
            <span className="text-xs text-secondary">
              {grouped[category].reduce((s, l) => s + l.calories, 0)} cal
            </span>
          </div>
          <div className="space-y-1">
            {grouped[category].map(log => (
              <div key={log.id} className="flex justify-between items-center py-1">
                <span className="text-sm text-white">{log.meal_name}</span>
                <div className="flex gap-3 text-xs text-secondary">
                  <span>{log.protein}p</span>
                  <span>{log.carbs}c</span>
                  <span>{log.fat}f</span>
                  <span className="text-white font-medium">{log.calories}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
