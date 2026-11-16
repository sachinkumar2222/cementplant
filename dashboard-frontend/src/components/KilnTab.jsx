import ActuatorControl from "./ActuatorControl.jsx";

const ZONES = [
  {
    name: "Kiln Zone",
    icon: "🔥",
    borderColor: "border-orange-200 dark:border-orange-950",
    badgeBg: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300",
    tempId: "klin_dht_temp",
    humId: "klin_dht_humidity",
  },
  {
    name: "Preheating Tower",
    icon: "🗼",
    borderColor: "border-purple-200 dark:border-purple-950",
    badgeBg: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    tempId: "preheating_tower_dht_temp",
    humId: "preheating_tower_dht_humidity",
  },
  {
    name: "Cooler Zone",
    icon: "❄️",
    borderColor: "border-teal-200 dark:border-teal-950",
    badgeBg: "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300",
    tempId: "cooler_dht_temp",
    humId: "cooler_dht_humidity",
  },
];

const KILN_ACTUATORS = [
  { id: "klin", label: "Kiln Motor", tag: "MOTOR", tagColor: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300" },
  { id: "klin_heater", label: "Kiln Heater", tag: "HEATER", tagColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" },
  { id: "heat_blower", label: "Heat Blower", tag: "DRAFT", tagColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" },
  { id: "preheating_tower_heater", label: "Preheating Heater", tag: "PREHEAT", tagColor: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300" },
  { id: "preheating_tower_fan", label: "Preheating Fan", tag: "FAN", tagColor: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300" },
];

export default function KilnTab({
  items,
  kilnTemperature,
  resetKilnBaseline,
  manualOverrides,
}) {
  const { startingTemp, afterHeaterTemp } = kilnTemperature || {};
  const hasStarting = startingTemp !== null && startingTemp !== undefined;
  const hasAfter = afterHeaterTemp !== null && afterHeaterTemp !== undefined;
  const delta = hasStarting && hasAfter ? (afterHeaterTemp - startingTemp).toFixed(1) : null;

  return (
    <div className="flex flex-col gap-3">
      {/* 3 Temperature Tracking Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Starting Temp */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 text-white shadow-md shadow-blue-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
              Starting Temp
            </span>
            <button
              onClick={resetKilnBaseline}
              className="text-[10px] font-bold bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
            >
              ↺ Reset
            </button>
          </div>
          <div className="my-1.5">
            <span className="text-3xl font-extrabold tracking-tight">
              {hasStarting ? Number(startingTemp).toFixed(1) : "--"}
            </span>
            <span className="text-sm font-semibold opacity-85 ml-1">°C</span>
          </div>
          <p className="text-[10px] opacity-75">Baseline before heater ON</p>
        </div>

        {/* Live Kiln Temp */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-md shadow-orange-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
              Live Kiln Probe
            </span>
            <span className="text-[10px] bg-white/25 px-2 py-0.2 rounded-full font-bold">
              ESP2
            </span>
          </div>
          <div className="my-1.5">
            <span className="text-3xl font-extrabold tracking-tight">
              {hasAfter ? Number(afterHeaterTemp).toFixed(1) : "--"}
            </span>
            <span className="text-sm font-semibold opacity-85 ml-1">°C</span>
          </div>
          <p className="text-[10px] opacity-75">Target Setpoint: 35.0°C</p>
        </div>

        {/* Temp Gain */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white shadow-md shadow-emerald-500/20 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
            Temp Gain (ΔT)
          </span>
          <div className="my-1.5">
            <span className="text-3xl font-extrabold tracking-tight">
              {delta !== null ? `${Number(delta) > 0 ? "+" : ""}${delta}` : "--"}
            </span>
            <span className="text-sm font-semibold opacity-85 ml-1">°C</span>
          </div>
          <p className="text-[10px] opacity-75">
            {delta !== null && Number(delta) > 0 ? "Kiln heating up 🔥" : "Baseline stable"}
          </p>
        </div>
      </div>

      {/* 3 Zone Ambient Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {ZONES.map((zone) => {
          const tempVal = items[zone.tempId]?.value;
          const humVal = items[zone.humId]?.value;
          const displayTemp = tempVal !== null && tempVal !== undefined ? Number(tempVal).toFixed(1) : "--";
          const displayHum = humVal !== null && humVal !== undefined ? Number(humVal).toFixed(1) : "--";

          return (
            <div
              key={zone.name}
              className={`bg-white dark:bg-slate-900 rounded-2xl border ${zone.borderColor} p-3.5 shadow-sm flex flex-col justify-between transition-colors`}
            >
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{zone.icon}</span>
                  <h4 className="font-bold text-xs uppercase tracking-wide text-slate-800 dark:text-slate-100">
                    {zone.name}
                  </h4>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${zone.badgeBg}`}>
                  DHT11
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Temp</p>
                  <p className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                    {displayTemp}<span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-0.5">°C</span>
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Humidity</p>
                  <p className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                    {displayHum}<span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-0.5">%</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5 Kiln Actuators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {KILN_ACTUATORS.map((a) => (
          <ActuatorControl
            key={a.id}
            id={a.id}
            label={a.label}
            tag={a.tag}
            tagColor={a.tagColor}
            isManualOverride={manualOverrides[a.id]}
            currentState={items[a.id]?.value}
          />
        ))}
      </div>
    </div>
  );
}
