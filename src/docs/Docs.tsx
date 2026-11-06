import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Box,
  Check,
  ChevronRight,
  Copy,
  Download,
  Github,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { DOC_PAGES, DOC_GROUPS, DOC_VERSION, type DocPage } from "./content";
import { exampleSource } from "./examples";
import guideUrl from "../../docs/guide.md?url";
import "./style.css";

const loaders = import.meta.glob<{ default: ComponentType }>(
  "./examples/*.tsx",
);
const demos = Object.fromEntries(
  Object.entries(loaders).map(([path, load]) => [
    path.split("/").pop()!.replace(".tsx", ""),
    lazy(load),
  ]),
);
const pageHash = () => window.location.hash.slice(1) || "quick-start";
function Inline({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(`[^`]+`)/g)
        .map((part, i) =>
          part.startsWith("`") ? (
            <code key={i}>{part.slice(1, -1)}</code>
          ) : (
            part
          ),
        )}
    </>
  );
}
function CodeBlock({ file, source }: { file: string; source: string }) {
  const [copied, setCopied] = useState(false),
    [error, setError] = useState(""),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setError("");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("无法访问剪贴板，请在代码区手动选择复制。");
    }
  }
  return (
    <div className="doc-code">
      <div className="doc-code-head">
        <span>{file}</span>
        <button onClick={copy} aria-label={`复制 ${file} 代码`}>
          {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
          {copied ? "已复制" : "复制代码"}
        </button>
      </div>
      <pre tabIndex={0} aria-label={`${file} 源码`}>
        <code>{source.trim()}</code>
      </pre>
      <span className="doc-sr-only" role="status">
        {copied ? "代码已复制" : error}
      </span>
      {error && <p className="doc-copy-error">{error}</p>}
    </div>
  );
}
class DemoBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p className="doc-callout">
        示例加载失败，请刷新页面重试。下面的源码仍可复制使用。
      </p>
    ) : (
      this.props.children
    );
  }
}
function Example({ id }: { id: string }) {
  const Demo = demos[id];
  return (
    <>
      <div className="doc-demo-label">
        <span>
          <i /> 运行示例
        </span>
        <span>默认暗色组件材质 · 可直接操作</span>
      </div>
      <DemoBoundary key={id}>
        <Suspense
          fallback={
            <div className="doc-demo-loading" role="status">
              加载组件演示…
            </div>
          }
        >
          <div className="doc-demo">
            <Demo />
          </div>
        </Suspense>
      </DemoBoundary>
      <CodeBlock
        file={`${id === "quick-start" ? "App" : id}.tsx`}
        source={exampleSource(id)}
      />
    </>
  );
}
function initialTheme() {
  try {
    return localStorage.getItem("prismdeck.chrome.v1") === "light"
      ? "light"
      : "dark";
  } catch {
    return "dark";
  }
}
export default function Docs() {
  const [hash, setHash] = useState(pageHash),
    [query, setQuery] = useState(""),
    [menu, setMenu] = useState(false),
    [theme, setTheme] = useState(initialTheme);
  const articleId = hash.split("--")[0],
    page = DOC_PAGES.find((p) => p.id === articleId) || DOC_PAGES[0],
    search = useRef<HTMLInputElement>(null);
  const normalized = query.trim().toLowerCase();
  const results = DOC_PAGES.filter(
    (p) =>
      !normalized ||
      [
        p.title,
        p.label,
        p.summary,
        ...p.sections.flatMap((s) => [
          s.title,
          ...s.paragraphs,
          ...(s.table?.rows.flat() || []),
        ]),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
  );
  useEffect(() => {
    const change = () => {
      setHash(pageHash());
      setMenu(false);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const frame = requestAnimationFrame(() => window.scrollTo({ top: 0 }));
    return () => cancelAnimationFrame(frame);
  }, [menu]);
  useEffect(() => {
    document.title = `${page.title} · PrismDeck 文档`;
    const frame = requestAnimationFrame(() => {
      if (hash.includes("--"))
        document.getElementById(hash)?.scrollIntoView({ block: "start" });
      else {
        window.scrollTo({ top: 0 });
        document.getElementById("doc-title")?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, page.id, page.title]);
  useEffect(() => {
    document.documentElement.dataset.docTheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#101211" : "#f7f8f3");
    try {
      localStorage.setItem("prismdeck.chrome.v1", theme);
    } catch {}
  }, [theme]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMenu(true);
        requestAnimationFrame(() => search.current?.focus());
      }
      if (event.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const current = DOC_PAGES.indexOf(page),
    previous = DOC_PAGES[current - 1],
    next = DOC_PAGES[current + 1];
  return (
    <div className="documentation">
      <a
        className="doc-skip"
        href="#doc-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("doc-content")?.focus();
        }}
      >
        跳到文档正文
      </a>
      <header className="doc-header">
        <a className="doc-brand" href={`${import.meta.env.BASE_URL}docs/`}>
          <Box size={22} />
          <strong>
            prismdeck<span>®</span>
          </strong>
          <span className="doc-brand-divider" />
          <span>DOCS</span>
        </a>
        <span className="doc-version">v{DOC_VERSION}</span>
        <nav aria-label="文档外部导航">
          <a href={import.meta.env.BASE_URL} aria-label="返回工作台">
            <ArrowLeft size={14} />
            <span>返回工作台</span>
          </a>
          <a
            href="https://github.com/batype/prismdeck"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub 源码"
          >
            <Github size={17} />
          </a>
          <button
            aria-label="切换文档亮暗主题"
            onClick={() => setTheme((v) => (v === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            className="doc-menu-toggle"
            aria-label="文档目录"
            aria-controls="doc-navigation"
            aria-expanded={menu}
            onClick={() => setMenu((v) => !v)}
          >
            {menu ? <X size={19} /> : <Menu size={19} />}
          </button>
        </nav>
      </header>
      <div className="doc-layout">
        <aside
          id="doc-navigation"
          className={`doc-navigation ${menu ? "is-open" : ""}`}
        >
          <label className="doc-search">
            <Search size={15} />
            <input
              ref={search}
              aria-label="搜索文档"
              placeholder="搜索文档…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query ? (
              <button aria-label="清空搜索" onClick={() => setQuery("")}>
                <X size={13} />
              </button>
            ) : (
              <kbd>⌘ K</kbd>
            )}
          </label>
          <span className="doc-sr-only" role="status">
            找到 {results.length} 篇文档
          </span>
          <nav aria-label="文档章节">
            {DOC_GROUPS.map((group) => {
              const items = results.filter((p) => p.group === group);
              return items.length ? (
                <div className="doc-nav-group" key={group}>
                  <h2>{group}</h2>
                  {items.map((p) => (
                    <a
                      key={p.id}
                      href={`#${p.id}`}
                      aria-current={p.id === page.id ? "page" : undefined}
                      onClick={() => setMenu(false)}
                    >
                      {p.label}
                      {p.id === page.id && <ChevronRight size={13} />}
                    </a>
                  ))}
                </div>
              ) : null;
            })}
          </nav>
          {!results.length && (
            <p className="doc-no-results">
              未找到相关文档。试试组件名称、SSR 或“样式”。
            </p>
          )}
          <a
            className="doc-download"
            href={guideUrl}
            download="PrismDeck-接入文档.md"
          >
            <Download size={15} />
            <span>下载完整 Markdown 文档</span>
          </a>
          <p className="doc-nav-note">
            15 个组件 · 类型随包提供
            <br />
            React + CSS · MIT License
          </p>
        </aside>
        <main id="doc-content" className="doc-content" tabIndex={-1}>
          {!DOC_PAGES.some((p) => p.id === articleId) && (
            <p className="doc-callout" role="status">
              未找到链接对应的文档，已显示快速开始。可通过左侧目录重新选择。
            </p>
          )}
          <div className="doc-breadcrumb">
            <BookOpen size={13} />
            <span>文档</span>
            <ChevronRight size={12} />
            <span>{page.group}</span>
          </div>
          <div className="doc-article-head" id={page.id}>
            <span className="doc-eyebrow">
              BUILD WITH CLARITY / {String(current + 1).padStart(2, "0")}
            </span>
            <h1 id="doc-title" tabIndex={-1}>
              {page.title}
            </h1>
            <p>{page.summary}</p>
          </div>
          {page.id === "quick-start" && (
            <div className="doc-quick-links">
              <a href="#quick-start--install">
                <span>01</span>安装组件
                <ArrowRight size={15} />
              </a>
              <a href="#nextjs">
                <span>02</span>Next.js 接入
                <ArrowRight size={15} />
              </a>
              <a href="#gauge">
                <span>03</span>查看组件 API
                <ArrowRight size={15} />
              </a>
            </div>
          )}
          <article key={page.id}>
            {page.sections.map((section) => (
              <section
                className="doc-section"
                key={section.id}
                id={`${page.id}--${section.id}`}
              >
                <h2>
                  <a href={`#${page.id}--${section.id}`}>
                    {section.title}
                    <span aria-hidden="true">#</span>
                  </a>
                </h2>
                {section.paragraphs.map((p, i) => (
                  <p key={i}>
                    <Inline text={p} />
                  </p>
                ))}
                {section.bullets && (
                  <ol>
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                )}
                {section.table && (
                  <div
                    className="doc-table-wrap"
                    tabIndex={0}
                    role="region"
                    aria-label={`${section.title} 表格`}
                  >
                    <table>
                      <thead>
                        <tr>
                          {section.table.headers.map((h) => (
                            <th key={h} scope="col">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j}>
                                {j === 0 ? (
                                  <code>{cell}</code>
                                ) : (
                                  <Inline text={cell} />
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {section.codes?.map((code, i) => (
                  <CodeBlock
                    key={`${code.file}-${i}`}
                    file={code.file}
                    source={code.source}
                  />
                ))}
                {section.demo && <Example id={section.demo} />}{" "}
                {section.links && (
                  <div className="doc-reference-links">
                    {section.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {link.label}
                        <ArrowUpRight size={13} />
                      </a>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </article>
          <nav className="doc-pagination" aria-label="相邻文档">
            {previous ? (
              <a href={`#${previous.id}`}>
                <small>上一篇</small>
                <span>
                  <ArrowLeft size={15} />
                  {previous.label}
                </span>
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a href={`#${next.id}`}>
                <small>下一篇</small>
                <span>
                  {next.label}
                  <ArrowRight size={15} />
                </span>
              </a>
            ) : (
              <span />
            )}
          </nav>
          <footer className="doc-footer">
            <span>PrismDeck · v{DOC_VERSION} · MIT</span>
            <a
              href="https://github.com/batype/prismdeck/issues"
              target="_blank"
              rel="noreferrer"
            >
              反馈文档问题 <ArrowUpRight size={12} />
            </a>
          </footer>
        </main>
        <aside className="doc-toc">
          <span>本页内容</span>
          <nav aria-label="本页目录">
            {page.sections.map((section) => (
              <a key={section.id} href={`#${page.id}--${section.id}`}>
                {section.title}
              </a>
            ))}
          </nav>
          <div className="doc-toc-tip">
            <span className="doc-tip-dot" />
            先跑通示例，再接入真实业务。
            <a href={import.meta.env.BASE_URL}>
              打开工作台 <ArrowUpRight size={12} />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
