import { type CSSProperties, type ReactNode } from "react";
import { DEFAULT_CONFIG, type PrismConfig } from "../core/config.js";
export interface ThemeProps {
  config?: Partial<PrismConfig>;
  className?: string;
}
export function themed(config: Partial<PrismConfig> = {}): {
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
export function Surface({
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
