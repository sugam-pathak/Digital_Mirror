const CATEGORY_COLORS = {
    "Work / Study": "#5b8def",
    "Social / Entertainment": "#6fae8f",
    "Learning": "#f5a623",
    "Other": "#999999"
};

const DAYS_IN_WEEK = 7;

//returns date like yy/mm/dd
function getDateKey(daysAgo = 0) {
    const d = new Date ();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
}
//Converts seconds into a readable format (e.g., 2h 15m)
function formatSeconds (seconds) {if (!seconds)return "0h 0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds% 3600) / 60);
    return `${h}h ${m}m`;
}
// Builds an array of data keys for the last 7 days
function buildWeekKeys() {
    const keys =[];
    for (let i = DAYS_IN_WEEK - 1; i >= 0; i--) {
        keys.push(getDateKey(i));
    }
    return keys;
} 
// Loads stored browsing data for the given data keys
function clearNode (node) {
    while (node.firstChild) node.removeChild(node.firstChild);
}
async function LoadWeekData(keys) {
    try {
        return await chrome.storage.local.get(keys);
    } catch {
        return {};
    }
}


    // Renders the daily total time list
function renderDailyList(container, keys, data) {
    clearNode(container);
    keys.forEach(key => {
     const row = document.createElement("div");
    row.className = "daily-item";

    const day = data[key];
    row.innerText = day
      ? `${key} — ${formatSeconds(day.totalSeconds || 0)}`
      : `${key} — No data`;

    container.appendChild(row);
  });
}

//Aggregates category-Wise time from all days 
function aggregateCategories(days) {
    const result = {};

    days.forEach(day => {
        if (!day || !day.categories) return;
        Object.entries(day.categories).forEach(([cat, sec]) => {
            result[cat] = (result[cat] || 0) + sec;
        });
    });
    return result;
}

// Builds the color legend for categories
function renderLegend(container, categories) {
    clearNode(container);

    Object.entries(categories).forEach(([cat, sec]) => {
        if (sec <= 0) return;

        const item = document.createElement("div");
        item.className = "legend-item";

        const color = document.createElement("div")
        color.className = "legend-color";
        color.style.background = CATEGORY_COLORS[cat] || "#888";

        const label = document.createElement("span");
        label.innerText = `${cat} (${formatSeconds(sec)})`;

        item.appendChild(color);
        item.appendChild(label);
        container.appendChild(item);

    });
}

// Draws a donut chart showing weekly category distribution
function drawDonut(canvas, categories) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const values = Object.values(categories);
    const total = values.reduce((a, b) => a + b, 0);

    //show placeholder text if no data exists
    if(total <= 0) {
        ctx.fillStyle = "#888";
        ctx.font = "14px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("No data", canvas.width / 2, canvas.height / 2);
        return;
    }

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 10;

    let angle = -Math.PI / 2;
    //start from top

    //draw each category slice
    Object.entries(categories).forEach(([cat, sec]) => {
        if (sec <= 0) return;

        const slice = (sec / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, angle, angle + slice);
        ctx.fillStyle = CATEGORY_COLORS[cat] || "#aaa";
        ctx.fill();

        angle += slice;
    });

    // inner circle to reate donut effect
    ctx.beginPath();
    ctx.arc(cx, cy, r -35, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

}

// Display the week date range at top
function  updateWeekRange(keys) {
    const el = document.getElementById("weekRange");
    el.innerText = `${keys[0]} → ${keys[keys.length - 1]}`;

}

//Main dashboard loader
async function loadDashboard () {
    const dailyList = document.getElementById("dailyList")
    const donut = document.getElementById("weeklyDonut");
    const legend = document.getElementById("categoryLegend");

    const keys = buildWeekKeys();
    const rawData = await LoadWeekData(keys);

    const orderedDays = keys.map(k => rawData[k] || null);

    renderDailyList(dailyList, keys, rawData);

    const categories = aggregateCategories(orderedDays);

    drawDonut(donut, categories);
    renderLegend(legend, categories);
    updateWeekRange(keys);
}

//Manual refresh button handler
document.getElementById("refreshBtn").addEventListener("click", loadDashboard);

//load dashboard whwn page is ready to open
document.addEventListener("DOMContentLoaded", loadDashboard);