import { useState } from "react";
import { API_BASE } from "../config.js";

// One material feed, one card: its own input and its own "Dispense" button, using
// the single-item POST /api/item/:id/target endpoint. Each feed's servo
// starts dispensing on its own click and stops automatically once its load
// cell reports the target weight (Architecture v5, Section 4).
const MATERIALS = [
  { id: "gypsum", label: "Gypsum" },
  { id: "clay", label: "Clay" },
  { id: "iron_ore", label: "Iron Ore" },
  { id: "sand", label: "Sand" },
];

function HopperCard({ id, label }) {
  const [target, setTarget] = useState(1);
  const [status, setStatus] = useState(null); // null | "sending" | "sent" | "error"

  async function dispense() {
    setStatus("sending");
    try {
      const res = await fetch(`${API_BASE}/api/item/${id}/target`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: Number(target) }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      console.error(err);
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
      <label className="text-[14px] text-gray-500 flex items-center gap-1">
        {label} Target (g)
        <span className="text-[12px] bg-gray-100 text-gray-700 font-bold rounded px-1.5 py-0.5">
          {id === "sand" ? "ESP1" : "ESP3"}
        </span>
      </label>
      <input
        type="number"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[16px] font-semibold"
      />
      <button
        onClick={dispense}
        disabled={status === "sending"}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-[14px] font-medium px-3 py-2 rounded-lg flex items-center justify-center gap-1.5"
      >
        <span>&#10148;</span> Dispense {label}
      </button>
      {status === "sent" && <p className="text-[11px] text-emerald-600">target sent</p>}
      {status === "error" && <p className="text-[11px] text-red-600">failed to send</p>}
    </div>
  );
}

export default function MaterialTargets() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-blue-600">&#9678;</span>
        <h2 className="font-semibold text-lg">Material Targets Configuration</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {MATERIALS.map((m) => (
          <HopperCard key={m.id} id={m.id} label={m.label} />
        ))}
      </div>
    </div>
  );
}