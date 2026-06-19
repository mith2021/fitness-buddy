export default function DailyTotal({ totalCalories, goalCalories, totalProtein, totalCarbs, totalFat }) {
  const pct = Math.min(100, Math.round((totalCalories / goalCalories) * 100));
  const remaining = goalCalories - totalCalories;
  const overBudget = remaining < 0;

  return (
    <div className="card mb-4">
      {/* Calorie display */}
      <div className="flex justify-between items-baseline mb-1">
        <div>
          <span className="text-7xl font-bold text-white leading-none">{totalCalories}</span>
          <span className="text-gray-400 text-sm ml-2">/ {goalCalories} cal</span>
        </div>
        <span className={`text-sm font-semibold ${overBudget ? 'text-orange-400' : 'text-green-400'}`}>
          {overBudget ? `${Math.abs(remaining)} over` : `${remaining} left`}
        </span>
      </div>

      <p className="text-gray-400 text-xs mb-3">calories today</p>

      {/* Progress bar */}
      <div className="h-3 bg-[#2a2a2a] rounded-full mb-5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${overBudget ? 'bg-orange-400' : 'bg-green-500'}`}
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
    <div className="text-center bg-[#0f0f0f] rounded-lg py-3">
      <div className="text-2xl font-bold" style={{ color }}>{value}g</div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}
