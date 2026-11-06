import { useState } from "react";
import { PrismHeatmap } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

const data = Array.from({ length: 56 }, (_, i) => ({
  label: `第 ${i + 1} 天`,
  value: (i * 7) % 24,
}));

export default function HeatmapExample() {
  const [selected, setSelected] = useState("方向键浏览，Enter 选择");
  return (
    <div>
      <PrismHeatmap
        title="开发活动"
        data={data}
        rows={7}
        unit="次"
        onSelect={(point) => setSelected(`${point.label}：${point.value} 次`)}
      />
      <p role="status" style={{ color: "#aab3a4", fontSize: 13 }}>
        {selected}
      </p>
    </div>
  );
}
