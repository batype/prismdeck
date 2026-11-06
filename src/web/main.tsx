import React, { useEffect, useRef, useState, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import { zipSync, strToU8 } from "fflate";
import {
  Activity,
  BarChart3,
  PieChart,
  Gauge,
  CalendarDays,
  Radar,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Focus,
  Github,
  Grid2X2,
  Layers,
  Maximize2,
  Monitor,
  MousePointer2,
  Moon,
  Move3D,
  Orbit,
  Palette,
  Play,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Sun,
  Terminal,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { ChartsPreview } from "./ChartsPreview";
import { ChartControls } from "./ChartControls";
import {
  createChartDesigns,
  isChartKind,
  readDesign,
  readDesignShare,
  type ChartDesign,
  type ChartDesigns,
} from "../core/workspace";
import { BasicsPreview } from "./BasicsPreview";
import { SpatialCard, OrbitDial, CommandDock } from "../components/Prism";
import "../components/prism.css";
import {
  DEFAULT_CONFIG,
  PRESETS,
  type PrismConfig,
  type ComponentKind,
} from "../core/config";
import { makeFiles } from "../core/export";
import "./style.css";
const catalog = [
  {
    id: "card" as const,
    name: "空间卡片",
    english: "SPATIAL CARD",
    icon: Box,
    description: "光影与层次，随指针而动。",
    number: "01",
  },
  {
    id: "dial" as const,
    name: "轨道旋钮",
    english: "ORBIT DIAL",
    icon: Orbit,
    description: "让精细控制，变得直觉。",
    number: "02",
  },
  {
    id: "dock" as const,
    name: "悬浮导航",
    english: "COMMAND DOCK",
    icon: Layers,
    description: "让每次切换，都有回应。",
    number: "03",
  },
  {
    id: "button" as const,
    name: "按钮",
    english: "BUTTON",
    icon: MousePointer2,
    description: "按钮层级与加载反馈",
    number: "04",
  },
  {
    id: "input" as const,
    name: "输入框",
    english: "INPUT",
    icon: Terminal,
    description: "标签、帮助与校验",
    number: "05",
  },
  {
    id: "switch" as const,
    name: "开关",
    english: "SWITCH",
    icon: SlidersHorizontal,
    description: "偏好设置与状态切换",
    number: "06",
  },
  {
    id: "tabs" as const,
    name: "标签页",
    english: "TABS",
    icon: Layers,
    description: "组织页面内容",
    number: "07",
  },
  {
    id: "badge" as const,
    name: "状态徽标",
    english: "BADGE",
    icon: CheckCircle2,
    description: "清楚表达状态",
    number: "08",
  },
  {
    id: "dialog" as const,
    name: "对话框",
    english: "DIALOG",
    icon: Box,
    description: "聚焦重要操作",
    number: "09",
  },
  {
    id: "area" as const,
    name: "趋势面积图",
    english: "AREA CHART",
    icon: Activity,
    description: "每一次增长，都有迹可循。",
    number: "10",
  },
  {
    id: "bar" as const,
    name: "柱状图",
    english: "BAR CHART",
    icon: BarChart3,
    description: "让对比变得清晰。",
    number: "11",
  },
  {
    id: "donut" as const,
    name: "环形占比图",
    english: "DONUT CHART",
    icon: PieChart,
    description: "看见数据的构成。",
    number: "12",
  },
  {
    id: "gauge" as const,
    name: "仪表盘",
    english: "GAUGE",
    icon: Gauge,
    description: "感知关键指标。",
    number: "13",
  },
  {
    id: "heatmap" as const,
    name: "活动热力图",
    english: "HEATMAP",
    icon: CalendarDays,
    description: "把时间变成信号。",
    number: "14",
  },
  {
    id: "radar" as const,
    name: "雷达图",
    english: "RADAR CHART",
    icon: Radar,
    description: "洞察不同维度。",
    number: "15",
  },
];
function categoryFor(kind: ComponentKind) {
  return isChartKind(kind)
    ? "charts"
    : ["card", "dial", "dock"].includes(kind)
      ? "visual"
      : "base";
}
function initial() {
  try {
    const shared = readDesignShare(location.search);
    if (shared) return { ...shared, note: "已载入分享的设计" };
    const raw = localStorage.getItem("prismdeck.design.v1");
    if (raw) {
      return { ...readDesign(JSON.parse(raw)), note: "" };
    }
  } catch {
    return {
      kind: "card" as ComponentKind,
      config: DEFAULT_CONFIG,
      charts: createChartDesigns(),
      note: "保存的配置或分享链接无法读取，已使用默认设计。",
    };
  }
  return {
    kind: "card" as ComponentKind,
    config: DEFAULT_CONFIG,
    charts: createChartDesigns(),
    note: "",
  };
}
function App() {
  const [start] = useState(initial),
    [kind, setKind] = useState<ComponentKind>(start.kind),
    [config, setConfig] = useState<PrismConfig>(start.config),
    [charts, setCharts] = useState<ChartDesigns>(start.charts),
    [theme, setTheme] = useState(() => {
      try {
        return localStorage.getItem("prismdeck.chrome.v1") || "dark";
      } catch {
        return "dark";
      }
    }),
    [mobileTab, setMobileTab] = useState("preview"),
    [category, setCategory] = useState(categoryFor(start.kind)),
    [codeOpen, setCodeOpen] = useState(false),
    [guideOpen, setGuideOpen] = useState(false),
    [codeTab, setCodeTab] = useState("App.tsx"),
    [copyState, setCopyState] = useState(""),
    [notice, setNotice] = useState(start.note),
    [viewport, setViewport] = useState("desktop"),
    [grid, setGrid] = useState(true),
    [connected, setConnected] = useState(false),
    [dial, setDial] = useState(64),
    [dock, setDock] = useState("overview"),
    [focused, setFocused] = useState(false);
  const uploader = useRef<HTMLInputElement>(null),
    restoreFocus = useRef<HTMLElement | null>(null),
    dialog = useRef<HTMLDialogElement>(null);
  const item = catalog.find((i) => i.id === kind)!,
    files = makeFiles(kind, config, charts);
  const activePreset = PRESETS.find(
    (p) => JSON.stringify(p.config) === JSON.stringify(config),
  );
  useEffect(() => {
    try {
      localStorage.setItem(
        "prismdeck.design.v1",
        JSON.stringify({ kind, config, charts }),
      );
    } catch {
      setNotice("浏览器保存不可用；可以下载配置保留设计。");
    }
  }, [kind, config, charts]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("prismdeck.chrome.v1", theme);
    } catch {}
  }, [theme]);
  useEffect(() => {
    if (codeOpen || guideOpen) {
      restoreFocus.current = document.activeElement as HTMLElement;
      dialog.current?.showModal();
    }
    return () => {
      dialog.current?.close();
      restoreFocus.current?.focus();
    };
  }, [codeOpen, guideOpen]);
  function option<K extends keyof PrismConfig>(key: K, value: PrismConfig[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
  }
  function chartOption(change: Partial<ChartDesign>) {
    if (isChartKind(kind))
      setCharts((c) => ({ ...c, [kind]: { ...c[kind], ...change } }));
  }
  function choose(id: ComponentKind) {
    setKind(id);
    setMobileTab("preview");
    setConnected(false);
  }
  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState(id);
      setTimeout(() => setCopyState(""), 1600);
    } catch {
      setNotice("剪贴板不可用，请在代码预览中手动选择复制。");
    }
  }
  function save(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function download() {
    const entries = Object.fromEntries(
      Object.entries(files).map(([name, content]) => [name, strToU8(content)]),
    );
    save(
      new Blob([zipSync(entries) as Uint8Array<ArrayBuffer>], {
        type: "application/zip",
      }),
      `prismdeck-${kind}.zip`,
    );
    setNotice("React 组件源码已导出，ZIP 内含接入说明。");
  }
  async function importConfig(f?: File) {
    if (!f) return;
    try {
      if (f.size > 262144) throw new Error("配置文件不能超过 256 KiB");
      const data = readDesign(JSON.parse(await f.text()));
      setConfig(data.config);
      setCharts(data.charts);
      setKind(data.kind);
      setCategory(categoryFor(data.kind));
      setNotice("已导入设计配置。");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "配置导入失败");
    } finally {
      if (uploader.current) uploader.current.value = "";
    }
  }
  function share() {
    const url = new URL(location.href);
    url.hash = "";
    url.search = "";
    const design = JSON.stringify({
      kind,
      config,
      ...(isChartKind(kind) ? { charts: { [kind]: charts[kind] } } : {}),
    });
    if (design.length > 16384) {
      setNotice("数据较多，分享链接超过限制；请使用保存配置或下载源码。");
      return;
    }
    url.searchParams.set("design", design);
    void copy(url.href, "share");
  }
  function close() {
    setCodeOpen(false);
    setGuideOpen(false);
  }
  return (
    <div className={`app ${focused ? "focus-mode" : ""}`}>
      <header className="topbar">
        <a className="brand" href="#" aria-label="PrismDeck 首页">
          <span className="brand-mark">
            <Box size={19} />
          </span>
          <b>
            prismdeck<span>®</span>
          </b>
          <span className="edition">UI / LAB</span>
        </a>
        <div className="top-center">
          <i />
          <span>未来界面实验室</span>
          <span className="tiny-tag">V.1.2.1</span>
        </div>
        <div className="top-actions">
          <button
            className="text-btn guide-trigger"
            onClick={() => setGuideOpen(true)}
          >
            接入指南 <ArrowUpRight size={12} />
          </button>
          <a
            className="icon-btn github"
            href="https://github.com/batype/prismdeck"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub 源码"
          >
            <Github size={16} />
          </a>
          <button
            className="icon-btn"
            aria-label="切换界面亮暗主题"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="primary export-top" onClick={download}>
            <Download size={14} /> 导出组件 <span>↗</span>
          </button>
        </div>
      </header>
      <div className="mobile-tabs" role="tablist" aria-label="工作台区域">
        {[
          ["library", "组件"],
          ["preview", "预览"],
          ["inspector", "调校"],
        ].map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={mobileTab === id}
            onClick={() => setMobileTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="workspace">
        <aside
          className={`library ${mobileTab === "library" ? "mobile-active" : ""}`}
        >
          <div className="library-title">
            <span>构建下一种界面。</span>
            <span className="mono">015</span>
          </div>
          <p className="sidebar-intro">小组件，更多可能。</p>
          <div className="section-label">
            COMPONENTS <span>01—15</span>
          </div>
          <div
            className="library-categories"
            role="group"
            aria-label="组件分类"
          >
            <button
              aria-pressed={category === "visual"}
              onClick={() => setCategory("visual")}
            >
              特色交互 <span>3</span>
            </button>
            <button
              aria-pressed={category === "base"}
              onClick={() => setCategory("base")}
            >
              通用组件 <span>6</span>
            </button>
            <button
              aria-pressed={category === "charts"}
              onClick={() => setCategory("charts")}
            >
              图形数据 <span>6</span>
            </button>
          </div>
          <div className="component-list">
            {catalog
              .filter((c) => categoryFor(c.id) === category)
              .map((c) => (
                <button
                  key={c.id}
                  className={`component-choice ${!["card", "dial", "dock"].includes(c.id) ? "basic-choice" : ""} ${kind === c.id ? "selected" : ""}`}
                  onClick={() => choose(c.id)}
                >
                  <span className={`mini-art mini-${c.id}`} aria-hidden="true">
                    {c.id === "card" ? (
                      <>
                        <i className="mini-sphere" />
                        <i className="mini-ring" />
                        <i className="mini-line" />
                      </>
                    ) : c.id === "dial" ? (
                      <>
                        <i className="mini-dial" />
                        <span>64</span>
                      </>
                    ) : c.id === "dock" ? (
                      <>
                        <i />
                        <i />
                        <i />
                        <i />
                      </>
                    ) : (
                      <c.icon size={24} />
                    )}
                  </span>
                  <span className="choice-title">
                    <b>{c.name}</b>
                    <span>
                      {c.number}
                      <ArrowUpRight size={10} />
                    </span>
                  </span>
                  <span className="choice-sub">{c.english}</span>
                </button>
              ))}
          </div>
          <div className="library-bottom">
            <div className="small-label">
              <span className="mini-dot" /> MADE TO BE YOURS
            </div>
            <h3>
              交互有形，
              <br />
              <em>灵感无界。</em>
            </h3>
            <p>
              调一束光，改变一种感受。
              <br />
              预览后，带走你的代码。
            </p>
            <button onClick={() => setGuideOpen(true)}>
              如何接入项目 <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="library-footer">
            <span>REACT + CSS</span>
            <span>MIT LICENSE</span>
          </div>
        </aside>
        <main
          className={`canvas ${mobileTab === "preview" ? "mobile-active" : ""}`}
        >
          <div className="canvas-top">
            <div>
              <span className="breadcrumb">
                组件实验室 <ChevronRight size={11} />
              </span>
              <span>{item.name}</span>
            </div>
            <div className="canvas-actions">
              <button
                className={viewport === "desktop" ? "on" : ""}
                onClick={() => setViewport("desktop")}
                aria-label="桌面预览"
                aria-pressed={viewport === "desktop"}
              >
                <Monitor size={15} />
              </button>
              <button
                className={viewport === "mobile" ? "on" : ""}
                onClick={() => setViewport("mobile")}
                aria-label="窄屏预览"
                aria-pressed={viewport === "mobile"}
              >
                <Smartphone size={15} />
              </button>
              <span />
              <button
                onClick={() => setGrid(!grid)}
                aria-label="切换画布网格"
                aria-pressed={grid}
              >
                <Grid2X2 size={15} />
              </button>
              <button
                onClick={() => setFocused(!focused)}
                aria-label={focused ? "退出专注预览" : "专注预览"}
                aria-pressed={focused}
              >
                {focused ? <X size={15} /> : <Maximize2 size={15} />}
              </button>
            </div>
          </div>
          <div className={`stage ${grid ? "stage-grid" : ""}`}>
            <div
              className="stage-haze"
              style={{ "--stage-accent": config.accent } as CSSProperties}
            />
            <div className="stage-label">
              <span className="cross">+</span>
              <span>LIVE CANVAS / {item.number}</span>
              <span>可交互预览</span>
            </div>
            <div className="stage-orientation">
              <span>N</span>
              <i />
              <span>↗</span>
            </div>
            <div
              className={`component-stage ${viewport === "mobile" ? "narrow" : ""}`}
            >
              <span className="dimension-tag">
                {viewport === "mobile"
                  ? "320 PX / NARROW"
                  : "RESPONSIVE / AUTO"}
              </span>
              <div className="stage-component" key={kind}>
                {kind === "card" ? (
                  <SpatialCard
                    config={config}
                    onAction={() => setConnected((v) => !v)}
                    actionLabel={connected ? "已连接 · 断开" : "建立连接"}
                  />
                ) : kind === "dial" ? (
                  <OrbitDial config={config} value={dial} onChange={setDial} />
                ) : kind === "dock" ? (
                  <div className="dock-demo">
                    <div className="dock-demo-head">
                      <span className="pd-micro">{config.label}</span>
                      <span className="dock-selection">
                        {
                          (
                            {
                              overview: "总览",
                              layers: "图层",
                              signal: "信号",
                              settings: "设置",
                            } as Record<string, string>
                          )[dock]
                        }
                      </span>
                      <p>{config.caption}</p>
                    </div>
                    <CommandDock
                      config={config}
                      value={dock}
                      onChange={setDock}
                    />
                    <span className="dock-help">点击切换 · Tab 键导航</span>
                  </div>
                ) : isChartKind(kind) ? (
                  <ChartsPreview
                    kind={kind}
                    config={config}
                    design={charts[kind]}
                    onChange={chartOption}
                  />
                ) : (
                  <BasicsPreview kind={kind} config={config} />
                )}
              </div>
            </div>
            <div className="stage-caption">
              <span className="caption-icon">
                <MousePointer2 size={13} />
              </span>
              <span>
                {kind === "card"
                  ? "移动指针感受层次 · 点击建立连接"
                  : kind === "dial"
                    ? "拖动旋钮调值 · 也可使用下方滑条与方向键"
                    : kind === "dock"
                      ? "悬停查看标签 · 点击切换导航"
                      : "可操作演示 · 查看代码以接入你的项目"}
              </span>
            </div>
            <div className="stage-coordinates">
              <span>PRISMDECK / ORIGINAL COMPONENTS</span>
              <span>+ X 000 · Y 000</span>
            </div>
          </div>
          <div className="preview-footer">
            <div>
              <span className="live-dot" />
              <span>实时预览</span>
              <span className="foot-divider" />
              <span className="subtle">
                {config.motion ? "动效已开启" : "静态模式"} ·
                跟随系统减少动态效果
              </span>
            </div>
            <button onClick={() => setCodeOpen(true)}>
              <Code2 size={14} /> 查看代码 <ArrowUpRight size={12} />
            </button>
          </div>
          <section className="material-strip">
            <div className="strip-title">
              <span>MATERIAL STUDIES</span>
              <b>换一种感受。</b>
            </div>
            <div className="preset-row">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setConfig({ ...p.config })}
                  aria-pressed={activePreset?.id === p.id}
                  className={activePreset?.id === p.id ? "active" : ""}
                >
                  <i style={{ "--swatch": p.config.accent } as CSSProperties} />
                  <span>
                    {p.name}
                    <small>{p.tag}</small>
                  </span>
                  {activePreset?.id === p.id && <Check size={13} />}
                </button>
              ))}
            </div>
          </section>
        </main>
        <aside
          className={`inspector ${mobileTab === "inspector" ? "mobile-active" : ""}`}
        >
          <div className="inspector-head">
            <span>
              <SlidersHorizontal size={14} /> 外观调校
            </span>
            <button
              className="icon-btn"
              aria-label="重置当前设计"
              onClick={() => {
                setConfig({ ...DEFAULT_CONFIG });
                if (isChartKind(kind))
                  setCharts((c) => ({
                    ...c,
                    [kind]: createChartDesigns()[kind],
                  }));
                setNotice("已恢复当前组件默认参数。");
              }}
            >
              <RotateCcw size={13} />
            </button>
          </div>
          <div className="inspector-body">
            <div className="inspector-section">
              <div className="section-label">
                {isChartKind(kind) ? "CHART CONTENT" : "IDENTITY"}{" "}
                <span>01</span>
              </div>
              {isChartKind(kind) ? (
                <ChartControls
                  key={kind}
                  kind={kind}
                  design={charts[kind]}
                  onChange={chartOption}
                />
              ) : (
                <>
                  <label className="field">
                    标题标识
                    <input
                      maxLength={40}
                      value={config.label}
                      onChange={(e) => option("label", e.target.value)}
                      placeholder="NEURAL CORE"
                    />
                  </label>
                  {["card", "dock", "tabs"].includes(kind) && (
                    <label className="field">
                      副文案 / 预览说明
                      <textarea
                        maxLength={100}
                        rows={2}
                        value={config.caption}
                        onChange={(e) => option("caption", e.target.value)}
                      />
                    </label>
                  )}
                </>
              )}
            </div>
            <div className="inspector-section">
              <div className="section-label">
                MATERIAL <span>02</span>
              </div>
              <label className="field">
                强调色
                <div className="color-input">
                  <input
                    type="color"
                    value={config.accent}
                    onChange={(e) => option("accent", e.target.value)}
                    aria-label="选择强调色"
                  />
                  <span>{config.accent.toUpperCase()}</span>
                  <span className="color-format">HEX</span>
                </div>
              </label>
              <div className="quick-colors">
                {["#c5f86d", "#8ce2ff", "#c6a2ff", "#ffad79", "#f4f4ef"].map(
                  (color) => (
                    <button
                      key={color}
                      className={config.accent === color ? "active" : ""}
                      aria-label={`强调色 ${color}`}
                      aria-pressed={config.accent === color}
                      style={{ "--swatch": color } as CSSProperties}
                      onClick={() => option("accent", color)}
                    >
                      {config.accent === color && <Check size={11} />}
                    </button>
                  ),
                )}
              </div>
              <div className="field">
                组件材质
                <div className="segment" role="group" aria-label="组件材质">
                  <button
                    aria-pressed={config.surface === "dark"}
                    className={config.surface === "dark" ? "active" : ""}
                    onClick={() => option("surface", "dark")}
                  >
                    <Moon size={12} /> 黑曜
                  </button>
                  <button
                    aria-pressed={config.surface === "light"}
                    className={config.surface === "light" ? "active" : ""}
                    onClick={() => option("surface", "light")}
                  >
                    <Sun size={12} /> 霜白
                  </button>
                </div>
              </div>
              {!["badge", "switch"].includes(kind) && (
                <Range
                  label="圆角"
                  value={config.radius}
                  max={40}
                  suffix="px"
                  onChange={(v) => option("radius", v)}
                />
              )}
              {!["input", "switch", "tabs", "badge"].includes(kind) && (
                <Range
                  label="光晕强度"
                  value={config.glow}
                  max={100}
                  suffix="%"
                  onChange={(v) => option("glow", v)}
                />
              )}
            </div>
            {(kind === "card" ||
              kind === "dock" ||
              kind === "dialog" ||
              kind === "button" ||
              kind === "gauge") && (
              <div className="inspector-section">
                <div className="section-label">
                  BEHAVIOR <span>03</span>
                </div>
                <Switch
                  label="动态效果"
                  description={
                    kind === "gauge"
                      ? "数值更新时的过渡动效"
                      : kind === "button"
                        ? "加载指示器动效"
                        : kind === "dialog"
                          ? "弹窗进入动效"
                          : kind === "dock"
                            ? "导航悬停位移"
                            : "呼吸光效与指针反馈"
                  }
                  checked={config.motion}
                  onChange={(v) => option("motion", v)}
                />
                {kind === "card" && (
                  <Range
                    label="动效速度"
                    value={config.speed}
                    max={100}
                    suffix="%"
                    disabled={!config.motion}
                    onChange={(v) => option("speed", v)}
                  />
                )}
                {kind === "card" && (
                  <Switch
                    label="组件辅助网格"
                    description={
                      kind === "card"
                        ? "空间卡片内的刻度网格"
                        : "用于空间卡片预设"
                    }
                    checked={config.grid}
                    onChange={(v) => option("grid", v)}
                  />
                )}
              </div>
            )}
            <div className="config-ops">
              <button onClick={() => uploader.current?.click()}>
                <Upload size={12} /> 导入配置
              </button>
              <button
                onClick={() =>
                  save(
                    new Blob([files["prismdeck.config.json"]], {
                      type: "application/json",
                    }),
                    "prismdeck.config.json",
                  )
                }
              >
                <Download size={12} /> 保存配置
              </button>
            </div>
            <input
              ref={uploader}
              hidden
              type="file"
              accept=".json,application/json"
              onChange={(e) => void importConfig(e.target.files?.[0])}
            />
            <div className="inspector-note">
              <CheckCircle2 size={13} />
              <p>
                材质与已应用的图表配置自动保存在此浏览器。
                <br />
                导出组件无需运行时动画依赖。
              </p>
            </div>
          </div>
          <div className="inspector-bottom">
            <button className="primary" onClick={download}>
              <Download size={14} /> 导出 React 组件 <ArrowUpRight size={14} />
            </button>
            <button className="share-btn" onClick={share}>
              {copyState === "share" ? (
                <Check size={13} />
              ) : (
                <ExternalLink size={13} />
              )}{" "}
              {copyState === "share" ? "设计链接已复制" : "分享当前设计"}
            </button>
          </div>
        </aside>
      </div>
      <footer className="statusbar">
        <span>
          <i /> 本地工作台 · 无需登录
        </span>
        <span className="status-center">
          DESIGN THE FEELING. TAKE THE CODE.
        </span>
        <span>
          PRISMDECK © 2026 <span className="status-plus">+</span>
        </span>
      </footer>
      {(codeOpen || guideOpen) && (
        <dialog
          ref={dialog}
          className="modal"
          aria-labelledby="prism-modal-title"
          onCancel={(e) => {
            e.preventDefault();
            close();
          }}
        >
          <div className="modal-head">
            <div>
              <span className="section-label">
                {guideOpen ? "QUICK START" : "READY FOR YOUR PROJECT"}
              </span>
              <h2 id="prism-modal-title">
                {guideOpen ? "把未来感，带进你的项目。" : "代码是你的。"}
              </h2>
            </div>
            <button className="icon-btn" aria-label="关闭弹窗" onClick={close}>
              <X size={19} />
            </button>
          </div>
          {guideOpen ? (
            <div className="guide">
              <p>
                在线调校后，导出 ZIP，将文件放入现有 React + TypeScript
                项目。组件仅依赖 React，CSS 独立引入。
              </p>
              <h3>方式一 / 安装 npm 组件</h3>
              <pre>npm install @batype/prismdeck</pre>
              <pre>{`import { SpatialCard } from '@batype/prismdeck';\nimport '@batype/prismdeck/style.css';\n\n<SpatialCard\n  config={{ accent: '${config.accent}' }}\n  onAction={() => console.log('connect')}\n/>`}</pre>
              <h3>方式二 / 带走源码</h3>
              <p>
                下载 ZIP 后保留 components 与 core 的目录关系，App.tsx
                为接入示例。导出包包含全部 15
                个组件，使用示例选中当前组件；组件样式使用 pd- 前缀。
              </p>
              <h3>Next.js / SSR</h3>
              <p>
                Next.js 客户端使用 @batype/prismdeck/next；Vite 等 React
                项目使用默认入口。导出的交互 App
                需要客户端边界。无浏览器全局变量在导入时运行，静态初始内容可服务端渲染。
              </p>
              <h3>通用组件</h3>
              <p>
                PrismButton、PrismInput、PrismSwitch、PrismTabs、PrismBadge、PrismDialog
                支持相同主题；原生表单属性、加载反馈、键盘标签页与模态交互可直接接入业务。选择组件后查看对应代码示例。
              </p>
              <h3>图形数据组件</h3>
              <p>
                趋势图、柱状图、环形图、仪表盘、热力图与雷达图，原生
                SVG，无图表运行时依赖。传入 data（label / value）、title 与可选
                onSelect 即可使用。仪表盘使用 value / min /
                max；悬停或聚焦查看数值。
              </p>
              <h3>可访问性</h3>
              <p>
                支持键盘操作与系统减少动态效果设置。旋钮同时提供标准 range
                输入。真实业务操作通过回调接入，预览中的连接状态是本地演示。
              </p>
              <a
                href="https://github.com/batype/prismdeck"
                target="_blank"
                rel="noreferrer"
              >
                完整说明与源码 <ArrowUpRight size={13} />
              </a>
            </div>
          ) : (
            <>
              <div className="code-tabs" role="tablist" aria-label="导出文件">
                {[
                  ["App.tsx", "React"],
                  ["components/prism.css", "CSS"],
                  ["prismdeck.config.json", "配置 JSON"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={codeTab === id}
                    onClick={() => setCodeTab(id)}
                  >
                    {label}
                  </button>
                ))}
                <button
                  className="copy-code"
                  onClick={() => copy(files[codeTab], "code")}
                >
                  {copyState === "code" ? (
                    <Check size={13} />
                  ) : (
                    <Copy size={13} />
                  )}{" "}
                  {copyState === "code" ? "已复制" : "复制"}
                </button>
              </div>
              <pre className="code-preview" tabIndex={0}>
                {files[codeTab]}
              </pre>
              <div className="modal-foot">
                <span>ZIP 含当前示例、15 个组件源码、CSS 与说明。</span>
                <button className="primary" onClick={download}>
                  <Download size={14} /> 下载源码 ZIP
                </button>
              </div>
            </>
          )}
        </dialog>
      )}
      {notice && (
        <div className="notice" role="status">
          <CheckCircle2 size={15} />
          <span>{notice}</span>
          <button aria-label="关闭提示" onClick={() => setNotice("")}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
function Range({
  label,
  value,
  max,
  suffix,
  onChange,
  disabled = false,
}: {
  label: string;
  value: number;
  max: number;
  suffix: string;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`range-field ${disabled ? "disabled" : ""}`}>
      <span>
        {label}
        <output>
          {value}
          <small>{suffix}</small>
        </output>
      </span>
      <input
        type="range"
        min="0"
        max={max}
        step="1"
        disabled={disabled}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
function Switch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="switch-field">
      <span>
        <b>{label}</b>
        <small>{description}</small>
      </span>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
      >
        <i />
      </button>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
