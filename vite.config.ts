import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
const file = (path: string) => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig({
  plugins: [react()],
  base: "/prismdeck/",
  resolve: {
    alias: [
      {
        find: /^@batype\/prismdeck\/style\.css$/,
        replacement: file("./src/components/prism.css"),
      },
      {
        find: /^@batype\/prismdeck\/config$/,
        replacement: file("./src/core/config.ts"),
      },
      {
        find: /^@batype\/prismdeck$/,
        replacement: file("./src/components/Prism.tsx"),
      },
    ],
  },
  build: {
    rolldownOptions: {
      input: { main: file("./index.html"), docs: file("./docs/index.html") },
    },
  },
});
