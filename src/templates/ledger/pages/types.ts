/** What every page of the template receives. */
export interface PageProps {
  /** Prefix for links, e.g. "/t/ledger". */
  base: string;
  /** Go to a path inside the template. */
  navigate: (path: string) => void;
}
