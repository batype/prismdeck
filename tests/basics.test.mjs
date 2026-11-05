import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  PrismButton,
  PrismInput,
  PrismSwitch,
  PrismTabs,
  PrismBadge,
  PrismDialog,
} from "../lib/components/Prism.js";
import {
  COMPONENT_KINDS,
  DEFAULT_CONFIG,
  readShare,
} from "../lib/core/config.js";
const render = (C, props) => renderToString(React.createElement(C, props));
test("loading buttons prevent activation and retain native button semantics", () => {
  const html = render(PrismButton, { loading: true, children: "保存" });
  assert.match(html, /type="button"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /保存/);
  assert.match(
    render(PrismButton, {
      type: "submit",
      variant: "outline",
      children: "提交",
    }),
    /type="submit"/,
  );
});
test("text inputs connect labels, hints, external descriptions and errors", () => {
  const html = render(PrismInput, {
    label: "邮箱",
    id: "email",
    name: "email",
    description: "工作邮箱",
    error: "格式错误",
    "aria-describedby": "external",
    value: "bad",
    onChange: () => {},
  });
  assert.match(html, /for="email"/);
  assert.match(html, /name="email"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-describedby="external email-help email-error"/);
  assert.match(html, /id="email-error"/);
  const pair = renderToString(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(PrismInput, { label: "一个" }),
      React.createElement(PrismInput, { label: "两个" }),
    ),
  );
  const ids = [...pair.matchAll(/<input[^>]*id="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, 2);
});
test("switches use a labeled native checkbox for forms, read-only and disabled states", () => {
  const html = render(PrismSwitch, {
    label: "通知",
    checked: true,
    onCheckedChange: () => {},
    name: "notify",
    value: "yes",
    description: "接收更新",
  });
  assert.match(html, /role="switch"/);
  assert.match(html, /checked=""/);
  assert.match(html, /name="notify"/);
  assert.match(html, /value="yes"/);
  assert.ok(!html.includes('disabled=""'));
  assert.match(
    render(PrismSwitch, { label: "锁定", checked: false }),
    /disabled=""/,
  );
});
test("tabs expose linked panels, one tab stop, and preserve hidden content", () => {
  const html = render(PrismTabs, {
    value: "a",
    onValueChange: () => {},
    items: [
      { value: "a", label: "甲", content: "面板一" },
      { value: "b", label: "乙", content: "面板二" },
      { value: "c", label: "禁用", content: "面板三", disabled: true },
    ],
  });
  assert.equal((html.match(/role="tab"/g) || []).length, 3);
  assert.equal((html.match(/role="tabpanel"/g) || []).length, 3);
  assert.equal((html.match(/aria-selected="true"/g) || []).length, 1);
  assert.match(html, /hidden=""/);
  assert.match(html, /面板二/);
  assert.match(html, /aria-controls="/);
});
test("badges support four semantic tones and safely escape content", () => {
  for (const tone of ["neutral", "success", "warning", "danger"]) {
    const html = render(PrismBadge, {
      tone,
      children: "<script>unsafe</script>",
    });
    assert.match(html, new RegExp("pd-badge-" + tone));
    assert.ok(!html.includes("<script>"));
  }
});
test("dialogs can render without browser globals and link their accessible name", () => {
  const html = render(PrismDialog, {
    open: true,
    onOpenChange: () => {},
    title: "创建项目",
    description: "填写项目名",
    children: "正文",
  });
  assert.match(html, /<dialog/);
  assert.match(html, /aria-labelledby="/);
  assert.match(html, /aria-describedby="/);
  assert.match(html, /aria-label="关闭弹窗"/);
  assert.ok(!/<dialog[^>]* open(?:\s|=|>)/.test(html));
});
test("all nine component kinds round-trip shared configuration without breaking old links", () => {
  assert.equal(COMPONENT_KINDS.length, 9);
  for (const kind of COMPONENT_KINDS) {
    const q = new URLSearchParams({
      design: JSON.stringify({ kind, config: DEFAULT_CONFIG }),
    });
    assert.equal(readShare("?" + q).kind, kind);
  }
});
