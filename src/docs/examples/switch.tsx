import { useState } from "react";
import { PrismSwitch } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function SwitchExample() {
  const [enabled, setEnabled] = useState(true);
  return (
    <PrismSwitch
      label="接收项目通知"
      description="支持点击标签和 Space 键切换。"
      name="notifications"
      value="yes"
      checked={enabled}
      onCheckedChange={setEnabled}
    />
  );
}
