import { PrismAreaChart } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function AreaExample() {
  return (
    <PrismAreaChart
      title="接口延迟"
      description="小数刻度保留有效数字。"
      unit="s"
      data={[
        { label: "10:00", value: 0.0001 },
        { label: "11:00", value: 0.0002 },
        { label: "12:00", value: 0.00015 },
      ]}
      formatAxisValue={(value) => (value === 0 ? "0" : value.toExponential(1))}
      onSelect={(point, index) => console.log(point.label, point.value, index)}
    />
  );
}
