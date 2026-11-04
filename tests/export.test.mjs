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
  const { DEFAULT_CONFIG } = await import("../lib/core/config.js");
  for (const kind of ["card", "dial", "dock"]) {
    const target = path.join(temp, kind);
    await mkdir(target);
    const files = makeFiles(kind, {
      ...DEFAULT_CONFIG,
      caption: '文字 " / <tag> 🚀',
      radius: 0,
    });
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
