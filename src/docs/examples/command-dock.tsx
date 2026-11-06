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
