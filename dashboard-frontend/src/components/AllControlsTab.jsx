import ActuatorControl from "./ActuatorControl.jsx";
import MasterSwitch from "./MasterSwitch.jsx";

const ACTUATORS = [
  { id: "lime_stone", label: "Lime Stone Gate", commands: ["open", "close"], tag: "GATE", tagColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" },
  { id: "conveyor_1", label: "Conveyor 1", tag: "FEED", tagColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" },
  { id: "conveyor_2", label: "Crusher + Conv 2", tag: "FEED", tagColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" },
  { id: "conveyor_3", label: "Conveyor 3", tag: "CONVEYOR", tagColor: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300" },
  { id: "conveyor_4", label: "Conveyor 4", tag: "CONVEYOR", tagColor: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300" },
  { id: "klin", label: "Kiln Motor", tag: "KILN", tagColor: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300" },
  { id: "klin_heater", label: "Kiln Heater", tag: "THERMAL", tagColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" },
  { id: "heat_blower", label: "Heat Blower", tag: "THERMAL", tagColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" },
  { id: "preheating_tower_heater", label: "Preheating Heater", tag: "TOWER", tagColor: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300" },
  { id: "preheating_tower_fan", label: "Preheating Fan", tag: "TOWER", tagColor: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300" },
  { id: "vibration_motor", label: "Vibration Motor", tag: "AGITATION", tagColor: "bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300" },
  { id: "ball_mill_1", label: "Ball Mill 1", tag: "MILL", tagColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300" },
  { id: "ball_mill_2", label: "Ball Mill 2", tag: "MILL", tagColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300" },
];

export default function AllControlsTab({ items, manualOverrides }) {
  const activeCount = ACTUATORS.filter((a) => items[a.id]?.value === "on" || items[a.id]?.value === "open").length;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Master Relay Controller */}
      <MasterSwitch items={items} />

      {/* 13 Relay Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {ACTUATORS.map((a) => (
          <ActuatorControl
            key={a.id}
            id={a.id}
            label={a.label}
            tag={a.tag}
            tagColor={a.tagColor}
            commands={a.commands}
            isManualOverride={manualOverrides[a.id]}
            currentState={items[a.id]?.value}
          />
        ))}

        {/* Balancing Hardware Info Banner to fill row 4 symmetrically */}
        <div className="hidden lg:flex col-span-3 items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 shadow-sm transition-colors">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              Hardware Matrix Active
            </span>
            <span className="text-slate-400 dark:text-slate-500">
              • 13 Independent Relay Channels via ESP2 &amp; ESP1
            </span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {activeCount} / 13 Engaged
          </span>
        </div>
      </div>
    </div>
  );
}
