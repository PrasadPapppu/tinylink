// script.js (shared file for both pages)
// Make sure this file is included in index.html and stats.html (it is in the provided templates)

const API = "/api/links";
const toastEl = document.getElementById("toast");

// Utility: show toast
function showToast(message, ms = 2500) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  setTimeout(() => toastEl.classList.add("hidden"), ms);
}

// Format timestamp
function prettyDate(ts) {
  if (!ts) return "-";
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return ts;
  }
}

// ------------------- Dashboard logic -------------------
async function loadLinksAndRender() {
  const loading = document.getElementById("loading");
  const table = document.getElementById("linksTable");
  const emptyState = document.getElementById("emptyState");
  const tbody = document.getElementById("linksBody");
  if (!loading || !tbody) return;

  loading.style.display = "block";
  table.classList.add("hidden");
  emptyState.classList.add("hidden");

  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("Failed to load");
    const links = await res.json();

    loading.style.display = "none";

    if (!links || links.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }

    table.classList.remove("hidden");
    tbody.innerHTML = "";

    for (const link of links) {
      const tr = document.createElement("tr");

      const shortUrl = `${location.origin}/${link.code}`;
      tr.innerHTML = `
        <td><a class="short-link" href="/code/${link.code}">${link.code}</a></td>
        <td><span class="truncate" title="${link.target_url}">${link.target_url}</span></td>
        <td>${link.total_clicks}</td>
        <td>${link.last_clicked ? prettyDate(link.last_clicked) : "-"}</td>
        <td>
          <button class="btn" data-copy="${shortUrl}">Copy</button>
          <button class="btn outline" data-open="${shortUrl}">Open</button>
          <button class="btn" data-delete="${link.code}">Delete</button>
        </td>
      `;

      tbody.appendChild(tr);
    }

  } catch (err) {
    loading.textContent = "Error loading links";
    console.error(err);
  }
}

// Delegated click handling for table actions
document.addEventListener("click", async (e) => {
  const copyBtn = e.target.closest("button[data-copy]");
  const openBtn = e.target.closest("button[data-open]");
  const delBtn = e.target.closest("button[data-delete]");

  if (copyBtn) {
    const text = copyBtn.getAttribute("data-copy");
    try {
      await navigator.clipboard.writeText(text);
      showToast("Short link copied to clipboard");
    } catch {
      showToast("Copy failed");
    }
    return;
  }

  if (openBtn) {
    const url = openBtn.getAttribute("data-open");
    window.open(url, "_blank");
    return;
  }

  if (delBtn) {
    const code = delBtn.getAttribute("data-delete");
    if (!confirm("Delete this link?")) return;
    try {
      const res = await fetch(`${API}/${code}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showToast("Deleted");
      await loadLinksAndRender();
    } catch (err) {
      showToast("Delete failed");
    }
    return;
  }
});

// Search filter
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  let cache = null;
  searchInput.addEventListener("input", async (e) => {
    const q = e.target.value.trim().toLowerCase();
    // load cache if null
    if (!cache) {
      const res = await fetch(API);
      cache = await res.json();
    }
    const tbody = document.getElementById("linksBody");
    tbody.innerHTML = "";
    const filtered = cache.filter(l => l.code.toLowerCase().includes(q) || l.target_url.toLowerCase().includes(q));
    if (filtered.length === 0) {
      document.getElementById("linksTable").classList.add("hidden");
      document.getElementById("emptyState").classList.remove("hidden");
      return;
    }
    document.getElementById("emptyState").classList.add("hidden");
    document.getElementById("linksTable").classList.remove("hidden");
    for (const link of filtered) {
      const tr = document.createElement("tr");
      const shortUrl = `${location.origin}/${link.code}`;
      tr.innerHTML = `
        <td><a class="short-link" href="/code/${link.code}">${link.code}</a></td>
        <td><span class="truncate" title="${link.target_url}">${link.target_url}</span></td>
        <td>${link.total_clicks}</td>
        <td>${link.last_clicked ? prettyDate(link.last_clicked) : "-"}</td>
        <td>
          <button class="btn" data-copy="${shortUrl}">Copy</button>
          <button class="btn outline" data-open="${shortUrl}">Open</button>
          <button class="btn" data-delete="${link.code}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    }
  });
}

// Create form
const createForm = document.getElementById("createForm");
if (createForm) {
  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const urlInput = document.getElementById("urlInput");
    const codeInput = document.getElementById("codeInput");
    const formMessage = document.getElementById("formMessage");
    const createBtn = document.getElementById("createBtn");

    const url = urlInput.value.trim();
    const code = codeInput.value.trim();

    formMessage.textContent = "";
    createBtn.disabled = true;
    createBtn.textContent = "Creating…";

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, code })
      });

      const data = await res.json();

      if (!res.ok) {
        formMessage.textContent = data.error || "Error creating link";
        formMessage.style.color = "crimson";
        showToast(data.error || "Error");
      } else {
        formMessage.textContent = "Created!";
        formMessage.style.color = "green";
        urlInput.value = "";
        codeInput.value = "";
        showToast("Link created");
        // reset cache used by search
        const si = document.getElementById("searchInput");
        if (si) si.value = "";
        // reload table
        await loadLinksAndRender();
      }
    } catch (err) {
      formMessage.textContent = "Server error";
      formMessage.style.color = "crimson";
      showToast("Server error");
    } finally {
      createBtn.disabled = false;
      createBtn.textContent = "Create";
    }
  });
}

// ------------------- Stats page logic -------------------
async function loadStatsPage() {
  if (!document.getElementById("codeTitle")) return;
  const path = window.location.pathname.split("/");
  const code = path[2];

  const statsWrap = document.getElementById("statsWrap");
  const notFound = document.getElementById("notfound");

  try {
    const res = await fetch(`${API}/${code}`);
    if (!res.ok) {
      notFound.classList.remove("hidden");
      statsWrap.classList.add("hidden");
      return;
    }
    const data = await res.json();
    document.getElementById("codeTitle").textContent = `Code: ${data.code}`;
    document.getElementById("url").textContent = data.target_url;
    document.getElementById("clicks").textContent = data.total_clicks;
    document.getElementById("last").textContent = data.last_clicked ? prettyDate(data.last_clicked) : "-";
    document.getElementById("created").textContent = data.created_at ? prettyDate(data.created_at) : "-";

    const openShort = document.getElementById("openShort");
    const copyBtn = document.getElementById("copyBtn");
    const shortUrl = `${location.origin}/${data.code}`;
    openShort.href = shortUrl;
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(shortUrl);
        showToast("Short link copied");
      } catch {
        showToast("Copy failed");
      }
    };

    notFound.classList.add("hidden");
    statsWrap.classList.remove("hidden");

  } catch (err) {
    notFound.classList.remove("hidden");
    statsWrap.classList.add("hidden");
  }
}

// On load run dashboard table loader and stats loader if relevant
document.addEventListener("DOMContentLoaded", () => {
  loadLinksAndRender();
  loadStatsPage();
});
