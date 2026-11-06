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
import type { PrismConfig } from "../core/config";
import {
  nextChartExample,
  type ChartKind,
  type ChartDesign,
} from "../core/workspace";

export function ChartsPreview({
  kind,
  config,
  design,
  onChange,
}: {
  kind: ChartKind;
  config: PrismConfig;
  design: ChartDesign;
  onChange: (change: Partial<ChartDesign>) => void;
}) {
  const [selection, setSelection] = useState("");
  const { style } = themed(config);
  const { title, description, unit, value, min, max, rows, empty } = design;
  const data = empty ? [] : design.data;
  const onSelect = (point: { label: string; value: number }) =>
    setSelection(`已选择 ${point.label} · ${point.value}`);
  const common = { config, title, description, unit, data, onSelect };
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
          {kind !== "gauge" && (
            <PrismButton
              config={config}
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange({ empty: !empty });
                setSelection("");
              }}
            >
              {empty ? "恢复数据" : "空状态"}
            </PrismButton>
          )}
          <PrismButton
            config={config}
            variant="outline"
            size="sm"
            onClick={() => {
              onChange(nextChartExample(kind, design));
              setSelection("");
            }}
          >
            切换示例数据 ↗
          </PrismButton>
        </div>
      </div>
      {kind === "area" ? (
        <PrismAreaChart {...common} />
      ) : kind === "bar" ? (
        <PrismBarChart {...common} />
      ) : kind === "donut" ? (
        <PrismDonutChart {...common} />
      ) : kind === "heatmap" ? (
        <PrismHeatmap {...common} rows={rows} />
      ) : kind === "radar" ? (
        <PrismRadarChart {...common} max={max} />
      ) : (
        <>
          <PrismGauge
            config={config}
            title={title}
            description={description}
            unit={unit}
            value={value}
            min={min}
            max={max}
          />
          <label className="charts-demo-slider">
            调整数值{" "}
            <input
              type="range"
              min={min}
              max={max}
              step="any"
              value={Math.max(min, Math.min(max, value))}
              onChange={(e) => onChange({ value: Number(e.target.value) })}
            />
            <span>
              {value} {unit}
            </span>
          </label>
        </>
      )}
      <p className="charts-demo-note" aria-live="polite">
        {kind === "gauge"
          ? "调值与标题会同步到代码、下载和配置文件。"
          : selection || "点击查看回调 · 右侧可编辑数据 · 当前数据会同步导出"}
      </p>
    </section>
  );
}
