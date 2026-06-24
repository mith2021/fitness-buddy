const VERDICT_API = 'https://fitness-buddy-iota.vercel.app/api/sync-extension';
const DEBOUNCE_MS = 2000;

let debounceTimer = null;

function parseDiary() {
  const entries = [];
  const tbody = document.querySelector('#diary-table tbody');
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

async function syncToVerdict() {
  const { verdictToken } = await chrome.storage.sync.get('verdictToken');
  if (!verdictToken) return;

  const entries = parseDiary();
  const date = getDateFromUrl();

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
      console.log(`[Verdict] Synced ${data.synced} entries for ${date}`);
    }
  } catch (err) {
    console.warn('[Verdict] Sync error:', err.message);
  }
}

function debouncedSync() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(syncToVerdict, DEBOUNCE_MS);
}

// Initial sync on page load
syncToVerdict();

// Watch for DOM changes (user adds/removes food)
const observer = new MutationObserver((mutations) => {
  const relevant = mutations.some((m) =>
    [...m.addedNodes, ...m.removedNodes].some(
      (n) => n.nodeType === 1 && (
        n.matches?.('tr') || n.querySelector?.('tr.bottom-row')
      )
    )
  );
  if (relevant) debouncedSync();
});

const diaryContainer = document.querySelector('#diary-table') || document.body;
observer.observe(diaryContainer, { childList: true, subtree: true });
