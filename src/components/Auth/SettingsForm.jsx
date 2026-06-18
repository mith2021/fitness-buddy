import { useState } from 'react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import Card from '../UI/Card';

export default function SettingsForm({ prefs, onSave, onClose }) {
  const [form, setForm] = useState({
    mfp_username: prefs.mfp_username || '',
    mfp_password: prefs.mfp_password || '',
    daily_goal_calories: prefs.daily_goal_calories || 2000,
    dietary_notes: prefs.dietary_notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    const { error } = await onSave(form);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button onClick={onClose} className="text-secondary hover:text-white text-xl">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-secondary mb-3 uppercase tracking-wider">MyFitnessPal</p>
            <div className="space-y-3">
              <Input
                label="MFP Username"
                value={form.mfp_username}
                onChange={set('mfp_username')}
                placeholder="your_mfp_username"
              />
              <Input
                label="MFP Password"
                type="password"
                value={form.mfp_password}
                onChange={set('mfp_password')}
                placeholder="••••••••"
              />
              <p className="text-xs text-secondary">Syncs every 15 min. Disable 2FA on MFP.</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-secondary mb-3 uppercase tracking-wider">Goals</p>
            <div className="space-y-3">
              <Input
                label="Daily Calorie Goal"
                type="number"
                value={form.daily_goal_calories}
                onChange={set('daily_goal_calories')}
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes for Coach</label>
                <textarea
                  value={form.dietary_notes}
                  onChange={set('dietary_notes')}
                  placeholder="e.g. trying to bulk, avoid dairy..."
                  rows={3}
                  className="input-field w-full resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full mt-6">
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
        </Button>
      </Card>
    </div>
  );
}
