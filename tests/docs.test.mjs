import test from "node:test";
import assert from "node:assert/strict";
import { build } from "vite";
import { mkdtemp, mkdir, writeFile, readFile, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

let documentData;
async function loadDocs() {
  if (!documentData)
    documentData = (async () => {
      const outDir = await mkdtemp(path.join(tmpdir(), "prismdeck-doc-data-"));
      await build({
        configFile: false,
        logLevel: "error",
        build: { ssr: "src/docs/export.ts", outDir, minify: false },
      });
      return import(pathToFileURL(path.join(outDir, "export.js")).href);
    })();
  return documentData;
}
test("documentation covers every exported component, valid deep links and synchronized Markdown", async () => {
  const {
    DOC_PAGES,
    EXAMPLE_SOURCES,
    COMPONENT_DOCS,
    DOC_VERSION,
    buildMarkdown,
  } = await loadDocs();
  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(DOC_VERSION, pkg.version);
  assert.equal(DOC_PAGES.length, 24);
  assert.equal(new Set(DOC_PAGES.map((p) => p.id)).size, DOC_PAGES.length);
  assert.equal(Object.keys(COMPONENT_DOCS).length, 15);
  for (const id of Object.values(COMPONENT_DOCS)) {
    const page = DOC_PAGES.find((p) => p.id === id);
    assert.ok(page, `Missing component page: ${id}`);
    assert.ok(
      page.sections.some((s) => s.id === "props" && s.table.rows.length > 2),
    );
    assert.ok(page.sections.some((s) => s.demo));
  }
  for (const page of DOC_PAGES) {
    assert.equal(
      new Set(page.sections.map((s) => s.id)).size,
      page.sections.length,
    );
    for (const section of page.sections)
      if (section.demo)
        assert.ok(EXAMPLE_SOURCES[`./examples/${section.demo}.tsx`]);
  }
  assert.equal(await readFile("docs/guide.md", "utf8"), buildMarkdown());
});
test("all runnable documentation examples and framework snippets compile against the public package entries", async () => {
  const { DOC_PAGES, EXAMPLE_SOURCES } = await loadDocs();
  const target = await mkdtemp(path.join(tmpdir(), "prismdeck-doc-code-"));
  const modules = path.join(target, "node_modules");
  await mkdir(path.join(modules, "@batype"), { recursive: true });
  await symlink(process.cwd(), path.join(modules, "@batype/prismdeck"));
  for (const name of ["react", "react-dom", "@types"])
    await symlink(path.resolve("node_modules", name), path.join(modules, name));
  const files = [];
  for (const [name, source] of Object.entries(EXAMPLE_SOURCES)) {
    const file = path.join(target, name);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, source);
    files.push(file);
  }
  for (const page of DOC_PAGES)
    for (const section of page.sections)
      for (const code of section.codes || [])
        if (code.scope) {
          const file = path.join(target, "snippets", code.scope, code.file);
          await mkdir(path.dirname(file), { recursive: true });
          await writeFile(file, code.source);
          files.push(file);
        }
  assert.equal(Object.keys(EXAMPLE_SOURCES).length, 17);
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
      ...files,
    ],
    { stdio: "pipe" },
  );
});
