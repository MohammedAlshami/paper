import * as React from 'react';
import { StockAdjustDialog, StockAdjustPanel } from '@/components/app/stock-adjust-dialog';
import { Button } from '@/components/ui/button';

function StockAdjustDemo() {
  const [open, setOpen] = React.useState(false);
  const [stock, setStock] = React.useState(42);
  return (
    <div className="flex w-full max-w-[28rem] flex-col gap-4">
      <div className="rounded-lg border p-5">
        <p className="text-base font-semibold">Adjust stock</p>
        <p className="mb-4 text-sm text-muted-foreground">Cast iron skillet, 26 cm · Warehouse</p>
        <StockAdjustPanel key={stock} current={stock} onConfirm={({ delta }) => setStock((value) => value + delta)} onClose={() => undefined} />
      </div>
      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span className="font-mono tabular-nums">{stock} on hand</span>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Open as a dialog</Button>
      </div>
      <StockAdjustDialog open={open} onOpenChange={setOpen} subject="Cast iron skillet, 26 cm" location="Warehouse" current={stock} onConfirm={({ delta }) => setStock((value) => value + delta)} />
    </div>
  );
}

export const APP_HARBOR_CATALOG_PREVIEWS: Record<string, React.ReactNode> = {
  'stock-adjust-dialog': <StockAdjustDemo />,
};
export const APP_HARBOR_CATALOG_EXAMPLES: Record<string, { label: string; node: React.ReactNode }[]> = {};
