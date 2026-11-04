import { validateConfig, type ComponentKind, type PrismConfig } from "./config";
import licenseSource from "../../LICENSE?raw";
import configSource from "./config.ts?raw";
import componentSource from "../components/Prism.tsx?raw";
import cssSource from "../components/prism.css?raw";
export function makeFiles(
  kind: ComponentKind,
  input: PrismConfig,
): Record<string, string> {
  const config = validateConfig(input);
  if (!["card", "dial", "dock"].includes(kind)) throw new Error("组件类型无效");
  const names = { card: "SpatialCard", dial: "OrbitDial", dock: "CommandDock" },
    name = names[kind];
  const state =
    kind === "dial"
      ? "const [value, setValue] = useState(64);"
      : kind === "dock"
        ? "const [value, setValue] = useState('overview');"
        : "const [connected, setConnected] = useState(false);";
  const props =
    kind === "card"
      ? "actionLabel={connected ? '已连接' : '建立连接'} onAction={() => setConnected(v => !v)}"
      : "value={value} onChange={setValue}";
  const app = `import { useState } from 'react';\nimport { ${name} } from './components/Prism';\nimport './components/prism.css';\n\nconst config = ${JSON.stringify(config, null, 2)} as const;\n\nexport default function App() {\n  ${state}\n  return <${name} config={config} ${props} />;\n}\n`;
  return {
    "App.tsx": app,
    "components/Prism.tsx": componentSource,
    "components/prism.css": cssSource,
    "components/prism.css.d.ts":
      "declare const stylesheet: string;\nexport default stylesheet;\n",
    LICENSE: licenseSource,
    "core/config.ts": configSource,
    "prismdeck.config.json": JSON.stringify(
      { version: 1, kind, config },
      null,
      2,
    ),
    "README.md": `# PrismDeck 导出组件\n\n将这些文件复制到现有 React + TypeScript 项目的 src 目录。使用 React 18.2+，无需 Tailwind 或动效依赖。App.tsx 是使用示例。保持 components 与 core 的相对目录。\n\nNext.js：在 App.tsx 顶部加 'use client'，CSS 可由根布局引入；组件仅在客户端交互。原生 ESM Node 不是 UI 运行环境。\n\n组件会遵循系统减少动态效果设置。旋钮 / 导航为受控组件，需要传入 value 和 onChange。导出的是源码片段，不是完整 Vite 工程。\n\nMIT License · https://github.com/batype/prismdeck\n`,
  };
}
