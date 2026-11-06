import { DOC_PAGES, DOC_VERSION } from "./content";
import { exampleSource } from "./examples";
const cell = (value: string) =>
  value
    .replace(/\|/g, "\\|")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, " ");
export function buildMarkdown() {
  const output = [
    "# PrismDeck 详细接入文档",
    `适用 npm 版本：${DOC_VERSION}。`,
    "[在线文档](https://batype.github.io/prismdeck/docs/) · [组件工作台](https://batype.github.io/prismdeck/) · [GitHub](https://github.com/batype/prismdeck)",
    "## 目录",
    DOC_PAGES.map((page) => `- [${page.title}](#${page.id})`).join("\n"),
  ];
  for (const page of DOC_PAGES) {
    output.push(`<a id="${page.id}"></a>`, `## ${page.title}`, page.summary);
    for (const section of page.sections) {
      output.push(
        `<a id="${page.id}--${section.id}"></a>`,
        `### ${section.title}`,
        ...section.paragraphs,
      );
      if (section.bullets)
        output.push(
          section.bullets.map((item, i) => `${i + 1}. ${item}`).join("\n"),
        );
      if (section.table)
        output.push(
          [
            `| ${section.table.headers.map(cell).join(" | ")} |`,
            `| ${section.table.headers.map(() => "---").join(" | ")} |`,
            ...section.table.rows.map(
              (row) => `| ${row.map(cell).join(" | ")} |`,
            ),
          ].join("\n"),
        );
      for (const code of section.codes || [])
        output.push(
          `**${code.file}**\n\n\`\`\`${code.language}\n${code.source.trim()}\n\`\`\``,
        );
      if (section.demo)
        output.push(
          `**完整 React 示例：${section.demo}.tsx**\n\n\`\`\`tsx\n${exampleSource(section.demo).trim()}\n\`\`\``,
        );
      if (section.links)
        output.push(
          section.links
            .map((link) => `- [${link.label}](${link.href})`)
            .join("\n"),
        );
    }
  }
  output.push("MIT License.");
  return output.join("\n\n") + "\n";
}
