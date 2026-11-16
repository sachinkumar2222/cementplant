// ESP32 Digital Twin Platform - Backend (Architecture v5)
// -----------------------------------------------------------------------------
// The only component that speaks MQTT. Maintains in-memory live state, exposes
// REST endpoints for snapshots/commands/targets, and pushes live updates over
// WebSocket to both the Dashboard and the Cupola-embedded Widget pages.

const express = require("express");
const cors = require("cors");
const http = require("http");

const env = require("./src/config/env");
const mqttClient = require("./src/mqtt/mqttClient");
const hivemqClient = require("./src/mqtt/hivemqClient");
const wsServer = require("./src/ws/wsServer");

const itemsRoutes = require("./src/routes/items");
const actionRoutes = require("./src/routes/action");
const materialsRoutes = require("./src/routes/materials");
const healthRoutes = require("./src/routes/health");
const otaRoutes = require("./src/routes/ota");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", itemsRoutes);
app.use("/api", actionRoutes);
app.use("/api", materialsRoutes);
app.use("/api", healthRoutes);
app.use("/api/ota", otaRoutes);
app.use("/api/system", otaRoutes);

const fs = require("fs");
const path = require("path");
const widgetDir = fs.existsSync(path.join(__dirname, "../widget-frontend"))
  ? path.join(__dirname, "../widget-frontend")
  : path.join(__dirname, "widgets");

// Direct widget routes available right on the backend port 4000:
app.get(["/gypsum", "/widgets/gypsum"], (req, res) => {
  const file = path.join(widgetDir, "gypsum.html");
  if (fs.existsSync(file)) return res.sendFile(file);
  res.status(404).send("Gypsum widget file not found");
});

app.get([
  "/other-three",
  "/other",
  "/materials",
  "/raw-materials",
  "/widgets/other-three",
], (req, res) => {
  const file = path.join(widgetDir, "other-three.html");
  if (fs.existsSync(file)) return res.sendFile(file);
  res.status(404).send("Materials widget file not found");
});

app.get(["/preheating-tower", "/preheating", "/preheat", "/widgets/preheating-tower"], (req, res) => {
  const file = path.join(widgetDir, "preheating-tower.html");
  if (fs.existsSync(file)) return res.sendFile(file);
  res.status(404).send("Preheating tower widget file not found");
});

app.get(["/kiln", "/cline", "/klin", "/widgets/kiln", "/widgets/cline"], (req, res) => {
  const file = path.join(widgetDir, "kiln.html");
  if (fs.existsSync(file)) return res.sendFile(file);
  res.status(404).send("Kiln widget file not found");
});

app.get(["/cooler", "/widgets/cooler"], (req, res) => {
  const file = path.join(widgetDir, "cooler.html");
  if (fs.existsSync(file)) return res.sendFile(file);
  res.status(404).send("Cooler widget file not found");
});

if (fs.existsSync(widgetDir)) {
  app.use("/widgets", express.static(widgetDir));
}

const server = http.createServer(app);
wsServer.attach(server);

// Every MQTT update flows through here and is immediately broadcast to
// whichever WebSocket clients care about that item (Dashboard = all,
// Widget pages = just their own item_id).
mqttClient.connect((item_id, updated) => {
  wsServer.broadcast(item_id, updated);
});

// HiveMQ Cloud broker — connects in parallel using the same shared store.
// If HIVEMQ_HOST is not set in .env, this call is a no-op and is safely skipped.
hivemqClient.connect((item_id, updated) => {
  wsServer.broadcast(item_id, updated);
});

server.listen(env.PORT, "0.0.0.0", () => {
  console.log(`[Backend] Listening on http://localhost:${env.PORT}`);
  console.log(`[Backend] WebSocket endpoint: ws://localhost:${env.PORT}/ws`);
});

