const outputEl = document.getElementById("output");
const sourcesEl = document.getElementById("sources");
const snapshotEl = document.getElementById("snapshot");

const setOutput = (data) => {
  outputEl.textContent = JSON.stringify(data, null, 2);
};

const request = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || `Error ${res.status}`);
  }
  return json;
};

const renderSources = (sources) => {
  sourcesEl.innerHTML = "";
  sources.forEach((source) => {
    const item = document.createElement("div");
    item.className = "source-item";
    item.innerHTML = `
      <div><strong>${source.id}</strong> (${source.type.toUpperCase()})</div>
      <div>bookmaker: ${source.bookmakerId}</div>
      <div>url: ${source.url}</div>
      <div>enabled: ${source.enabled ? "si" : "no"}</div>
      <div class="row">
        <button data-action="toggle" data-id="${source.id}">
          ${source.enabled ? "Deshabilitar" : "Habilitar"}
        </button>
        <button data-action="delete" data-id="${source.id}">Eliminar</button>
      </div>
    `;
    sourcesEl.appendChild(item);
  });
};

const refreshSources = async () => {
  const data = await request("/api/collectors/sources");
  renderSources(data.data || []);
  setOutput({ message: "Fuentes actualizadas", count: (data.data || []).length });
};

const refreshSnapshot = async () => {
  const data = await request("/api/collectors/snapshot");
  snapshotEl.textContent = JSON.stringify(data.data || {}, null, 2);
};

document.getElementById("create-source-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData.entries());
  payload.enabled = formData.get("enabled") === "on";
  if (!payload.method) delete payload.method;

  try {
    const result = await request("/api/collectors/sources", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setOutput(result);
    e.target.reset();
    await refreshSources();
  } catch (error) {
    setOutput({ error: error.message });
  }
});

document.getElementById("btn-refresh-sources").addEventListener("click", async () => {
  try {
    await refreshSources();
  } catch (error) {
    setOutput({ error: error.message });
  }
});

document.getElementById("btn-run-http").addEventListener("click", async () => {
  try {
    const result = await request("/api/collectors/run/http", { method: "POST" });
    setOutput(result);
    await refreshSnapshot();
  } catch (error) {
    setOutput({ error: error.message });
  }
});

document.getElementById("btn-run-ws").addEventListener("click", async () => {
  try {
    const result = await request("/api/collectors/run/ws", {
      method: "POST",
      body: JSON.stringify({ timeoutMs: 10000 }),
    });
    setOutput(result);
    await refreshSnapshot();
  } catch (error) {
    setOutput({ error: error.message });
  }
});

document.getElementById("btn-refresh-snapshot").addEventListener("click", async () => {
  try {
    await refreshSnapshot();
    setOutput({ message: "Snapshot actualizado" });
  } catch (error) {
    setOutput({ error: error.message });
  }
});

sourcesEl.addEventListener("click", async (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const action = button.getAttribute("data-action");
  const id = button.getAttribute("data-id");

  try {
    if (action === "toggle") {
      const sources = await request("/api/collectors/sources");
      const source = (sources.data || []).find((item) => item.id === id);
      if (!source) throw new Error("Fuente no encontrada");

      const result = await request(`/api/collectors/sources/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled: !source.enabled }),
      });
      setOutput(result);
      await refreshSources();
      return;
    }

    if (action === "delete") {
      const result = await request(`/api/collectors/sources/${id}`, {
        method: "DELETE",
      });
      setOutput(result);
      await refreshSources();
      return;
    }
  } catch (error) {
    setOutput({ error: error.message });
  }
});

refreshSources().catch((error) => setOutput({ error: error.message }));
refreshSnapshot().catch((error) => setOutput({ error: error.message }));
