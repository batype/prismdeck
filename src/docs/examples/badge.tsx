import { PrismBadge } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function BadgeExample() {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <PrismBadge tone="neutral">未开始</PrismBadge>
      <PrismBadge tone="success">运行正常</PrismBadge>
      <PrismBadge tone="warning">需要注意</PrismBadge>
      <PrismBadge tone="danger" dot={false}>
        连接失败
      </PrismBadge>
    </div>
  );
}
