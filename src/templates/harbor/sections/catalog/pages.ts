import type { TemplatePage } from '../../../types';

/** Metadata only (no component imports) so tooling can read it in Node. */
export const CATALOG_PAGES: TemplatePage[] = [
  {
    path: '/products',
    label: 'Products',
    description: 'The catalogue: filter by status, category and supplier, select rows for bulk pause or retire, peek at a product in a side sheet, and import from CSV.',
    components: ['filter-bar', 'multi-select', 'data-table', 'bulk-action-bar', 'record-detail-sheet', 'confirm-dialog', 'file-upload', 'toast'],
  },
  {
    path: '/products/:id',
    label: 'Product detail',
    description: 'One product: edit price, cost and reorder rules in place, see stock at every location, its orders and its supplier, and draft a reorder.',
    components: ['page-tabs', 'stat-card-grid', 'inline-edit', 'file-upload', 'timeline', 'stock-level-bar', 'stock-adjust-dialog', 'data-table', 'empty-state'],
    example: '/products/p-03',
  },
  {
    path: '/inventory',
    label: 'Inventory',
    description: 'Stock by location with a tab per store and the warehouse. Low items are flagged, a watch list shows what is on order, and any count can be corrected.',
    components: ['page-tabs', 'stat-card-grid', 'parts-inventory-table', 'stock-level-bar', 'stock-adjust-dialog'],
  },
  {
    path: '/purchasing',
    label: 'Purchasing',
    description: 'Reorder suggestions become one draft order per supplier. Orders move from draft to received, and booking a delivery in adds the units to the warehouse.',
    components: ['page-tabs', 'reorder-suggestions', 'purchase-order-card', 'confirm-dialog', 'empty-state', 'toast'],
  },
  {
    path: '/suppliers',
    label: 'Suppliers',
    description: 'Who supplies what, how reliable they are and what has been spent. A side sheet lists their products and orders and can draft a reorder.',
    components: ['stat-card-grid', 'data-table', 'record-detail-sheet', 'toast'],
  },
];
