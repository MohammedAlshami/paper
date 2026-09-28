import * as React from 'react';
import { highlight } from './highlight';

/* ---------- headings & prose (base-ui's markdown classes, verbatim) ---------- */

export function MdH1({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h1 className="MdH1" id={id}>
      {children}
    </h1>
  );
}

export function MdH2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 className="MdH2" id={id}>
      <a className="HeadingLink" href={`#${id}`}>
        {children}
      </a>
    </h2>
  );
}

export function MdH3({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 className="MdH3" id={id}>
      <a className="HeadingLink" href={`#${id}`}>
        {children}
      </a>
    </h3>
  );
}

export function MdP({ children }: { children: React.ReactNode }) {
  return <p className="MdP">{children}</p>;
}

export function MdUl({ children }: { children: React.ReactNode }) {
  return <ul className="MdUl">{children}</ul>;
}

export function MdLi({ children }: { children: React.ReactNode }) {
  return <li className="MdListItem">{children}</li>;
}

export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="Code MdCode" data-inline="">
      {children}
    </code>
  );
}

export function Link({
  href,
  children,
  arrow,
}: {
  href: string;
  children: React.ReactNode;
  arrow?: boolean;
}) {
  return (
    <a className="Link" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
      {children}
      {arrow ? (
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" aria-hidden>
          <path d="M1.5 7.5 7.5 1.5" strokeLinecap="square" />
          <path d="M3 1.5h4.5V6" strokeLinecap="square" />
        </svg>
      ) : null}
    </a>
  );
}

export function Subtitle({ children, links }: { children: React.ReactNode; links?: React.ReactNode }) {
  return (
    <div className="Subtitle">
      <p className="MdP">{children}</p>
      {links ? <div className="SubtitleLinks">{links}</div> : null}
    </div>
  );
}

export function SubtitleLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="SubtitleLink" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
      <span className="SubtitleLinkText">{children}</span>
    </a>
  );
}

/* ---------- buttons ---------- */

const CopyIcon = () => (
  <span className="CodeBlockCopyIcon">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
      <path strokeLinecap="square" d="M1.5 1.5h10v10h-10z" />
      <path strokeLinecap="square" d="M4.5 11.5h-3v-10h10v3" />
      <path d="M12 4.5h2.5v10h-10V12" />
    </svg>
  </span>
);

export function GhostButton({
  children,
  label,
  layout = 'text',
  onClick,
  className,
}: {
  children?: React.ReactNode;
  label?: string;
  layout?: 'text' | 'icon';
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      data-layout={layout}
      className={`GhostButton${className ? ` ${className}` : ''}`}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <GhostButton
      layout="icon"
      label="Copy code"
      onClick={() => {
        void navigator.clipboard?.writeText(code).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        });
      }}
    >
      {copied ? (
        <span className="CodeBlockCopyIcon" style={{ fontSize: 11 }}>
          ✓
        </span>
      ) : (
        <CopyIcon />
      )}
    </GhostButton>
  );
}

/* ---------- code blocks ---------- */

/**
 * base-ui puts the horizontal padding of a code block on the `frame`/`line` spans
 * (`.CodeBlockRoot code .frame { padding-inline: .75rem }`), so the markup has to
 * wrap the code the same way or it sits flush against the border.
 */
export function CodeLines({ code }: { code: string }) {
  const lines = code.split('\n');
  return (
    <span className="frame">
      {lines.map((line, index) => (
        <span className="line" key={index}>
          {highlight(line)}
          {index < lines.length - 1 ? '\n' : ''}
        </span>
      ))}
    </span>
  );
}

export function CodeBlock({
  file,
  code,
  language = 'tsx',
  inline,
}: {
  file?: string;
  code: string;
  language?: string;
  inline?: boolean;
}) {
  return (
    <div role="figure" className={inline ? 'CodeBlockRoot' : 'CodeBlockRoot MdFigure'}>
      {file ? (
        <div className="CodeBlockPanel">
          <div className="CodeBlockPanelTitle">{file}</div>
          <CopyButton code={code} />
        </div>
      ) : null}
      <div className="CodeBlockPreContainer">
        <div className="CodeBlockViewport">
          <pre className="CodeBlockPreInline CodeBlockPre" spellCheck={false}>
            <code className={`language-${language}`}>
              <CodeLines code={code} />
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

const MANAGERS = [
  { id: 'pnpm', label: 'pnpm', command: 'pnpm' },
  { id: 'npm', label: 'npm', command: 'npm' },
  { id: 'yarn', label: 'yarn', command: 'yarn' },
  { id: 'bun', label: 'bun', command: 'bun' },
] as const;

function installCommand(manager: string, packages: string) {
  if (manager === 'npm') return `npm i ${packages}`;
  if (manager === 'yarn') return `yarn add ${packages}`;
  if (manager === 'bun') return `bun add ${packages}`;
  return `pnpm add ${packages}`;
}

export function InstallBlock({ packages }: { packages: string }) {
  const [manager, setManager] = React.useState<(typeof MANAGERS)[number]['id']>('pnpm');
  const command = installCommand(manager, packages);

  return (
    <div className="InstallationBlock bui-mt-5 bui-mb-6" data-orientation="horizontal">
      <div role="figure" aria-label="Installation command" className="CodeBlockRoot">
        <div className="CodeBlockPanel">
          <div role="tablist" aria-label="Package manager" className="InstallationBlockTabsList">
            {MANAGERS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={manager === item.id}
                data-active={manager === item.id ? '' : undefined}
                className="InstallationBlockTab"
                onClick={() => setManager(item.id)}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <CopyButton code={command} />
        </div>
        <div role="tabpanel" className="InstallationBlockTabPanel">
          <div className="CodeBlockPreContainer">
            <div className="CodeBlockViewport">
              <pre className="CodeBlockPreInline CodeBlockPre" spellCheck={false}>
                <code className="language-bash">
                  <CodeLines code={command} />
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- demo frame ---------- */

export function Demo({
  children,
  code,
  file = 'index.tsx',
  wide,
}: {
  children: React.ReactNode;
  code?: string;
  file?: string;
  wide?: boolean;
}) {
  return (
    <div className="DemoRoot">
      <div className="DemoPlayground">
        <div
          className="DemoPlaygroundInner"
          style={wide ? { justifyContent: 'stretch', alignItems: 'stretch', minWidth: 0 } : { minWidth: 0 }}
        >
          <div style={wide ? { width: '100%', textAlign: 'left' } : { width: '100%', display: 'flex', justifyContent: 'center', minWidth: 0 }}>{children}</div>
        </div>
      </div>

      {code ? (
        <>
          <div className="DemoToolbar">
            <div className="DemoToolbarScrollAreaRoot">
              <div className="DemoToolbarViewport">
                <div className="DemoTabsRoot">
                  <div className="DemoTabsList">
                    <span className="DemoTab" data-active="">
                      <span>{file}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="DemoToolbarActions DemoToolbarActionsDesktop">
              <CopyButton code={code} />
            </div>
          </div>
          <div className="DemoCodeBlockRoot">
            <div className="DemoSourceBrowser">
              <pre className="CodeBlockPreInline" spellCheck={false}>
                <code className="language-tsx">
                  <CodeLines code={code} />
                </code>
              </pre>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ---------- API reference ---------- */

export type ApiRow = { prop: string; type: string; default?: string; description: string };
export type ApiSection = { title: string; description?: string; rows: ApiRow[] };

function DescriptionRow({ term, children, separator }: { term: string; children: React.ReactNode; separator?: boolean }) {
  return (
    <div className="DescriptionListItem">
      <dt className={`DescriptionTerm${separator ? ' separator' : ''}`}>
        <div className="DescriptionListInner">{term}</div>
      </dt>
      <dd className="DescriptionListDetails">
        <div className="DescriptionListInner">{children}</div>
      </dd>
    </div>
  );
}

export function ApiSectionTable({ section }: { section: ApiSection }) {
  const slug = section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <>
      <MdH3 id={slug}>{section.title}</MdH3>
      {section.description ? <MdP>{section.description}</MdP> : null}
      <section
        className="AccordionRoot ReferenceAccordionRoot ReferenceBlockSpaced"
        style={{ '--rows': section.rows.length + 1 } as React.CSSProperties}
      >
        <div className="AccordionHeaderRow ReferenceHeaderRow" aria-hidden="true">
          <div className="AccordionHeaderCell">
            <span className="AccordionHeaderCellInner">Prop</span>
          </div>
          <div className="AccordionHeaderCell ReferenceHeaderTypeCell">
            <span className="AccordionHeaderCellInner">Type</span>
          </div>
          <div className="AccordionHeaderCell ReferenceHeaderDefaultCell">
            <span className="AccordionHeaderCellInner">Default</span>
          </div>
          <div className="AccordionHeaderCell ReferenceHeaderIconCell">
            <span className="AccordionHeaderCellInner" />
          </div>
        </div>

        {section.rows.map((row) => (
          <details className="AccordionItem" key={row.prop}>
            <summary
              id={`${slug}-${row.prop.replace(/[^a-z0-9]+/gi, '-')}`}
              className="AccordionTrigger ReferenceTrigger"
              aria-label={`Prop: ${row.prop}`}
            >
              <span
                className="AccordionScrollable ReferenceNameCell"
                style={{ '--scrollable-gradient-color': 'var(--color-content)' } as React.CSSProperties}
              >
                <span className="AccordionScrollableInner">
                  <code className="Code TableCode bui-ws-nw" style={{ color: 'var(--color-navy)' }}>
                    {row.prop}
                  </code>
                </span>
              </span>
              <span
                className="AccordionScrollable ReferenceTypeCell"
                style={{ '--scrollable-gradient-color': 'var(--color-content)' } as React.CSSProperties}
              >
                <span className="AccordionScrollableInner">
                  <code className="Code TableCode" data-inline="" style={{ color: 'var(--color-blue)' }}>
                    {row.type}
                  </code>
                </span>
              </span>
              <span
                className="AccordionScrollable ReferenceDefaultCell"
                style={{ '--scrollable-gradient-color': 'var(--color-content)' } as React.CSSProperties}
              >
                <span className="AccordionScrollableInner">
                  {row.default ? (
                    <code className="Code TableCode" data-inline="">
                      {row.default}
                    </code>
                  ) : (
                    <span style={{ color: 'var(--color-gray)' }}>—</span>
                  )}
                </span>
              </span>
              <span className="ReferenceIconWrap">
                <svg className="AccordionIcon ReferenceIcon" width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 3.5L5 7.5L9 3.5" stroke="currentColor" />
                </svg>
              </span>
            </summary>

            <div className="AccordionPanel">
              <div className="AccordionContent">
                <dl className="DescriptionList ReferenceContent">
                  <DescriptionRow term="Name">
                    <code className="Code TableCode">{row.prop}</code>
                  </DescriptionRow>
                  <DescriptionRow term="Description" separator>
                    <p className="MdP">{row.description}</p>
                  </DescriptionRow>
                  <DescriptionRow term="Type" separator>
                    <code className="Code TableCode">{row.type}</code>
                  </DescriptionRow>
                  <DescriptionRow term="Default" separator>
                    <code className="Code TableCode">{row.default ?? 'undefined'}</code>
                  </DescriptionRow>
                </dl>
              </div>
            </div>
          </details>
        ))}
      </section>
    </>
  );
}

export function ApiTable({ sections }: { sections: ApiSection[] }) {
  return (
    <>
      {sections.map((section) => (
        <ApiSectionTable key={section.title} section={section} />
      ))}
    </>
  );
}
