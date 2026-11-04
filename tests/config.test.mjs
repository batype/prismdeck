import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_CONFIG,
  PRESETS,
  validateConfig,
  readShare,
  pointerValue,
  clampValue,
} from "../lib/core/config.js";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  SpatialCard,
  OrbitDial,
  CommandDock,
} from "../lib/components/Prism.js";
test("presets and partial configuration normalize with strict bounds", () => {
  for (const p of PRESETS) assert.deepEqual(validateConfig(p.config), p.config);
  assert.equal(validateConfig({ radius: 0 }).radius, 0);
  for (const data of [
    { accent: "red" },
    { accent: "#fff;url()" },
    { radius: 41 },
    { glow: NaN },
    { speed: -1 },
    { motion: "true" },
    { surface: "x" },
    { label: "x".repeat(41) },
    { caption: "x".repeat(101) },
    { unknown: 1 },
    null,
  ])
    assert.throws(() => validateConfig(data));
  assert.equal(DEFAULT_CONFIG.radius, 24);
});
test("shared configuration preserves Unicode and rejects corrupt input", () => {
  const config = { ...DEFAULT_CONFIG, caption: "你好 / 🚀 <script> & spaces" };
  const query = new URLSearchParams({
    design: JSON.stringify({ kind: "dial", config }),
  });
  assert.deepEqual(readShare("?" + query), { kind: "dial", config });
  assert.equal(readShare(""), null);
  assert.throws(() => readShare("?design={"));
  assert.throws(() =>
    readShare(
      "?design=" +
        encodeURIComponent(JSON.stringify({ kind: "unknown", config })),
    ),
  );
});
test("dial pointer maps endpoints and top correctly; values stay bounded", () => {
  assert.equal(pointerValue(-1, 1, 0, 0), 0);
  assert.equal(pointerValue(1, 1, 0, 0), 100);
  assert.equal(pointerValue(0, -1, 0, 0), 50);
  assert.equal(clampValue(-20), 0);
  assert.equal(clampValue(120), 100);
  assert.equal(clampValue(NaN), 0);
});
test("all components import and render on server without browser globals", () => {
  for (const C of [SpatialCard, OrbitDial, CommandDock])
    assert.match(renderToString(React.createElement(C)), /pd-root/);
  const html = renderToString(
    React.createElement(SpatialCard, {
      config: { label: "<script>alert(1)</script>" },
    }),
  );
  assert.ok(!html.includes("<script>"));
  assert.match(html, /&lt;script&gt;/);
});
test("controlled UI exposes accessible input, navigation and local callbacks", () => {
  const dial = renderToString(
    React.createElement(OrbitDial, { value: 200, onChange: () => {} }),
  );
  assert.match(dial, /value="100"/);
  assert.match(dial, /type="range"/);
  assert.match(dial, /aria-label="能量输出"/);
  const dock = renderToString(
    React.createElement(CommandDock, { value: "signal", onChange: () => {} }),
  );
  assert.match(dock, /aria-label="快捷导航"/);
  assert.match(dock, /aria-current="page"/);
  assert.equal((dock.match(/<button/g) || []).length, 4);
});
