# Digital_Mirror
# WorkMirror

WorkMirror is a Chrome/Brave extension that silently tracks your browsing time and shows a calm weekly summary of your digital activity.  
It does **not block websites or interrupt you**—it only reflects your online behavior.

---

## Features

| Feature | Description |
|--------|-------------|
| Silent tracking | Tracks time without notifications |
| Weekly view | Shows last 7 days of activity |
| Daily totals | Displays daily time spent |
| Category breakdown | Donut chart of categories |
| Dark mode | Toggle between light/dark theme |
| Local storage | All data stored locally |

---

## Folder Structure

```
WorkMirror/
│
├── background/
│   └── background.js
├── dashboard/
│   ├── dashboard.html
│   ├── dashboard.js
│   └── dashboard.css
├── weekly/
│   ├── weekly.html
│   ├── weekly.js
│   └── weekly.css
├── settings/
│   ├── settings.html
│   └── settings.js
├── popup.html
├── popup.js
├── popup.css
├── manifest.json
└── README.md
```

---

## 🧩 Installation (Developer Mode)

### ✅ Chrome / Brave / Edge

| Step | Action |
|------|--------|
| 1 | Open browser |
| 2 | Go to `chrome://extensions` |
| 3 | Enable **Developer mode** |
| 4 | Click **Load unpacked** |
| 5 | Select your extension folder |

---

## ⚙️ How to Use

### Popup Options

| Button | Action |
|--------|--------|
| **Weekly view** | Open weekly dashboard |
| **Settings** | Open settings page |
| **Dark Mode toggle** | Enable/disable dark theme |

---

## 📊 Weekly Dashboard

The weekly page shows:

- Daily totals for last 7 days
- Donut chart of category breakdown

---

## 🧪 Testing (Add Test Data)

To test the dashboard instantly, open **Weekly view** → press **F12** → Console → paste:

```js
const createTestData = () => {
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);

    chrome.storage.local.set({
      [key]: {
        totalSeconds: 3600 + i * 100,
        categories: {
          "Work / Study": 1500 + i * 50,
          "Social / Entertainment": 1000 + i * 40,
          "Learning": 800 + i * 30
        }
      }
    });
  }
};

createTestData();
```

Then **refresh** the weekly page.

---

## Common Issues & Fixes

| Problem | Fix |
|--------|-----|
| No data shown | Wait for the extension to track your browsing or add test data |
| `TypeError: dayData.timeline` | Add `dayData.timeline = dayData.timeline || [];` in `background.js` |
| Data not updating | Reload extension in `chrome://extensions` |

---

## Reset Data

To clear all stored data:

```js
chrome.storage.local.clear();
```

---

## Notes

- Works in normal browsing mode (not Incognito).
- Data stays on your device (not sent anywhere).

---

## License

This project is open-source and free to use.
