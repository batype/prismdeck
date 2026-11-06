import { useState } from "react";
import { PrismGauge, PrismButton } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function GaugeExample() {
  const [value, setValue] = useState(35);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PrismGauge
        title="CPU 使用率"
        description="由外部业务状态控制。"
        value={value}
        min={0}
        max={100}
        unit="%"
      />
      <PrismButton
        variant="outline"
        onClick={() => setValue((v) => (v === 35 ? 72 : 35))}
      >
        切换到 {value === 35 ? 72 : 35}%
      </PrismButton>
    </div>
  );
}
