// Scrapes the user's MFP bio data (calorie goal, weight, height, age, gender)
// and pushes it to Verdict so the AI coach can give accurate TDEE/macro advice.
//
// NOTE: the exact HTML/selectors for the MFP account/measurements pages are
// UNKNOWN. The selectors below are best-effort guesses. When a field is not
// found we log the relevant markup (`[Verdict][profile] <field> raw section:`)
// so the real HTML can be pasted back and the selectors finalized. Every
// uncertain selector is marked `// TODO: verify selector against real MFP markup`.

const VERDICT_PROFILE_API = 'https://fitness-buddy-iota.vercel.app/api/sync-profile';

const ACCOUNT_URL = 'https://www.myfitnesspal.com/account/edit';
const MEASUREMENTS_URL = 'https://www.myfitnesspal.com/measurements/edit';

// Fetch a page same-origin (carries the user's cookies + real browser
// fingerprint so Cloudflare lets it through) and parse it into a document.
async function fetchDoc(url) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  });
  if (!res.ok) {
    console.warn(`[Verdict][profile] Fetch failed for ${url}:`, res.status);
    return null;
  }
  const html = await res.text();
  return new DOMParser().parseFromString(html, 'text/html');
}

// Pull a number out of a form control or element. Handles inputs (value),
// selects (selected option) and plain text. Returns null when nothing usable.
function readNumber(el) {
  if (!el) return null;
  let raw = '';
  if ('value' in el && el.value != null && el.value !== '') {
    raw = String(el.value);
  } else if (el.tagName === 'SELECT') {
    const opt = el.querySelector('option[selected]') || el.selectedOptions?.[0];
    raw = opt ? (opt.value || opt.textContent) : '';
  } else {
    raw = el.textContent || '';
  }
  const n = parseFloat(raw.replace(/,/g, '').trim());
  return isNaN(n) ? null : n;
}

function readText(el) {
  if (!el) return null;
  let raw = '';
  if ('value' in el && el.value != null && el.value !== '') {
    raw = String(el.value);
  } else if (el.tagName === 'SELECT') {
    const opt = el.querySelector('option[selected]') || el.selectedOptions?.[0];
    raw = opt ? (opt.value || opt.textContent) : '';
  } else {
    raw = el.textContent || '';
  }
  raw = raw.trim();
  return raw || null;
}

// What gets logged when a selector misses, so the human can see the real markup.
function missHint(doc, selector) {
  const el = doc.querySelector(selector);
  return el ? el.outerHTML : (doc.title || '(no <title>)');
}

// --- Field extractors -----------------------------------------------------
// Each returns a value or null. On a miss it logs the relevant raw markup.

function scrapeHeight(accountDoc) {
  // TODO: verify selector against real MFP markup
  const el = accountDoc.querySelector('#height, [name="height"], [name*="height"]');
  const cm = readNumber(el);
  if (cm == null) {
    console.log('[Verdict][profile] height raw section:', missHint(accountDoc, 'form'));
  }
  return cm;
}

function scrapeAge(accountDoc) {
  // TODO: verify selector against real MFP markup
  const el = accountDoc.querySelector('#age, [name="age"], [name*="age"]');
  const age = readNumber(el);
  if (age == null) {
    console.log('[Verdict][profile] age raw section:', missHint(accountDoc, 'form'));
  }
  return age == null ? null : Math.round(age);
}

function scrapeGender(accountDoc) {
  // TODO: verify selector against real MFP markup
  const el = accountDoc.querySelector(
    '#gender, [name="gender"], [name="sex"], [name*="gender"]'
  );
  const gender = readText(el);
  if (gender == null) {
    console.log('[Verdict][profile] gender raw section:', missHint(accountDoc, 'form'));
  }
  return gender;
}

function scrapeWeight(measurementsDoc) {
  // TODO: verify selector against real MFP markup
  const el = measurementsDoc.querySelector(
    '#weight, [name="weight"], [name*="weight"], [name="measurement[value]"]'
  );
  const kg = readNumber(el);
  if (kg == null) {
    console.log(
      '[Verdict][profile] weight raw section:',
      missHint(measurementsDoc, 'form')
    );
  }
  return kg;
}

// Read the daily calorie goal from the live diary page footer if present.
function scrapeCalorieGoal() {
  // TODO: verify selector against real MFP markup
  // The diary "Totals / Your Daily Goal" footer lives in #diary-table tfoot;
  // the goal row is typically labelled "Your Daily Goal".
  const tfoot = document.querySelector('#diary-table tfoot');
  if (tfoot) {
    for (const row of tfoot.querySelectorAll('tr')) {
      const label = (row.querySelector('td.first') || {}).textContent || '';
      if (/daily goal/i.test(label)) {
        const cals = readNumber(row.querySelectorAll('td')[1]);
        if (cals != null) return Math.round(cals);
      }
    }
  }
  console.log(
    '[Verdict][profile] daily_goal_calories raw section:',
    tfoot ? tfoot.outerHTML : (document.title || '(no diary tfoot on this page)')
  );
  return null;
}

// --- Orchestration --------------------------------------------------------

async function scrapeProfile() {
  const profile = {};
  try {
    const [accountDoc, measurementsDoc] = await Promise.all([
      fetchDoc(ACCOUNT_URL).catch((err) => {
        console.warn('[Verdict][profile] account fetch error:', err.message);
        return null;
      }),
      fetchDoc(MEASUREMENTS_URL).catch((err) => {
        console.warn('[Verdict][profile] measurements fetch error:', err.message);
        return null;
      }),
    ]);

    if (accountDoc) {
      profile.height_cm = scrapeHeight(accountDoc);
      profile.age = scrapeAge(accountDoc);
      profile.gender = scrapeGender(accountDoc);
    }
    if (measurementsDoc) {
      profile.weight_kg = scrapeWeight(measurementsDoc);
    }
    profile.daily_goal_calories = scrapeCalorieGoal();

    // Drop nulls so we only send what we actually found.
    for (const key of Object.keys(profile)) {
      if (profile[key] == null) delete profile[key];
    }
  } catch (err) {
    console.warn('[Verdict][profile] scrapeProfile error:', err.message);
  }
  return profile;
}

async function pushProfile(profile) {
  try {
    if (!profile || Object.keys(profile).length === 0) {
      console.warn('[Verdict][profile] Nothing scraped — skipping push.');
      return;
    }
    const { verdictToken } = await chrome.storage.sync.get('verdictToken');
    if (!verdictToken) return;

    const res = await fetch(VERDICT_PROFILE_API, {
      method: 'POST',
      // text/plain keeps this a CORS "simple request" — no OPTIONS preflight.
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ token: verdictToken, profile }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.warn('[Verdict][profile] Sync failed:', data.error);
    } else {
      console.log('[Verdict][profile] Synced fields:', data.updated);
    }
  } catch (err) {
    console.warn('[Verdict][profile] Sync error:', err.message);
  }
}

async function syncProfile() {
  const profile = await scrapeProfile();
  await pushProfile(profile);
}

// Scrape once on diary page load (alongside the diary sync in content.js).
syncProfile();
