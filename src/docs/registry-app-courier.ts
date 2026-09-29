import type { ApiRow } from './md';
import type { ComponentEntry } from './registry';

const row = (prop: string, type: string, description: string, def?: string): ApiRow => ({ prop, type, description, ...(def ? { default: def } : {}) });

const entry = (e: Omit<ComponentEntry, 'status' | 'file'> & { file: string }): ComponentEntry => ({ status: 'new', ...e, file: `components/app/${e.file}.tsx` });

/** New app components the Courier template needed, added to the library so the template can use them. */
export const APP_COURIER_COMPONENTS: ComponentEntry[] = [
  entry({
    id: 'step-indicator',
    name: 'StepIndicator',
    category: 'Layout and navigation',
    tagline: 'Where someone is in a short flow.',
    description: 'A row of numbered steps joined by a line. Finished steps show a tick and can be pressed to go back, the current step takes the accent colour, and on a phone only the current label is shown so the row always fits.',
    file: 'step-indicator',
    primitives: [],
    deps: ['lucide-react'],
    usage: `<StepIndicator
  steps={[
    { id: 'address', label: 'Address', description: 'Where to deliver' },
    { id: 'area', label: 'Delivery area', description: 'Check we reach you' },
    { id: 'method', label: 'Pickup or door', description: 'How you want it' },
  ]}
  currentId="area"
  onSelect={(id) => setStep(id)}
/>`,
    anatomy: `import { StepIndicator, type Step } from '@/components/app/step-indicator';

// You own the current step: keep it in state and pass it as currentId.
// onSelect only fires for steps before the current one.
<StepIndicator steps={steps} currentId={step} onSelect={setStep} />`,
    examples: [{ label: 'Not interactive', code: `<StepIndicator steps={steps} currentId="method" />` }],
    api: [
      {
        title: 'StepIndicator',
        description: 'A horizontal progress row.',
        rows: [
          row('steps', 'Step[]', 'id, label and an optional description for each step, in order.'),
          row('currentId', 'string', 'The step being worked on. Earlier steps are drawn as done.'),
          row('onSelect', '(id: string) => void', 'Called when a finished step is pressed. Without it steps are not interactive.'),
          row('accentColor', 'string', 'Colour of the current step. Inline styles cannot read CSS variables, so pass a value.', "'#ec4899'"),
          row('className', 'string', 'Merged onto the list.'),
        ],
      },
    ],
  }),
];
