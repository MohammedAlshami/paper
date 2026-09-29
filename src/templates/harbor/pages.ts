import type { TemplatePage } from '../types';
import { CATALOG_PAGES } from './sections/catalog/pages';
import { DELIVERY_PAGES } from './sections/delivery/pages';
import { FLEET_PAGES } from './sections/fleet/pages';
import { INSIGHT_PAGES } from './sections/insight/pages';
import { OPERATIONS_PAGES } from './sections/operations/pages';

/** Every Harbor page, in nav order. Import-free (metadata only) so tooling can read it in Node. */
export const HARBOR_PAGES: TemplatePage[] = [...OPERATIONS_PAGES, ...DELIVERY_PAGES, ...CATALOG_PAGES, ...FLEET_PAGES, ...INSIGHT_PAGES];
