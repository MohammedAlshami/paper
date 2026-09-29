import { Compass } from 'lucide-react';
import { EmptyState } from '@/components/app/empty-state';
import { AuthLayout } from '../layouts';
import type { PageProps } from './types';

export function NotFoundPage({ navigate }: PageProps) {
  return (
    <AuthLayout>
      <EmptyState icon={Compass} title="There is nothing at this address" description="The page may have moved, or the link may be wrong." action={{ label: 'Back to the overview', onClick: () => navigate('/app') }} secondaryAction={{ label: 'Go to the site', onClick: () => navigate('/') }} />
    </AuthLayout>
  );
}
