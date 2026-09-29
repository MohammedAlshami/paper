import * as React from 'react';
import { PackageCheck } from 'lucide-react';
import { EmptyState } from '@/components/app/empty-state';
import { PageHeader } from '@/components/app/page-header';
import { StepIndicator } from '@/components/app/step-indicator';
import { AddressPicker, type PickedLocation } from '@/components/maps/address-picker';
import { PickupPointSelector } from '@/components/maps/pickup-point-selector';
import { ServiceAreaChecker } from '@/components/maps/service-area-checker';
import { Button } from '@/components/ui/button';
import { PICKUP_POINTS, SERVICE_ZONES } from '../data/places';
import { reverseAddress, searchAddresses } from '../data/san-francisco';

const STEPS = [
  { id: 'address', label: 'Address', description: 'Where to deliver' },
  { id: 'area', label: 'Delivery area', description: 'Check we reach you' },
  { id: 'method', label: 'Door or pickup', description: 'How you want it' },
  { id: 'done', label: 'Done' },
];

/** A three-step checkout built from the location components: pick an address, check the zone, choose a way to receive. */
export function CheckoutPage({ navigate }: { navigate: (path: string) => void }) {
  const [step, setStep] = React.useState('address');
  const [location, setLocation] = React.useState<PickedLocation>({ position: [-122.421, 37.76035], address: '800 Valencia Street' });
  const index = STEPS.findIndex((item) => item.id === step);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader title="Delivery details" description="Three quick steps and your order is on its way." />
      <StepIndicator steps={STEPS} currentId={step} onSelect={setStep} />

      {step === 'address' ? (
        <div className="flex flex-col gap-4">
          <AddressPicker
            className="w-full"
            defaultValue={location}
            search={searchAddresses}
            reverseGeocode={reverseAddress}
            onChange={setLocation}
            onConfirm={(value) => {
              setLocation(value);
              setStep('area');
            }}
            confirmLabel="Use this address"
          />
        </div>
      ) : null}

      {step === 'area' ? (
        <div className="flex flex-col gap-4">
          <ServiceAreaChecker className="w-full" zones={SERVICE_ZONES} defaultPosition={location.position} search={searchAddresses} onNotify={() => undefined} />
          <div className="flex justify-between gap-3">
            <Button variant="outline" onClick={() => setStep('address')}>
              Back
            </Button>
            <Button onClick={() => setStep('method')}>Continue</Button>
          </div>
        </div>
      ) : null}

      {step === 'method' ? (
        <div className="flex flex-col gap-4">
          <PickupPointSelector className="w-full" points={PICKUP_POINTS} userPosition={location.position} onConfirm={() => setStep('done')} />
          <div className="flex justify-start">
            <Button variant="outline" onClick={() => setStep('area')}>
              Back
            </Button>
          </div>
        </div>
      ) : null}

      {step === 'done' ? (
        <EmptyState
          icon={PackageCheck}
          title="Order placed"
          description={`We will bring it to ${location.address ?? 'your pin'}. You will get a text with a tracking link.`}
          action={{ label: 'Track your order', onClick: () => navigate('/track/48213') }}
          secondaryAction={{ label: 'Start over', onClick: () => setStep('address') }}
        />
      ) : null}

      <p className="text-center font-mono text-xs text-muted-foreground">
        Step {Math.min(index + 1, 3)} of 3
      </p>
    </div>
  );
}
