import { useState } from "react";
import {
  PrismButton,
  PrismGauge,
  PrismAreaChart,
  PrismBadge,
} from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function Dashboard() {
  const [load, setLoad] = useState(35);
  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 600 }}>
      <PrismBadge tone="success">系统运行正常</PrismBadge>
      <PrismGauge title="CPU 使用率" value={load} unit="%" />
      <PrismButton onClick={() => setLoad((v) => (v === 35 ? 72 : 35))}>
        切换示例负载
      </PrismButton>
      <PrismAreaChart
        title="每小时请求量"
        unit="次"
        data={[
          { label: "10:00", value: 120 },
          { label: "11:00", value: 186 },
          { label: "12:00", value: 152 },
        ]}
      />
    </div>
  );
}
