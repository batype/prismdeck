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
