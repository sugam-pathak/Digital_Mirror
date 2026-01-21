console.log("WorkMirror background started");
const DEFAULT_CATEGORIES = [
    { name: "Work / Study",patterns: ["docs", "drive", "slack", "meet", "mail", "github", "notion", "stackoverflow", "wikipedia" ] },
    { name: "Social / Entertainment", patterns: ["facebook", "instagram", "youtube", "tiktok", "reddit", "twitter", "netflix", "spotify"] },
    { name: "Learning", patterns: ["coursera", "udemy", "khanacademy", "edx", "medium","academia" ] },
    { name: "Other", patterns: [] }
];

async function getCategories() {
  const res = await chrome.storage.local.get("categories");

  // If categories is not set or not an array, save default
  if (!Array.isArray(res.categories)) {
    await chrome.storage.local.set({ categories: DEFAULT_CATEGORIES });
    return DEFAULT_CATEGORIES;
  }

  return res.categories;
}


function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

function normalizeDomain(url) {
    try {
        const u = new URL(url);
        return u.hostname.replace("www.", "");

    } catch (e) {
        return "";
    }
}
async function categorize(url) {
    const domain = normalizeDomain(url);
    const categories = await getCategories();

    for (const cat of categories) {
    if (!cat || !Array.isArray(cat.patterns)) continue;

    for (const p of cat.patterns) {
        if (domain.includes(p)) return cat.name;
    }
}

    return "Other";
}

async function getDefaultDayData() {
    return {
        date: getTodayKey(),
        totalSeconds: 0,
        categories: {},
        timeline: [],
        reflection: ""
    };
}

let activeTab = null;
let activeWindowFocused = true;
let lastTick = Date.now();

async function refreshActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    activeTab = tab || null;

}

async function recordTime() {
    const now = Date.now();
    const elapsed = Math.floor((now - lastTick) / 1000);
    lastTick = now;

    if (!activeTab || !activeWindowFocused) return;
    if (!activeTab.url || activeTab.url.startsWith("chrome://")) return;

    const category = await categorize(activeTab.url);
    const site = normalizeDomain(activeTab.url);
    const title = activeTab.title || site;

    const key = getTodayKey();
    const storage = await chrome.storage.local.get(key);
    const dayData = storage[key] || await getDefaultDayData();
    dayData.timeline = dayData.timeline || [];

dayData.totalSeconds += elapsed;
dayData.categories[category] = (dayData.categories[category] || 0) + elapsed;

const lastEvent = dayData.timeline[dayData.timeline.length - 1];

    if (lastEvent && lastEvent.site === site && lastEvent.category === category) {
        lastEvent.end = now;

    }
    else {
        dayData.timeline.push({
            start: now - elapsed * 1000,
            end: now,
            site,
            title,
            category
        });
    }

    await chrome.storage.local.set({ [key]: dayData });
}

chrome.alarms.create("tick", { periodInMinutes: 0.166 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "tick") {
        await refreshActiveTab();
        await recordTime();
    }
});

chrome.windows.onFocusChanged.addListener((windowId) => {

    activeWindowFocused = windowId !== chrome.windows.WINDOW_ID_NONE;
});

chrome.tabs.onActivated.addListener(refreshActiveTab);
chrome.tabs.onUpdated.addListener(refreshActiveTab);

chrome.idle.onStateChanged.addListener((state) => {
    activeWindowFocused = (state === "active");
});

// in future may new fetwer will be unlck
// code by sugam pathak (sangam )