import { useLiveData } from "../hooks/useLiveData.js";

const ITEM_CONFIGS = {
  gypsum: { label: "Gypsum", color: "#38bdf8", defaultColor: "text-sky-400" },
  iron_ore: { label: "Iron Ore", color: "#f43f5e", defaultColor: "text-rose-500" },
  sand: { label: "Sand", color: "#f97316", defaultColor: "text-orange-500" },
  clay: { label: "Clay", color: "#a855f7", defaultColor: "text-purple-400" },
};

export default function TransparentWidget({ itemKeys = ["gypsum", "iron_ore"] }) {
  const { items } = useLiveData();

  const urlParams = new URLSearchParams(window.location.search);
  const layout = urlParams.get("layout") || "row";
  const customSize = urlParams.get("size") || "24px";
  const customColor = urlParams.get("color");
  const valueOnly = urlParams.get("valueOnly") === "true" || urlParams.get("label") === "false";
  const hideAlarm = urlParams.get("hideAlarm") === "true" || urlParams.get("alarm") === "false";
  const decimals = Number(urlParams.get("decimals") || 2);

  function formatVal(v) {
    if (v === null || v === undefined) return "--";
    if (typeof v === "number") {
      const nonNeg = v < 0 ? 0 : v;
      return Number.isInteger(nonNeg) ? nonNeg : nonNeg.toFixed(decimals);
    }
    return v;
  }

  return (
    <div
      style={{
        background: "transparent",
        fontSize: isNaN(customSize) ? customSize : `${customSize}px`,
      }}
      className={`inline-flex p-1 select-none font-sans ${
        layout === "col" ? "flex-col items-start gap-1.5" : "flex-row items-center gap-3.5"
      }`}
    >
      {itemKeys.map((key, index) => {
        const conf = ITEM_CONFIGS[key] || { label: key, color: "#38bdf8" };
        const data = items[key] || {};
        const val = data.value;
        const unit = data.unit || "g";
        const weight = Number(val);

        const isOverload = !hideAlarm && Number.isFinite(weight) && weight > 20;
        const isUnderweight = !hideAlarm && Number.isFinite(weight) && weight < 5 && val !== null;

        return (
          <div key={key} className="flex items-center gap-3">
            {index > 0 && layout !== "col" && (
              <span className="text-white/40 font-thin text-lg select-none">|</span>
            )}

            <div
              className="inline-flex items-baseline gap-1.5 whitespace-nowrap"
              style={{
                color: customColor || conf.color,
                textShadow: "0 1px 4px rgba(0, 0, 0, 0.9), 0 0 10px rgba(0, 0, 0, 0.5)",
              }}
            >
              {!valueOnly && (
                <span className="font-bold opacity-95">{conf.label}:</span>
              )}
              <span className="font-extrabold tracking-tight">{formatVal(val)}</span>
              <span className="text-[0.75em] font-semibold opacity-85 ml-0.5">{unit}</span>

              {isOverload && (
                <span className="text-[11px] font-extrabold text-red-500 bg-red-500/20 border border-red-500/60 px-1.5 py-0.2 rounded animate-pulse ml-1">
                  OVERLOAD
                </span>
              )}
              {isUnderweight && (
                <span className="text-[11px] font-extrabold text-red-500 bg-red-500/20 border border-red-500/60 px-1.5 py-0.2 rounded animate-pulse ml-1">
                  UNDERWEIGHT
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

