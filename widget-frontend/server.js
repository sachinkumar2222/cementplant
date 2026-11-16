const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const port = Number(process.env.PORT || 4173);

// Cupola runs on a different origin and fetches control.html / widget URLs.
app.use(cors());
app.use(express.json());

// In-memory sync for dispense events across iframes & widgets
const lastDispenseEvents = {};

app.post(["/api/dispense-sync", "/dispense-sync"], (req, res) => {
  const { item_id, target } = req.body || {};
  if (item_id) {
    const n = Number(target);
    lastDispenseEvents[item_id] = {
      target: isNaN(n) ? 0 : n,
      time: Date.now(),
    };
    console.log(`[Sync] Dispense event recorded for ${item_id}: ${lastDispenseEvents[item_id].target}g`);
  }
  res.json({ ok: true, event: lastDispenseEvents[item_id] });
});

app.get(["/api/dispense-sync/:id", "/dispense-sync/:id"], (req, res) => {
  res.json(lastDispenseEvents[req.params.id] || { target: null, time: 0 });
});

// Route 1: Gypsum Only (Single Hopper Card)
app.get(["/gypsum", "/widgets/gypsum"], (req, res) => {
  res.sendFile(path.join(__dirname, "gypsum.html"));
});

// Route 1 Copy: Gypsum Copy (Updates after 2 sec to dispensed value)
app.get(["/gypsum-copy", "/widgets/gypsum-copy", "/gypsum-copy.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "gypsum-copy.html"));
});

// Route 2: The Other Three Materials (Clay, Iron Ore, Sand)
app.get([
  "/other-three",
  "/other",
  "/materials",
  "/raw-materials",
  "/clay-ironore-sand",
  "/sand-clay-ironore",
  "/widgets/other-three",
  "/widgets/materials",
], (req, res) => {
  res.sendFile(path.join(__dirname, "other-three.html"));
});

// Copy Route: Starts at 0 and smoothly animates to entered target upon dispense
app.get([
  "/other-three-copy",
  "/materials-copy",
  "/materials-sim",
  "/copy",
  "/widgets/other-three-copy",
  "/widgets/materials-copy",
], (req, res) => {
  res.sendFile(path.join(__dirname, "other-three-copy.html"));
});

// Manual Controller Page to update widget-copy values
app.get(["/update", "/update.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "update.html"));
});

// Part 1: Separate Reading / Value Card (e.g. /sand/value or /reading?id=sand)
app.get([
  "/hopper-reading",
  "/hopper-reading.html",
  "/reading",
  "/value",
  "/sand/value",
  "/sand/reading",
  "/clay/value",
  "/clay/reading",
  "/iron_ore/value",
  "/iron_ore/reading",
  "/iron-ore/value",
  "/iron-ore/reading",
  "/gypsum/value",
  "/gypsum/reading",
], (req, res) => {
  res.sendFile(path.join(__dirname, "hopper-reading.html"));
});

// Part 2: Separate Dispense Control Card (e.g. /sand/dispense or /dispense?id=sand)
app.get([
  "/hopper-control",
  "/hopper-control.html",
  "/dispense",
  "/control",
  "/sand/control",
  "/sand/dispense",
  "/clay/control",
  "/clay/dispense",
  "/iron_ore/control",
  "/iron_ore/dispense",
  "/iron-ore/control",
  "/iron-ore/dispense",
  "/gypsum/control",
  "/gypsum/dispense",
], (req, res) => {
  res.sendFile(path.join(__dirname, "hopper-control.html"));
});

// Single Item Widget Copy (No Underweight Alarm, Dispense + Slow Counting Animation)
app.get(["/widget-copy", "/widget-copy.html", "/widgets/widget-copy"], (req, res) => {
  res.sendFile(path.join(__dirname, "widget-copy.html"));
});

// Dual routes (Gypsum & Iron Ore / Sand & Clay)
app.get(["/gypsum-ironore", "/gypsum-iron-ore", "/widgets/gypsum-ironore"], (req, res) => {
  res.sendFile(path.join(__dirname, "gypsum-ironore.html"));
});

app.get(["/sand-clay", "/sand-and-clay", "/widgets/sand-clay"], (req, res) => {
  res.sendFile(path.join(__dirname, "sand-clay.html"));
});

// Card 1: Preheating Tower Card (Heater, Fan, Temp & Humidity)
app.get([
  "/preheating-tower",
  "/preheating",
  "/preheat",
  "/widgets/preheating-tower",
  "/widgets/preheating",
  "/preheating-tower.html"
], (req, res) => {
  res.sendFile(path.join(__dirname, "preheating-tower.html"));
});

// Card 2: Kiln (Cline) Card (Motor, Heater, Blower, Temp & Humidity)
app.get([
  "/kiln",
  "/cline",
  "/klin",
  "/widgets/kiln",
  "/widgets/cline",
  "/kiln.html"
], (req, res) => {
  res.sendFile(path.join(__dirname, "kiln.html"));
});

// Card 3: Cooler Zone Card (Temp & Humidity)
app.get([
  "/cooler",
  "/widgets/cooler",
  "/cooler.html"
], (req, res) => {
  res.sendFile(path.join(__dirname, "cooler.html"));
});

// Serve static directory
app.use(express.static(__dirname));

app.listen(port, "0.0.0.0", () => {
  console.log(`[Widget] Listening on http://0.0.0.0:${port}`);
  console.log(`[Widget] Route 1 (Gypsum): http://0.0.0.0:${port}/gypsum`);
  console.log(`[Widget] Route 2 (Clay, Iron Ore, Sand): http://0.0.0.0:${port}/other-three`);
  console.log(`[Widget] Route 3 (Preheating Tower): http://0.0.0.0:${port}/preheating-tower`);
  console.log(`[Widget] Route 4 (Kiln/Cline): http://0.0.0.0:${port}/kiln`);
  console.log(`[Widget] Route 5 (Cooler): http://0.0.0.0:${port}/cooler`);
});
