import { useState, useEffect } from "react";
import { API_BASE } from "../config.js";

const HOPPER_THEMES = {
  gypsum: {
    bg: "bg-gradient-to-br from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/20",
    btnBg: "bg-white text-blue-700 hover:bg-blue-50 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800",
  },
  clay: {
    bg: "bg-gradient-to-br from-purple-500 to-purple-600",
    shadow: "shadow-purple-500/20",
    btnBg: "bg-white text-purple-700 hover:bg-purple-50 dark:bg-slate-900 dark:text-purple-300 dark:hover:bg-slate-800",
  },
  iron_ore: {
    bg: "bg-gradient-to-br from-rose-500 to-rose-600",
    shadow: "shadow-rose-500/20",
    btnBg: "bg-white text-rose-700 hover:bg-rose-50 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-slate-800",
  },
  sand: {
    bg: "bg-gradient-to-br from-orange-500 to-orange-600",
    shadow: "shadow-orange-500/20",
    btnBg: "bg-white text-orange-700 hover:bg-orange-50 dark:bg-slate-900 dark:text-orange-300 dark:hover:bg-slate-800",
  },
};

const HOPPERS = [
  { id: "gypsum", label: "Gypsum" },
  { id: "clay", label: "Clay" },
  { id: "iron_ore", label: "Iron Ore" },
  { id: "sand", label: "Sand" },
];

export default function HoppersTab({ items }) {
  const [targets, setTargets] = useState({
    gypsum: 1,
    clay: 1,
    iron_ore: 1,
    sand: 1,
  });
  const [sending, setSending] = useState({});
  const [message, setMessage] = useState({});
  const [gateSending, setGateSending] = useState(false);

  function handleTargetChange(id, val) {
    setTargets((prev) => ({ ...prev, [id]: val }));
  }

  async function dispense(id, label) {
    setSending((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/item/${id}/target`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: Number(targets[id]) || 1 }),
      });
      if (!res.ok) throw new Error("Failed");
      setMessage((prev) => ({ ...prev, [id]: "Target Sent ✓" }));
      setTimeout(() => setMessage((prev) => ({ ...prev, [id]: null })), 3000);
    } catch (err) {
      console.error(err);
      setMessage((prev) => ({ ...prev, [id]: "Failed" }));
      setTimeout(() => setMessage((prev) => ({ ...prev, [id]: null })), 3000);
    } finally {
      setSending((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function emptyTray(id) {
    setSending((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/item/${id}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed");
      setMessage((prev) => ({ ...prev, [id]: "Tray Emptied ✓" }));
      setTimeout(() => setMessage((prev) => ({ ...prev, [id]: null })), 3000);
    } catch (err) {
      console.error(err);
      setMessage((prev) => ({ ...prev, [id]: "Reset Failed" }));
      setTimeout(() => setMessage((prev) => ({ ...prev, [id]: null })), 3000);
    } finally {
      setSending((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function stopDispense(id) {
    try {
      await fetch(`${API_BASE}/api/item/${id}/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      setMessage((prev) => ({ ...prev, [id]: "Stopped ✓" }));
      setTimeout(() => setMessage((prev) => ({ ...prev, [id]: null })), 3000);
    } catch (err) {
      console.error(err);
    }
  }

  async function emptyAllTrays() {
    try {
      await fetch(`${API_BASE}/api/materials/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ material: "all" }),
      });
      alert("Reset command sent for all material trays.");
    } catch (err) {
      console.error(err);
    }
  }

  async function stopAll() {
    try {
      await fetch(`${API_BASE}/api/materials/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ material: "all" }),
      });
    } catch (err) {
      console.error(err);
    }
  }

  const gateState = items.lime_stone?.value;
  const isGateOpen = gateState === "open";
  const [localGateOpen, setLocalGateOpen] = useState(isGateOpen);

  useEffect(() => {
    setLocalGateOpen(gateState === "open");
  }, [gateState]);

  async function sendGateCommand(cmd) {
    setGateSending(true);
    setLocalGateOpen(cmd === "open");
    try {
      await fetch(`${API_BASE}/api/item/lime_stone/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
    } catch (e) {
      console.error(e);
      setLocalGateOpen(gateState === "open");
    } finally {
      setGateSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Dispensing System
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            ESP1 (Sand) • ESP3 (Gypsum, Clay, Iron Ore)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={emptyAllTrays}
            className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-all cursor-pointer"
            title="Sends demo_reset to reset cumulative demonstration weights to zero"
          >
            ↺ Empty All Trays
          </button>
          <button
            onClick={stopAll}
            className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 transition-all cursor-pointer"
            title="Stops all active dispensing actions"
          >
            ⏹ Stop All
          </button>
        </div>
      </div>

      {/* 4 Hoppers Dispenser Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {HOPPERS.map((h) => {
          const val = items[h.id]?.value;
          const displayWeight =
            val !== null && val !== undefined
              ? typeof val === "number"
                ? val < 0
                  ? 0
                  : val.toFixed(1)
                : val
              : "--";

          const theme = HOPPER_THEMES[h.id] || HOPPER_THEMES.gypsum;
          const isBusy = sending[h.id];
          const msg = message[h.id];
          const controllerSource = h.id === "sand" ? "ESP1" : "ESP3";

          return (
            <div
              key={h.id}
              className={`${theme.bg} rounded-2xl p-4 text-white shadow-md ${theme.shadow} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold uppercase tracking-wider opacity-90">
                    {h.label} Hopper
                  </span>
                  <span className="text-[12px] bg-white/20 font-bold px-2 py-0.5 rounded-full">
                    {controllerSource}
                  </span>
                </div>

                <div className="my-2">
                  <span className="text-3xl font-extrabold tracking-tight">
                    {displayWeight}
                  </span>
                  <span className="text-sm font-semibold opacity-85 ml-1">g</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-white/20">
                <div className="flex items-center justify-between text-[18px] font-semibold opacity-95">
                  <span>Dispense Target:</span>
                  <div className="relative w-24">
                    <input
                      type="number"
                      min="1"
                      value={targets[h.id]}
                      onChange={(e) => handleTargetChange(h.id, e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 font-bold text-[18px] rounded-lg px-2.5 py-1 focus:outline-none shadow-inner"
                    />
                    <span className="absolute right-2.5 top-1 text-[18px] text-gray-500 dark:text-gray-400 font-bold">
                      g
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => dispense(h.id, h.label)}
                  disabled={isBusy}
                  className={`w-full ${theme.btnBg} font-bold text-[18px] py-2.5 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer`}
                >
                  {isBusy ? "Sending…" : msg ? msg : `Dispense ${h.label}`}
                </button>

                <div className="flex items-center gap-1.5 pt-0.5">
                  <button
                    onClick={() => emptyTray(h.id)}
                    disabled={isBusy}
                    className="flex-1 bg-black/20 hover:bg-black/30 font-semibold text-[12px] py-1.5 rounded-lg text-white/90 transition-all cursor-pointer"
                    title="Reset cumulative weight for this hopper"
                  >
                    ↺ Empty Tray
                  </button>
                  <button
                    onClick={() => stopDispense(h.id)}
                    className="bg-black/20 hover:bg-black/30 font-semibold text-[12px] px-3 py-1.5 rounded-lg text-white/90 transition-all cursor-pointer"
                    title="Stop dispensing for this hopper"
                  >
                    ⏹ Stop
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lime Stone Gate */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 shadow-sm flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚜</span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                Lime Stone Raw Material Gate
              </h4>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                GATE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">ESP1 Gate Servo</p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={localGateOpen}
          disabled={gateSending}
          onClick={() => sendGateCommand(localGateOpen ? "close" : "open")}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 shadow-inner ${
            localGateOpen ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white dark:bg-slate-100 shadow transition-transform duration-200 ease-in-out ${
              localGateOpen ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
