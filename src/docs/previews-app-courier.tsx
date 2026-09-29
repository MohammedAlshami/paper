import * as React from 'react';
import { StepIndicator, type Step } from '@/components/app/step-indicator';

const MEDIUM = 'w-full max-w-[36rem]';

const STEPS: Step[] = [
  { id: 'address', label: 'Address', description: 'Where to deliver' },
  { id: 'area', label: 'Delivery area', description: 'Check we reach you' },
  { id: 'method', label: 'Pickup or door', description: 'How you want it' },
  { id: 'confirm', label: 'Confirm' },
];

function StepDemo() {
  const [current, setCurrent] = React.useState('area');
  return <StepIndicator className={MEDIUM} steps={STEPS} currentId={current} onSelect={setCurrent} />;
}

export const APP_COURIER_PREVIEWS: Record<string, React.ReactNode> = {
  'step-indicator': <StepDemo />,
};

export const APP_COURIER_EXAMPLES: Record<string, { label: string; node: React.ReactNode }[]> = {
  'step-indicator': [{ label: 'Not interactive', node: <StepIndicator className={MEDIUM} steps={STEPS} currentId="method" /> }],
};
