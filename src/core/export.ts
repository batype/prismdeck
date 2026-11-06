import {
  validateConfig,
  isComponentKind,
  type ComponentKind,
  type PrismConfig,
} from "./config";
import licenseSource from "../../LICENSE?raw";
import configSource from "./config.ts?raw";
import componentSource from "../components/Prism.tsx?raw";
import basicsSource from "../components/Basics.tsx?raw";
import chartsSource from "../components/Charts.tsx?raw";
import themeSource from "../components/theme.tsx?raw";
import cssSource from "../components/prism.css?raw";
export function makeFiles(
  kind: ComponentKind,
  input: PrismConfig,
): Record<string, string> {
  const config = validateConfig(input);
  if (!isComponentKind(kind)) throw new Error("组件类型无效");
  const examples: Record<
    ComponentKind,
    { imports: string; state: string; jsx: string }
  > = {
    card: {
      imports: "SpatialCard",
      state: "const [connected, setConnected] = useState(false);",
      jsx: `<SpatialCard config={config} actionLabel={connected ? '已连接' : '建立连接'} onAction={() => setConnected(v => !v)} />`,
    },
    dial: {
      imports: "OrbitDial",
      state: "const [value, setValue] = useState(64);",
      jsx: "<OrbitDial config={config} value={value} onChange={setValue} />",
    },
    dock: {
      imports: "CommandDock",
      state: "const [value, setValue] = useState('overview');",
      jsx: "<CommandDock config={config} value={value} onChange={setValue} />",
    },
    button: {
      imports: "PrismButton",
      state: "const [count, setCount] = useState(0);",
      jsx: "<PrismButton config={config} onClick={() => setCount(v => v + 1)}>已触发 {count} 次</PrismButton>",
    },
    input: {
      imports: "PrismInput",
      state: "const [value, setValue] = useState('');",
      jsx: '<PrismInput config={config} label="项目名称" description={config.caption} value={value} onChange={e => setValue(e.target.value)} placeholder="输入项目名称" required />',
    },
    switch: {
      imports: "PrismSwitch",
      state: "const [checked, setChecked] = useState(true);",
      jsx: '<PrismSwitch config={config} label="消息通知" description={config.caption} checked={checked} onCheckedChange={setChecked} />',
    },
    tabs: {
      imports: "PrismTabs",
      state: "const [value, setValue] = useState('overview');",
      jsx: `<PrismTabs config={config} value={value} onValueChange={setValue} items={[{ value: 'overview', label: '概览', content: config.caption }, { value: 'activity', label: '动态', content: '这里展示操作记录。' }, { value: 'team', label: '团队', content: '团队设置', disabled: true }]} />`,
    },
    badge: {
      imports: "PrismBadge",
      state: "",
      jsx: '<PrismBadge config={config} tone="success">运行正常</PrismBadge>',
    },
    dialog: {
      imports: "PrismDialog, PrismButton, PrismInput",
      state: "const [open, setOpen] = useState(false);",
      jsx: `<>\n      <PrismButton config={config} onClick={() => setOpen(true)}>创建项目</PrismButton>\n      <PrismDialog config={config} open={open} onOpenChange={setOpen} title="创建项目" description={config.caption} footer={<><PrismButton config={config} variant="ghost" onClick={() => setOpen(false)}>取消</PrismButton><PrismButton config={config} onClick={() => setOpen(false)}>确认</PrismButton></>}>\n        <PrismInput config={config} label="项目名称" defaultValue="My project" />\n      </PrismDialog>\n    </>`,
    },
    area: {
      imports: "PrismAreaChart",
      state: "",
      jsx: '<PrismAreaChart config={config} title="每周 API 调用" data={[{ label: "周一", value: 28 }, { label: "周二", value: 42 }, { label: "周三", value: 35 }, { label: "周四", value: 64 }, { label: "周五", value: 88 }]} unit="k" onSelect={(point, index) => console.log(point, index)} />',
    },
    bar: {
      imports: "PrismBarChart",
      state: "",
      jsx: '<PrismBarChart config={config} title="任务完成量" data={[{ label: "一月", value: 28 }, { label: "二月", value: 42 }, { label: "三月", value: 35 }, { label: "四月", value: 64 }]} unit="项" onSelect={(point, index) => console.log(point, index)} />',
    },
    donut: {
      imports: "PrismDonutChart",
      state: "",
      jsx: '<PrismDonutChart config={config} title="流量来源" data={[{ label: "网页", value: 58 }, { label: "移动端", value: 24 }, { label: "API", value: 18 }]} onSelect={(point, index) => console.log(point, index)} />',
    },
    gauge: {
      imports: "PrismGauge",
      state: "const [value, setValue] = useState(72);",
      jsx: '<><PrismGauge config={config} title="系统负载" value={value} min={0} max={100} unit="%" /><label>调整负载 <input type="range" min="0" max="100" value={value} onChange={e => setValue(Number(e.target.value))} /></label></>',
    },
    heatmap: {
      imports: "PrismHeatmap",
      state: "",
      jsx: '<PrismHeatmap config={config} title="开发活动" data={Array.from({ length: 84 }, (_, i) => ({ label: `第 ${i + 1} 天`, value: i * 7 % 24 }))} unit="次" onSelect={(point, index) => console.log(point, index)} />',
    },
    radar: {
      imports: "PrismRadarChart",
      state: "",
      jsx: '<PrismRadarChart config={config} title="项目健康度" max={100} data={[{ label: "性能", value: 76 }, { label: "可靠性", value: 92 }, { label: "安全性", value: 70 }, { label: "体验", value: 88 }, { label: "维护性", value: 63 }]} onSelect={(point, index) => console.log(point, index)} />',
    },
  };
  const example = examples[kind];
  const app = `${example.state ? "import { useState } from 'react';\n" : ""}import { ${example.imports} } from './components/Prism';\nimport './components/prism.css';\n\nconst config = ${JSON.stringify(config, null, 2)} as const;\n\nexport default function App() {\n  ${example.state}\n  return (${example.jsx});\n}\n`;
  return {
    "App.tsx": app,
    "components/Prism.tsx": componentSource,
    "components/Basics.tsx": basicsSource,
    "components/Charts.tsx": chartsSource,
    "components/theme.tsx": themeSource,
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
    "README.md": `# PrismDeck 导出组件\n\n将文件复制到现有 React + TypeScript 项目的 src 目录。React 18.2+，无需 Tailwind 或动效依赖。App.tsx 是当前组件使用示例；保留 components 与 core 的相对目录。ZIP 包含完整组件源文件，不是完整脚手架。\n\nNext.js：交互 App.tsx 顶部添加 'use client'；CSS 可由根布局引入。默认 npm 入口供 React / Vite 使用，Next 客户端可使用 @batype/prismdeck/next。\n\n通用组件：PrismButton、PrismInput、PrismSwitch、PrismTabs、PrismBadge、PrismDialog。表单控件支持原生属性和键盘；开关 / 标签页 / 弹窗采用受控状态。按钮加载时禁用点击；弹窗支持 Escape、焦点恢复与背景点击关闭。组件不自动执行接口请求。\n\n图形组件：PrismAreaChart、PrismBarChart、PrismDonutChart、PrismGauge、PrismHeatmap、PrismRadarChart。图表 data 使用 { label, value } 数组；详见项目 README 的数据边界说明。\n\nMIT License · https://github.com/batype/prismdeck\n`,
  };
}
