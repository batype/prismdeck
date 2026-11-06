import { useState } from "react";
import { PrismButton, PrismGauge, type PrismConfig } from "@batype/prismdeck";
import { DEFAULT_CONFIG, validateConfig } from "@batype/prismdeck/config";
import "@batype/prismdeck/style.css";

export default function ThemeExample() {
  const [light, setLight] = useState(false);
  const config: PrismConfig = validateConfig({
    ...DEFAULT_CONFIG,
    accent: "#8ce2ff",
    surface: light ? "light" : "dark",
    radius: 16,
    motion: true,
  });
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PrismGauge config={config} title="同一份主题配置" value={64} />
      <PrismButton config={config} onClick={() => setLight((v) => !v)}>
        切换到{light ? "暗色" : "亮色"}材质
      </PrismButton>
    </div>
  );
}
