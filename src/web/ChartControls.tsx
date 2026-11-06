import { useEffect, useId, useState } from "react";
import {
  validateChartData,
  type ChartDesign,
  type ChartKind,
} from "../core/workspace";

export function ChartControls({
  kind,
  design,
  onChange,
}: {
  kind: ChartKind;
  design: ChartDesign;
  onChange: (change: Partial<ChartDesign>) => void;
}) {
  const [titleDraft, setTitleDraft] = useState(design.title);
  useEffect(() => setTitleDraft(design.title), [design.title]);
  const id = useId(),
    [draft, setDraft] = useState(() => JSON.stringify(design.data, null, 2)),
    [error, setError] = useState(""),
    [status, setStatus] = useState("");
  const [lower, setLower] = useState(String(design.min)),
    [upper, setUpper] = useState(String(design.max));
  useEffect(() => {
    setDraft(JSON.stringify(design.data, null, 2));
    setError("");
    setStatus(
      kind === "gauge" ? "" : `当前 ${design.data.length} 项数据已应用。`,
    );
  }, [design.data]);
  useEffect(() => {
    setLower(String(design.min));
    setUpper(String(design.max));
  }, [design.min, design.max]);
  function applyData() {
    try {
      const data = validateChartData(JSON.parse(draft));
      if (kind === "radar" && data.length > 0 && data.length < 3)
        throw new Error("雷达图需要至少 3 个维度，或使用空数组展示空状态");
      onChange({ data, empty: false });
      setError("");
      setStatus(`已应用 ${data.length} 项数据，预览与导出已同步。`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "数据无法解析");
      setStatus("");
    }
  }
  function applyRange() {
    const min = kind === "radar" ? 0 : Number(lower),
      max = Number(upper);
    if (
      (kind !== "radar" && !lower.trim()) ||
      !upper.trim() ||
      !Number.isFinite(min) ||
      !Number.isFinite(max) ||
      max <= min ||
      !Number.isFinite(max - min)
    ) {
      setError("请填写有效范围，最大值必须大于最小值");
      return;
    }
    onChange({ min, max, value: Math.max(min, Math.min(max, design.value)) });
    setError("");
    setStatus("数值范围已同步到预览与导出。");
  }
  return (
    <>
      <label className="field">
        图表标题
        <input
          maxLength={80}
          value={titleDraft}
          onChange={(e) => {
            setTitleDraft(e.target.value);
            if (e.target.value.trim()) onChange({ title: e.target.value });
          }}
          onBlur={() => {
            if (!titleDraft.trim()) setTitleDraft(design.title);
          }}
        />
      </label>
      <label className="field">
        图表说明
        <textarea
          maxLength={160}
          rows={2}
          value={design.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </label>
      <label className="field">
        数值单位
        <input
          maxLength={20}
          value={design.unit}
          placeholder="例如 %、次、ms"
          onChange={(e) => onChange({ unit: e.target.value })}
        />
      </label>
      {(kind === "gauge" || kind === "radar") && (
        <div className="chart-range-editor">
          {kind === "gauge" && (
            <label className="field">
              最小值
              <input
                type="number"
                step="any"
                value={lower}
                onChange={(e) => setLower(e.target.value)}
              />
            </label>
          )}
          <label className="field">
            最大值
            <input
              type="number"
              step="any"
              value={upper}
              onChange={(e) => setUpper(e.target.value)}
            />
          </label>
          <button className="inspector-apply" onClick={applyRange}>
            应用范围
          </button>
        </div>
      )}
      {kind === "heatmap" && (
        <label className="field">
          每列行数
          <select
            value={design.rows}
            onChange={(e) => onChange({ rows: Number(e.target.value) })}
          >
            {Array.from({ length: 14 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} 行
              </option>
            ))}
          </select>
        </label>
      )}
      {kind !== "gauge" && (
        <details className="chart-data-editor">
          <summary>
            编辑图表数据 <span>{design.data.length} 项</span>
          </summary>
          <p id={`${id}-help`}>
            输入 label / value 数组，点击应用后同步预览、配置和代码。最多 512
            项。
          </p>
          <label className="field">
            数据 JSON
            <textarea
              aria-describedby={`${id}-help`}
              value={draft}
              spellCheck={false}
              rows={9}
              onChange={(e) => {
                setDraft(e.target.value);
                setError("");
                setStatus("尚未应用，当前预览使用上次已应用的数据。");
              }}
            />
          </label>
          <button className="inspector-apply" onClick={applyData}>
            应用数据
          </button>
        </details>
      )}
      {error && (
        <p className="chart-control-error" role="alert">
          {error}
        </p>
      )}
      {status && (
        <p className="chart-control-status" role="status">
          {status}
        </p>
      )}
    </>
  );
}
