import { useState, useEffect } from "react";
import { useLiveData } from "./hooks/useLiveData.js";
import AllControlsTab from "./components/AllControlsTab.jsx";
import KilnTab from "./components/KilnTab.jsx";
import ConveyorsTab from "./components/ConveyorsTab.jsx";
import HoppersTab from "./components/HoppersTab.jsx";
import OtaManagement from "./components/OtaManagement.jsx";
import HopperWidgetRoute from "./components/HopperWidgetRoute.jsx";

const TABS = [
  {
    id: "relays",
    label: "All Relays",
    icon: "⚡",
    gradient: "from-indigo-600 to-purple-700",
    shadow: "shadow-indigo-500/25",
  },
  {
    id: "kiln",
    label: "Kiln & Thermal",
    icon: "🔥",
    gradient: "from-amber-500 to-orange-600",
    shadow: "shadow-orange-500/25",
  },
  {
    id: "conveyors",
    label: "Conveyors & Mills",
    icon: "⚙️",
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/25",
  },
  {
    id: "hoppers",
    label: "Hoppers & Dispense",
    icon: "⚖️",
    gradient: "from-blue-500 to-cyan-600",
    shadow: "shadow-blue-500/25",
  },
];

export default function App() {
  const {
    items,
    connected,
    deviceStatus,
    manualOverrides,
    kilnTemperature,
    refresh,
    refreshing,
    resetKilnBaseline,
    otaStatus,
  } = useLiveData();

  const [activeTab, setActiveTab] = useState("relays");
  const [showOtaSection, setShowOtaSection] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Theme state: checks ?theme= query param, localStorage, or defaults to clean light mode
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const themeParam = urlParams.get("theme");
      if (themeParam === "light") return false;
      if (themeParam === "dark") return true;

      const saved = localStorage.getItem("theme");
      if (saved !== null) return saved === "dark";
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const esp1Info = deviceStatus?.esp1 || { status: "unknown", lastSeen: null };
  const esp1LastSeen = esp1Info.lastSeen || items.esp1_status?.ts;
  const isEsp1Online =
    (esp1Info.status === "online" || items.esp1_status?.value === "online" || !!esp1LastSeen) &&
    esp1LastSeen &&
    Date.now() - esp1LastSeen < 15000;

  const esp2Info = deviceStatus?.esp2 || { status: "unknown", lastSeen: null };
  const esp2LastSeen = esp2Info.lastSeen || items.esp2_status?.ts;
  const isEsp2Online =
    (esp2Info.status === "online" || items.esp2_status?.value === "online" || !!esp2LastSeen) &&
    esp2LastSeen &&
    Date.now() - esp2LastSeen < 15000;

  const path = typeof window !== "undefined" ? window.location.pathname.toLowerCase() : "";
  const search = typeof window !== "undefined" ? window.location.search.toLowerCase() : "";

  // Dedicated transparent Hopper Card routes:
  // Route 1: Gypsum (Single Hopper Card)
  if (
    path === "/gypsum" ||
    path.endsWith("/gypsum") ||
    search.includes("widget=gypsum") ||
    search.includes("route=gypsum") ||
    search.includes("route=1")
  ) {
    return <HopperWidgetRoute hopperKeys={["gypsum"]} />;
  }

  // Route 2: Materials (Clay, Iron Ore, Sand)
  if (
    path.includes("materials") ||
    path.includes("matrails") ||
    path.includes("other") ||
    path.includes("clay-ironore-sand") ||
    path.includes("sand-clay-ironore") ||
    search.includes("widget=materials") ||
    search.includes("widget=matrails") ||
    search.includes("widget=other") ||
    search.includes("route=2")
  ) {
    return <HopperWidgetRoute hopperKeys={["clay", "iron_ore", "sand"]} />;
  }

  // Backward-compatible dual routes
  if (path.includes("gypsum-ironore") || search.includes("gypsum-ironore")) {
    return <HopperWidgetRoute hopperKeys={["gypsum", "iron_ore"]} />;
  }

  if (path.includes("sand-clay") || search.includes("sand-clay")) {
    return <HopperWidgetRoute hopperKeys={["sand", "clay"]} />;
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col p-3.5 max-w-6xl mx-auto text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-white dark:bg-slate-900 rounded-2xl px-4 py-2.5 border border-slate-200/90 dark:border-slate-800 shadow-sm shrink-0 transition-colors">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📈</span>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
              Cement Plant Digital Twin
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Real-Time PID &amp; Hardware SCADA</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-all border shadow-sm bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-amber-300"
          >
            <span>{darkMode ? "☀️" : "🌙"}</span>
            <span>{darkMode ? "Light" : "Dark"}</span>
          </button>

          {/* Refresh */}
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 disabled:opacity-60 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-xl transition-colors cursor-pointer text-xs font-semibold text-blue-700"
          >
            <span className={`text-[11px] ${refreshing ? "animate-spin" : ""}`}>↻</span>
            <span>{refreshing ? "Refreshing…" : "Refresh"}</span>
          </button>

          {/* WS */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                connected ? "bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900" : "bg-red-500 ring-2 ring-red-200 dark:ring-red-900"
              }`}
            />
            <span>WS</span>
          </div>

          {/* ESP1 */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold ${
              isEsp1Online
                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isEsp1Online ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span>ESP1</span>
          </div>

          {/* ESP2 */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold ${
              isEsp2Online
                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isEsp2Online ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span>ESP2</span>
          </div>

          {/* Options / OTA */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-xl text-xs font-semibold cursor-pointer shadow-sm"
            >
              ⚙ Options
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50">
                <button
                  onClick={() => {
                    setShowOtaSection(!showOtaSection);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700"
                >
                  {showOtaSection ? "⚡ Hide Firmware OTA" : "⚡ Show Firmware OTA"}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hidden OTA Panel */}
      {showOtaSection && (
        <div className="mb-3 shrink-0">
          <OtaManagement
            otaStatus={otaStatus}
            isEsp1Online={isEsp1Online}
            isEsp2Online={isEsp2Online}
            onClose={() => setShowOtaSection(false)}
          />
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <nav className="flex gap-2 mb-3 shrink-0">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shadow-sm ${
                isActive
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-md ${tab.shadow} scale-[1.01]`
                  : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tab Contents: No-Scroll Architecture */}
      <main key={activeTab} className="flex-1 overflow-y-auto lg:overflow-hidden animate-tab-content">
        {activeTab === "relays" && (
          <AllControlsTab items={items} manualOverrides={manualOverrides} />
        )}

        {activeTab === "kiln" && (
          <KilnTab
            items={items}
            kilnTemperature={kilnTemperature}
            resetKilnBaseline={resetKilnBaseline}
            manualOverrides={manualOverrides}
          />
        )}

        {activeTab === "conveyors" && (
          <ConveyorsTab items={items} manualOverrides={manualOverrides} />
        )}

        {activeTab === "hoppers" && (
          <HoppersTab items={items} manualOverrides={manualOverrides} />
        )}
      </main>
    </div>
  );
}
