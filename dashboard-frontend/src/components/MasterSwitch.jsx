import { useState } from "react";
import { API_BASE } from "../config.js";

const ACTUATOR_IDS = [
  "crusher", "conveyor_1", "conveyor_2", "conveyor_3", "conveyor_4",
  "klin", "klin_heater", "heat_blower",
  "preheating_tower_fan", "preheating_tower_heater",
  "vibration_motor", "ball_mill_1", "ball_mill_2",
];

export default function MasterSwitch({ items }) {
  const [sending, setSending] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);
  const [notification, setNotification] = useState(null);

  const activeCount = ACTUATOR_IDS.filter((id) => items[id]?.value === "on").length;

  async function sendMasterCommand(command) {
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/actuators/master`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();
      setLastCommand(command);
      setNotification(`Master ${command.toUpperCase()} (${data.publishedCount ?? ACTUATOR_IDS.length})`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error(err);
      setNotification("Failed");
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 rounded-2xl shadow-sm px-4 py-3 border border-slate-200 dark:border-indigo-900/50 flex flex-wrap items-center justify-between gap-3 shrink-0 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-xl">⚡</span>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-slate-900 dark:text-white font-extrabold text-xs sm:text-sm tracking-wide">
              MASTER RELAY CONTROLLER
            </h3>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200 dark:bg-emerald-950/80 dark:border-emerald-500/40 dark:text-emerald-300">
              {activeCount} / {ACTUATOR_IDS.length} ON
            </span>
          </div>
          <p className="text-slate-500 dark:text-indigo-300/70 text-[10px] hidden sm:block">
            Controls all 13 relays simultaneously across ESP2
          </p>
        </div>
      </div>

      {notification && (
        <span className="text-xs font-bold px-2 py-0.5 rounded-md border bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:border-amber-500/40 dark:text-amber-300">
          {notification}
        </span>
      )}

      <div className="flex items-center gap-2">
        <button
          disabled={sending}
          onClick={() => sendMasterCommand("on")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm text-white ${
            lastCommand === "on"
              ? "bg-emerald-500 shadow-emerald-500/30 scale-105"
              : "bg-emerald-600 hover:bg-emerald-500"
          } disabled:opacity-50`}
        >
          <span>🟢</span>
          <span>{sending && lastCommand !== "off" ? "Sending…" : "MASTER ON"}</span>
        </button>

        <button
          disabled={sending}
          onClick={() => sendMasterCommand("off")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm text-white ${
            lastCommand === "off"
              ? "bg-rose-500 shadow-rose-500/30 scale-105"
              : "bg-rose-600 hover:bg-rose-500"
          } disabled:opacity-50`}
        >
          <span>🔴</span>
          <span>{sending && lastCommand !== "on" ? "Sending…" : "MASTER OFF"}</span>
        </button>
      </div>
    </div>
  );
}
