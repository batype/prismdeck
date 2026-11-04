import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  DEFAULT_CONFIG,
  clampValue,
  pointerValue,
  type PrismConfig,
} from "../core/config.js";
export type { PrismConfig } from "../core/config.js";
interface ThemeProps {
  config?: Partial<PrismConfig>;
  className?: string;
}
function themed(config: Partial<PrismConfig> = {}): {
  config: PrismConfig;
  style: CSSProperties;
} {
  const c = { ...DEFAULT_CONFIG, ...config };
  return {
    config: c,
    style: {
      "--pd-seed": c.accent,
      "--pd-radius": `${c.radius}px`,
      "--pd-glow": c.glow / 100,
      "--pd-duration": `${22 - c.speed * 0.17}s`,
    } as CSSProperties,
  };
}
function Surface({
  config,
  children,
  className = "",
  style = {},
}: {
  config: PrismConfig;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`pd-root ${className}`}
      data-surface={config.surface}
      data-motion={config.motion ? "on" : "off"}
      style={style}
    >
      {children}
    </div>
  );
}
export function SpatialCard({
  config: input,
  className,
  onAction,
  actionLabel = "建立连接",
}: ThemeProps & { onAction?: () => void; actionLabel?: string }) {
  const { config, style } = themed(input),
    card = useRef<HTMLElement>(null);
  function move(e: React.PointerEvent) {
    if (
      !config.motion ||
      e.pointerType === "touch" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width,
      y = (e.clientY - r.top) / r.height;
    card.current?.style.setProperty("--pd-rx", `${(0.5 - y) * 8}deg`);
    card.current?.style.setProperty("--pd-ry", `${(x - 0.5) * 10}deg`);
    card.current?.style.setProperty("--pd-px", `${x * 100}%`);
    card.current?.style.setProperty("--pd-py", `${y * 100}%`);
  }
  function reset() {
    card.current?.style.setProperty("--pd-rx", "0deg");
    card.current?.style.setProperty("--pd-ry", "0deg");
  }
  return (
    <Surface
      config={config}
      style={style}
      className={`pd-card-wrap ${className || ""}`}
    >
      <article
        ref={card}
        className="pd-card"
        onPointerMove={move}
        onPointerLeave={reset}
      >
        <div className="pd-card-glint" aria-hidden="true" />
        <div className="pd-card-head">
          <span className="pd-micro">{config.label}</span>
          <span className="pd-chip">
            <i /> READY
          </span>
        </div>
        <div
          className={`pd-orbit ${config.grid ? "pd-orbit-grid" : ""}`}
          aria-hidden="true"
        >
          <div className="pd-orbit-axis" />
          <div className="pd-orbit-ring pd-ring-one" />
          <div className="pd-orbit-ring pd-ring-two" />
          <div className="pd-core">
            <div className="pd-core-inner" />
          </div>
          <span className="pd-orbit-coordinate">X 043 · Y 128</span>
          <span className="pd-orbit-marker">+</span>
        </div>
        <div className="pd-card-copy">
          <span className="pd-overline">SPATIAL INTERFACE / 001</span>
          <h2>
            Beyond the
            <br />
            <em>ordinary.</em>
          </h2>
          <p>{config.caption}</p>
        </div>
        <div className="pd-card-bottom">
          <span className="pd-bars" aria-hidden="true">
            {Array.from({ length: 17 }, (_, i) => (
              <i
                key={i}
                style={{
                  height: `${5 + Math.sin(i * 1.8) * 4 + (i % 3) * 3}px`,
                }}
              />
            ))}
          </span>
          <button
            type="button"
            className="pd-connect"
            onClick={onAction}
            disabled={!onAction}
          >
            {actionLabel}
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </article>
    </Surface>
  );
}
export function OrbitDial({
  config: input,
  className,
  value = 64,
  onChange,
  label = "能量输出",
  disabled = false,
}: ThemeProps & {
  value?: number;
  onChange?: (value: number) => void;
  label?: string;
  disabled?: boolean;
}) {
  const { config, style } = themed(input),
    [dragging, setDragging] = useState(false);
  const v = clampValue(value);
  const editable = !!onChange && !disabled;
  function change(e: React.PointerEvent) {
    const r = e.currentTarget.getBoundingClientRect();
    onChange?.(
      Math.round(
        pointerValue(
          e.clientX,
          e.clientY,
          r.left + r.width / 2,
          r.top + r.height / 2,
        ),
      ),
    );
  }
  return (
    <Surface
      config={config}
      style={style}
      className={`pd-dial-panel ${className || ""}`}
    >
      <div className="pd-module-head">
        <span>{config.label}</span>
        <span className="pd-micro">CONTROL / 02</span>
      </div>
      <div className="pd-dial-zone">
        <div
          className="pd-dial"
          onPointerDown={(e) => {
            if (!editable) return;
            setDragging(true);
            e.currentTarget.setPointerCapture(e.pointerId);
            change(e);
          }}
          onPointerMove={(e) => {
            if (dragging && editable) change(e);
          }}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          style={
            {
              "--pd-turn": `${-135 + v * 2.7}deg`,
              "--pd-progress": `${v * 0.75}%`,
            } as CSSProperties
          }
        >
          <svg
            className="pd-dial-ticks"
            viewBox="0 0 240 240"
            aria-hidden="true"
          >
            {Array.from({ length: 41 }, (_, i) => {
              const a = ((135 + i * 6.75) * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={120 + 109 * Math.cos(a)}
                  y1={120 + 109 * Math.sin(a)}
                  x2={120 + (i % 5 === 0 ? 99 : 104) * Math.cos(a)}
                  y2={120 + (i % 5 === 0 ? 99 : 104) * Math.sin(a)}
                  className={(i / 40) * 100 <= v ? "pd-tick-on" : ""}
                />
              );
            })}
          </svg>
          <div className="pd-dial-track" />
          <div className="pd-dial-knob">
            <span className="pd-dial-pointer" />
            <span className="pd-dial-number">
              {Math.round(v)}
              <small>%</small>
            </span>
            <span className="pd-dial-label">{label}</span>
          </div>
          <span className="pd-dial-min">0</span>
          <span className="pd-dial-max">100</span>
        </div>
      </div>
      <label className="pd-range-label">
        <span>{label}</span>
        <input
          aria-label={label}
          type="range"
          min="0"
          max="100"
          step="1"
          value={v}
          disabled={!editable}
          onChange={(e) => onChange?.(Number(e.target.value))}
        />
      </label>
      <div className="pd-dial-footer">
        <i />
        <span>PRECISION CONTROL</span>
        <b>{disabled ? "LOCKED" : onChange ? "ACTIVE" : "READ ONLY"}</b>
      </div>
    </Surface>
  );
}
const dockIcons: Record<string, ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 10 6-10 6L2 9z" />
      <path d="m2 14 10 6 10-6" />
    </>
  ),
  signal: (
    <>
      <path d="M2 12h4l3-8 6 16 3-8h4" />
    </>
  ),
  settings: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="9" cy="6" r="2" />
      <circle cx="15" cy="12" r="2" />
      <circle cx="10" cy="18" r="2" />
    </>
  ),
};
export interface DockItem {
  id: string;
  label: string;
  icon?: ReactNode;
}
export const DEFAULT_DOCK_ITEMS: DockItem[] = [
  { id: "overview", label: "总览" },
  { id: "layers", label: "图层" },
  { id: "signal", label: "信号" },
  { id: "settings", label: "设置" },
];
export function CommandDock({
  config: input,
  className,
  items = DEFAULT_DOCK_ITEMS,
  value = "overview",
  onChange,
  label = "快捷导航",
}: ThemeProps & {
  items?: DockItem[];
  value?: string;
  onChange?: (id: string) => void;
  label?: string;
}) {
  const { config, style } = themed(input);
  return (
    <Surface
      config={config}
      style={style}
      className={`pd-dock-panel ${className || ""}`}
    >
      <nav className="pd-dock" aria-label={label}>
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-label={item.label}
            aria-current={value === item.id ? "page" : undefined}
            disabled={!onChange}
            onClick={() => onChange?.(item.id)}
            className={`pd-dock-item ${value === item.id ? "pd-dock-active" : ""}`}
          >
            <span className="pd-dock-tooltip">{item.label}</span>
            {item.icon || (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                {dockIcons[item.id] || <circle cx="12" cy="12" r="7" />}
              </svg>
            )}
            <i />
          </button>
        ))}
        <span className="pd-dock-separator" />
        <span className="pd-dock-system" title="界面已就绪">
          <i />
          <span>LIVE</span>
        </span>
      </nav>
    </Surface>
  );
}
