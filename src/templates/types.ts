import type * as React from 'react';

/** What every template's root component receives from the docs site. */
export interface TemplateProps {
  /** The path inside the template, e.g. "/vehicles/v12". Always starts with "/". */
  path: string;
  /** Go to a path inside the template, e.g. navigate('/vehicles'). The base is added for you. */
  navigate: (path: string) => void;
  /** The prefix every link in the template needs, e.g. "/t/garage". Use it as href={`${base}/vehicles`}. */
  base: string;
}

export interface TemplatePage {
  /** A route pattern inside the template; ":id" matches one segment. */
  path: string;
  label: string;
  description: string;
  /** Ids of the components this page is built from (they link to their docs). */
  components: string[];
  /** A concrete path to open for the live link when `path` has params. */
  example?: string;
}

export interface TemplateEntry {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Which component families it draws on. */
  families: ('maps' | 'fleet' | 'app')[];
  pages: TemplatePage[];
  load: () => Promise<{ default: React.ComponentType<TemplateProps> }>;
}
