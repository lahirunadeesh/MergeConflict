let currentFile = null;
let currentConflicts = [];
let currentConflictIndex = 0;

async function scanFolder() {
    const path = document.getElementById("rootPath").value.trim();
    if (!path) return alert("Please enter a project root path.");

    const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path })
    });

    const data = await res.json();
    renderFileList(data.files);
}

function renderFileList(files) {
    const section = document.getElementById("results");
    const list = document.getElementById("fileList");
    list.innerHTML = "";

    if (files.length === 0) {
        list.innerHTML = "<p>No conflict files found.</p>";
    } else {
        files.forEach(f => {
            const div = document.createElement("div");
            div.className = "file-item";
            div.innerHTML = `<span>${f.path}</span><span class="file-type">${f.type}</span>`;
            div.onclick = () => loadFile(f.path);
            list.appendChild(div);
        });
    }

    section.style.display = "block";
}

async function loadFile(filePath) {
    const res = await fetch("/api/conflicts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: filePath })
    });

    const data = await res.json();
    currentFile = filePath;
    currentConflicts = data.conflicts;
    currentConflictIndex = 0;
    renderConflict();
}

function renderConflict() {
    const section = document.getElementById("resolver");
    const view = document.getElementById("conflictView");

    if (currentConflicts.length === 0) {
        section.style.display = "none";
        return;
    }

    const c = currentConflicts[currentConflictIndex];
    view.innerHTML = `
        <p style="margin-bottom:12px;font-size:13px;color:#636e72;">
            Conflict ${currentConflictIndex + 1} of ${currentConflicts.length} — <strong>${currentFile}</strong>
        </p>
        <div class="conflict-block">
            <div class="local">${escapeHtml(c.local)}</div>
            <div class="repo">${escapeHtml(c.repo)}</div>
        </div>
    `;

    section.style.display = "block";
}

async function resolve(strategy) {
    const c = currentConflicts[currentConflictIndex];
    await fetch("/api/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            file: currentFile,
            conflict_index: currentConflictIndex,
            strategy
        })
    });

    currentConflictIndex++;
    if (currentConflictIndex >= currentConflicts.length) {
        document.getElementById("resolver").style.display = "none";
        alert("All conflicts in this file resolved!");
    } else {
        renderConflict();
    }
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
