import test from "node:test";
import assert from "node:assert/strict";
import {
  createChartDesigns,
  readDesign,
  readDesignShare,
  validateChartData,
  nextChartExample,
  demoData,
} from "../lib/core/workspace.js";
import { DEFAULT_CONFIG } from "../lib/core/config.js";
test("old v1 designs and links restore without losing material settings", () => {
  const old = {
    version: 1,
    kind: "dial",
    config: { ...DEFAULT_CONFIG, accent: "#8ce2ff" },
  };
  const restored = readDesign(old);
  assert.equal(restored.kind, "dial");
  assert.deepEqual(restored.config, old.config);
  assert.equal(restored.charts.gauge.value, 72);
  assert.deepEqual(
    readDesignShare("?" + new URLSearchParams({ design: JSON.stringify(old) })),
    restored,
  );
});
test("chart content, custom ranges and live gauge values round-trip configuration and links", () => {
  const charts = createChartDesigns();
  charts.gauge = {
    ...charts.gauge,
    title: "处理延迟 <demo>",
    description: "使用真实数据",
    unit: "ms",
    min: -20,
    max: 80,
    value: 35,
  };
  charts.area.data = [
    { label: 'A " \\ <tag>', value: 0.0001 },
    { label: "B", value: 0.0002 },
  ];
  const source = { version: 1, kind: "gauge", config: DEFAULT_CONFIG, charts };
  assert.deepEqual(
    readDesign(JSON.parse(JSON.stringify(source))).charts,
    charts,
  );
  const link = "?" + new URLSearchParams({ design: JSON.stringify(source) });
  assert.equal(readDesignShare(link).charts.gauge.value, 35);
  assert.equal(readDesignShare(link).charts.gauge.title, "处理延迟 <demo>");
});
test("invalid data and oversized or malformed designs cannot overwrite workspace state", () => {
  for (const bad of [
    null,
    {},
    [{ label: "a", value: Infinity }],
    [{ label: "", value: 1 }],
    Array.from({ length: 513 }, () => ({ label: "a", value: 1 })),
  ])
    assert.throws(() => validateChartData(bad));
  const defaults = createChartDesigns();
  assert.throws(() =>
    readDesign({
      kind: "gauge",
      config: DEFAULT_CONFIG,
      charts: { gauge: { ...defaults.gauge, max: 0, min: 0 } },
    }),
  );
  assert.throws(() =>
    readDesign({
      kind: "gauge",
      config: DEFAULT_CONFIG,
      charts: { unknown: {} },
    }),
  );
  assert.throws(() =>
    readDesignShare("?design=" + encodeURIComponent("x".repeat(16385))),
  );
  assert.deepEqual(createChartDesigns(), defaults);
});

test("switching examples changes the actual gauge value and works after restoring an alternate dataset", () => {
  const charts = createChartDesigns();
  const first = { ...charts.gauge, ...nextChartExample("gauge", charts.gauge) };
  assert.equal(first.value, 35);
  assert.equal(nextChartExample("gauge", first).value, 72);
  for (const kind of ["area", "bar", "donut", "radar", "heatmap"]) {
    const restored = { ...charts[kind], data: demoData(kind, true) };
    assert.deepEqual(nextChartExample(kind, restored).data, demoData(kind));
  }
});
