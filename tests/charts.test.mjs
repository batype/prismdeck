import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  PrismAreaChart,
  PrismBarChart,
  PrismDonutChart,
  PrismGauge,
  PrismHeatmap,
  PrismRadarChart,
} from "../lib/components/Prism.js";
import * as next from "../lib/components/next.js";
const render = (C, props) => renderToString(React.createElement(C, props));
const data = [
  { label: "<script>a</script>", value: 20 },
  { label: "B", value: 60 },
  { label: "C", value: 40 },
];
test("all charts render on the server, expose labeled data and escape text", () => {
  for (const C of [
    PrismAreaChart,
    PrismBarChart,
    PrismDonutChart,
    PrismHeatmap,
    PrismRadarChart,
  ]) {
    const html = render(C, {
      title: "业务指标",
      description: "单序列",
      data,
      unit: "次",
    });
    assert.match(html, /业务指标/);
    assert.match(html, /aria-labelledby="/);
    assert.match(html, /&lt;script&gt;a&lt;\/script&gt;/);
    assert.ok(!html.includes("<script>"));
    assert.ok(!html.includes("NaN"));
    assert.match(html, /button/);
  }
});
test("empty and non-finite datasets have an explicit empty state", () => {
  for (const C of [
    PrismAreaChart,
    PrismBarChart,
    PrismDonutChart,
    PrismHeatmap,
    PrismRadarChart,
  ]) {
    assert.match(render(C, { title: "empty", data: [] }), /暂无有效数据/);
    const html = render(C, {
      title: "invalid",
      data: [
        { label: "invalid", value: NaN },
        { label: "infinity", value: Infinity },
      ],
    });
    assert.match(html, /暂无有效数据/);
    assert.ok(!html.includes("NaN"));
    assert.ok(!html.includes("Infinity"));
  }
});
test("area and bars handle single, flat, negative and large finite values without invalid geometry", () => {
  for (const C of [PrismAreaChart, PrismBarChart]) {
    for (const values of [
      [0],
      [0, 0, 0],
      [-5, -1, -10],
      [-5, 0, 8],
      [-Number.MAX_VALUE, Number.MAX_VALUE],
    ]) {
      const html = render(C, {
        title: "bounds",
        data: values.map((value, i) => ({ label: String(i), value })),
      });
      assert.ok(!/NaN|Infinity/.test(html));
      assert.match(html, /<svg/);
    }
  }
});
test("donut excludes non-positive parts and normalizes very large totals safely", () => {
  assert.match(
    render(PrismDonutChart, {
      title: "zero",
      data: [
        { label: "zero", value: 0 },
        { label: "negative", value: -1 },
      ],
    }),
    /暂无有效数据/,
  );
  const html = render(PrismDonutChart, {
    title: "large",
    data: [
      { label: "A", value: Number.MAX_VALUE },
      { label: "B", value: Number.MAX_VALUE },
    ],
  });
  assert.match(html, /50%/);
  assert.ok(!/NaN|Infinity/.test(html));
});
test("gauge clamps value, supports custom ranges and reports invalid ranges", () => {
  const html = render(PrismGauge, {
    title: "温度",
    value: 200,
    min: -50,
    max: 150,
    unit: "°C",
  });
  assert.match(html, /role="meter"/);
  assert.match(html, /aria-valuenow="150"/);
  assert.match(html, /aria-valuemin="-50"/);
  assert.match(html, /aria-valuemax="150"/);
  assert.match(html, /aria-valuetext="150 °C"/);
  for (const p of [
    { value: NaN },
    { value: 3, min: 100, max: 0 },
    { value: 2, min: 1, max: 1 },
  ])
    assert.match(
      render(PrismGauge, { title: "invalid", ...p }),
      /无效数值或范围/,
    );
});
test("heatmap has a single tab stop, labeled cells and finite normalized colors", () => {
  const html = render(PrismHeatmap, {
    title: "activity",
    data,
    rows: Infinity,
  });
  assert.equal((html.match(/tabindex="0"/g) || []).length, 1);
  assert.equal((html.match(/tabindex="-1"/g) || []).length, 2);
  assert.match(html, /--pd-heat-rows:7/);
  assert.ok(!html.includes("Infinity"));
});
test("radar requires three axes, clamps geometry to the range, and supports formatting", () => {
  assert.match(
    render(PrismRadarChart, { title: "short", data: data.slice(0, 2) }),
    /暂无有效数据/,
  );
  const html = render(PrismRadarChart, {
    title: "range",
    data: [
      { label: "a", value: -1 },
      { label: "b", value: 200 },
      { label: "c", value: 50 },
    ],
    max: 100,
    formatValue: (n) => `value ${n}`,
  });
  assert.ok(!/NaN|Infinity/.test(html));
  assert.match(html, /value -1/);
});
test("multiple area charts use independent gradient ids and Next exports match", () => {
  const html = renderToString(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(PrismAreaChart, { title: "a", data }),
      React.createElement(PrismAreaChart, { title: "b", data }),
    ),
  );
  const ids = [...html.matchAll(/linearGradient id="([^"]+)"/g)].map(
    (m) => m[1],
  );
  assert.equal(new Set(ids).size, 2);
  for (const C of [
    PrismAreaChart,
    PrismBarChart,
    PrismDonutChart,
    PrismGauge,
    PrismHeatmap,
    PrismRadarChart,
  ])
    assert.equal(next[C.name], C);
});

test("small and scientific values keep distinct readable ticks, including custom axis formatting", () => {
  for (const C of [PrismAreaChart, PrismBarChart]) {
    const small = [
      { label: "A", value: 0.0001 },
      { label: "B", value: 0.0002 },
    ];
    const html = render(C, { title: "precision", data: small });
    const ticks = [
      ...html.matchAll(/<text\b[^>]*text-anchor="end"[^>]*>(.*?)<\/text>/g),
    ].map((m) => m[1]);
    assert.ok(new Set(ticks).size > 1);
    assert.ok(ticks.includes("0.0002"));
    const custom = render(C, {
      title: "custom",
      data: small,
      formatAxisValue: (n) => `${n.toExponential(1)} s`,
      formatValue: (n) => `value ${n}`,
    });
    assert.match(custom, /2\.0e-4 s/);
    assert.match(custom, /value 0\.0001/);
    const tiny = render(C, {
      title: "tiny",
      data: [
        { label: "a", value: 1e-12 },
        { label: "b", value: 2e-12 },
      ],
    });
    assert.match(tiny, /2e-12/);
    const zeros = render(C, {
      title: "zero",
      data: [
        { label: "a", value: 0 },
        { label: "b", value: 0 },
      ],
    });
    assert.match(zeros, />1<\/text>/);
  }
});
