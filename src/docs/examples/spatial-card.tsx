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
