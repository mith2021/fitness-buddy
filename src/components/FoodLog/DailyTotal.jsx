export default function DailyTotal({ totalCalories, goalCalories, totalProtein, totalCarbs, totalFat }) {
  const pct = Math.min(100, Math.round((totalCalories / goalCalories) * 100));
  const remaining = goalCalories - totalCalories;
  const overBudget = remaining < 0;

  return (
    <div className="card mb-4">
      <div className="flex justify-between items-baseline mb-3">
        <div>
          <span className="text-5xl font-bold text-white">{totalCalories}</span>
          <span className="text-secondary text-sm ml-2">/ {goalCalories} cal</span>
        </div>
        <span className={`text-sm font-medium ${overBudget ? 'text-orange-400' : 'text-green-400'}`}>
          {overBudget ? `${Math.abs(remaining)} over` : `${remaining} left`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-700 rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${overBudget ? 'bg-orange-400' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Macro breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <MacroStat label="Protein" value={totalProtein} color="#fbbf24" />
        <MacroStat label="Carbs" value={totalCarbs} color="#06b6d4" />
        <MacroStat label="Fat" value={totalFat} color="#a855f7" />
      </div>
    </div>
  );
}

function MacroStat({ label, value, color }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold" style={{ color }}>{value}g</div>
      <div className="text-xs text-secondary">{label}</div>
    </div>
  );
}
