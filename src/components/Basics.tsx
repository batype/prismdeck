import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { themed, type ThemeProps } from "./theme.js";

export type PrismButtonProps = ThemeProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "solid" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
  };
export const PrismButton = forwardRef<HTMLButtonElement, PrismButtonProps>(
  function PrismButton(
    {
      config: input,
      className = "",
      variant = "solid",
      size = "md",
      loading = false,
      disabled,
      type = "button",
      children,
      style,
      ...props
    },
    ref,
  ) {
    const { config, style: vars } = themed(input);
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={`pd-root pd-button pd-button-${variant} pd-size-${size} ${className}`}
        data-surface={config.surface}
        data-motion={config.motion ? "on" : "off"}
        style={{ ...vars, ...style }}
      >
        {loading && <span className="pd-spinner" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);

export type PrismInputProps = ThemeProps &
  InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    description?: string;
    error?: string;
  };
export const PrismInput = forwardRef<HTMLInputElement, PrismInputProps>(
  function PrismInput(
    {
      config: input,
      className = "",
      label,
      description,
      error,
      id,
      style,
      "aria-describedby": describedBy,
      "aria-invalid": invalid,
      ...props
    },
    ref,
  ) {
    const generated = useId(),
      fieldId = id || generated,
      { config, style: vars } = themed(input);
    const helpId = fieldId + "-help",
      errorId = fieldId + "-error";
    const descriptions =
      [describedBy, description ? helpId : "", error ? errorId : ""]
        .filter(Boolean)
        .join(" ") || undefined;
    return (
      <div
        className={`pd-root pd-field ${className}`}
        data-surface={config.surface}
        data-motion={config.motion ? "on" : "off"}
        style={{ ...vars, ...style }}
      >
        <label className="pd-field-label" htmlFor={fieldId}>
          {label}
          {props.required && <span aria-hidden="true"> *</span>}
        </label>
        <input
          {...props}
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : invalid}
          aria-describedby={descriptions}
          className="pd-input"
        />
        {description && (
          <p id={helpId} className="pd-field-help">
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} className="pd-field-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

export type PrismSwitchProps = ThemeProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "checked" | "defaultChecked" | "onChange" | "children"
  > & {
    checked: boolean;
    onCheckedChange?: (checked: boolean) => void;
    label: string;
    description?: string;
  };
export const PrismSwitch = forwardRef<HTMLInputElement, PrismSwitchProps>(
  function PrismSwitch(
    {
      config: input,
      className = "",
      checked,
      onCheckedChange,
      label,
      description,
      id,
      disabled,
      style,
      "aria-describedby": describedBy,
      ...props
    },
    ref,
  ) {
    const generated = useId(),
      fieldId = id || generated,
      { config, style: vars } = themed(input);
    return (
      <div
        className={`pd-root pd-switch-row ${className}`}
        data-surface={config.surface}
        data-motion={config.motion ? "on" : "off"}
        style={{ ...vars, ...style }}
      >
        <div>
          <label className="pd-field-label" htmlFor={fieldId}>
            {label}
          </label>
          {description && (
            <p id={fieldId + "-help"} className="pd-field-help">
              {description}
            </p>
          )}
        </div>
        <span className="pd-switch-control">
          <input
            {...props}
            ref={ref}
            id={fieldId}
            type="checkbox"
            role="switch"
            checked={checked}
            disabled={disabled || !onCheckedChange}
            aria-describedby={
              [describedBy, description ? fieldId + "-help" : ""]
                .filter(Boolean)
                .join(" ") || undefined
            }
            onChange={(e) => onCheckedChange?.(e.target.checked)}
          />
          <span className="pd-switch-track" aria-hidden="true">
            <i />
          </span>
        </span>
      </div>
    );
  },
);

export interface PrismTabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}
export interface PrismTabsProps extends ThemeProps {
  items: PrismTabItem[];
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
}
export function PrismTabs({
  config: input,
  className = "",
  items,
  value,
  onValueChange,
  label = "选项卡",
}: PrismTabsProps) {
  const { config, style } = themed(input),
    id = useId(),
    refs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = items.findIndex(
    (item) => item.value === value && !item.disabled,
  );
  const first = items.findIndex((item) => !item.disabled);
  return (
    <div
      className={`pd-root pd-tabs ${className}`}
      data-surface={config.surface}
      data-motion={config.motion ? "on" : "off"}
      style={style}
    >
      <div className="pd-tab-list" role="tablist" aria-label={label}>
        {items.map((item, index) => (
          <button
            type="button"
            key={item.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            role="tab"
            id={`${id}-tab-${index}`}
            aria-selected={active === index}
            aria-controls={`${id}-panel-${index}`}
            disabled={item.disabled}
            tabIndex={index === (active >= 0 ? active : first) ? 0 : -1}
            onClick={() => onValueChange(item.value)}
            onKeyDown={(e) => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key))
                return;
              e.preventDefault();
              const enabled = items
                .map((v, i) => (v.disabled ? -1 : i))
                .filter((i) => i >= 0);
              if (!enabled.length) return;
              const pos = enabled.indexOf(index);
              const target =
                e.key === "Home"
                  ? enabled[0]
                  : e.key === "End"
                    ? enabled[enabled.length - 1]
                    : enabled[
                        (pos +
                          (e.key === "ArrowRight" ? 1 : -1) +
                          enabled.length) %
                          enabled.length
                      ];
              onValueChange(items[target].value);
              refs.current[target]?.focus();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={item.value}
          id={`${id}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${index}`}
          hidden={active !== index}
          tabIndex={0}
          className="pd-tab-panel"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

export type PrismBadgeProps = ThemeProps &
  HTMLAttributes<HTMLSpanElement> & {
    tone?: "neutral" | "success" | "warning" | "danger";
    dot?: boolean;
  };
export function PrismBadge({
  config: input,
  className = "",
  tone = "neutral",
  dot = true,
  children,
  style,
  ...props
}: PrismBadgeProps) {
  const { config, style: vars } = themed(input);
  return (
    <span
      {...props}
      className={`pd-root pd-badge pd-badge-${tone} ${className}`}
      data-surface={config.surface}
      data-motion={config.motion ? "on" : "off"}
      style={{ ...vars, ...style }}
    >
      {dot && <i aria-hidden="true" />}
      {children}
    </span>
  );
}

export interface PrismDialogProps extends ThemeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  closeOnBackdrop?: boolean;
  closeLabel?: string;
}
export function PrismDialog({
  config: input,
  className = "",
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  closeOnBackdrop = true,
  closeLabel = "关闭弹窗",
}: PrismDialogProps) {
  const { config, style } = themed(input),
    ref = useRef<HTMLDialogElement>(null),
    id = useId();
  useEffect(() => {
    const element = ref.current;
    if (!element || !open) return;
    const previous = document.activeElement as HTMLElement | null;
    if (!element.open) element.showModal();
    return () => {
      if (element.open) element.close();
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`pd-root pd-dialog ${className}`}
      data-surface={config.surface}
      data-motion={config.motion ? "on" : "off"}
      style={style}
      aria-labelledby={id + "-title"}
      aria-describedby={description ? id + "-description" : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onOpenChange(false);
      }}
      onClose={() => {
        if (open && ref.current && !ref.current.open) onOpenChange(false);
      }}
      onClick={(e) => {
        if (!closeOnBackdrop || e.target !== e.currentTarget) return;
        const r = e.currentTarget.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          onOpenChange(false);
      }}
    >
      <div className="pd-dialog-head">
        <div>
          <h2 id={id + "-title"}>{title}</h2>
          {description && <p id={id + "-description"}>{description}</p>}
        </div>
        <button
          type="button"
          className="pd-dialog-close"
          aria-label={closeLabel}
          onClick={() => onOpenChange(false)}
        >
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="m5 5 10 10M15 5 5 15" />
          </svg>
        </button>
      </div>
      <div className="pd-dialog-body">{children}</div>
      {footer && <div className="pd-dialog-footer">{footer}</div>}
    </dialog>
  );
}
