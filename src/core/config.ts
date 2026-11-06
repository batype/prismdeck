export const COMPONENT_KINDS = [
  "card",
  "dial",
  "dock",
  "button",
  "input",
  "switch",
  "tabs",
  "badge",
  "dialog",
  "area",
  "bar",
  "donut",
  "gauge",
  "heatmap",
  "radar",
] as const;
export type ComponentKind = (typeof COMPONENT_KINDS)[number];
export function isComponentKind(value: unknown): value is ComponentKind {
  return (
    typeof value === "string" &&
    COMPONENT_KINDS.includes(value as ComponentKind)
  );
}
export interface PrismConfig {
  accent: string;
  surface: "dark" | "light";
  radius: number;
  glow: number;
  speed: number;
  motion: boolean;
  grid: boolean;
  label: string;
  caption: string;
}
export const DEFAULT_CONFIG: PrismConfig = {
  accent: "#c5f86d",
  surface: "dark",
  radius: 24,
  glow: 45,
  speed: 35,
  motion: true,
  grid: true,
  label: "NEURAL CORE",
  caption: "让想法，进入下一个维度。",
};
export const PRESETS = [
  {
    id: "signal",
    name: "信号绿",
    tag: "SIGNAL / 01",
    config: { ...DEFAULT_CONFIG },
  },
  {
    id: "arctic",
    name: "极地蓝",
    tag: "ARCTIC / 02",
    config: {
      ...DEFAULT_CONFIG,
      accent: "#8ce2ff",
      glow: 32,
      radius: 16,
      caption: "清晰感知每一次连接。",
    },
  },
  {
    id: "violet",
    name: "离子紫",
    tag: "ION / 03",
    config: {
      ...DEFAULT_CONFIG,
      accent: "#c6a2ff",
      glow: 65,
      radius: 30,
      caption: "探索边界以外的可能。",
    },
  },
  {
    id: "ember",
    name: "余烬橙",
    tag: "EMBER / 04",
    config: {
      ...DEFAULT_CONFIG,
      accent: "#ffad79",
      glow: 35,
      radius: 12,
      caption: "让每一次交互都有温度。",
    },
  },
] as const;
export function validateConfig(value: unknown): PrismConfig {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("配置必须是 JSON 对象");
  const v = value as Record<string, unknown>;
  const allowed = Object.keys(DEFAULT_CONFIG);
  if (Object.keys(v).some((k) => !allowed.includes(k)))
    throw new Error("配置包含未知字段");
  const c = { ...DEFAULT_CONFIG, ...v };
  if (typeof c.accent !== "string" || !/^#[\da-f]{6}$/i.test(c.accent))
    throw new Error("主题色必须是六位十六进制颜色");
  if (!["dark", "light"].includes(c.surface))
    throw new Error("材质必须是 dark 或 light");
  for (const [key, min, max] of [
    ["radius", 0, 40],
    ["glow", 0, 100],
    ["speed", 0, 100],
  ] as const) {
    if (
      typeof c[key] !== "number" ||
      !Number.isFinite(c[key]) ||
      c[key] < min ||
      c[key] > max
    )
      throw new Error(`${key} 超出范围 ${min}–${max}`);
  }
  for (const key of ["motion", "grid"] as const)
    if (typeof c[key] !== "boolean") throw new Error(`${key} 必须为布尔值`);
  if (
    typeof c.label !== "string" ||
    c.label.length > 40 ||
    typeof c.caption !== "string" ||
    c.caption.length > 100
  )
    throw new Error("标题最多 40 字，副文案最多 100 字");
  return c;
}
export function clampValue(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
}
export function pointerValue(x: number, y: number, cx: number, cy: number) {
  let angle = (Math.atan2(y - cy, x - cx) * 180) / Math.PI;
  angle = (angle + 225 + 360) % 360;
  return clampValue(
    angle > 270 ? (angle > 315 ? 0 : 100) : (angle / 270) * 100,
  );
}
export function readShare(
  search: string,
): { kind: ComponentKind; config: PrismConfig } | null {
  const raw = new URLSearchParams(search).get("design");
  if (!raw) return null;
  if (raw.length > 4096) throw new Error("分享配置过大");
  const data = JSON.parse(raw);
  if (!isComponentKind(data.kind)) throw new Error("组件类型无效");
  return { kind: data.kind, config: validateConfig(data.config) };
}
