const VERDICT_API = 'https://fitness-buddy-tau.vercel.app/api/sync-extension';
const DEBOUNCE_MS = 2000;

let debounceTimer = null;

function parseDiary() {
  const entries = [];
  const sections = document.querySelectorAll('table.main-title-2');

  for (const section of sections) {
    const heading = section.querySelector('td.first.alt') || section.querySelector('th');
    const mealCategory = heading ? heading.textContent.trim() : 'Unknown';

    const tbody = section.nextElementSibling;
    if (!tbody) continue;

    const rows = tbody.querySelectorAll('tr.bottom-row');
    for (const row of rows) {
      const nameEl = row.querySelector('.food-name');
      if (!nameEl) continue;

      const getCol = (cls) => {
        const el = row.querySelector(`.${cls} span`);
        if (!el) return 0;
        const n = parseInt(el.textContent.replace(/,/g, '').trim(), 10);
        return isNaN(n) ? 0 : n;
      };

      entries.push({
        meal_name: nameEl.textContent.trim(),
        mfp_meal_category: mealCategory,
        calories: getCol('calories'),
        protein: getCol('protein'),
        carbs: getCol('carbohydrates'),
        fat: getCol('fat'),
      });
    }
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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${verdictToken}`,
      },
      body: JSON.stringify({ entries, date }),
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

// Observe the main diary container
const diaryContainer = document.querySelector('#diary-table') || document.querySelector('main') || document.body;
observer.observe(diaryContainer, { childList: true, subtree: true });
