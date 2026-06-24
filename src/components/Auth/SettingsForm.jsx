import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Input from '../UI/Input';
import Button from '../UI/Button';
import Card from '../UI/Card';

export default function SettingsForm({ prefs, onSave, onClose }) {
  const [form, setForm] = useState({
    mfp_username: prefs.mfp_username || '',
    daily_goal_calories: prefs.daily_goal_calories || 2000,
    dietary_notes: prefs.dietary_notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const [tokenLoading, setTokenLoading] = useState(false);
  const [extensionToken, setExtensionToken] = useState(null);
  const [tokenCopied, setTokenCopied] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const generateToken = async () => {
    setTokenLoading(true);
    setExtensionToken(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error('Not logged in');

      // Generate a random token
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Upsert — one token per user (replace old)
      await supabase.from('extension_tokens')
        .delete()
        .eq('user_id', userId);

      const { error: insertErr } = await supabase.from('extension_tokens')
        .insert({ user_id: userId, token });

      if (insertErr) throw insertErr;
      setExtensionToken(token);
    } catch (e) {
      setError(e.message);
    }
    setTokenLoading(false);
  };

  const copyToken = () => {
    navigator.clipboard.writeText(extensionToken);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { error: saveError } = await onSave(form);
    setSaving(false);
    if (saveError) {
      setError(saveError.message || 'Save failed');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button onClick={onClose} className="text-secondary hover:text-white text-xl">✕</button>
        </div>

        <div className="space-y-6">
          {/* MFP Extension Sync */}
          <div>
            <p className="text-xs text-secondary mb-1 uppercase tracking-wider">MyFitnessPal Sync</p>
            <p className="text-xs text-secondary mb-3">
              Install the Verdict Chrome extension, then paste your pairing token into it.
              The extension syncs your diary automatically as you log food on MFP.
            </p>
            <Input
              label="MFP Username"
              value={form.mfp_username}
              onChange={set('mfp_username')}
              placeholder="your_mfp_username"
            />
            <div className="mt-3">
              <p className="text-xs text-secondary mb-2">Pairing token (extension auth)</p>
              {extensionToken ? (
                <div className="space-y-2">
                  <div className="bg-[#0a1628] border border-[#1e3a5f] rounded px-3 py-2 font-mono text-xs text-[#7fd6ef] break-all">
                    {extensionToken}
                  </div>
                  <button
                    onClick={copyToken}
                    className="btn-primary text-xs px-3 py-1.5 w-full"
                  >
                    {tokenCopied ? 'Copied!' : 'Copy Token'}
                  </button>
                  <p className="text-xs text-secondary">Paste this into the extension popup. Token expires when you regenerate.</p>
                </div>
              ) : (
                <button
                  onClick={generateToken}
                  disabled={tokenLoading}
                  className="btn-primary text-sm px-4 py-2 w-full"
                >
                  {tokenLoading ? 'Generating...' : 'Generate Pairing Token'}
                </button>
              )}
            </div>
          </div>

          {/* Goals */}
          <div>
            <p className="text-xs text-secondary mb-3 uppercase tracking-wider">Goals</p>
            <Input
              label="Daily Calorie Goal"
              type="number"
              value={form.daily_goal_calories}
              onChange={(e) => setForm(f => ({ ...f, daily_goal_calories: parseInt(e.target.value) || 2000 }))}
              placeholder="2000"
            />
          </div>

          {/* Coach Notes */}
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
