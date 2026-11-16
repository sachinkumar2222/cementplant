import { useState, useEffect } from "react";
import { API_BASE } from "../config.js";

export default function ActuatorControl({
  id,
  label,
  tag,
  tagColor,
  isManualOverride,
  currentState,
  commands = ["on", "off"],
}) {
  const isServerActive = currentState === commands[0];
  const [localActive, setLocalActive] = useState(isServerActive);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setLocalActive(currentState === commands[0]);
  }, [currentState, commands]);

  async function toggle() {
    const nextActive = !localActive;
    const nextCommand = nextActive ? commands[0] : commands[1];

    setLocalActive(nextActive);
    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/api/item/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: nextCommand }),
      });
      if (!res.ok) throw new Error("Action failed");
    } catch (err) {
      console.error(err);
      setLocalActive(currentState === commands[0]);
    } finally {
      setSending(false);
    }
  }

  async function resumeAuto() {
    setSending(true);
    try {
      await fetch(`${API_BASE}/api/item/${id}/resume-auto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className={`rounded-xl border px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between transition-all shadow-sm ${
        localActive
          ? "bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600 ring-1 ring-emerald-400/40"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
      }`}
    >
      <div className="flex flex-col min-w-0 pr-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight"
            title={label}
          >
            {label}
          </span>
          {tag && (
            <span
              className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider shrink-0 ${
                tagColor || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {tag}
            </span>
          )}
        </div>

        {isManualOverride && (
          <button
            disabled={sending}
            onClick={resumeAuto}
            className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold text-left cursor-pointer mt-0.5"
          >
            Manual Override (Auto PID)
          </button>
        )}
      </div>

      {/* Pure Toggle Switch: Green for ON, Red for OFF */}
      <button
        type="button"
        role="switch"
        aria-checked={localActive}
        disabled={sending}
        onClick={toggle}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 shadow-inner ${
          localActive ? "bg-green-500" : "bg-red-500"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
            localActive ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
