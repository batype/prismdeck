# PrismDeck 详细接入文档

适用 npm 版本：1.2.1。

[在线文档](https://batype.github.io/prismdeck/docs/) · [组件工作台](https://batype.github.io/prismdeck/) · [GitHub](https://github.com/batype/prismdeck)

## 目录

- [安装与快速开始](#quick-start)
- [Next.js 接入](#nextjs)
- [Vite SSR 与水合](#ssr)
- [主题与公共配置](#theme)
- [状态管理与业务请求](#forms)
- [图表数据与事件](#chart-data)
- [导出源码与保存配置](#source-export)
- [SpatialCard · 空间卡片](#spatial-card)
- [OrbitDial · 轨道旋钮](#orbit-dial)
- [CommandDock · 悬浮导航](#command-dock)
- [PrismButton · 按钮](#button)
- [PrismInput · 输入框](#input)
- [PrismSwitch · 开关](#switch)
- [PrismTabs · 标签页](#tabs)
- [PrismBadge · 状态徽标](#badge)
- [PrismDialog · 对话框](#dialog)
- [PrismAreaChart · 趋势面积图](#area-chart)
- [PrismBarChart · 柱状图](#bar-chart)
- [PrismDonutChart · 环形占比图](#donut-chart)
- [PrismGauge · 仪表盘](#gauge)
- [PrismHeatmap · 活动热力图](#heatmap)
- [PrismRadarChart · 雷达图](#radar-chart)
- [常见问题与排查](#faq)
- [版本与兼容说明](#changelog)

<a id="quick-start"></a>

## 安装与快速开始

从安装包到第一个可交互界面，按顺序完成接入。

<a id="quick-start--requirements"></a>

### 1. 确认项目环境

需要 React 18.2+ 与 react-dom 18.2+。TypeScript 类型随包提供，无需额外安装组件类型包。运行时只依赖 React，不要求 Tailwind 或图表运行时。

当前 npm 稳定版为 1.2.1。首次建议指定版本，升级时再改为 latest。

<a id="quick-start--install"></a>

### 2. 安装组件包

**Terminal**

```sh
npm install @batype/prismdeck@1.2.1
# pnpm / yarn 任选其一
pnpm add @batype/prismdeck@1.2.1
yarn add @batype/prismdeck@1.2.1
```

<a id="quick-start--css"></a>

### 3. 引入组件样式

在 src/main.tsx 或应用的全局入口引入一次样式即可；示例把 CSS 放在组件文件中，复制到入口后可删除重复 import。

不要只导入 React 组件而遗漏 CSS。CSS 使用 pd- 前缀；工作台界面样式无需复制。

**src/main.tsx**

```tsx
import '@batype/prismdeck/style.css';
```

<a id="quick-start--example"></a>

### 4. 放入完整组件

把下面代码保存为 src/App.tsx。点击按钮可切换本地示例负载，图表数据由普通 props 传入。

**完整 React 示例：quick-start.tsx**

```tsx
import { useState } from "react";
import {
  PrismButton,
  PrismGauge,
  PrismAreaChart,
  PrismBadge,
} from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function Dashboard() {
  const [load, setLoad] = useState(35);
  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 600 }}>
      <PrismBadge tone="success">系统运行正常</PrismBadge>
      <PrismGauge title="CPU 使用率" value={load} unit="%" />
      <PrismButton onClick={() => setLoad((v) => (v === 35 ? 72 : 35))}>
        切换示例负载
      </PrismButton>
      <PrismAreaChart
        title="每小时请求量"
        unit="次"
        data={[
          { label: "10:00", value: 120 },
          { label: "11:00", value: 186 },
          { label: "12:00", value: 152 },
        ]}
      />
    </div>
  );
}
```

<a id="quick-start--verify"></a>

### 5. 启动并验收

执行项目已有的开发脚本。首次接入检查：仪表盘可见、按钮能把 35 切到 72、图表样式完整。

**Terminal**

```sh
npm run dev
# 上线前使用项目原有构建命令
npm run build
```

<a id="quick-start--choose"></a>

### 接下来选择接入方式

| 环境 / 场景 | 入口 | 下一步 |
| --- | --- | --- |
| React + Vite 浏览器项目 | @batype/prismdeck | 直接使用本页代码，不需要 use client。 |
| Next.js App Router | @batype/prismdeck/next | 阅读“Next.js 接入”，设置客户端边界。 |
| Vite React SSR | @batype/prismdeck | 服务端生成初始 HTML，客户端水合后才有交互。 |
| 需要修改组件实现 | 源码 ZIP | 阅读“导出源码与配置”，保留目录关系。 |

<a id="nextjs"></a>

## Next.js 接入

把组件与事件放进客户端边界，保留服务端获取数据的能力。

<a id="nextjs--boundary"></a>

### 明确服务端与客户端边界

使用状态、事件回调或浏览器能力的包装组件，需要在文件开头声明 use client，并从 @batype/prismdeck/next 导入组件。该入口保留客户端指令。

Client Component 可以参与首屏服务端预渲染；“客户端组件”并不意味着只能在浏览器生成 HTML。事件与状态交互需要水合完成。

跨服务端 / 客户端边界传入可序列化数据，例如 number 或数据数组；普通 onClick 函数请在客户端包装组件内定义。

- [Next.js 官方：Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [React 官方：use client](https://react.dev/reference/rsc/use-client)

<a id="nextjs--css"></a>

### 1. 在根布局引入 CSS

**app/layout.tsx**

```tsx
import type { ReactNode } from 'react';
import '@batype/prismdeck/style.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
```

<a id="nextjs--client"></a>

### 2. 创建客户端组件

**app/metrics.tsx**

```tsx
'use client';

import { useState } from 'react';
import { PrismGauge, PrismButton } from '@batype/prismdeck/next';

export default function Metrics({ initialValue }: { initialValue: number }) {
  const [value, setValue] = useState(initialValue);
  return <section>
    <PrismGauge title="CPU 使用率" value={value} unit="%" />
    <PrismButton onClick={() => setValue(v => v === 35 ? 72 : 35)}>
      切换示例负载
    </PrismButton>
  </section>;
}
```

<a id="nextjs--server"></a>

### 3. 在服务端页面使用

下面的 35 是静态初始值；可以替换为服务端获取的真实数值，再通过 props 传给 Metrics。不要在 React Server Component 中直接使用 useState 或定义浏览器点击事件。

**app/page.tsx**

```tsx
import Metrics from './metrics';

export default function Page() {
  return <Metrics initialValue={35} />;
}
```

<a id="nextjs--pages-router"></a>

### Pages Router 项目

在 pages/_app.tsx 引入组件样式，交互组件可使用默认 React 入口。上面的 app 目录结构专用于 App Router，不要同时复制到 Pages Router。

<a id="ssr"></a>

## Vite SSR 与水合

组件可生成初始 HTML，交互仍需要客户端 React 水合。

<a id="ssr--difference"></a>

### SSR 与 React Server Components 的区别

SSR 是服务端输出 HTML 后在浏览器水合；React Server Components 是另一种组件边界机制。普通 Vite SSR 使用默认入口，通常不需要添加 use client。

组件模块导入和初始渲染时不读取浏览器全局变量，已验证 Node SSR 输出。PrismDialog 的模态打开、焦点恢复等逻辑在客户端 effect 中执行。

<a id="ssr--server"></a>

### 服务端入口示意

这里给出 React 的渲染部分，接入已有 SSR 工程；它不包含 HTTP 服务、HTML 模板注入和资源清单处理。

**src/entry-server.tsx**

```tsx
import { renderToString } from 'react-dom/server';
import { PrismGauge } from '@batype/prismdeck';

export function render(initialValue: number) {
  return renderToString(<PrismGauge title="系统负载" value={initialValue} />);
}
```

<a id="ssr--client"></a>

### 客户端水合示意

服务端与客户端第一次渲染传入同样的初始值；真实项目应将服务端数据序列化给客户端，而不是分别生成随机数或当前时间。

**src/entry-client.tsx**

```tsx
import { hydrateRoot } from 'react-dom/client';
import { PrismGauge } from '@batype/prismdeck';
import '@batype/prismdeck/style.css';

hydrateRoot(document.getElementById('root')!,
  <PrismGauge title="系统负载" value={35} />
);
```

<a id="ssr--limits"></a>

### Node 使用边界

这是 React UI 组件库，不提供独立 CLI、接口请求 SDK 或 Canvas 图片渲染服务。Node 中可以做 SSR；拖拽、弹窗与点击需要浏览器。

已覆盖组件导入和初始输出，未逐一验证所有 Vite SSR 适配器。SSR 项目的 CSS 提取、路由和部署请沿用框架方案。

- [Vite 官方 SSR 指南](https://vite.dev/guide/ssr.html)

<a id="theme"></a>

## 主题与公共配置

区分页面主题与组件材质，把同一份配置传给需要统一外观的组件。

<a id="theme--common"></a>

### 公共参数

| 参数 | 类型 / 默认值 | 作用 |
| --- | --- | --- |
| config | Partial&lt;PrismConfig&gt; / 默认配置 | 按需覆盖公共主题字段。 |
| className | string / 无 | 附加到组件外层；不自动透传其他 DOM 属性。 |

<a id="theme--fields"></a>

### PrismConfig 字段

| 字段 | 默认 / 范围 | 使用说明 |
| --- | --- | --- |
| accent | #c5f86d / 六位 HEX | 强调色；light 材质会调整文字用色。 |
| surface | dark / dark 或 light | 组件材质，与工作台或文档页面主题独立。 |
| radius | 24 / 0–40 px | 使用圆角的组件会按自身结构限制上限。 |
| glow | 45 / 0–100 | 卡片、旋钮、导航、按钮、弹窗和图表的相关光晕。 |
| speed | 35 / 0–100 | 空间卡片持续动画速度；不控制网络请求速度。 |
| motion | true / boolean | 相关动画与过渡；不禁用业务交互。 |
| grid | true / boolean | 空间卡片内部辅助网格。 |
| label | NEURAL CORE / 最多 40 字 | 特色组件的顶部标识；不是图表 title。 |
| caption | 中文副文案 / 最多 100 字 | 空间卡片的辅助文案。 |

<a id="theme--example"></a>

### 完整主题示例

当前没有全局 ThemeProvider。需要统一主题时，共用同一份 config 对象并传给各组件。

**完整 React 示例：theme.tsx**

```tsx
import { useState } from "react";
import { PrismButton, PrismGauge, type PrismConfig } from "@batype/prismdeck";
import { DEFAULT_CONFIG, validateConfig } from "@batype/prismdeck/config";
import "@batype/prismdeck/style.css";

export default function ThemeExample() {
  const [light, setLight] = useState(false);
  const config: PrismConfig = validateConfig({
    ...DEFAULT_CONFIG,
    accent: "#8ce2ff",
    surface: light ? "light" : "dark",
    radius: 16,
    motion: true,
  });
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PrismGauge config={config} title="同一份主题配置" value={64} />
      <PrismButton config={config} onClick={() => setLight((v) => !v)}>
        切换到{light ? "暗色" : "亮色"}材质
      </PrismButton>
    </div>
  );
}
```

<a id="theme--validation"></a>

### 校验与 CSS 注意事项

DEFAULT_CONFIG、PRESETS、validateConfig 从 @batype/prismdeck/config 导入。validateConfig 接受部分配置、补默认值并拒绝未知字段；从外部 JSON 读取配置时建议先校验。

不要直接修改 node_modules。className 可以覆盖业务容器尺寸；修改组件 CSS 时请检查后加载的全局样式是否覆盖 pd- 类。

默认 React / Vite 入口没有 use client。组件样式只需在应用入口引入一次；动态切换页面亮暗主题不会自动修改组件 config.surface。

<a id="forms"></a>

## 状态管理与业务请求

组件负责交互与展示，业务代码负责数据、请求及错误反馈。

<a id="forms--controlled"></a>

### 受控组件如何接入

OrbitDial、CommandDock、PrismSwitch、PrismTabs 和 PrismDialog 通过 value / checked / open 与回调由父组件控制。只传当前值，不在回调里更新状态，界面不会自动变化。

PrismInput 支持受控 value + onChange，也支持 defaultValue。不要在同一个实例上来回切换受控与非受控模式。

PrismButton 默认 type=button；表单提交要显式传 type=submit。loading 由父组件维护，加载中会禁用按钮。

<a id="forms--example"></a>

### 完整请求表单

下面代码需要你提供 /api/settings 后端。它不会在文档页中运行请求，也不会因为点击组件就自动接通业务 API。

**src/SettingsForm.tsx**

```tsx
import { useState, type FormEvent } from 'react';
import { PrismInput, PrismSwitch, PrismButton } from '@batype/prismdeck';
import '@batype/prismdeck/style.css';

export default function SettingsForm() {
  const [name, setName] = useState('My project');
  const [notify, setNotify] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      // 将此 URL 替换为你自己的后端，并处理所需认证。
      const response = await fetch('/api/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, notifications: notify }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setMessage('保存成功');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '保存失败');
    } finally { setLoading(false); }
  }
  return <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
    <PrismInput label="项目名称" name="projectName" value={name} required
      onChange={event => setName(event.target.value)}
      error={name.trim() ? undefined : '请填写项目名称'} />
    <PrismSwitch label="消息通知" checked={notify} onCheckedChange={setNotify} />
    <PrismButton type="submit" loading={loading}>保存设置</PrismButton>
    <p role="status">{message}</p>
  </form>;
}
```

<a id="forms--errors"></a>

### 处理异步成功和失败

在 finally 中恢复 loading，处理非 2xx HTTP 状态，并把错误显示给用户。复杂请求取消、重试与缓存可以放在你的数据层；PrismDeck 不内置这些策略。

没有 onCheckedChange 的开关会禁用；没有 onChange 的旋钮和导航也会只读或禁用动作。不要把“未提供业务回调”误认为组件会自己保存设置。

<a id="chart-data"></a>

## 图表数据与事件

先理解数据模型、原始索引与数值范围，再接入六种图形组件。

<a id="chart-data--shape"></a>

### 数据结构

**data.ts**

```tsx
import type { PrismDataPoint } from '@batype/prismdeck';

export const data: PrismDataPoint[] = [
  { label: '周一', value: 120 },
  { label: '周二', value: 186 },
];
```

<a id="chart-data--rules"></a>

### 数据边界

| 组件 | 有效数据规则 | 空 / 异常状态 |
| --- | --- | --- |
| 面积图 / 柱状图 | 有限数值，支持正数、负数、全零和单点；输入顺序等距排列。 | 无有效点显示空状态；不自动把日期转换为时间轴。 |
| 环形图 | 只使用有限且大于 0 的数值。 | 无正值显示空状态，百分比按有效正值总量计算。 |
| 仪表盘 | value / min / max 必须有限，max &gt; min。 | 值显示为范围内的钳制值；无效范围显示提示。 |
| 热力图 | 按数组顺序逐列排列，每列 rows 项。 | 负值为最低强度、读数保留原值；不自动补日期或星期偏移。 |
| 雷达图 | 至少 3 个有效维度，所有轴共用 0–max。 | max 必须是有限正数；图形钳制范围、读数保留原值。 |

<a id="chart-data--events"></a>

### 事件与格式化

onSelect(point, index) 在点击或 Enter / Space 激活时调用；index 对应原始 data 的索引，即使中间有无效项被过滤。悬停和聚焦只更新读数，不调用 onSelect。

formatValue 控制数值读数。面积图 / 柱状图默认也用它格式化纵轴；formatAxisValue 可以单独覆盖纵轴。unit 添加到读数，formatter 通常只返回数字文本，避免重复单位。

<a id="chart-data--limits"></a>

### 容量与当前能力

库组件没有固定的 512 项硬限制，但大量 SVG / DOM 节点会影响性能，建议先采样或聚合。512 项是在线数据编辑器的限制。

当前面积图、柱状图为单序列，雷达图为单组数据；不提供堆叠、缩放、多曲线对比或自动请求。需要加载 / 错误态时，在业务容器中切换提示和图表。

<a id="source-export"></a>

## 导出源码与保存配置

使用 npm 或带走源码均可。明确哪些设计状态会被保存，避免预览与代码不同步。

<a id="source-export--workflow"></a>

### 推荐工作流

1. 在工作台选择组件与材质。
2. 图形组件在右侧设置标题、说明、单位；编辑 JSON 后点击“应用数据”。
3. 仪表盘调值、应用范围或修改热力图行数。
4. 打开“查看代码”核对当前配置，下载源码 ZIP。

<a id="source-export--files"></a>

### ZIP 中的文件

| 文件 / 目录 | 用途 |
| --- | --- |
| App.tsx | 当前组件示例，图表的已应用数据与当前仪表盘数值内嵌其中。 |
| components/ | 15 个组件实现、公共主题模块和独立 CSS。 |
| core/config.ts | 主题默认值、类型与校验。 |
| prismdeck.config.json | 当前设计元数据，可回到工作台导入。 |
| README.md / LICENSE | 接入说明与 MIT 许可证。 |

<a id="source-export--integrate"></a>

### 接入已有工程

保留 components 与 core 的相对位置，将内容放入现有 React + TypeScript 工程的 src 目录。ZIP 不是包含 package.json、路由和 Vite 配置的完整脚手架。

复制 App.tsx 为你需要的页面，组件样式保持引入。源码 ZIP 内部使用相对导入，不依赖安装 @batype/prismdeck；只需要 React 与相应 TypeScript 开发配置。

Next.js 中，交互 App.tsx 顶部添加 use client，CSS 可提升到根布局。不要把可交互 App 直接作为未声明边界的 Server Component。

<a id="source-export--persistence"></a>

### 保存与分享的规则

当前图表的已应用数据、标题、单位、范围和值会同步预览、导出和保存配置。未应用的 JSON 草稿、按钮点击次数、弹窗打开状态等临时交互不导出。

配置文件最多 256 KiB，分享内容最多 16 KiB。超出分享大小时改用配置文件或源码 ZIP。配置保存在当前浏览器，不提供云同步。

分享链接是创建时的快照，打开链接时优先加载链接内容；普通工作台页面刷新恢复本地保存内容。分享链接会携带文案与图表数据，请勿把私密数据放入公开链接。旧版无 charts 字段的配置仍可导入。

<a id="spatial-card"></a>

## SpatialCard · 空间卡片

带指针光影与层次效果的固定结构展示卡片。

<a id="spatial-card--example"></a>

### 可运行示例

代码与下面的组件演示使用同一份源码，可直接复制到 React + TypeScript 项目。

**完整 React 示例：spatial-card.tsx**

```tsx
import { useState } from "react";
import { SpatialCard } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function CardExample() {
  const [connected, setConnected] = useState(false);
  return (
    <SpatialCard
      config={{
        label: "PROJECT CORE",
        caption: "空间卡片的连接状态为本地演示。",
        accent: "#8ce2ff",
      }}
      actionLabel={connected ? "已连接 · 断开" : "建立连接"}
      onAction={() => setConnected((v) => !v)}
    />
  );
}
```

<a id="spatial-card--props"></a>

### 参数与默认值

| 参数 | 类型 | 默认 / 必填 | 说明 |
| --- | --- | --- | --- |
| config | Partial&lt;PrismConfig&gt; | 默认主题 | 公共材质配置，参见“主题与样式”。 |
| className | string | 无 | 附加到组件外层容器。 |
| onAction | () =&gt; void | 无 | 点击动作回调；不提供时按钮禁用。 |
| actionLabel | string | 建立连接 | 动作按钮文字。 |

<a id="spatial-card--behavior"></a>

### 交互与使用边界

config.label 调整顶部标识，config.caption 调整辅助文案。触屏不执行指针倾斜，关闭 motion 不影响动作回调。

当前主标题 Beyond the ordinary. 与部分装饰内容为固定结构，不支持 title / children / footer 插槽；需要这些能力时可导出源码修改。

<a id="orbit-dial"></a>

## OrbitDial · 轨道旋钮

可拖动且提供原生键盘滑条的百分比控件。

<a id="orbit-dial--example"></a>

### 可运行示例

代码与下面的组件演示使用同一份源码，可直接复制到 React + TypeScript 项目。

**完整 React 示例：orbit-dial.tsx**

```tsx
import { useState } from "react";
import { OrbitDial } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function DialExample() {
  const [value, setValue] = useState(64);
  return (
    <OrbitDial
      label="能量输出"
      value={value}
      onChange={setValue}
      config={{ accent: "#c6a2ff" }}
    />
  );
}
```

<a id="orbit-dial--props"></a>

### 参数与默认值

| 参数 | 类型 | 默认 / 必填 | 说明 |
| --- | --- | --- | --- |
| config | Partial&lt;PrismConfig&gt; | 默认主题 | 公共材质配置，参见“主题与样式”。 |
| className | string | 无 | 附加到组件外层容器。 |
| value | number | 64 | 当前值，有限数值钳制到 0–100，非有限值显示为 0。 |
| onChange | (value: number) =&gt; void | 无 | 受控更新回调，不提供则只读。 |
| label | string | 能量输出 | 旋钮和滑条标签。 |
| disabled | boolean | false | 禁用指针与键盘修改。 |

<a id="orbit-dial--behavior"></a>

### 交互与使用边界

指针拖动通过受控 onChange 更新；下方原生 range 支持方向键。父组件必须把新值传回 value。

当前范围固定为 0–100、步长为 1、单位为 %；不支持 min / max / step / unit 参数。

<a id="command-dock"></a>

## CommandDock · 悬浮导航

在少量页面或工具视图间切换。

<a id="command-dock--example"></a>

### 可运行示例

代码与下面的组件演示使用同一份源码，可直接复制到 React + TypeScript 项目。

**完整 React 示例：command-dock.tsx**

```tsx
import { useState } from "react";
import { CommandDock } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function DockExample() {
  const [page, setPage] = useState("overview");
  return (
    <div>
      <CommandDock
        value={page}
        onChange={setPage}
        items={[
          { id: "overview", label: "概览" },
          { id: "settings", label: "设置" },
        ]}
      />
      <p style={{ color: "#aab3a4", fontSize: 13 }}>当前页面：{page}</p>
    </div>
  );
}
```

<a id="command-dock--props"></a>

### 参数与默认值

| 参数 | 类型 | 默认 / 必填 | 说明 |
| --- | --- | --- | --- |
| config | Partial&lt;PrismConfig&gt; | 默认主题 | 公共材质配置，参见“主题与样式”。 |
| className | string | 无 | 附加到组件外层容器。 |
| items | DockItem[] | 四个默认导航项 | { id: string, label: string, icon?: ReactNode }，id 应唯一。 |
| value | string | overview | 当前选中项 id。 |
| onChange | (id: string) =&gt; void | 无 | 点击后通知父层更新；未提供时按钮禁用。 |
| label | string | 快捷导航 | nav 的可访问名称。 |

<a id="command-dock--behavior"></a>

### 交互与使用边界

只负责选中状态与回调，不内置路由跳转。需要跳转时，在 onChange 中接入你的路由方案。

图标和标题可以自定义；当前不支持单项 disabled、href 或 badge 属性。默认项 id 为 overview、layers、signal、settings。

<a id="button"></a>

## PrismButton · 按钮

按钮层级、尺寸与异步加载反馈。

<a id="button--example"></a>

### 可运行示例

代码与下面的组件演示使用同一份源码，可直接复制到 React + TypeScript 项目。

**完整 React 示例：button.tsx**

```tsx
import { useState } from "react";
import { PrismButton } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function ButtonExample() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("尚未执行");
  async function save() {
    setLoading(true);
    try {
      // 本地演示。接入业务时在这里 await 真实请求。
      await Promise.resolve();
      setMessage("演示保存完成");
    } catch {
      setMessage("保存失败，请重试");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PrismButton loading={loading} onClick={save}>
        {loading ? "保存中…" : "保存设置"}
      </PrismButton>
      <PrismButton variant="outline" disabled>
        无权限操作
      </PrismButton>
      <p role="status" style={{ color: "#aab3a4", fontSize: 13 }}>
        {message}
      </p>
    </div>
  );
}
```

<a id="button--props"></a>

### 参数与默认值

| 参数 | 类型 | 默认 / 必填 | 说明 |
| --- | --- | --- | --- |
| config | Partial&lt;PrismConfig&gt; | 默认主题 | 公共材质配置，参见“主题与样式”。 |
| className | string | 无 | 附加到组件外层容器。 |
| variant | solid / outline / ghost | solid | 外观层级。 |
| size | sm / md / lg | md | 按钮尺寸。 |
| loading | boolean | false | 显示加载指示器并禁用按钮。 |
| disabled | boolean | false | 原生禁用状态。 |
| type | button / submit / reset | button | 在 form 中提交时显式使用 submit。 |
| children | ReactNode | 无 | 按钮内容。 |
| 原生属性 / ref | ButtonHTMLAttributes / HTMLButtonElement | 支持 | onClick、name、aria-*、style 等透传到按钮。 |

<a id="button--behavior"></a>

### 交互与使用边界

业务层负责请求和 loading 状态，组件不会自动调用 API，也不会自动处理 Promise。

style 合并到按钮本身；传入 ref 指向原生 button。loading 时 aria-busy 为 true，文本需由业务按需要更新。

<a id="input"></a>

## PrismInput · 输入框

将标签、帮助与校验反馈组合到原生 input。

<a id="input--example"></a>

### 可运行示例

代码与下面的组件演示使用同一份源码，可直接复制到 React + TypeScript 项目。

**完整 React 示例：input.tsx**

```tsx
import { useRef, useState } from "react";
import { PrismInput, PrismButton } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function InputExample() {
  const [name, setName] = useState("My project");
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PrismInput
        ref={ref}
        label="项目名称"
        name="projectName"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        maxLength={40}
        description="显示在项目列表中，最多 40 字。"
        error={name.trim() ? undefined : "请填写项目名称"}
      />
      <PrismButton variant="outline" onClick={() => ref.current?.focus()}>
        聚焦输入框
      </PrismButton>
    </div>
  );
}
```

<a id="input--props"></a>

### 参数与默认值

| 参数 | 类型 | 默认 / 必填 | 说明 |
| --- | --- | --- | --- |
| config | Partial&lt;PrismConfig&gt; | 默认主题 | 公共材质配置，参见“主题与样式”。 |
| className | string | 无 | 附加到组件外层容器。 |
| label | string | 必填 | 可见标签，与原生 input 关联。 |
| description | string | 无 | 辅助说明，加入 aria-describedby。 |
| error | string | 无 | 错误文字，设置 aria-invalid 并显示 alert。 |
| value / defaultValue | 原生 input 类型 | 无 | 支持受控或非受控用法。 |
| 原生属性 / ref | InputHTMLAttributes / HTMLInputElement | 支持 | type、name、required、onChange、aria-* 等传给 input。 |
| style / className | CSSProperties / string | 无 | 作用于外层容器，ref 指向内部 input。 |

<a id="input--behavior"></a>

### 交互与使用边界

提供 error 只负责展示错误，不会自动执行你自己的校验规则。可以使用原生 required / type 或表单库。

推荐 text、email、password 等文本输入。没有内置清空、密码显隐或前后缀插槽。

<a id="switch"></a>

## PrismSwitch · 开关

受控状态开关，保留复选框的键盘和表单行为。

<a id="switch--example"></a>

### 可运行示例

代码与下面的组件演示使用同一份源码，可直接复制到 React + TypeScript 项目。

**完整 React 示例：switch.tsx**

```tsx
import { useState } from "react";
import { PrismSwitch } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function SwitchExample() {
  const [enabled, setEnabled] = useState(true);
  return (
    <PrismSwitch
      label="接收项目通知"
      description="支持点击标签和 Space 键切换。"
      name="notifications"
      value="yes"
      checked={enabled}
      onCheckedChange={setEnabled}
    />
  );
}
```

<a id="switch--props"></a>

### 参数与默认值

| 参数 | 类型 | 默认 / 必填 | 说明 |
| --- | --- | --- | --- |
| config | Partial&lt;PrismConfig&gt; | 默认主题 | 公共材质配置，参见“主题与样式”。 |
| className | string | 无 | 附加到组件外层容器。 |
| label | string | 必填 | 可点击的可见标签。 |
| checked | boolean | 必填 | 当前开关值。 |
| onCheckedChange | (checked: boolean) =&gt; void | 无 | 更新回调；不提供时禁用。 |
| description | string | 无 | 关联的帮助文字。 |
| disabled | boolean | false | 禁用修改。 |
| 原生属性 / ref | 部分 InputHTMLAttributes / HTMLInputElement | 支持 | 支持 name、value、required 等；type 固定为 checkbox，角色为 switch。 |
| style / className | CSSProperties / string | 无 | 作用于外层容器。 |

<a id="switch--behavior"></a>

### 交互与使用边界

未选中或禁用的开关不提交原生表单值；选中时提交 name/value，未指定 value 时使用原生默认值。

不支持 defaultChecked 非受控模式。用 Space 或点击标签触发 onCheckedChange，业务负责将新 checked 传回。

<a id="tabs"></a>

## PrismTabs · 标签页

组织受控面板，支持方向键与保留隐藏内容状态。

<a id="tabs--example"></a>

### 可运行示例

代码与下面的组件演示使用同一份源码，可直接复制到 React + TypeScript 项目。

**完整 React 示例：tabs.tsx**

```tsx
import { useState } from "react";
import { PrismTabs, PrismInput } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function TabsExample() {
  const [tab, setTab] = useState("overview");
  return (
    <PrismTabs
      label="项目视图"
      value={tab}
      onValueChange={setTab}
      items={[
        { value: "overview", label: "概览", content: "项目运行正常。" },
        { value: "team", label: "团队", content: "团队视图", disabled: true },
        {
          value: "settings",
          label: "设置",
          content: <PrismInput label="显示名称" defaultValue="My project" />,
        },
      ]}
    />
  );
}
```

<a id="tabs--props"></a>

### 参数与默认值

| 参数 | 类型 | 默认 / 必填 | 说明 |
| --- | --- | --- | --- |
| config | Partial&lt;PrismConfig&gt; | 默认主题 | 公共材质配置，参见“主题与样式”。 |
| className | string | 无 | 附加到组件外层容器。 |
| items | PrismTabItem[] | 必填 | { value, label, content, disabled? }，value 必须唯一。 |
| value | string | 必填 | 当前启用项的 value。 |
| onValueChange | (value: string) =&gt; void | 必填 | 父层负责更新 value。 |
| label | string | 选项卡 | tablist 的可访问名称。 |

<a id="tabs--behavior"></a>

### 交互与使用边界

左右方向键循环切换启用项，Home / End 跳到首尾，禁用项会被跳过。采用方向键自动激活模式。

隐藏面板保持挂载，保留内部输入。业务应保证 value 对应有效启用项；无有效匹配时不会显示面板。

<a id="badge"></a>

## PrismBadge · 状态徽标

通过文字与语义色表达状态。

<a id="badge--example"></a>

### 可运行示例

代码与下面的组件演示使用同一份源码，可直接复制到 React + TypeScript 项目。

**完整 React 示例：badge.tsx**

```tsx
import { PrismBadge } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function BadgeExample() {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <PrismBadge tone="neutral">未开始</PrismBadge>
      <PrismBadge tone="success">运行正常</PrismBadge>
      <PrismBadge tone="warning">需要注意</PrismBadge>
      <PrismBadge tone="danger" dot={false}>
        连接失败
      </PrismBadge>
    </div>
  );
}
```

<a id="badge--props"></a>

### 参数与默认值

| 参数 | 类型 | 默认 / 必填 | 说明 |
| --- | --- | --- | --- |
| config | Partial&lt;PrismConfig&gt; | 默认主题 | 公共材质配置，参见“主题与样式”。 |
| className | string | 无 | 附加到组件外层容器。 |
| tone | neutral / success / warning / danger | neutral | 语义色。 |
| dot | boolean | true | 是否显示圆点。 |
| children | ReactNode | 无 | 状态文字。 |
| 原生属性 | HTMLAttributes&lt;HTMLSpanElement&gt; | 支持 | className、style、aria-* 等。 |

<a id="badge--behavior"></a>

### 交互与使用边界

默认不创建动态播报区域。需要播报接口状态变化时，可在业务外层使用 role=status 或 aria-live=polite。

颜色并非唯一状态线索，应保留明确文字；当前不支持关闭型标签或计数徽标专用 API。

<a id="dialog"></a>

## PrismDialog · 对话框

用原生模态 dialog 聚焦重要内容。

<a id="dialog--example"></a>

### 可运行示例

代码与下面的组件演示使用同一份源码，可直接复制到 React + TypeScript 项目。

**完整 React 示例：dialog.tsx**

```tsx
import { useState } from "react";
import { PrismDialog, PrismButton, PrismInput } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function DialogExample() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("My project");
  return (
    <>
      <PrismButton onClick={() => setOpen(true)}>打开项目设置</PrismButton>
      <PrismDialog
        open={open}
        onOpenChange={setOpen}
        title="项目设置"
        description="本地演示；关闭后会返回触发按钮。"
        closeOnBackdrop={false}
        footer={<PrismButton onClick={() => setOpen(false)}>完成</PrismButton>}
      >
        <PrismInput
          label="项目名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </PrismDialog>
    </>
  );
}
```

<a id="dialog--props"></a>

### 参数与默认值

| 参数 | 类型 | 默认 / 必填 | 说明 |
| --- | --- | --- | --- |
| config | Partial&lt;PrismConfig&gt; | 默认主题 | 公共材质配置，参见“主题与样式”。 |
| className | string | 无 | 附加到组件外层容器。 |
| open | boolean | 必填 | 受控打开状态。 |
| onOpenChange | (open: boolean) =&gt; void | 必填 | 关闭请求，父层需更新 open。 |
| title | ReactNode | 必填 | 弹窗标题与可访问名称。 |
| description | string | 无 | 标题下的辅助说明。 |
| children | ReactNode | 无 | 正文内容。 |
| footer | ReactNode | 无 | 底部操作区域。 |
| closeOnBackdrop | boolean | true | 是否允许点击背景关闭。 |
| closeLabel | string | 关闭弹窗 | 关闭按钮的可访问标签。 |

<a id="dialog--behavior"></a>

### 交互与使用边界

支持 Escape、关闭按钮与焦点恢复。closeOnBackdrop=false 只禁止背景关闭，不会禁止 Escape 或关闭按钮。

使用现代浏览器原生 showModal。SSR 时不打开模态，客户端 effect 后打开。不要用 form method=dialog 代替受控状态管理。

没有内置异步确认逻辑；需要保存后关闭时，在业务回调完成后 setOpen(false)。

<a id="area-chart"></a>

## PrismAreaChart · 趋势面积图

查看指标趋势与面积。

<a id="area-chart--example"></a>

### 可运行示例

代码与下面的组件演示使用同一份源码，可直接复制到 React + TypeScript 项目。

**完整 React 示例：area-chart.tsx**

```tsx
import { PrismAreaChart } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function AreaExample() {
  return (
    <PrismAreaChart
      title="接口延迟"
      description="小数刻度保留有效数字。"
      unit="s"
      data={[
        { label: "10:00", value: 0.0001 },
        { label: "11:00", value: 0.0002 },
        { label: "12:00", value: 0.00015 },
      ]}
      formatAxisValue={(value) => (value === 0 ? "0" : value.toExponential(1))}
      onSelect={(point, index) => console.log(point.label, point.value, index)}
    />
  );
}
```

<a id="area-chart--props"></a>

### 参数与默认值

| 参数 | 类型 | 默认 / 必填 | 说明 |
| --- | --- | --- | --- |
| config | Partial&lt;PrismConfig&gt; | 默认主题 | 公共材质配置，参见“主题与样式”。 |
| className | string | 无 | 附加到组件外层容器。 |
| title | string | 必填 | 图表可访问名称和可见标题。 |
| data | readonly PrismDataPoint[] | 必填 | 按输入顺序展示的 { label, value } 数组。 |
| description | string | 无 | 标题下的说明。 |
| unit | string | 空字符串 | 读数单位。 |
| formatValue | (value: number) =&gt; string | 自动有效数字 | 数值显示格式。 |
| onSelect | (point, originalIndex) =&gt; void | 无 | 点击或键盘激活时通知业务层。 |
| formatAxisValue | (value: number) =&gt; string | formatValue 或默认格式 | 只覆盖纵轴，不改变数据点的读数。 |

<a id="area-chart--behavior"></a>

### 交互与使用边界

支持正负值、单点与全零；绘制为等距单序列，不解析时间间隔。

默认保留六位有效数字，极小或很大的值使用科学记数法；可通过 formatAxisValue 单独格式化纵轴。

公共数据约定、原始索引与格式化规则参见“图表数据约定”。

<a id="bar-chart"></a>

## PrismBarChart · 柱状图

比较分类数值，保留负值与零基线。

<a id="bar-chart--example"></a>

### 可运行示例

代码与下面的组件演示使用同一份源码，可直接复制到 React + TypeScript 项目。

**完整 React 示例：bar-chart.tsx**

```tsx
import { useState } from "react";
import { PrismBarChart } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function BarExample() {
  const [selected, setSelected] = useState("尚未选择");
  return (
    <div>
      <PrismBarChart
        title="月度净增长"
        unit="人"
        data={[
          { label: "一月", value: 36 },
          { label: "二月", value: -12 },
          { label: "三月", value: 58 },
        ]}
        onSelect={(point) => setSelected(`${point.label}：${point.value} 人`)}
      />
      <p role="status" style={{ color: "#aab3a4", fontSize: 13 }}>
        {selected}
      </p>
    </div>
  );
}
```

<a id="bar-chart--props"></a>

### 参数与默认值

| 参数 | 类型 | 默认 / 必填 | 说明 |
| --- | --- | --- | --- |
| config | Partial&lt;PrismConfig&gt; | 默认主题 | 公共材质配置，参见“主题与样式”。 |
| className | string | 无 | 附加到组件外层容器。 |
| title | string | 必填 | 图表可访问名称和可见标题。 |
| data | readonly PrismDataPoint[] | 必填 | 按输入顺序展示的 { label, value } 数组。 |
| description | string | 无 | 标题下的说明。 |
| unit | string | 空字符串 | 读数单位。 |
| formatValue | (value: number) =&gt; string | 自动有效数字 | 数值显示格式。 |
| onSelect | (point, originalIndex) =&gt; void | 无 | 点击或键盘激活时通知业务层。 |
| formatAxisValue | (value: number) =&gt; string | formatValue 或默认格式 | 只覆盖纵轴，不改变数据点的读数。 |

<a id="bar-chart--behavior"></a>

### 交互与使用边界

支持正负数和零基线。超过 8 项时省略 SVG 横轴标签，完整标签仍在数据图例中。

当前为单序列竖向柱状图，不支持分组、堆叠或横向布局。

公共数据约定、原始索引与格式化规则参见“图表数据约定”。

<a id="donut-chart"></a>

## PrismDonutChart · 环形占比图

展示分类构成与当前分类百分比。

<a id="donut-chart--example"></a>

### 可运行示例

代码与下面的组件演示使用同一份源码，可直接复制到 React + TypeScript 项目。

**完整 React 示例：donut-chart.tsx**

```tsx
import { PrismDonutChart } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function DonutExample() {
  return (
    <PrismDonutChart
      title="流量来源"
      unit="次"
      data={[
        { label: "网页", value: 580 },
        { label: "移动端", value: 240 },
        { label: "API", value: 180 },
      ]}
      onSelect={(point, originalIndex) => console.log(point, originalIndex)}
    />
  );
}
```

<a id="donut-chart--props"></a>

### 参数与默认值

| 参数 | 类型 | 默认 / 必填 | 说明 |
| --- | --- | --- | --- |
| config | Partial&lt;PrismConfig&gt; | 默认主题 | 公共材质配置，参见“主题与样式”。 |
| className | string | 无 | 附加到组件外层容器。 |
| title | string | 必填 | 图表可访问名称和可见标题。 |
| data | readonly PrismDataPoint[] | 必填 | 按输入顺序展示的 { label, value } 数组。 |
| description | string | 无 | 标题下的说明。 |
| unit | string | 空字符串 | 读数单位。 |
| formatValue | (value: number) =&gt; string | 自动有效数字 | 数值显示格式。 |
| onSelect | (point, originalIndex) =&gt; void | 无 | 点击或键盘激活时通知业务层。 |

<a id="donut-chart--behavior"></a>

### 交互与使用边界

只使用有限正数；负数、零与非有限值不参与占比。点击扇区或图例更新当前读数。

图例用于查看数据，不会隐藏分类。颜色每五项循环，使用文字与数值区分类别。

公共数据约定、原始索引与格式化规则参见“图表数据约定”。

<a id="gauge"></a>

## PrismGauge · 仪表盘

显示范围内的单个业务数值。

<a id="gauge--example"></a>

### 可运行示例

代码与下面的组件演示使用同一份源码，可直接复制到 React + TypeScript 项目。

**完整 React 示例：gauge.tsx**

```tsx
import { useState } from "react";
import { PrismGauge, PrismButton } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function GaugeExample() {
  const [value, setValue] = useState(35);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PrismGauge
        title="CPU 使用率"
        description="由外部业务状态控制。"
        value={value}
        min={0}
        max={100}
        unit="%"
      />
      <PrismButton
        variant="outline"
        onClick={() => setValue((v) => (v === 35 ? 72 : 35))}
      >
        切换到 {value === 35 ? 72 : 35}%
      </PrismButton>
    </div>
  );
}
```

<a id="gauge--props"></a>

### 参数与默认值

| 参数 | 类型 | 默认 / 必填 | 说明 |
| --- | --- | --- | --- |
| config | Partial&lt;PrismConfig&gt; | 默认主题 | 公共材质配置，参见“主题与样式”。 |
| className | string | 无 | 附加到组件外层容器。 |
| title | string | 必填 | 标题与 meter 的可访问名称。 |
| value | number | 必填 | 当前业务值，显示时钳制到范围内。 |
| min | number | 0 | 下限。 |
| max | number | 100 | 上限，必须大于 min。 |
| unit | string | % | 数值单位，可设为空字符串。 |
| description | string | 无 | 辅助说明。 |
| formatValue | (value: number) =&gt; string | 自动有效数字 | 显示数值与范围标签的格式。 |

<a id="gauge--behavior"></a>

### 交互与使用边界

这是只读指标展示，改变数值需要业务层更新 value；本身没有 onSelect 或 onChange 回调。示例按钮属于业务代码。

无效数值或范围显示“无效数值或范围”。提供 meter 角色和数值 ARIA 属性；motion=false 关闭数值弧线过渡。

<a id="heatmap"></a>

## PrismHeatmap · 活动热力图

将连续记录绘制成可浏览的活动矩阵。

<a id="heatmap--example"></a>

### 可运行示例

代码与下面的组件演示使用同一份源码，可直接复制到 React + TypeScript 项目。

**完整 React 示例：heatmap.tsx**

```tsx
import { useState } from "react";
import { PrismHeatmap } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

const data = Array.from({ length: 56 }, (_, i) => ({
  label: `第 ${i + 1} 天`,
  value: (i * 7) % 24,
}));

export default function HeatmapExample() {
  const [selected, setSelected] = useState("方向键浏览，Enter 选择");
  return (
    <div>
      <PrismHeatmap
        title="开发活动"
        data={data}
        rows={7}
        unit="次"
        onSelect={(point) => setSelected(`${point.label}：${point.value} 次`)}
      />
      <p role="status" style={{ color: "#aab3a4", fontSize: 13 }}>
        {selected}
      </p>
    </div>
  );
}
```

<a id="heatmap--props"></a>

### 参数与默认值

| 参数 | 类型 | 默认 / 必填 | 说明 |
| --- | --- | --- | --- |
| config | Partial&lt;PrismConfig&gt; | 默认主题 | 公共材质配置，参见“主题与样式”。 |
| className | string | 无 | 附加到组件外层容器。 |
| title | string | 必填 | 图表可访问名称和可见标题。 |
| data | readonly PrismDataPoint[] | 必填 | 按输入顺序展示的 { label, value } 数组。 |
| description | string | 无 | 标题下的说明。 |
| unit | string | 空字符串 | 读数单位。 |
| formatValue | (value: number) =&gt; string | 自动有效数字 | 数值显示格式。 |
| onSelect | (point, originalIndex) =&gt; void | 无 | 点击或键盘激活时通知业务层。 |
| rows | number | 7 | 每列行数，取整并限制在 1–14。 |

<a id="heatmap--behavior"></a>

### 交互与使用边界

按输入顺序逐列放置，不会补齐缺失日期。若用作日历，应在业务侧先构造连续日期，并按需要补零。

方向键、Home / End 浏览，Enter / Space 选择。宽度不足时可水平滚动。

公共数据约定、原始索引与格式化规则参见“图表数据约定”。

<a id="radar-chart"></a>

## PrismRadarChart · 雷达图

查看同一组数据在多个维度的轮廓。

<a id="radar-chart--example"></a>

### 可运行示例

代码与下面的组件演示使用同一份源码，可直接复制到 React + TypeScript 项目。

**完整 React 示例：radar-chart.tsx**

```tsx
import { PrismRadarChart } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function RadarExample() {
  return (
    <PrismRadarChart
      title="项目健康度"
      max={100}
      data={[
        { label: "性能", value: 76 },
        { label: "可靠性", value: 92 },
        { label: "安全性", value: 70 },
        { label: "体验", value: 88 },
        { label: "维护性", value: 63 },
      ]}
      onSelect={(point) => console.log(point.label, point.value)}
    />
  );
}
```

<a id="radar-chart--props"></a>

### 参数与默认值

| 参数 | 类型 | 默认 / 必填 | 说明 |
| --- | --- | --- | --- |
| config | Partial&lt;PrismConfig&gt; | 默认主题 | 公共材质配置，参见“主题与样式”。 |
| className | string | 无 | 附加到组件外层容器。 |
| title | string | 必填 | 图表可访问名称和可见标题。 |
| data | readonly PrismDataPoint[] | 必填 | 按输入顺序展示的 { label, value } 数组。 |
| description | string | 无 | 标题下的说明。 |
| unit | string | 空字符串 | 读数单位。 |
| formatValue | (value: number) =&gt; string | 自动有效数字 | 数值显示格式。 |
| onSelect | (point, originalIndex) =&gt; void | 无 | 点击或键盘激活时通知业务层。 |
| max | number | 100 | 所有轴共用的正数上限。 |

<a id="radar-chart--behavior"></a>

### 交互与使用边界

需要至少三个有效维度，所有维度共用 0–max。负数与超上限值在图形上钳制，读数保留原值。

当前是单组数据，不能把多组数据直接拼成一个数组来实现多组对比。

公共数据约定、原始索引与格式化规则参见“图表数据约定”。

<a id="faq"></a>

## 常见问题与排查

按现象定位安装、样式、状态和导出问题。

<a id="faq--styles"></a>

### 组件出现了，但没有样式

检查是否引入 @batype/prismdeck/style.css。默认组件 JS 不会隐式注入这份 CSS。确认构建工具支持包的 CSS 子路径，并检查自己的全局 button/input 样式是否覆盖组件。

<a id="faq--client"></a>

### Next.js 提示事件或 Hook 不能用于服务端

按“Next.js 接入”创建带 use client 的包装文件，从 /next 导入，在包装内部定义状态和回调。服务端页面只传可序列化初始数据。

<a id="faq--controlled"></a>

### 点击、输入或切换后界面不变

确认提供了对应回调并更新状态：value/onChange、checked/onCheckedChange、value/onValueChange、open/onOpenChange。还要检查 disabled 与 loading。

<a id="faq--empty"></a>

### 图表为空或显示无有效数据

先检查 data 是否为数组，value 是否为有限 number，而不是数字字符串。环形图需要正值，雷达图至少三维和正数 max。仪表盘检查 min/max/value。

<a id="faq--export"></a>

### 工作台修改后，导出内容为什么没变化

图表 JSON 必须先点击“应用数据”，未应用草稿不导出。通用控件点击次数、弹窗打开状态属于临时交互，不是设计参数。确认使用 1.2.1 的工作台。

<a id="faq--theme"></a>

### 文档或工作台切到亮色，组件还是暗色

页面主题与组件材质独立。给组件传 config={{ surface: "light" }}；文档演示默认使用暗色组件材质，主题示例页可体验切换。

<a id="faq--types"></a>

### 类型找不到或缺少新属性

确认安装版本至少为 1.2.1，包本身带类型声明。formatAxisValue 属于面积图 / 柱状图的 PrismCartesianChartProps。更新安装后重启编辑器的 TypeScript 服务。

**Terminal**

```sh
npm ls @batype/prismdeck
npm install @batype/prismdeck@1.2.1
```

<a id="faq--scope"></a>

### 还缺哪些能力

当前没有全局 ThemeProvider、多系列图表、日历日期自动补齐、卡片内容插槽、可自定义范围的旋钮或完整设计系统。选择前请查看各组件的“交互与使用边界”。

<a id="changelog"></a>

## 版本与兼容说明

区分 npm 版本、文档更新和已验证的运行范围。

<a id="changelog--v121"></a>

### 1.2.1 · 配置与导出一致性

修复小数纵轴显示、仪表盘示例切换、无效参数展示和预览导出不一致；新增图表专属配置与可选 formatAxisValue，兼容旧配置。

<a id="changelog--v120"></a>

### 1.2.0 · 六个图形组件

新增面积图、柱状图、环形图、仪表盘、热力图与雷达图，组件总数增至 15。

<a id="changelog--v110"></a>

### 1.1.0 · 六个通用组件

新增按钮、输入框、开关、标签页、徽标与弹窗。

<a id="changelog--support"></a>

### 验证范围与浏览器

已验证 Node SSR、React TypeScript 入口、Next 专用入口与源码导出编译。文档示例也单独进行类型编译检查。未覆盖所有 React/Next/Vite SSR 版本组合。

交互依赖现代浏览器能力，包括 dialog.showModal、Pointer Events，以及 color-mix 等 CSS。系统减少动态效果设置会被遵循。自定义强调色仍需要检查实际可读性。

<a id="changelog--license"></a>

### 开源与反馈

项目使用 MIT 许可证。提交问题时，附安装版本、React/框架版本、最小代码、输入数据和复现步骤；不要上传凭据。

- [GitHub 源码与 Issues](https://github.com/batype/prismdeck)
- [npm 包](https://www.npmjs.com/package/@batype/prismdeck)

MIT License.
