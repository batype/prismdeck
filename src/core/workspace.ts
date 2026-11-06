import {
  isComponentKind,
  validateConfig,
  type ComponentKind,
  type PrismConfig,
} from "./config.js";

export const CHART_KINDS = [
  "area",
  "bar",
  "donut",
  "gauge",
  "heatmap",
  "radar",
] as const;
export type ChartKind = (typeof CHART_KINDS)[number];
export function isChartKind(kind: ComponentKind): kind is ChartKind {
  return (CHART_KINDS as readonly string[]).includes(kind);
}
export interface ChartDesign {
  title: string;
  description: string;
  unit: string;
  data: { label: string; value: number }[];
  value: number;
  min: number;
  max: number;
  rows: number;
  empty: boolean;
}
export type ChartDesigns = Record<ChartKind, ChartDesign>;
export interface WorkspaceDesign {
  kind: ComponentKind;
  config: PrismConfig;
  charts: ChartDesigns;
}
export function demoData(
  kind: ChartKind,
  alternate = false,
): ChartDesign["data"] {
  if (kind === "area" || kind === "bar")
    return (
      alternate ? [62, 48, 75, 60, 89, 72, 96] : [28, 42, 35, 64, 51, 78, 88]
    ).map((value, i) => ({
      label: `周${["一", "二", "三", "四", "五", "六", "日"][i]}`,
      value,
    }));
  if (kind === "donut")
    return [
      { label: "网页", value: alternate ? 42 : 58 },
      { label: "移动端", value: alternate ? 38 : 24 },
      { label: "开放 API", value: alternate ? 20 : 18 },
    ];
  if (kind === "radar")
    return ["性能", "可靠性", "安全性", "体验", "可维护性"].map((label, i) => ({
      label,
      value: (alternate ? [92, 68, 95, 70, 82] : [76, 92, 70, 88, 63])[i],
    }));
  if (kind === "heatmap")
    return Array.from({ length: 84 }, (_, i) => ({
      label: `第 ${i + 1} 天`,
      value:
        (i * 7 + (alternate ? 5 : 2)) % 17 < 5
          ? 0
          : (i * 13 + (alternate ? 11 : 3)) % 24,
    }));
  return [];
}
export function nextChartExample(
  kind: ChartKind,
  design: ChartDesign,
): Partial<ChartDesign> {
  if (kind === "gauge") {
    const fraction = (design.value - design.min) / (design.max - design.min);
    return {
      value:
        design.min +
        (design.max - design.min) * (fraction >= 0.5 ? 0.35 : 0.72),
    };
  }
  const alternate = demoData(kind, true);
  return {
    data:
      JSON.stringify(design.data) === JSON.stringify(alternate)
        ? demoData(kind)
        : alternate,
    empty: false,
  };
}
export function createChartDesigns(): ChartDesigns {
  const titles = {
    area: "每周 API 调用",
    bar: "每日任务完成量",
    donut: "流量来源",
    gauge: "系统负载",
    heatmap: "开发活动",
    radar: "项目健康度",
  };
  const descriptions = {
    area: "单序列趋势 · 点击数据查看回调",
    bar: "从业务数据到直观对比",
    donut: "细分每一份增长",
    gauge: "可自定义数值范围与单位",
    heatmap: "84 天活动 · 方向键浏览，点击选择",
    radar: "五个维度，找到下一处提升空间",
  };
  return Object.fromEntries(
    CHART_KINDS.map((kind) => [
      kind,
      {
        title: titles[kind],
        description: descriptions[kind],
        unit:
          kind === "gauge"
            ? "%"
            : kind === "bar"
              ? "项"
              : kind === "heatmap"
                ? "次"
                : kind === "radar"
                  ? ""
                  : "k",
        data: demoData(kind),
        value: 72,
        min: 0,
        max: 100,
        rows: 7,
        empty: false,
      },
    ]),
  ) as ChartDesigns;
}
export function validateChartData(value: unknown): ChartDesign["data"] {
  if (!Array.isArray(value) || value.length > 512)
    throw new Error("数据必须是数组，最多 512 项");
  return value.map((point, index) => {
    if (
      !point ||
      typeof point !== "object" ||
      typeof point.label !== "string" ||
      !point.label.trim() ||
      point.label.length > 80 ||
      typeof point.value !== "number" ||
      !Number.isFinite(point.value)
    )
      throw new Error(
        `第 ${index + 1} 项需要 label（1–80 字）和有限数值 value`,
      );
    return { label: point.label, value: point.value };
  });
}
export function validateChartDesign(
  value: unknown,
  fallback: ChartDesign,
): ChartDesign {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("图表配置必须是对象");
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !Object.hasOwn(fallback, key)))
    throw new Error("图表配置包含未知字段");
  const c = { ...fallback, ...input } as ChartDesign;
  for (const [key, max] of [
    ["title", 80],
    ["description", 160],
    ["unit", 20],
  ] as const) {
    if (
      typeof c[key] !== "string" ||
      c[key].length > max ||
      (key === "title" && !c[key].trim())
    )
      throw new Error(`${key} 需要有效文本，最多 ${max} 字`);
  }
  if (
    ![c.value, c.min, c.max].every(
      (n) => typeof n === "number" && Number.isFinite(n),
    ) ||
    c.max <= c.min ||
    !Number.isFinite(c.max - c.min)
  )
    throw new Error("数值范围必须有限，且最大值大于最小值");
  if (
    !Number.isInteger(c.rows) ||
    c.rows < 1 ||
    c.rows > 14 ||
    typeof c.empty !== "boolean"
  )
    throw new Error("图表行数或空状态无效");
  return {
    ...c,
    value: Math.max(c.min, Math.min(c.max, c.value)),
    data: validateChartData(c.data),
  };
}
export function readDesign(value: unknown): WorkspaceDesign {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("设计配置必须为对象");
  const input = value as Record<string, unknown>;
  if (
    !isComponentKind(input.kind) ||
    (input.version !== undefined && input.version !== 1)
  )
    throw new Error("配置版本或组件类型不正确");
  const defaults = createChartDesigns();
  if (input.charts !== undefined) {
    if (
      !input.charts ||
      typeof input.charts !== "object" ||
      Array.isArray(input.charts)
    )
      throw new Error("图表配置无效");
    for (const [kind, chart] of Object.entries(input.charts)) {
      if (!isChartKind(kind as ComponentKind)) throw new Error("未知图表类型");
      const validated = validateChartDesign(chart, defaults[kind as ChartKind]);
      if (
        kind === "radar" &&
        (validated.max <= 0 ||
          (validated.data.length > 0 && validated.data.length < 3))
      )
        throw new Error("雷达图需要正数上限和至少 3 个维度（或空数据）");
      defaults[kind as ChartKind] = validated;
    }
  }
  return {
    kind: input.kind,
    config: validateConfig(input.config),
    charts: defaults,
  };
}
export function readDesignShare(search: string): WorkspaceDesign | null {
  const raw = new URLSearchParams(search).get("design");
  if (!raw) return null;
  if (raw.length > 16384) throw new Error("分享配置过大，请改用配置文件");
  return readDesign(JSON.parse(raw));
}
