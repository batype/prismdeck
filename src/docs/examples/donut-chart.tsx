import { PrismDonutChart } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function DonutExample() {
  return (
    <PrismDonutChart
      title="流量来源"
      unit="次"
      data={[
        { label: "网页", value: 580 },
        { label: "移动端", value: 240 },
        { label: "API", value: 180 },
      ]}
      onSelect={(point, originalIndex) => console.log(point, originalIndex)}
    />
  );
}
