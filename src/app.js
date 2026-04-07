const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");

const bookmakersRoutes = require("./routes/bookmakers.routes");
const eventsRoutes = require("./routes/events.routes");
const oddsRoutes = require("./routes/odds.routes");
const collectorsRoutes = require("./routes/collectors.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "api-casas-apuestas",
  });
});

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "api-casas-apuestas",
    admin: "/admin",
    health: "/health",
    endpointsBase: "/api",
  });
});

app.use("/api/bookmakers", bookmakersRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/odds", oddsRoutes);
app.use("/api/collectors", collectorsRoutes);

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "admin.html"));
});

app.use((_req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
  });
});

module.exports = app;
