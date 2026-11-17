import { useState, useEffect } from "react";
import { API_BASE } from "../config.js";

export default function KilnAutoTriggerCard({ items }) {
  const triggerState = items?.klin_auto_temp_trigger?.value === "on";
  const [enabled, setEnabled] = useState(triggerState);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setEnabled(items?.klin_auto_temp_trigger?.value === "on");
  }, [items?.klin_auto_temp_trigger?.value]);

  const rawTemp = items?.klin_dht_temp?.value;
  const currentTemp = rawTemp !== null && rawTemp !== undefined && !isNaN(rawTemp) ? Number(rawTemp) : null;
  const isAtOrAbove35 = currentTemp !== null && currentTemp >= 35.0;
  const kilnMotorOn = items?.klin?.value === "on";

  async function toggleTrigger() {
    const nextState = !enabled;
    setEnabled(nextState);
    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/api/kiln/auto-trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextState }),
      });
      if (!res.ok) throw new Error("Failed to set kiln auto trigger");
    } catch (err) {
      console.error(err);
      setEnabled(triggerState);
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className={`rounded-2xl border px-4 py-3 shadow-sm transition-all flex flex-wrap items-center justify-between gap-3 ${
        enabled
          ? "bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 dark:from-orange-950/40 dark:via-amber-950/30 dark:to-orange-950/40 border-orange-400/60 dark:border-orange-500/50 ring-1 ring-orange-400/30"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
      }`}
    >
      {/* Left: Info & Description */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2 rounded-xl text-xl flex items-center justify-center shrink-0 ${
          enabled ? "bg-orange-500/20 text-orange-600 dark:text-orange-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
        }`}>
          <span>🔥</span>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-slate-900 dark:text-white font-extrabold text-xs sm:text-sm tracking-wide flex items-center gap-1.5">
              <span>KILN 35°C AUTO-START TRIGGER</span>
            </h3>

            {/* Status Pill */}
            {enabled ? (
              isAtOrAbove35 ? (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  ≥35°C REACHED — KILN MOTOR STARTED
                </span>
              ) : (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                  ARMED: WAITING FOR 35°C
                </span>
              )
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                OFF (Manual Control)
              </span>
            )}
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-snug">
            Automatically starts Kiln Motor when chamber temperature reaches <strong className="text-orange-600 dark:text-orange-400 font-semibold">35.0°C</strong> or above.
          </p>
        </div>
      </div>

      {/* Middle: Live Kiln Temp Telemetry */}
      <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shrink-0">
        <div className="text-left">
          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-400 block">
            Chamber Temp
          </span>
          <span className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100">
            {currentTemp !== null ? `${currentTemp.toFixed(1)}°C` : "--"}
          </span>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

        <div className="text-left">
          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-400 block">
            Target
          </span>
          <span className="text-sm sm:text-base font-extrabold text-orange-600 dark:text-orange-400">
            35.0°C
          </span>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

        <div className="text-left">
          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-400 block">
            Kiln Motor
          </span>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
            kilnMotorOn
              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
          }`}>
            {kilnMotorOn ? "RUNNING" : "STOPPED"}
          </span>
        </div>
      </div>

      {/* Right: Master Toggle Switch */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className={`text-xs font-extrabold hidden sm:inline ${
          enabled ? "text-orange-600 dark:text-orange-400" : "text-slate-400 dark:text-slate-400"
        }`}>
          {enabled ? "AUTO ON" : "AUTO OFF"}
        </span>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={sending}
          onClick={toggleTrigger}
          className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 shadow-inner ${
            enabled ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/30" : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
          }`}
          title="Toggle Kiln 35°C Auto-Start Trigger"
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
              enabled ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
