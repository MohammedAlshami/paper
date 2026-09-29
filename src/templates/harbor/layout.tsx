import * as React from 'react';
import { PageHeader } from '@/components/app/page-header';
import { useHarborRouter } from './router-context';

/** The padded, centred column every page's content goes in. */
export function PageBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto flex w-full max-w-[84rem] flex-col gap-6 p-4 sm:p-6 ${className ?? ''}`}>{children}</div>;
}

/**
 * HarborPage — what every page wraps itself in: the padded column, then a PageHeader with breadcrumbs that link
 * back through Harbor's router, then the content. Pass `crumbs` for anything deeper than a top-level page.
 */
export function HarborPage({
  title,
  description,
  crumbs,
  badge,
  actions,
  tabs,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  /** Breadcrumb trail. Paths are Harbor paths: { label: 'Orders', path: '/orders' }. The current page is added for you. */
  crumbs?: { label: string; path?: string }[];
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  /** A PageTabs strip to draw under the header. */
  tabs?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { navigate, href } = useHarborRouter();
  const trail = [{ label: 'Harbor', path: '/' }, ...(crumbs ?? []), { label: title }];
  return (
    <PageBody>
      <div className="flex flex-col gap-4">
        <PageHeader
          title={title}
          description={description}
          badge={badge}
          actions={actions}
          breadcrumbs={trail.map((crumb) => ({ label: crumb.label, href: 'path' in crumb && crumb.path ? href(crumb.path) : undefined }))}
          onCrumb={(crumb) => {
            const match = trail.find((item) => item.label === crumb.label && 'path' in item && item.path);
            if (match && 'path' in match && match.path) navigate(match.path);
          }}
        />
        {tabs}
      </div>
      {children}
    </PageBody>
  );
}
