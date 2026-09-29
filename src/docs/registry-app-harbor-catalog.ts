import type { ApiRow } from './md';
import type { ComponentEntry } from './registry';

const row = (prop: string, type: string, description: string, def?: string): ApiRow => ({ prop, type, description, ...(def ? { default: def } : {}) });

/** New app components the Harbor catalog section needed. */
export const APP_HARBOR_CATALOG_COMPONENTS: ComponentEntry[] = [
  {
    id: 'stock-adjust-dialog',
    name: 'StockAdjustDialog',
    category: 'Forms and feedback',
    tagline: 'Change a quantity, say why, and see the new total before saving.',
    description: 'A dialog for counting, writing off or topping up stock. It shows the quantity now, the change and the new total side by side, takes a step or a typed amount, asks for a reason, and never lets the total go below zero. onConfirm can be async.',
    status: 'new',
    file: 'components/app/stock-adjust-dialog.tsx',
    primitives: ['button', 'dialog', 'input', 'label', 'select'],
    deps: ['lucide-react'],
    usage: `<StockAdjustDialog
  open={open}
  onOpenChange={setOpen}
  subject="Cast iron skillet, 26 cm"
  location="Warehouse"
  current={42}
  onConfirm={({ delta, reason }) => adjustStock('p-01', 'warehouse', delta, reason)}
/>`,
    anatomy: `import { StockAdjustDialog, type StockAdjustment } from '@/components/app/stock-adjust-dialog';

// delta is signed: +12 adds twelve, -3 removes three. reason is one of the strings in \`reasons\`.
<StockAdjustDialog open={open} onOpenChange={setOpen} subject={name} current={onHand} onConfirm={save} />`,
    examples: [{ label: 'Custom reasons', code: `<StockAdjustDialog open={open} onOpenChange={setOpen} subject="Oil filter" current={9} unit="filters" reasons={['Used in a repair', 'Damaged', 'Stock take']} onConfirm={save} />` }],
    api: [
      {
        title: 'StockAdjustDialog',
        description: 'Closing is blocked while onConfirm is running.',
        rows: [
          row('open', 'boolean', 'Whether the dialog is open.'),
          row('onOpenChange', '(open: boolean) => void', 'Called when it opens or closes.'),
          row('title', 'string', 'The dialog heading.', "'Adjust stock'"),
          row('subject', 'string', 'What is being adjusted, such as a product name.'),
          row('location', 'string', 'Where, shown after the subject.'),
          row('current', 'number', 'The quantity now.'),
          row('unit', 'string', 'Unit word in the amount label.', "'units'"),
          row('reasons', 'string[]', 'Choices for the reason select.', 'Cycle count, Damaged, Received, Transferred, Returned, Lost'),
          row('onConfirm', '(adjustment: { delta: number; reason: string }) => void | Promise<void>', 'Runs on save with the signed change and the reason.'),
          row('accentColor', 'string', 'Colour of a negative change and an invalid total.', "'#ec4899'"),
        ],
      },
      {
        title: 'StockAdjustPanel',
        description: 'The form inside the dialog, for placing in your own layout.',
        rows: [
          row('current', 'number', 'The quantity now.'),
          row('unit', 'string', 'Unit word in the amount label.', "'units'"),
          row('reasons', 'string[]', 'Choices for the reason select.'),
          row('onConfirm', '(adjustment: { delta: number; reason: string }) => void | Promise<void>', 'Runs on save.'),
          row('onClose', '() => void', 'Called by Cancel, and after a successful save.'),
          row('accentColor', 'string', 'Colour of a negative change and an invalid total.', "'#ec4899'"),
        ],
      },
    ],
  },
];
