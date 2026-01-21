const DEFAULT_CATEGORIES = [
    { name: "work / study", patterns: ["docs", "drive", "slack", "meet", "mail", "github", "notion", "stackoverflow", "wikipedia"] },
    { name: "Social / Entertainment", patterns: ["facebook", "instagram", "youtube", "tiktok", "reddit", "twitter", "netflix", "spotify"] },
    { name: "Learning", patterns: ["coursera", "udemy", "khanacademy", "edx", "medium", "academia"] },
    { name: "Other", patterns: [] }
];

//local
async function loadCategories() {
    const res = await chrome.storage.local.get("categories");
    return res.categories || DEFAULT_CATEGORIES;
}
// svve cat
async function saveCategories(categories) {
    await chrome.storage.local.set({ categories });
}

function renderCategories(categories) {
    const container = document.getElementById("categories");
    if (!container) return;

    container.innerHTML = "";

    categories.forEach((cat, idx) => {
        const div = document.createElement("div");
        div.className = "category";

        const inputName = document.createElement("input");
        inputName.value = cat.name;
        inputName.placeholder = "Category name";

        const inputPattern = document.createElement("input");
        inputPattern.value = cat.patterns.join(",");
        inputPattern.placeholder = "Comma-separated domain patterns";

        const removeBtn = document.createElement("button");
        removeBtn.innerText = "Remove";
        removeBtn.className = "remove";
        removeBtn.onclick = () => {
            categories.splice(idx, 1);
            saveCategories(categories).then(() => renderCategories(categories));
        };
// update category name on input
        inputName.oninput = () => {
            cat.name = inputName.value;
            saveCategories(categories);
        };
//update patterns on input
        inputPattern.oninput = () => {
            cat.patterns = inputPattern.value.split(",").map(p => p.trim()).filter(p => p);
            saveCategories(categories);
        };
         // add element to category div
        div.appendChild(inputName);
        div.appendChild(inputPattern);
        div.appendChild(removeBtn);

        container.appendChild(div);
    });
}

//initialize ehen the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {

    const addCategoryBtn = document.getElementById("addCategory");
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener("click", async () => {
            const categories = await loadCategories();
            categories.push({ name: "New Category", patterns: [] });
            await saveCategories(categories);
            renderCategories(categories);
        });
    }

    const exportDataBtn = document.getElementById("exportData");
    if (exportDataBtn) {
        exportDataBtn.addEventListener("click", async () => {
            try {
                const allData = await chrome.storage.local.get(null);
                const blob = new Blob([JSON.stringify(allData, null, 2)], {
                    type: "application/json"
                });
                const url = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = `workmirror_export_${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Export Failed", error);
                alert("Failed to export data. check console for detail");
            }
        });
    }

    loadCategories().then(renderCategories).catch(error => {
        console.error("Failed to load categories.", error);
    });
});