import { copyFile, writeFile } from "node:fs/promises";
await copyFile("src/components/prism.css", "lib/components/prism.css");
await writeFile(
  "lib/components/prism.css.d.ts",
  "declare const stylesheet: string;\nexport default stylesheet;\n",
);
