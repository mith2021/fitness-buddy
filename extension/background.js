// Service worker — handles install lifecycle and future alarm-based syncs
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Verdict] Extension installed.');
});
