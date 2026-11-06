import type { ComponentKind } from "../core/config";
export const COMPONENT_DOCS: Record<ComponentKind, string> = {
  card: "spatial-card",
  dial: "orbit-dial",
  dock: "command-dock",
  button: "button",
  input: "input",
  switch: "switch",
  tabs: "tabs",
  badge: "badge",
  dialog: "dialog",
  area: "area-chart",
  bar: "bar-chart",
  donut: "donut-chart",
  gauge: "gauge",
  heatmap: "heatmap",
  radar: "radar-chart",
};
export function documentationUrl(kind?: ComponentKind) {
  return `${import.meta.env.BASE_URL}docs/${kind ? `#${COMPONENT_DOCS[kind]}` : ""}`;
}
