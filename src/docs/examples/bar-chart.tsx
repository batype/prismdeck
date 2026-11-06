import { useState } from "react";
import { PrismBarChart } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function BarExample() {
  const [selected, setSelected] = useState("尚未选择");
  return (
    <div>
      <PrismBarChart
        title="月度净增长"
        unit="人"
        data={[
          { label: "一月", value: 36 },
          { label: "二月", value: -12 },
          { label: "三月", value: 58 },
        ]}
        onSelect={(point) => setSelected(`${point.label}：${point.value} 人`)}
      />
      <p role="status" style={{ color: "#aab3a4", fontSize: 13 }}>
        {selected}
      </p>
    </div>
  );
}
