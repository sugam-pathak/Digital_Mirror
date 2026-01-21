/**************************************************
 * WorkMirror -Weekly dashbord script
*/

const CATEGORY_COLORS = {
    "Work / Study": "#5b8def",
    "Social / Entertainment": "#6fae8f",
    "Learning": "#3333333"
}

//number of days to show in weekly project.
//fixed only for 7 day

const DAYS_IN_WEEK = 7;
// canvas config for donut
const DONUT_CONFIG = {
    padding: 20,
    innerCutout: 35,
    backgroundColor: "#f6f7f8"
};

/* ===================================================
DATE AND TIME SECTION
=====================================================*/

function getDayKey(daysAgo =0) {
    const d = new Date();
    d.setHours(0, 0, 0 ,0);
    d.setDate(d.getDate() -daysAgo);
    return d.toISOString().slice(0, 10);
}


// conv sec to readable time

function secondsToReadable(seconds) {
    if (!seconds || seconds <=0) return "0h 0m";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${hours}h ${minutes}m`;
}

//storage access layer
//load for single day

async function loadDayFromStorage(key) {
    try{
        const data = await chrome.storage.local.get(key);
        return data[key] || null;
    } catch (err){
        console.error("Failed to load day:", key, err);
        return null;
    }
}

async function  loadMultipleDays(keys) {
    try {
        return await chrome.storage.local.get(keys);
    } catch {
        return{};
    }
}
function createElement(tag, className="", text=""){
    const el = document.createElement(tag);
    if(className) el.className = className;
    if(text) el.innerText = text;
    return el;
}

function buildWeekKeys() {
    const keys = [];
    for (let i = 0; i < DAYS_IN_WEEK; i++) {
        keys.push(getDayKey(i));
    }
    return keys.reverse();
}

function aggregateWeeklyCategories(days) {
    const totals = {};

    days.forEach(day => {
    if (!day|| !day.categories)return;

    Object.entries(day.categories).forEach(([cat, seconds]) => {
        totals[cat] = (totals[cat] || 0) + seconds;
    });
});

return totals;
}
function clearNode(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function renderDailyTotals(container, keys,data) {
    clearNode(container);

    keys.slice().reverse().forEach(key => {
    const day = data[key];
    const row = createElement("div", "daily-item");

    if (day && day.totalSeconds > 0) {
        row.innerText = `${key}: ${secondsToReadable(day.totalSeconds)}`;
    } else {
        row.innerText = `${key}: No recorded activity`;
    }

    container.appendChild(row);
});

}
function sumNumbers(arr) {
  return arr.reduce((a, b) => a + b, 0);
}


function drawWeeklyDonut(canvas, categories) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

   const values = Object.values(categories || {});
   const total = values.reduce((a, b) => a + b, 0);



    if(total <= 0){
        ctx.fillStyle = "#999";
        ctx.font = "14px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("No data for this week", canvas.width /2, canvas.height / 2);
        return;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius =
    Math.min(canvas.width, canvas.height) / 2 - DONUT_CONFIG.padding;

    let startAngle = -0.5 * Math.PI;

    Object.entries(categories || {}).forEach(([cat, seconds]) => {
        if (seconds <= 0) return;

        const sliceAngle = (seconds / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(
            centerX,
            centerY,
            radius,
            startAngle,
            startAngle + sliceAngle
        );
        ctx.closePath();

        ctx.fillStyle = CATEGORY_COLORS[cat] || "#999";
        ctx.fill();

        startAngle += sliceAngle;
    });
    ctx.beginPath();
    ctx.arc(
        centerX,
        centerY,
        radius - DONUT_CONFIG.innerCutout,
        0,
        Math.PI * 2
    );
    ctx.fillStyle = DONUT_CONFIG.backgroundColor;
    ctx.fill();

}

async function loadWeeklyDashboard() {
    const dailyListEl = document.getElementById("dailyList");
    const donutCanvas = document.getElementById("weeklyDonut");

    if (!dailyListEl || !donutCanvas) return;

    const weekKeys = buildWeekKeys();
    const rawData = await loadMultipleDays(weekKeys);

    const orderedDays = weekKeys.map(key => rawData[key] || null);

    renderDailyTotals(dailyListEl, weekKeys, rawData);

    const weeklyCategories = aggregateWeeklyCategories(orderedDays);

    drawWeeklyDonut(donutCanvas, weeklyCategories);
}

document.addEventListener("DOMContentLoaded", () => {
    loadWeeklyDashboard();
});