const VERDICT_API = 'https://fitness-buddy-iota.vercel.app/api/sync-extension';
const DEBOUNCE_MS = 2000;
const POLL_MS = 60000; // re-fetch diary every 60s to catch edits made on other devices

let debounceTimer = null;
let lastSyncedHash = null;

// Parse a diary document (live page OR a fetched HTML doc) into entries.
function parseDiaryDoc(doc) {
  const entries = [];
  const tbody = doc.querySelector('#diary-table tbody');
  if (!tbody) return entries;

  let currentMeal = 'Unknown';

  for (const row of tbody.querySelectorAll('tr')) {
    if (row.classList.contains('meal_header')) {
      const td = row.querySelector('td.first.alt');
      currentMeal = td ? td.textContent.trim() : 'Unknown';
      continue;
    }

    // Skip footer/total rows
    if (row.classList.contains('bottom') || row.classList.contains('total')) continue;

    const nameLink = row.querySelector('td.first.alt a');
    if (!nameLink) continue;

    const tds = row.querySelectorAll('td');
    const getNum = (td) => {
      if (!td) return 0;
      const span = td.querySelector('.macro-value');
      const n = parseInt((span ? span.textContent : td.textContent).replace(/,/g, '').trim(), 10);
      return isNaN(n) ? 0 : n;
    };

    entries.push({
      meal_name: nameLink.textContent.trim(),
      mfp_meal_category: currentMeal,
      calories: getNum(tds[1]),
      carbs: getNum(tds[2]),
      fat: getNum(tds[3]),
      protein: getNum(tds[4]),
    });
  }

  return entries;
}

function getDateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('date') || new Date().toISOString().split('T')[0];
}

async function pushEntries(entries, date) {
  const { verdictToken } = await chrome.storage.sync.get('verdictToken');
  if (!verdictToken) return;

  // Skip the network round-trip if nothing changed since the last sync.
  const hash = JSON.stringify(entries) + date;
  if (hash === lastSyncedHash) return;

  try {
    const res = await fetch(VERDICT_API, {
      method: 'POST',
      // text/plain keeps this a CORS "simple request" — no OPTIONS preflight.
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ token: verdictToken, entries, date }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.warn('[Verdict] Sync failed:', data.error);
    } else {
      lastSyncedHash = hash;
      console.log(`[Verdict] Synced ${data.synced} entries for ${date}`);
    }
  } catch (err) {
    console.warn('[Verdict] Sync error:', err.message);
  }
}

// Sync from the live DOM (fast path for edits in this tab).
function syncFromLiveDOM() {
  pushEntries(parseDiaryDoc(document), getDateFromUrl());
}

// Re-fetch the current diary URL same-origin (carries the user's cookies and
// real browser fingerprint, so Cloudflare lets it through) and sync. This is
// what catches food logged on the phone app without a manual page reload.
async function syncFromFetch() {
  try {
    const res = await fetch(window.location.href, {
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    if (!res.ok) {
      console.warn('[Verdict] Diary re-fetch failed:', res.status);
      return;
    }
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    pushEntries(parseDiaryDoc(doc), getDateFromUrl());
  } catch (err) {
    console.warn('[Verdict] Re-fetch error:', err.message);
  }
}

function debouncedLiveSync() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(syncFromLiveDOM, DEBOUNCE_MS);
}

// Initial sync on page load
syncFromLiveDOM();

// Watch for DOM changes (food added/removed in this tab)
const observer = new MutationObserver((mutations) => {
  const relevant = mutations.some((m) =>
    [...m.addedNodes, ...m.removedNodes].some(
      (n) => n.nodeType === 1 && (n.matches?.('tr') || n.querySelector?.('tr'))
    )
  );
  if (relevant) debouncedLiveSync();
});

const diaryContainer = document.querySelector('#diary-table') || document.body;
observer.observe(diaryContainer, { childList: true, subtree: true });

// Poll for cross-device edits (only while the tab is visible, to save battery).
setInterval(() => {
  if (document.visibilityState === 'visible') syncFromFetch();
}, POLL_MS);
