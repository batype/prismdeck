import { build } from "vite";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
const temp = await mkdtemp(join(tmpdir(), "prismdeck-docs-"));
try {
  await build({
    configFile: false,
    logLevel: "error",
    build: { ssr: resolve("src/docs/export.ts"), outDir: temp, minify: false },
  });
  const { buildMarkdown } = await import(
    pathToFileURL(join(temp, "export.js")).href
  );
  await writeFile(resolve("docs/guide.md"), buildMarkdown());
  process.stdout.write("Synced detailed documentation: docs/guide.md\n");
} finally {
  await rm(temp, { recursive: true, force: true });
}
