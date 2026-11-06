import { useState } from "react";
import {
  PrismAreaChart,
  PrismBarChart,
  PrismDonutChart,
  PrismGauge,
  PrismHeatmap,
  PrismRadarChart,
  PrismButton,
} from "../components/Prism";
import { themed } from "../components/theme";
import type { PrismConfig, ComponentKind } from "../core/config";
export const CHART_KINDS = [
  "area",
  "bar",
  "donut",
  "gauge",
  "heatmap",
  "radar",
];
export function ChartsPreview({
  kind,
  config,
}: {
  kind: ComponentKind;
  config: PrismConfig;
}) {
  const [period, setPeriod] = useState(false),
    [gauge, setGauge] = useState(72),
    [selection, setSelection] = useState(""),
    [empty, setEmpty] = useState(false);
  const { style } = themed(config);
  const trend = (
    period ? [62, 48, 75, 60, 89, 72, 96] : [28, 42, 35, 64, 51, 78, 88]
  ).map((value, i) => ({
    label: `周${["一", "二", "三", "四", "五", "六", "日"][i]}`,
    value,
  }));
  const share = [
    { label: "网页", value: period ? 42 : 58 },
    { label: "移动端", value: period ? 38 : 24 },
    { label: "开放 API", value: period ? 20 : 18 },
  ];
  const radar = ["性能", "可靠性", "安全性", "体验", "可维护性"].map(
    (label, i) => ({
      label,
      value: (period ? [92, 68, 95, 70, 82] : [76, 92, 70, 88, 63])[i],
    }),
  );
  const heat = Array.from({ length: 84 }, (_, i) => ({
    label: `${i < 31 ? "10" : i < 61 ? "11" : "12"} 月 ${i < 31 ? i + 1 : i < 61 ? i - 30 : i - 60} 日`,
    value:
      (i * 7 + (period ? 5 : 2)) % 17 < 5
        ? 0
        : (i * 13 + (period ? 11 : 3)) % 24,
  }));
  const onSelect = (point: { label: string; value: number }) =>
    setSelection(`已选择 ${point.label} · ${point.value}`);
  const common = { config, onSelect };
  return (
    <section
      className="pd-root charts-demo"
      data-surface={config.surface}
      data-motion={config.motion ? "on" : "off"}
      style={style}
    >
      <div className="charts-demo-toolbar">
        <span>DATA / INTERACTIVE</span>
        <div>
          <PrismButton
            config={config}
            variant="ghost"
            size="sm"
            onClick={() => setEmpty((v) => !v)}
          >
            {empty ? "恢复数据" : "空状态"}
          </PrismButton>
          <PrismButton
            config={config}
            variant="outline"
            size="sm"
            onClick={() => {
              setPeriod((v) => !v);
              setSelection("");
            }}
          >
            切换数据 ↗
          </PrismButton>
        </div>
      </div>
      {kind === "area" ? (
        <PrismAreaChart
          {...common}
          title="每周 API 调用"
          description="单序列趋势 · 点击数据查看回调"
          data={empty ? [] : trend}
          unit="k"
        />
      ) : kind === "bar" ? (
        <PrismBarChart
          {...common}
          title="每日任务完成量"
          description="从业务数据到直观对比"
          data={empty ? [] : trend}
          unit="项"
        />
      ) : kind === "donut" ? (
        <PrismDonutChart
          {...common}
          title="流量来源"
          description="细分每一份增长"
          data={empty ? [] : share}
          unit="k"
        />
      ) : kind === "gauge" ? (
        <>
          <PrismGauge
            config={config}
            title="系统负载"
            description="可自定义数值范围与单位"
            value={empty ? NaN : gauge}
          />
          <label className="charts-demo-slider">
            调整负载{" "}
            <input
              type="range"
              min="0"
              max="100"
              value={gauge}
              onChange={(e) => setGauge(Number(e.target.value))}
            />
            <span>{gauge}%</span>
          </label>
        </>
      ) : kind === "heatmap" ? (
        <PrismHeatmap
          {...common}
          title="开发活动"
          description="84 天活动 · 方向键浏览，点击选择"
          data={empty ? [] : heat}
          unit="次"
        />
      ) : (
        <PrismRadarChart
          {...common}
          title="项目健康度"
          description="五个维度，找到下一处提升空间"
          data={empty ? [] : radar}
          max={100}
        />
      )}
      <p className="charts-demo-note" aria-live="polite">
        {selection || "演示数据 · 悬停或键盘聚焦查看数值 · 点击触发 onSelect"}
      </p>
      <div className="charts-demo-foot">
        <span>SVG + REACT</span>
        <span>NO CHART DEPENDENCIES</span>
      </div>
    </section>
  );
}
