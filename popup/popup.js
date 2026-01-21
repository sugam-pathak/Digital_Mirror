const themeToggle = document.getElementById("themeToggle");
const openDashboardBtn = document.getElementById("openDashboard");
const openWeeklyBtn = document.getElementById("openWeekly");
const openSettingsBtn = document.getElementById("openSettings");

function applyTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");
}

chrome.storage.local.get("uiTheme", res => {
    const theme = res.uiTheme || "light";
    themeToggle.checked = theme === "dark";
    applyTheme(theme);
});

themeToggle.addEventListener("change", () => {
const theme = themeToggle.checked ? "dark" : "light";
chrome.storage.local.set({ uiTheme: theme});
applyTheme(theme);
});

if (openDashboardBtn) {
  openDashboardBtn.addEventListener("click", () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("dashboard/dashboard.html")
    });
  });
}

if(openWeeklyBtn) {
    openWeeklyBtn.addEventListener("click", () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("weekly/weekly.html")
    });
});
}
if (openSettingsBtn) {
  openSettingsBtn.addEventListener("click", () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("settings/settings.html")
    });
  });
}