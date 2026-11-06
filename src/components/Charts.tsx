import { useId, useState, type ReactNode, type CSSProperties } from "react";
import { Surface, themed, type ThemeProps } from "./theme.js";

export interface PrismDataPoint {
  label: string;
  value: number;
}
export interface PrismChartProps extends ThemeProps {
  title: string;
  description?: string;
  data: readonly PrismDataPoint[];
  unit?: string;
  formatValue?: (value: number) => string;
  onSelect?: (point: PrismDataPoint, index: number) => void;
}
export interface PrismGaugeProps extends ThemeProps {
  title: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  description?: string;
  formatValue?: (value: number) => string;
}
export interface PrismHeatmapProps extends PrismChartProps {
  rows?: number;
}
export interface PrismRadarChartProps extends PrismChartProps {
  max?: number;
}
type Entry = { point: PrismDataPoint; index: number };
const finiteData = (data: readonly PrismDataPoint[]): Entry[] =>
  data.flatMap((point, index) =>
    Number.isFinite(point.value) ? [{ point, index }] : [],
  );
const plain = (v: number) => String(Number(v.toFixed(2)));
const tone = (i: number) => `var(--pd-chart-${i % 5})`;
function Frame({
  title,
  description,
  config: input,
  className,
  unit = "",
  formatValue = plain,
  onSelect,
  entries,
  children,
  legend = true,
}: Omit<PrismChartProps, "data"> & {
  entries: Entry[];
  legend?: boolean;
  children: (state: {
    active: number;
    inspect: (i: number) => void;
    select: (i: number) => void;
    id: string;
    format: (v: number) => string;
  }) => ReactNode;
}) {
  const { config, style } = themed(input),
    id = useId().replace(/:/g, ""),
    [selected, setSelected] = useState(0);
  const active = Math.min(selected, Math.max(0, entries.length - 1));
  const format = (v: number) => `${formatValue(v)}${unit ? ` ${unit}` : ""}`;
  const select = (i: number) => {
    setSelected(i);
    const e = entries[i];
    if (e) onSelect?.(e.point, e.index);
  };
  return (
    <Surface
      config={config}
      style={style}
      className={`pd-chart ${className || ""}`}
    >
      <figure aria-labelledby={`${id}-title`}>
        <header className="pd-chart-head">
          <div>
            <span className="pd-chart-eyebrow">PRISM / DATA SIGNAL</span>
            <h3 id={`${id}-title`}>{title}</h3>
            {description && <p>{description}</p>}
          </div>
          <i aria-hidden="true" />
        </header>
        {entries.length ? (
          <>
            {children({ active, inspect: setSelected, select, id, format })}
            <output className="pd-chart-readout" aria-live="polite">
              <span>{entries[active].point.label}</span>
              <strong>{format(entries[active].point.value)}</strong>
            </output>
            {legend && (
              <ul className="pd-chart-legend" aria-label={`${title} 数据`}>
                {entries.map(({ point, index }, i) => (
                  <li key={index}>
                    <button
                      type="button"
                      aria-pressed={active === i}
                      onFocus={() => setSelected(i)}
                      onMouseEnter={() => setSelected(i)}
                      onClick={() => select(i)}
                    >
                      <i
                        style={{
                          background: className?.includes("pd-donut-chart")
                            ? tone(i)
                            : "var(--pd-accent)",
                        }}
                        aria-hidden="true"
                      />
                      <span>{point.label}</span>
                      <b>{format(point.value)}</b>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="pd-chart-empty">暂无有效数据</p>
        )}
      </figure>
    </Surface>
  );
}
function Grid({
  min,
  max,
  format,
}: {
  min: number;
  max: number;
  format: (v: number) => string;
}) {
  return (
    <g className="pd-chart-grid">
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line x1="48" x2="468" y1={26 + i * 43} y2={26 + i * 43} />
          <text x="40" y={30 + i * 43} textAnchor="end">
            {format(max * (1 - i / 4) + min * (i / 4))}
          </text>
        </g>
      ))}
    </g>
  );
}
export function PrismAreaChart(props: PrismChartProps) {
  const entries = finiteData(props.data),
    values = entries.map((e) => e.point.value);
  // Divide before subtracting so even very large finite inputs retain finite SVG coordinates.
  const scale = Math.max(1, ...values.map(Math.abs));
  const lo = Math.min(0, ...values.map((v) => v / scale)),
    hi = Math.max(0, ...values.map((v) => v / scale));
  const span = hi - lo || 1,
    y = (v: number) => 198 - ((v / scale - lo) / span) * 172;
  const x = (i: number) =>
    entries.length === 1 ? 258 : 48 + (i / (entries.length - 1)) * 420;
  const path = entries
    .map((e, i) => `${i ? "L" : "M"}${x(i)},${y(e.point.value)}`)
    .join(" ");
  return (
    <Frame
      {...props}
      entries={entries}
      className={`pd-area-chart ${props.className || ""}`}
    >
      {({ active, inspect, select, id }) => (
        <svg viewBox="0 0 490 230" aria-hidden="true" className="pd-chart-svg">
          <defs>
            <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="var(--pd-accent)" stopOpacity=".32" />
              <stop offset="1" stopColor="var(--pd-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <Grid min={lo * scale} max={hi * scale} format={plain} />
          {entries.length > 1 && (
            <path
              d={`${path} L${x(entries.length - 1)},${y(0)} L${x(0)},${y(0)} Z`}
              fill={`url(#${id}-fill)`}
            />
          )}
          <path
            d={path}
            fill="none"
            stroke="var(--pd-accent)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {entries[active] && (
            <line
              x1={x(active)}
              x2={x(active)}
              y1="26"
              y2="198"
              className="pd-chart-crosshair"
            />
          )}
          {entries.map(({ point, index }, i) => (
            <g
              key={index}
              onMouseEnter={() => inspect(i)}
              onClick={() => select(i)}
              className="pd-chart-hit"
            >
              <circle
                cx={x(i)}
                cy={y(point.value)}
                r={i === active ? 5 : 3}
                fill="var(--pd-accent)"
              />
              <circle cx={x(i)} cy={y(point.value)} r="13" fill="transparent" />
              {(i === 0 || i === entries.length - 1) && (
                <text x={x(i)} y="221" textAnchor="middle">
                  {point.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      )}
    </Frame>
  );
}
export function PrismBarChart(props: PrismChartProps) {
  const entries = finiteData(props.data),
    values = entries.map((e) => e.point.value),
    scale = Math.max(1, ...values.map(Math.abs));
  const lo = Math.min(0, ...values.map((v) => v / scale)),
    hi = Math.max(0, ...values.map((v) => v / scale)),
    span = hi - lo || 1;
  const y = (v: number) => 198 - ((v / scale - lo) / span) * 172,
    step = 420 / Math.max(1, entries.length);
  return (
    <Frame
      {...props}
      entries={entries}
      className={`pd-bar-chart ${props.className || ""}`}
    >
      {({ active, inspect, select }) => (
        <svg viewBox="0 0 490 230" aria-hidden="true" className="pd-chart-svg">
          <Grid min={lo * scale} max={hi * scale} format={plain} />
          <line
            x1="48"
            x2="468"
            y1={y(0)}
            y2={y(0)}
            className="pd-chart-baseline"
          />
          {entries.map(({ point, index }, i) => (
            <g
              key={index}
              className="pd-chart-hit"
              onMouseEnter={() => inspect(i)}
              onClick={() => select(i)}
            >
              <rect
                x={48 + step * (i + 0.18)}
                y={Math.min(y(0), y(point.value))}
                width={step * 0.64}
                height={Math.max(1, Math.abs(y(0) - y(point.value)))}
                rx="3"
                fill="var(--pd-accent)"
                opacity={active === i ? 1 : 0.38}
              />
              <rect
                x={48 + step * i}
                y="26"
                width={step}
                height="172"
                fill="transparent"
              />
              {entries.length <= 8 && (
                <text x={48 + step * (i + 0.5)} y="221" textAnchor="middle">
                  {point.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      )}
    </Frame>
  );
}
export function PrismDonutChart(props: PrismChartProps) {
  const entries = finiteData(props.data).filter((e) => e.point.value > 0),
    scale = Math.max(1, ...entries.map((e) => e.point.value));
  const total = entries.reduce((n, e) => n + e.point.value / scale, 0);
  let offset = 0;
  const arcs = entries.map((e) => {
    const part = (e.point.value / scale / total) * 100,
      start = offset;
    offset += part;
    return { part, start };
  });
  return (
    <Frame
      {...props}
      entries={entries}
      className={`pd-donut-chart ${props.className || ""}`}
    >
      {({ active, inspect, select }) => (
        <svg
          viewBox="0 0 320 250"
          aria-hidden="true"
          className="pd-chart-svg pd-chart-round"
        >
          <circle
            cx="160"
            cy="120"
            r="84"
            fill="none"
            stroke="var(--pd-line)"
            strokeWidth="25"
          />
          {entries.map(({ point, index }, i) => {
            const { part, start } = arcs[i];
            return (
              <circle
                key={index}
                cx="160"
                cy="120"
                r="84"
                pathLength="100"
                fill="none"
                stroke={tone(i)}
                strokeWidth={active === i ? 31 : 25}
                strokeDasharray={`${part} ${100 - part}`}
                strokeDashoffset={-start}
                transform="rotate(-90 160 120)"
                className="pd-chart-hit"
                onMouseEnter={() => inspect(i)}
                onClick={() => select(i)}
              />
            );
          })}
          <text className="pd-chart-big" x="160" y="119" textAnchor="middle">
            {entries[active]
              ? `${plain((entries[active].point.value / scale / total) * 100)}%`
              : "0%"}
          </text>
          <text x="160" y="143" textAnchor="middle">
            占比 / SHARE
          </text>
        </svg>
      )}
    </Frame>
  );
}
export function PrismGauge({
  title,
  value,
  min = 0,
  max = 100,
  unit = "%",
  description,
  formatValue = plain,
  config: input,
  className,
}: PrismGaugeProps) {
  const { config, style } = themed(input),
    id = useId();
  const valid =
    Number.isFinite(value) &&
    Number.isFinite(min) &&
    Number.isFinite(max) &&
    max > min;
  const clamped = valid ? Math.max(min, Math.min(max, value)) : min;
  const scale = Math.max(1, Math.abs(min), Math.abs(max));
  const fraction = valid
    ? (clamped / scale - min / scale) / (max / scale - min / scale)
    : 0;
  return (
    <Surface
      config={config}
      style={style}
      className={`pd-chart pd-gauge ${className || ""}`}
    >
      <figure aria-labelledby={id}>
        <header className="pd-chart-head">
          <div>
            <span className="pd-chart-eyebrow">PRISM / SYSTEM METRIC</span>
            <h3 id={id}>{title}</h3>
            {description && <p>{description}</p>}
          </div>
          <i aria-hidden="true" />
        </header>
        {valid ? (
          <div
            role="meter"
            aria-labelledby={id}
            aria-valuenow={clamped}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuetext={`${formatValue(clamped)} ${unit}`}
          >
            <svg
              viewBox="0 0 320 230"
              className="pd-chart-svg pd-chart-round"
              aria-hidden="true"
            >
              <path
                d="M 65 190 A 110 110 0 1 1 255 190"
                pathLength="100"
                fill="none"
                stroke="var(--pd-line)"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d="M 65 190 A 110 110 0 1 1 255 190"
                pathLength="100"
                fill="none"
                stroke="var(--pd-accent)"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${fraction * 100} 100`}
                opacity={fraction > 0 ? 1 : 0}
                className="pd-gauge-arc"
              />
              <text
                x="160"
                y="134"
                className="pd-chart-big"
                textAnchor="middle"
              >
                {formatValue(clamped)}
              </text>
              <text x="160" y="158" textAnchor="middle">
                {unit}
              </text>
              <text x="53" y="220" textAnchor="middle">
                {formatValue(min)}
              </text>
              <text x="268" y="220" textAnchor="middle">
                {formatValue(max)}
              </text>
            </svg>
          </div>
        ) : (
          <p className="pd-chart-empty">无效数值或范围</p>
        )}
      </figure>
    </Surface>
  );
}
export function PrismHeatmap({ rows = 7, ...props }: PrismHeatmapProps) {
  const entries = finiteData(props.data),
    count = Number.isFinite(rows)
      ? Math.max(1, Math.min(14, Math.floor(rows)))
      : 7;
  const high = Math.max(1, ...entries.map((e) => Math.max(0, e.point.value)));
  return (
    <Frame
      {...props}
      entries={entries}
      legend={false}
      className={`pd-heatmap ${props.className || ""}`}
    >
      {({ active, inspect, select, format }) => (
        <>
          <div className="pd-heatmap-scroll">
            <div
              className="pd-heatmap-cells"
              role="group"
              aria-label={`${props.title} 数据，方向键浏览`}
              style={{ "--pd-heat-rows": count } as CSSProperties}
            >
              {entries.map(({ point, index }, i) => (
                <button
                  type="button"
                  key={index}
                  tabIndex={active === i ? 0 : -1}
                  aria-pressed={active === i}
                  aria-label={`${point.label}: ${format(point.value)}`}
                  title={`${point.label}: ${format(point.value)}`}
                  onFocus={() => inspect(i)}
                  onMouseEnter={() => inspect(i)}
                  onClick={() => select(i)}
                  onKeyDown={(e) => {
                    const moves: Record<string, number> = {
                      ArrowUp: -1,
                      ArrowDown: 1,
                      ArrowLeft: -count,
                      ArrowRight: count,
                    };
                    let next =
                      e.key === "Home"
                        ? 0
                        : e.key === "End"
                          ? entries.length - 1
                          : moves[e.key] !== undefined
                            ? i + moves[e.key]
                            : null;
                    if (next === null) return;
                    e.preventDefault();
                    next = Math.max(0, Math.min(entries.length - 1, next));
                    (
                      e.currentTarget.parentElement?.children[next] as
                        HTMLElement | undefined
                    )?.focus();
                  }}
                  style={
                    {
                      "--pd-heat-strength": Math.max(0, point.value) / high,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          </div>
          <div className="pd-heatmap-scale" aria-hidden="true">
            <span>少</span>
            {[0, 0.25, 0.5, 0.75, 1].map((n) => (
              <i key={n} style={{ "--pd-heat-strength": n } as CSSProperties} />
            ))}
            <span>多</span>
          </div>
        </>
      )}
    </Frame>
  );
}
export function PrismRadarChart({ max = 100, ...props }: PrismRadarChartProps) {
  const entries = finiteData(props.data),
    valid = Number.isFinite(max) && max > 0;
  const xy = (i: number, r: number) => {
    const a = -Math.PI / 2 + (i / entries.length) * Math.PI * 2;
    return [210 + Math.cos(a) * r, 145 + Math.sin(a) * r];
  };
  const polygon = (r: number) =>
    entries.map((_, i) => xy(i, r).join(",")).join(" ");
  return (
    <Frame
      {...props}
      entries={valid && entries.length >= 3 ? entries : []}
      className={`pd-radar-chart ${props.className || ""}`}
    >
      {({ active, inspect, select }) => (
        <svg viewBox="0 0 420 290" aria-hidden="true" className="pd-chart-svg">
          {[0.25, 0.5, 0.75, 1].map((n) => (
            <polygon
              key={n}
              points={polygon(n * 100)}
              className="pd-radar-grid"
            />
          ))}
          {entries.map(({ point, index }, i) => {
            const [x, y] = xy(i, 100),
              [tx, ty] = xy(i, 122);
            return (
              <g key={index}>
                <line
                  x1="210"
                  y1="145"
                  x2={x}
                  y2={y}
                  className="pd-chart-baseline"
                />
                <text
                  x={tx}
                  y={ty + 4}
                  textAnchor={tx < 208 ? "end" : tx > 212 ? "start" : "middle"}
                >
                  {point.label}
                </text>
              </g>
            );
          })}
          <polygon
            points={entries
              .map((e, i) =>
                xy(i, Math.max(0, Math.min(1, e.point.value / max)) * 100).join(
                  ",",
                ),
              )
              .join(" ")}
            fill="var(--pd-accent)"
            fillOpacity=".16"
            stroke="var(--pd-accent)"
            strokeWidth="2"
          />
          {entries.map(({ point, index }, i) => {
            const [x, y] = xy(
              i,
              Math.max(0, Math.min(1, point.value / max)) * 100,
            );
            return (
              <g
                key={index}
                className="pd-chart-hit"
                onMouseEnter={() => inspect(i)}
                onClick={() => select(i)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={active === i ? 5 : 3}
                  fill="var(--pd-accent)"
                />
                <circle cx={x} cy={y} r="13" fill="transparent" />
              </g>
            );
          })}
        </svg>
      )}
    </Frame>
  );
}
