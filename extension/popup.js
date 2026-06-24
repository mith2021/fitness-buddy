const tokenInput = document.getElementById('token');
const saveBtn = document.getElementById('save');
const statusEl = document.getElementById('status');

// Load saved token
chrome.storage.sync.get('verdictToken', ({ verdictToken }) => {
  if (verdictToken) {
    tokenInput.value = verdictToken;
    setStatus('Connected', 'ok');
  }
});

saveBtn.addEventListener('click', async () => {
  const token = tokenInput.value.trim();
  if (!token) {
    setStatus('Paste your token first', 'err');
    return;
  }

  // Validate token against Verdict API before saving
  try {
    saveBtn.disabled = true;
    setStatus('Verifying…', '');
    const res = await fetch('https://fitness-buddy-iota.vercel.app/api/sync-extension', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ entries: [], date: new Date().toISOString().split('T')[0], ping: true }),
    });
    const data = await res.json();
    if (!res.ok && !data.ok) throw new Error(data.error || res.status);

    await chrome.storage.sync.set({ verdictToken: token });
    setStatus('Connected!', 'ok');
  } catch (err) {
    setStatus(`Invalid token: ${err.message}`, 'err');
  } finally {
    saveBtn.disabled = false;
  }
});

function setStatus(msg, cls) {
  statusEl.textContent = msg;
  statusEl.className = cls;
}
