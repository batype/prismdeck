import { useEffect, useRef, useState } from "react";
import {
  PrismButton,
  PrismInput,
  PrismSwitch,
  PrismTabs,
  PrismBadge,
  PrismDialog,
} from "../components/Prism";
import { themed } from "../components/theme";
import type { ComponentKind, PrismConfig } from "../core/config";
export function BasicsPreview({
  kind,
  config: input,
}: {
  kind: ComponentKind;
  config: PrismConfig;
}) {
  const { config, style } = themed(input),
    [count, setCount] = useState(0),
    [loading, setLoading] = useState(false),
    [email, setEmail] = useState(""),
    [submitted, setSubmitted] = useState(false),
    [notifications, setNotifications] = useState(true),
    [sync, setSync] = useState(false),
    [tab, setTab] = useState("overview"),
    [tone, setTone] = useState(0),
    [open, setOpen] = useState(false),
    [project, setProject] = useState("Untitled project"),
    [saved, setSaved] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const statuses = [
    { tone: "neutral" as const, text: "未开始" },
    { tone: "success" as const, text: "运行正常" },
    { tone: "warning" as const, text: "需要注意" },
    { tone: "danger" as const, text: "连接异常" },
  ];
  return (
    <section
      className="pd-root basics-demo"
      data-surface={config.surface}
      data-motion={config.motion ? "on" : "off"}
      style={style}
    >
      <div className="basics-demo-head">
        <span>{config.label}</span>
        <span>PRIMITIVES / 1.1</span>
      </div>
      {kind === "button" ? (
        <>
          <h2>每个动作，都有回应。</h2>
          <p className="basics-intro">三种层级 · 加载反馈 · 原生按钮属性</p>
          <div className="basics-stack">
            <PrismButton
              config={config}
              loading={loading}
              onClick={() => {
                setLoading(true);
                timer.current = setTimeout(() => {
                  setLoading(false);
                  setCount((v) => v + 1);
                }, 800);
              }}
            >
              {loading ? "处理中…" : "执行操作"}{" "}
              <span aria-hidden="true">↗</span>
            </PrismButton>
            <div className="basics-inline">
              <PrismButton
                config={config}
                variant="outline"
                onClick={() => setCount((v) => v + 1)}
              >
                次要操作
              </PrismButton>
              <PrismButton
                config={config}
                variant="ghost"
                onClick={() => setCount(0)}
              >
                重置次数
              </PrismButton>
            </div>
            <PrismButton config={config} disabled>
              不可用状态
            </PrismButton>
          </div>
          <p className="basics-result" aria-live="polite">
            已触发 {count} 次操作 · 本地演示
          </p>
        </>
      ) : kind === "input" ? (
        <>
          <h2>输入更清晰。</h2>
          <p className="basics-intro">标签、辅助说明与错误状态，放在一起。</p>
          <form
            className="basics-stack"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <PrismInput
              config={config}
              label="电子邮箱"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSubmitted(false);
              }}
              required
              description="填写邮箱后体验表单校验，不会发送请求。"
              error={
                email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                  ? "请输入有效的邮箱地址"
                  : undefined
              }
            />
            <PrismInput
              config={config}
              label="工作区 ID"
              defaultValue="workspace_001"
              disabled
            />
            <PrismButton config={config} type="submit">
              确认输入
            </PrismButton>
          </form>
          <p className="basics-result" aria-live="polite">
            {submitted ? "已确认：" + email : "输入内容会实时反映到组件状态。"}
          </p>
        </>
      ) : kind === "switch" ? (
        <>
          <h2>偏好，由你掌控。</h2>
          <p className="basics-intro">受控开关 · 键盘操作 · 原生表单值</p>
          <div className="basics-stack">
            <PrismSwitch
              config={config}
              label="消息通知"
              description="开启后接收项目更新提醒"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
            <div className="basics-rule" />
            <PrismSwitch
              config={config}
              label="自动同步"
              description="当前仅切换本地演示状态"
              checked={sync}
              onCheckedChange={setSync}
            />
            <div className="basics-rule" />
            <PrismSwitch
              config={config}
              label="团队策略"
              description="由管理员管理，不可修改"
              checked={false}
              disabled
            />
          </div>
          <p className="basics-result" aria-live="polite">
            消息通知：{notifications ? "已开启" : "已关闭"} · 自动同步：
            {sync ? "已开启" : "已关闭"}
          </p>
        </>
      ) : kind === "tabs" ? (
        <>
          <h2>内容，各就其位。</h2>
          <p className="basics-intro">方向键切换 · 跳过禁用项 · 保留面板状态</p>
          <PrismTabs
            config={config}
            label="项目视图"
            value={tab}
            onValueChange={setTab}
            items={[
              {
                value: "overview",
                label: "概览",
                content: (
                  <div className="basics-tab-content">
                    <PrismBadge config={config} tone="success">
                      运行正常
                    </PrismBadge>
                    <h3>项目概览</h3>
                    <p>{config.caption}</p>
                  </div>
                ),
              },
              {
                value: "activity",
                label: "动态",
                content: (
                  <div className="basics-tab-content">
                    <h3>操作记录</h3>
                    <p>创建项目 → 调整配置 → 保存设计</p>
                  </div>
                ),
              },
              {
                value: "team",
                label: "团队",
                disabled: true,
                content: "团队设置",
              },
              {
                value: "settings",
                label: "设置",
                content: (
                  <PrismInput
                    config={config}
                    label="显示名称"
                    defaultValue="My project"
                  />
                ),
              },
            ]}
          />
          <p className="basics-result">试试 ← / →、Home、End 和 Tab 键。</p>
        </>
      ) : kind === "badge" ? (
        <>
          <h2>状态，一眼可读。</h2>
          <p className="basics-intro">四种语义色 · 文本与圆点双重表达</p>
          <div className="basics-badges">
            {statuses.map((s) => (
              <PrismBadge key={s.tone} config={config} tone={s.tone}>
                {s.text}
              </PrismBadge>
            ))}
          </div>
          <div className="basics-status-card">
            <span>当前状态</span>
            <div aria-live="polite">
              <PrismBadge config={config} tone={statuses[tone].tone}>
                {statuses[tone].text}
              </PrismBadge>
            </div>
          </div>
          <PrismButton
            config={config}
            variant="outline"
            onClick={() => setTone((v) => (v + 1) % 4)}
          >
            切换演示状态
          </PrismButton>
        </>
      ) : (
        <>
          <h2>让重要操作，被看见。</h2>
          <p className="basics-intro">原生模态窗口 · Escape 关闭 · 焦点恢复</p>
          <div className="basics-dialog-illustration" aria-hidden="true">
            <i />
            <span />
            <span />
          </div>
          <PrismButton config={config} onClick={() => setOpen(true)}>
            打开创建项目窗口 <span aria-hidden="true">↗</span>
          </PrismButton>
          <p className="basics-result" aria-live="polite">
            {saved
              ? "已在本地演示中创建：" + saved
              : "弹窗会阻止操作背景，关闭后返回触发按钮。"}
          </p>
          <PrismDialog
            config={config}
            open={open}
            onOpenChange={setOpen}
            title="创建新项目"
            description="填写名称以体验完整交互，不会创建远程资源。"
            footer={
              <>
                <PrismButton
                  config={config}
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  取消
                </PrismButton>
                <PrismButton
                  config={config}
                  disabled={!project.trim()}
                  onClick={() => {
                    setSaved(project.trim());
                    setOpen(false);
                  }}
                >
                  创建项目
                </PrismButton>
              </>
            }
          >
            <PrismInput
              config={config}
              label="项目名称"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              maxLength={60}
              required
            />
          </PrismDialog>
        </>
      )}
      <div className="basics-demo-foot">
        <span />
        <span>REACT + CSS / INTERACTIVE</span>
      </div>
    </section>
  );
}
