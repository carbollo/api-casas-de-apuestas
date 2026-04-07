const { sourceConfigs } = require("../data/sourceConfigs");

const sourceRegistry = sourceConfigs.map((source) => ({ ...source }));

const listSources = () => sourceRegistry;

const findSourceById = (id) => sourceRegistry.find((source) => source.id === id);

const validateType = (type) => type === "http" || type === "ws";

const createSource = (payload) => {
  const id = String(payload?.id || "").trim();
  const bookmakerId = String(payload?.bookmakerId || "").trim();
  const type = String(payload?.type || "").trim();
  const url = String(payload?.url || "").trim();
  const method = String(payload?.method || "GET").toUpperCase();
  const enabled = Boolean(payload?.enabled);

  if (!id || !bookmakerId || !type || !url) {
    return { ok: false, reason: "Campos requeridos: id, bookmakerId, type, url" };
  }
  if (!validateType(type)) {
    return { ok: false, reason: "type debe ser http o ws" };
  }
  if (findSourceById(id)) {
    return { ok: false, reason: "Ya existe una fuente con ese id" };
  }

  const created = { id, bookmakerId, type, url, enabled };
  if (type === "http") {
    created.method = method;
  }
  if (payload.provider !== undefined) created.provider = String(payload.provider).trim();
  if (Array.isArray(payload.marketIds)) created.marketIds = payload.marketIds;
  if (payload.headers && typeof payload.headers === "object") created.headers = payload.headers;
  if (payload.body && typeof payload.body === "object") created.body = payload.body;
  sourceRegistry.push(created);
  return { ok: true, data: created };
};

const updateSource = (id, payload) => {
  const source = findSourceById(id);
  if (!source) {
    return { ok: false, reason: "Fuente no encontrada" };
  }

  if (payload.type && !validateType(payload.type)) {
    return { ok: false, reason: "type debe ser http o ws" };
  }

  if (payload.bookmakerId !== undefined) source.bookmakerId = String(payload.bookmakerId).trim();
  if (payload.type !== undefined) source.type = String(payload.type).trim();
  if (payload.url !== undefined) source.url = String(payload.url).trim();
  if (payload.enabled !== undefined) source.enabled = Boolean(payload.enabled);
  if (payload.provider !== undefined) source.provider = String(payload.provider).trim();
  if (payload.marketIds !== undefined) source.marketIds = Array.isArray(payload.marketIds) ? payload.marketIds : [];
  if (payload.headers !== undefined) source.headers = payload.headers && typeof payload.headers === "object" ? payload.headers : undefined;
  if (payload.body !== undefined) source.body = payload.body && typeof payload.body === "object" ? payload.body : undefined;

  if (source.type === "http") {
    source.method = payload.method ? String(payload.method).toUpperCase() : source.method || "GET";
  } else {
    delete source.method;
  }

  return { ok: true, data: source };
};

const deleteSource = (id) => {
  const index = sourceRegistry.findIndex((source) => source.id === id);
  if (index === -1) {
    return { ok: false, reason: "Fuente no encontrada" };
  }
  const [deleted] = sourceRegistry.splice(index, 1);
  return { ok: true, data: deleted };
};

module.exports = {
  listSources,
  createSource,
  updateSource,
  deleteSource,
};
