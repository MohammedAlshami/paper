import { Truck } from 'lucide-react';
import { EmptyState } from '@/components/app/empty-state';
import { GarageShell, PageBody } from '../shell';
import type { PageContext } from '../context';

export function NotFoundPage(ctx: PageContext) {
  return (
    <GarageShell activeId="" ctx={ctx}>
      <PageBody>
        <EmptyState icon={Truck} title="Page not found" description="That page is not part of this template." action={{ label: 'Back to the dashboard', onClick: () => ctx.navigate('/') }} />
      </PageBody>
    </GarageShell>
  );
}
