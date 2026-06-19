import { useState } from 'react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import Card from '../UI/Card';

export default function SettingsForm({ prefs, onSave, onClose }) {
  const [form, setForm] = useState({
    mfp_username: prefs.mfp_username || '',
    mfp_password: prefs.mfp_password || '',
    dietary_notes: prefs.dietary_notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch('/api/sync-mfp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CRON_SECRET || ''}`,
        },
      });
      const text = await res.text();
      setSyncMsg(res.ok ? 'Synced! Refresh to see meals.' : `Error: ${text}`);
    } catch (e) {
      setSyncMsg(`Error: ${e.message}`);
    }
    setSyncing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error: saveError } = await onSave(form);
    setSaving(false);
    if (saveError) {
      console.error('Save failed:', saveError);
      setError(saveError.message || 'Save failed');
    } else {
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
              <p className="text-xs text-secondary">Auto-syncs every 2h. Disable 2FA on MFP.</p>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="btn-primary text-sm px-4 py-2 w-full"
              >
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
              {syncMsg && <p className={`text-xs ${syncMsg.startsWith('Error') ? 'text-red-400' : 'text-[#00a0d2]'}`}>{syncMsg}</p>}
            </div>
          </div>

          <div>
            <p className="text-xs text-secondary mb-3 uppercase tracking-wider">Coach Notes</p>
            <textarea
              value={form.dietary_notes}
              onChange={set('dietary_notes')}
              placeholder="e.g. trying to bulk, avoid dairy, cut weight for summer..."
              rows={3}
              className="input-field w-full resize-none"
            />
            <p className="text-xs text-secondary mt-1">AI coach uses this as context</p>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        <Button onClick={handleSave} disabled={saving} className="w-full mt-6">
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
        </Button>
      </Card>
    </div>
  );
}
