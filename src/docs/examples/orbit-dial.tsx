import { useState } from "react";
import { OrbitDial } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function DialExample() {
  const [value, setValue] = useState(64);
  return (
    <OrbitDial
      label="能量输出"
      value={value}
      onChange={setValue}
      config={{ accent: "#c6a2ff" }}
    />
  );
}
