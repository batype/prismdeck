# PrismDeck · 未来界面实验室

在浏览器中调校空间卡片、轨道旋钮与悬浮导航，实时预览，带走 React + CSS 源码。

[在线工作台](https://batype.github.io/prismdeck/) · [GitHub](https://github.com/batype/prismdeck)

![PrismDeck 在线工作台](docs/preview.png)

## 使用 npm 组件

```sh
npm install @batype/prismdeck
```

```tsx
import { useState } from 'react';
import { SpatialCard, OrbitDial, CommandDock } from '@batype/prismdeck';
import '@batype/prismdeck/style.css';

export default function Demo() {
  const [value, setValue] = useState(64);
  return <OrbitDial
    value={value}
    onChange={setValue}
    config={{ accent: '#8ce2ff', surface: 'dark', radius: 20 }}
  />;
}
```

需要 React 18.2+。运行时只依赖 React；CSS 独立引入，无需 Tailwind、Canvas、WebGL 或动画运行时。

## 三个可交互原语

| 组件 | 核心行为 | 业务接入 |
| --- | --- | --- |
| `SpatialCard` | 指针跟随层次、轨道与呼吸动效 | `onAction` 与 `actionLabel` 接入真实动作 |
| `OrbitDial` | 圆周拖动、0–100 数值控制、标准滑条 | 受控 `value` / `onChange`，支持 `disabled` |
| `CommandDock` | 图标导航、活动状态、悬停与焦点标签 | 受控 `value` / `onChange`，可自定义 `items` |

组件回调由业务执行；工作台中的“连接”仅切换本地演示状态，不连接外部服务。未提供回调时，动作按钮或输入禁用，旋钮显示只读。

```tsx
<SpatialCard
  config={{ label: 'PROJECT CORE', caption: '准备好开启下一段旅程。' }}
  actionLabel="打开项目"
  onAction={() => openProject()}
/>

<CommandDock
  items={[
    { id: 'overview', label: '总览' },
    { id: 'settings', label: '设置' },
  ]}
  value={selected}
  onChange={setSelected}
/>
```

## 配置

所有组件接收 `config?: Partial<PrismConfig>`，并支持 `className`。默认配置及校验函数从 `@batype/prismdeck/config` 导入，不依赖 React。

| 字段 | 默认 | 范围 / 作用 |
| --- | --- | --- |
| accent | `#c5f86d` | 六位 HEX 主题色；霜白材质会调整文字用色以提高对比 |
| surface | `dark` | `dark` / `light`，控制组件材质，与工作台界面主题独立 |
| radius | 24 | 0–40 像素 |
| glow | 45 | 0–100，卡片、轨道和导航光晕 |
| speed | 35 | 0–100，持续 CSS 动效速度 |
| motion | true | CSS 动效、卡片跟随与导航悬停位移；旋钮调值始终可用 |
| grid | true | 空间卡片内的辅助网格 |
| label | NEURAL CORE | 标题标识，最多 40 字 |
| caption | 默认中文副文案 | 副文案，最多 100 字 |

其中不同组件使用相关配置子集：例如 `caption` 用于空间卡片；`speed` 用于轨道动画。工作台会说明仅适用于卡片的网格选项。

## 带走源码

在工作台选组件、调参数，点击“导出组件”下载 ZIP。内容包含：

- 当前组件的 `App.tsx` 使用示例，包含完整主题配置。
- `components/Prism.tsx`：三个可复用组件原语。
- `components/prism.css`：使用 `pd-` 前缀的独立样式。
- `core/config.ts`、`prismdeck.config.json`、接入说明。

保留 `components` 与 `core` 相对目录，将文件复制到现有 React + TypeScript 工程。ZIP 是源码片段，不是完整脚手架。代码预览中的 React 页是使用示例；全部实现包含在 ZIP 中。

可保存与导入配置 JSON，或复制分享链接。设计参数保存在当前浏览器 localStorage；不上传设计。分享链接携带文案与配置，请自行决定分享内容。

## Next.js / SSR

Next.js 客户端组件使用专门入口：

```tsx
'use client';
import { OrbitDial } from '@batype/prismdeck/next';
import '@batype/prismdeck/style.css';
```

React + Vite 使用默认入口，不附加 `use client` 指令。导出的交互 `App.tsx` 在 Next.js 中需要客户端边界，CSS 也可从根布局引入。

默认入口在导入和服务端初始渲染时不读取浏览器全局变量，支持 SSR 初始输出；交互需要客户端水合。Next 入口保留客户端指令。已验证 Node SSR 和独立 React TypeScript 构建，未逐一验证所有 Next.js、Vite SSR 适配器。

## 可访问性与边界

- 标准按钮、可见焦点、键盘导航；旋钮同时提供原生 range 输入，支持方向键。
- 所有动效遵循 `prefers-reduced-motion`。关闭动效不禁用导航与调值。
- 触屏卡片不执行指针倾斜；触屏仍可操作旋钮和按钮。
- 使用现代 CSS `color-mix`、mask、conic-gradient；面向现代 Chrome / Edge / Safari / Firefox。旧浏览器外观可能降级。
- 颜色可自由设置，业务使用者应检查自定义主题的可读性；自由配置不等于任意颜色组合都通过对比度标准。
- 提供的是三个 UI 原语和配置工作台，不是完整设计系统、3D 建模器或自由拖拽页面编辑器。

## 开发

```sh
npm ci
npm test
npm run build
npm run dev
```

React + Vite 工作台，独立 TypeScript 配置模块，组件库单独构建。测试覆盖配置边界、分享恢复、旋钮坐标映射、SSR、安全转义，以及三个导出包在独立项目中的实际编译。

MIT License.
