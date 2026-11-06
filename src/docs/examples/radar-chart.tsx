import { PrismRadarChart } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function RadarExample() {
  return (
    <PrismRadarChart
      title="项目健康度"
      max={100}
      data={[
        { label: "性能", value: 76 },
        { label: "可靠性", value: 92 },
        { label: "安全性", value: 70 },
        { label: "体验", value: 88 },
        { label: "维护性", value: 63 },
      ]}
      onSelect={(point) => console.log(point.label, point.value)}
    />
  );
}
