import { useState } from "react";
import { PrismTabs, PrismInput } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function TabsExample() {
  const [tab, setTab] = useState("overview");
  return (
    <PrismTabs
      label="项目视图"
      value={tab}
      onValueChange={setTab}
      items={[
        { value: "overview", label: "概览", content: "项目运行正常。" },
        { value: "team", label: "团队", content: "团队视图", disabled: true },
        {
          value: "settings",
          label: "设置",
          content: <PrismInput label="显示名称" defaultValue="My project" />,
        },
      ]}
    />
  );
}
