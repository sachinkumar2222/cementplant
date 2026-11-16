import ActuatorControl from "./ActuatorControl.jsx";

const CONVEYORS = [
  { id: "conveyor_1", label: "Conveyor 1", tag: "FEED", tagColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" },
  { id: "conveyor_2", label: "Crusher + Conveyor 2", tag: "CRUSHER", tagColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" },
  { id: "conveyor_3", label: "Conveyor 3", tag: "TRANSFER", tagColor: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300" },
  { id: "conveyor_4", label: "Conveyor 4", tag: "TRANSFER", tagColor: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300" },
];

const MILLS = [
  { id: "ball_mill_1", label: "Ball Mill 1", tag: "PRIMARY", tagColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300" },
  { id: "ball_mill_2", label: "Ball Mill 2", tag: "SECONDARY", tagColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300" },
  { id: "vibration_motor", label: "Vibration Motor", tag: "AGITATOR", tagColor: "bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300" },
];

export default function ConveyorsTab({ items, manualOverrides }) {
  const vibVal = items.vibration_sensor?.value;

  return (
    <div className="flex flex-col gap-3">
      {/* Vibration Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-4 text-white shadow-md shadow-pink-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
              Vibration Sensor
            </span>
            <span className="text-[10px] bg-white/20 font-bold px-2 py-0.2 rounded-full">
              ESP2
            </span>
          </div>
          <div className="my-1.5">
            <span className="text-3xl font-extrabold tracking-tight">
              {vibVal !== null && vibVal !== undefined ? vibVal : "--"}
            </span>
            <span className="text-xs opacity-80 ml-1">Hz</span>
          </div>
          <p className="text-[10px] opacity-75">Mechanical agitation sensor</p>
        </div>

        <div className="sm:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col justify-center transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">⚙️</span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Milling &amp; Material Transfer Lines</h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Independent controls for primary crusher transfer, 4-stage conveyor routing, and ball mill grinding circuits.
          </p>
        </div>
      </div>

      {/* 4 Conveyors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {CONVEYORS.map((c) => (
          <ActuatorControl
            key={c.id}
            id={c.id}
            label={c.label}
            tag={c.tag}
            tagColor={c.tagColor}
            isManualOverride={manualOverrides[c.id]}
            currentState={items[c.id]?.value}
          />
        ))}
      </div>

      {/* 3 Mills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {MILLS.map((m) => (
          <ActuatorControl
            key={m.id}
            id={m.id}
            label={m.label}
            tag={m.tag}
            tagColor={m.tagColor}
            isManualOverride={manualOverrides[m.id]}
            currentState={items[m.id]?.value}
          />
        ))}
      </div>
    </div>
  );
}
