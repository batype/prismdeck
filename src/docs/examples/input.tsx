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
