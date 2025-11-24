const API = "/api/links";

// DOM elements
const table = document.getElementById("linksTable");
const tbody = document.getElementById("linksBody");
const loading = document.getElementById("loading");
const emptyState = document.getElementById("emptyState");

// Load all links on page load
async function loadLinks() {
  loading.style.display = "block";
  table.classList.add("hidden");
  emptyState.classList.add("hidden");

  const res = await fetch(API);
  const links = await res.json();

  loading.style.display = "none";

  if (links.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  table.classList.remove("hidden");
  tbody.innerHTML = "";

  links.forEach(link => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><a href="/code/${link.code}">${link.code}</a></td>
      <td class="truncate">${link.target_url}</td>
      <td>${link.total_clicks}</td>
      <td>${link.last_clicked || "-"}</td>
      <td><button onclick="deleteLink('${link.code}')">Delete</button></td>
    `;

    tbody.appendChild(row);
  });
}

loadLinks();

// DELETE LINK
async function deleteLink(code) {
  const ok = confirm("Delete this link?");
  if (!ok) return;

  await fetch(`${API}/${code}`, {
    method: "DELETE"
  });

  loadLinks();
}

// CREATE LINK
document.getElementById("createForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = document.getElementById("urlInput").value;
  const code = document.getElementById("codeInput").value;
  const msg = document.getElementById("formMessage");

  msg.textContent = "Creating…";

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, code })
  });

  const data = await res.json();

  if (!res.ok) {
    msg.textContent = data.error || "Error";
    msg.style.color = "red";
  } else {
    msg.textContent = "Created!";
    msg.style.color = "green";
    loadLinks();
  }
});
