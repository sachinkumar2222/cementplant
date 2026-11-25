// Material dispensing routes - Architecture v5, Section 4.3 (Feature B).
//
// POST /api/materials/targets
//   { "gypsum": 50, "clay": 50, "iron_ore": 50, "sand": 50 }
//   Used by the Dashboard's "Material Targets Configuration" panel - one
//   request applies all target values at once.
//
// POST /api/item/:id/target
//   { "target": 50 }
//   Single-item variant, in case any other UI needs to set just one target.

const express = require("express");
const router = express.Router();
const { findItem, dispensableItems } = require("../config/itemRegistry");
const mqttClient = require("../mqtt/mqttClient");
const hivemqClient = require("../mqtt/hivemqClient");
const store = require("../state/store");

function publishTargetToAvailableBrokers(item_id, target) {
  const localPublished = mqttClient.publishTarget(item_id, target);
  const cloudPublished = hivemqClient.isConnected() ? hivemqClient.publishTarget(item_id, target) : false;
  return localPublished || cloudPublished;
}

function publishDemoResetToAvailableBrokers(material_id) {
  const localPublished = mqttClient.publishDemoReset(material_id);
  const cloudPublished = hivemqClient.isConnected() ? hivemqClient.publishDemoReset(material_id) : false;
  return localPublished || cloudPublished;
}

function publishStopToAvailableBrokers(material_id) {
  const localPublished = mqttClient.publishStop(material_id);
  const cloudPublished = hivemqClient.isConnected() ? hivemqClient.publishStop(material_id) : false;
  return localPublished || cloudPublished;
}

function publishDemoRateToAvailableBrokers(material_id, ms_per_g) {
  const localPublished = mqttClient.publishDemoRate(material_id, ms_per_g);
  const cloudPublished = hivemqClient.isConnected() ? hivemqClient.publishDemoRate(material_id, ms_per_g) : false;
  return localPublished || cloudPublished;
}

router.post("/materials/targets", (req, res) => {
  console.log(`[API] POST /api/materials/targets - body: ${JSON.stringify(req.body)}`);
  const accepted = [];
  const rejected = [];

  for (const [item_id, target] of Object.entries(req.body || {})) {
    const item = findItem(item_id);
    if (item && item.dispensable && typeof target === "number") {
      const ok = publishTargetToAvailableBrokers(item_id, target);
      if (ok) {
        accepted.push(item_id);
      } else {
        rejected.push(item_id);
      }
    } else {
      rejected.push(item_id);
    }
  }

  res.json({ accepted, rejected });
});

router.post("/item/:id/target", (req, res) => {
  console.log(`[API] POST /api/item/${req.params.id}/target - body: ${JSON.stringify(req.body)}`);
  const item = findItem(req.params.id);
  if (!item) return res.status(404).json({ error: "Unknown item_id" });
  if (!item.dispensable) return res.status(400).json({ error: `${item.id} is not dispensable` });

  const { target } = req.body;
  if (typeof target !== "number") {
    return res.status(400).json({ error: "target must be a number" });
  }

  const ok = publishTargetToAvailableBrokers(item.id, target);
  if (!ok) return res.status(500).json({ error: "Failed to publish target to MQTT broker" });
  res.json({ item_id: item.id, target });
});

// Empty tray / Reset demonstration cumulative weight
router.post("/item/:id/reset", (req, res) => {
  console.log(`[API] POST /api/item/${req.params.id}/reset`);
  const item = findItem(req.params.id);
  if (!item) return res.status(404).json({ error: "Unknown item_id" });
  if (!item.dispensable) return res.status(400).json({ error: `${item.id} is not dispensable` });

  const ok = publishDemoResetToAvailableBrokers(item.id);
  if (!ok) return res.status(500).json({ error: "Failed to publish demo_reset" });
  res.json({ item_id: item.id, reset: true });
});

router.post("/materials/reset", (req, res) => {
  console.log(`[API] POST /api/materials/reset - body: ${JSON.stringify(req.body)}`);
  const material = req.body?.material || "all";
  const ok = publishDemoResetToAvailableBrokers(material);
  if (!ok) return res.status(500).json({ error: "Failed to publish demo_reset" });
  res.json({ material, reset: true });
});

// Stop dispensing commands
router.post("/item/:id/stop", (req, res) => {
  console.log(`[API] POST /api/item/${req.params.id}/stop`);
  const item = findItem(req.params.id);
  if (!item) return res.status(404).json({ error: "Unknown item_id" });

  const ok = publishStopToAvailableBrokers(item.id);
  if (!ok) return res.status(500).json({ error: "Failed to publish stop" });
  res.json({ item_id: item.id, stopped: true });
});

router.post("/materials/stop", (req, res) => {
  console.log(`[API] POST /api/materials/stop`);
  const material = req.body?.material || "all";
  const ok = publishStopToAvailableBrokers(material);
  if (!ok) return res.status(500).json({ error: "Failed to publish stop" });
  res.json({ material, stopped: true });
});

// Adjust remote dispensing time (ms_per_g)
router.post("/item/:id/rate", (req, res) => {
  console.log(`[API] POST /api/item/${req.params.id}/rate - body: ${JSON.stringify(req.body)}`);
  const item = findItem(req.params.id);
  if (!item) return res.status(404).json({ error: "Unknown item_id" });

  const { ms_per_g } = req.body;
  if (typeof ms_per_g !== "number" || ms_per_g <= 0) {
    return res.status(400).json({ error: "ms_per_g must be a positive number" });
  }

  const ok = publishDemoRateToAvailableBrokers(item.id, ms_per_g);
  if (!ok) return res.status(500).json({ error: "Failed to publish demo_rate" });
  res.json({ item_id: item.id, ms_per_g });
});

// Get actual load-cell physical readings
router.get("/materials/actuals", (req, res) => {
  res.json(store.getLoadCellActuals());
});

// Handy for the dashboard to know which materials support targets at all.
router.get("/materials/dispensable", (req, res) => {
  res.json(dispensableItems().map((i) => i.id));
});

module.exports = router;
