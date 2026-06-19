export default function DailyTotal({ totalCalories, goalCalories, totalProtein, totalCarbs, totalFat, goalProtein, goalCarbs, goalFat }) {
  const calPct = Math.min(100, Math.round((totalCalories / goalCalories) * 100));
  const remaining = goalCalories - totalCalories;
  const overBudget = remaining < 0;

  const gp = goalProtein || 180;
  const gc = goalCarbs || 300;
  const gf = goalFat || 53;

  return (
    <div className="space-y-3">
      {/* Calories card */}
      <div className="card">
        <p className="text-[#8b95a8] text-sm font-medium mb-2">Calories</p>
        <div className="flex justify-between items-baseline mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-bold text-white tabular-nums leading-none">{totalCalories.toLocaleString()}</span>
            <span className="text-[#8b95a8] text-sm">cal / {goalCalories.toLocaleString()} 🔥</span>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold tabular-nums ${overBudget ? 'text-orange-400' : 'text-white'}`}>
              {Math.abs(remaining).toLocaleString()}
            </span>
            <p className="text-[#8b95a8] text-xs">{overBudget ? 'over' : 'left'}</p>
          </div>
        </div>

        {/* Blue calorie progress bar */}
        <div className="h-2.5 bg-[#2a2d38] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${calPct}%`,
              background: overBudget
                ? 'linear-gradient(90deg, #f97316, #ef4444)'
                : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
            }}
          />
        </div>
      </div>

      {/* Macros card */}
      <div className="card space-y-4">
        <MacroRow label="Carbs" value={totalCarbs} goal={gc} color="#10b981" />
        <MacroRow label="Fat" value={totalFat} goal={gf} color="#c084fc" />
        <MacroRow label="Protein" value={totalProtein} goal={gp} color="#f59e0b" />
      </div>
    </div>
  );
}

function MacroRow({ label, value, goal, color }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[#8b95a8] text-sm font-medium">{label}</span>
        <span className="text-white text-sm font-semibold tabular-nums">
          {value}g <span className="text-[#8b95a8] font-normal">/ {goal}</span>
        </span>
      </div>
      <div className="h-2 bg-[#2a2d38] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
