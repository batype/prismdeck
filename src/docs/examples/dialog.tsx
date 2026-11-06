import { useState } from "react";
import { PrismDialog, PrismButton, PrismInput } from "@batype/prismdeck";
import "@batype/prismdeck/style.css";

export default function DialogExample() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("My project");
  return (
    <>
      <PrismButton onClick={() => setOpen(true)}>打开项目设置</PrismButton>
      <PrismDialog
        open={open}
        onOpenChange={setOpen}
        title="项目设置"
        description="本地演示；关闭后会返回触发按钮。"
        closeOnBackdrop={false}
        footer={<PrismButton onClick={() => setOpen(false)}>完成</PrismButton>}
      >
        <PrismInput
          label="项目名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </PrismDialog>
    </>
  );
}
