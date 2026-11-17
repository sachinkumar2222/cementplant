// Actuator control routes - Architecture v5, Section 5 (Feature C).
//
// POST /api/item/:id/action   { command: "on" | "off" } or { command: "open" | "close" }
//   Used by the Dashboard, where a real button + click handler exists.
//
// GET /api/item/:id/action/on
// GET /api/item/:id/action/off
//   Used by Cupola hotspots. Cupola simply opens a URL when a hotspot is
//   clicked - there's no button to tap inside the embedded page - so these
//   GET endpoints fire the action immediately and return a short status line
//   that the widget-frontend page displays.
//
// NOTE (Future Scope): a GET request that changes state can be triggered by
// anything that loads the URL. Fine for a private LAN demo; add a
// confirmation step or short-lived token before exposing this publicly.

const express = require("express");
const router = express.Router();
const { findItem } = require("../config/itemRegistry");
const mqttClient = require("../mqtt/mqttClient");
const hivemqClient = require("../mqtt/hivemqClient");
const store = require("../state/store");

function publishCommandToAvailableBrokers(item_id, command) {
  if (item_id === "klin_auto_temp_trigger") {
    const isEnabled = command === "on";
    store.setKilnAutoTempStartEnabled(isEnabled);
    const updated = store.setValue("klin_auto_temp_trigger", isEnabled ? "on" : "off", "on/off");
    try {
      const wsServer = require("../ws/wsServer");
      wsServer.broadcast("klin_auto_temp_trigger", updated);
    } catch (_) {}

    mqttClient.evaluateKilnTempThreshold();
    if (hivemqClient.isConnected()) {
      hivemqClient.evaluateKilnTempThreshold();
    }
    return true;
  }

  const localPublished = mqttClient.publishCommand(item_id, command);
  const cloudPublished = hivemqClient.isConnected() ? hivemqClient.publishCommand(item_id, command) : false;
  return localPublished || cloudPublished;
}

function publishResumeAutoToAvailableBrokers(item_id) {
  const localPublished = mqttClient.publishResumeAuto(item_id);
  const cloudPublished = hivemqClient.isConnected() ? hivemqClient.publishResumeAuto(item_id) : false;
  return localPublished || cloudPublished;
}

function assertActuator(req, res) {
  const item = findItem(req.params.id);
  if (!item) {
    res.status(404).json({ error: "Unknown item_id" });
    return null;
  }
  if (item.type !== "actuator") {
    res.status(400).json({ error: `${req.params.id} is not an actuator` });
    return null;
  }
  return item;
}

function isValidCommand(item, command) {
  if (item.gate) return command === "open" || command === "close";
  return command === "on" || command === "off";
}

router.post("/item/:id/action", (req, res) => {
  const item = assertActuator(req, res);
  if (!item) return;

  const { command } = req.body;
  if (!isValidCommand(item, command)) {
    return res.status(400).json({ error: item.gate
      ? 'command must be "open" or "close"'
      : 'command must be "on" or "off"' });
  }

  publishCommandToAvailableBrokers(item.id, command);
  res.json({ item_id: item.id, command });
});

router.get("/item/:id/action/on", (req, res) => {
  const item = assertActuator(req, res);
  if (!item) return;
  if (item.gate) return res.status(400).send("Use open/close for gate actuators");
  publishCommandToAvailableBrokers(item.id, "on");
  res.type("text/plain").send(`${item.id.toUpperCase()}: ON`);
});

router.get("/item/:id/action/off", (req, res) => {
  const item = assertActuator(req, res);
  if (!item) return;
  if (item.gate) return res.status(400).send("Use open/close for gate actuators");
  publishCommandToAvailableBrokers(item.id, "off");
  res.type("text/plain").send(`${item.id.toUpperCase()}: OFF`);
});

router.get("/item/:id/action/open", (req, res) => {
  const item = assertActuator(req, res);
  if (!item) return;
  if (!item.gate) return res.status(400).send("Only gate actuators support open/close");
  publishCommandToAvailableBrokers(item.id, "open");
  res.type("text/plain").send(`${item.id.toUpperCase()}: OPEN`);
});

router.get("/item/:id/action/close", (req, res) => {
  const item = assertActuator(req, res);
  if (!item) return;
  if (!item.gate) return res.status(400).send("Only gate actuators support open/close");
  publishCommandToAvailableBrokers(item.id, "close");
  res.type("text/plain").send(`${item.id.toUpperCase()}: CLOSE`);
});

// Dedicated separate ON/OFF/OPEN/CLOSE endpoints
router.all(["/item/:id/on", "/item/:id/off", "/item/:id/open", "/item/:id/close"], (req, res) => {
  const item = assertActuator(req, res);
  if (!item) return;
  
  const pathAction = req.path.split("/").pop(); // "on", "off", "open", "close"
  if (item.gate && (pathAction === "on" || pathAction === "off")) {
    return res.status(400).json({ error: "Use /open or /close for gate actuators" });
  }
  if (!item.gate && (pathAction === "open" || pathAction === "close")) {
    return res.status(400).json({ error: "Only gate actuators support /open and /close" });
  }

  publishCommandToAvailableBrokers(item.id, pathAction);
  
  if (req.headers.accept && req.headers.accept.includes("application/json")) {
    return res.json({ item_id: item.id, command: pathAction });
  }
  res.type("text/plain").send(`${item.id.toUpperCase()}: ${pathAction.toUpperCase()}`);
});

router.post("/item/:id/resume-auto", (req, res) => {
  const item = assertActuator(req, res);
  if (!item) return;
  if (item.id !== "klin" && item.id !== "klin_heater") {
    return res.status(400).json({ error: "Only klin and klin_heater support auto PID mode" });
  }
  publishResumeAutoToAvailableBrokers(item.id);
  res.json({ item_id: item.id, status: "auto_resumed" });
});

// Master Switch route to control all actuators simultaneously
router.post("/actuators/master", (req, res) => {
  const { command } = req.body;
  if (command !== "on" && command !== "off") {
    return res.status(400).json({ error: 'command must be "on" or "off"' });
  }

  const localResult = mqttClient.publishMasterCommand(command);
  const cloudResult = hivemqClient.publishMasterCommand(command);
  res.json({
    status: "success",
    command,
    publishedCount: Math.max(localResult.count, cloudResult.count),
    totalActuators: Math.max(localResult.total, cloudResult.total),
    timestamp: Date.now(),
  });
});

// Kiln Motor Auto-Start Trigger (at >= 35°C) routes
router.get("/kiln/auto-trigger", (req, res) => {
  const enabled = store.isKilnAutoTempStartEnabled();
  const rawTemp = store.get("klin_dht_temp")?.value ?? null;
  const klinState = store.get("klin")?.value ?? "off";
  res.json({
    enabled,
    targetTemp: 35.0,
    currentTemp: rawTemp !== null ? Number(rawTemp) : null,
    kilnState: klinState,
  });
});

router.post("/kiln/auto-trigger", (req, res) => {
  const { enabled, command } = req.body;
  const isEnabled = enabled !== undefined ? !!enabled : command === "on";

  store.setKilnAutoTempStartEnabled(isEnabled);
  const updated = store.setValue("klin_auto_temp_trigger", isEnabled ? "on" : "off", "on/off");

  try {
    const wsServer = require("../ws/wsServer");
    wsServer.broadcast("klin_auto_temp_trigger", updated);
  } catch (_) {}

  mqttClient.evaluateKilnTempThreshold();
  if (hivemqClient.isConnected()) {
    hivemqClient.evaluateKilnTempThreshold();
  }

  const rawTemp = store.get("klin_dht_temp")?.value ?? null;
  const klinState = store.get("klin")?.value ?? "off";
  res.json({
    status: "success",
    enabled: isEnabled,
    targetTemp: 35.0,
    currentTemp: rawTemp !== null ? Number(rawTemp) : null,
    kilnState: klinState,
  });
});

module.exports = router;
