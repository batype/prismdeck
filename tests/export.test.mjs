import test from "node:test";
import assert from "node:assert/strict";
import { build } from "vite";
import { mkdtemp, writeFile, mkdir, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { zipSync, unzipSync, strToU8, strFromU8 } from "fflate";
test("each real source export compiles in an independent React project", async () => {
  const temp = await mkdtemp(path.join(tmpdir(), "prismdeck-source-"));
  const bundle = path.join(temp, "bundle");
  await build({
    configFile: false,
    logLevel: "error",
    build: { ssr: "src/core/export.ts", outDir: bundle, minify: false },
  });
  const { makeFiles } = await import(
    pathToFileURL(path.join(bundle, "export.js"))
  );
  const { DEFAULT_CONFIG, COMPONENT_KINDS } =
    await import("../lib/core/config.js");
  const { createChartDesigns, isChartKind, readDesign } =
    await import("../lib/core/workspace.js");
  const charts = createChartDesigns();
  charts.gauge = {
    ...charts.gauge,
    value: 35,
    title: '导出 "35" <demo>',
    unit: "ms",
    min: -20,
    max: 80,
  };
  charts.area.data = [
    { label: 'A " \u2028 <tag>', value: 0.0001 },
    { label: "B", value: 0.0002 },
  ];
  for (const kind of COMPONENT_KINDS) {
    const target = path.join(temp, kind);
    await mkdir(target);
    const files = makeFiles(
      kind,
      {
        ...DEFAULT_CONFIG,
        caption: '文字 " / <tag> 🚀',
        radius: 0,
      },
      charts,
    );
    if (isChartKind(kind)) {
      const restoredDesign = readDesign(
        JSON.parse(files["prismdeck.config.json"]),
      );
      assert.deepEqual(restoredDesign.charts[kind], charts[kind]);
      assert.ok(
        files["App.tsx"].includes(JSON.stringify(charts[kind], null, 2)),
      );
    }
    const zipped = zipSync(
      Object.fromEntries(
        Object.entries(files).map(([k, v]) => [k, strToU8(v)]),
      ),
    );
    const restored = unzipSync(zipped);
    assert.match(strFromU8(restored["prismdeck.config.json"]), /🚀/);
    for (const [name, bytes] of Object.entries(restored)) {
      const p = path.join(target, name);
      await mkdir(path.dirname(p), { recursive: true });
      await writeFile(p, bytes);
    }
    await symlink(
      path.resolve("node_modules"),
      path.join(target, "node_modules"),
    );
    execFileSync(
      process.execPath,
      [
        path.resolve("node_modules/typescript/bin/tsc"),
        "--ignoreConfig",
        "--noEmit",
        "--target",
        "ES2022",
        "--module",
        "ESNext",
        "--moduleResolution",
        "Bundler",
        "--jsx",
        "react-jsx",
        "--strict",
        "--skipLibCheck",
        path.join(target, "App.tsx"),
      ],
      { stdio: "pipe" },
    );
  }
});
