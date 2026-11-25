import { useState, useEffect } from "react";
import { useLiveData } from "../hooks/useLiveData.js";
import { API_BASE } from "../config.js";

const HOPPER_THEMES = {
  gypsum: {
    label: "Gypsum",
    bgStyle: {
      background: "rgba(30, 64, 175, 0.30)",
      border: "1px solid rgba(147, 197, 253, 0.45)",
      boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.35), inset 0 0 20px rgba(59, 130, 246, 0.2)",
    },
    titleColor: "text-blue-300",
  },
  clay: {
    label: "Clay",
    bgStyle: {
      background: "rgba(109, 40, 217, 0.30)",
      border: "1px solid rgba(192, 132, 252, 0.45)",
      boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.35), inset 0 0 20px rgba(168, 85, 247, 0.2)",
    },
    titleColor: "text-purple-300",
  },
  iron_ore: {
    label: "Iron Ore",
    bgStyle: {
      background: "rgba(190, 18, 60, 0.30)",
      border: "1px solid rgba(251, 113, 133, 0.45)",
      boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.35), inset 0 0 20px rgba(244, 63, 94, 0.2)",
    },
    titleColor: "text-rose-300",
  },
  sand: {
    label: "Sand",
    bgStyle: {
      background: "rgba(194, 65, 12, 0.30)",
      border: "1px solid rgba(251, 146, 60, 0.45)",
      boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.35), inset 0 0 20px rgba(249, 115, 22, 0.2)",
    },
    titleColor: "text-orange-300",
  },
};

export default function HopperWidgetRoute({ hopperKeys = ["gypsum"] }) {
  const { items } = useLiveData();
  const [targets, setTargets] = useState({
    gypsum: 10,
    iron_ore: 10,
    sand: 10,
    clay: 10,
  });
  const [sending, setSending] = useState({});
  const [message, setMessage] = useState({});

  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    return () => {
      document.documentElement.style.background = "";
      document.body.style.background = "";
    };
  }, []);

  const urlParams = new URLSearchParams(window.location.search);
  const layout = urlParams.get("layout") || "row";

  function handleTargetChange(id, val) {
    setTargets((prev) => ({ ...prev, [id]: val }));
  }

  async function dispense(id, label) {
    setSending((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/item/${id}/target`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: Number(targets[id]) || 10 }),
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

  return (
    <div
      style={{ background: "transparent" }}
      className={`p-3 bg-transparent inline-flex ${
        layout === "col" ? "flex-col" : "flex-row flex-wrap"
      } gap-4 items-start`}
    >
      {hopperKeys.map((id) => {
        const theme = HOPPER_THEMES[id] || {
          label: id,
          bgStyle: { background: "rgba(30, 64, 175, 0.3)" },
          titleColor: "text-blue-300",
        };
        const val = items[id]?.value;
        const displayWeight =
          val !== null && val !== undefined
            ? typeof val === "number"
              ? val < 0
                ? 0
                : val.toFixed(1)
              : val
            : "--";

        const isBusy = sending[id];
        const msg = message[id];

        return (
          <div
            key={id}
            style={theme.bgStyle}
            className="w-64 sm:w-72 rounded-2xl p-4 text-white backdrop-blur-md flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${theme.titleColor}`}
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                >
                  {theme.label} Hopper
                </span>
                <span className="text-[10px] bg-white/20 border border-white/25 font-bold px-2 py-0.2 rounded-full">
                  {id === "sand" ? "ESP1" : "ESP3"}
                </span>
              </div>

              <div className="my-2.5 flex items-baseline gap-1">
                <span
                  className="text-3xl font-extrabold tracking-tight"
                  style={{ textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}
                >
                  {displayWeight}
                </span>
                <span className="text-sm font-semibold opacity-85 ml-1">g</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-white/20">
              <div
                className="flex items-center justify-between text-[11px] font-semibold text-white/95"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
              >
                <span>Dispense Target:</span>
                <div className="relative w-20">
                  <input
                    type="number"
                    min="1"
                    value={targets[id]}
                    onChange={(e) => handleTargetChange(id, e.target.value)}
                    className="w-full bg-slate-900/60 text-white font-bold text-xs rounded-lg px-2.5 py-1 focus:outline-none border border-white/25 focus:border-white/50 backdrop-blur-sm"
                  />
                  <span className="absolute right-2 top-1 text-[11px] text-white/70 font-bold">
                    g
                  </span>
                </div>
              </div>

              <button
                onClick={() => dispense(id, theme.label)}
                disabled={isBusy}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs py-2 rounded-xl border border-white/30 shadow-md backdrop-blur-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
              >
                {isBusy ? "Sending…" : msg ? msg : `Dispense ${theme.label}`}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
