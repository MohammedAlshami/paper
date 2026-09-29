import { InvoiceList } from '@/components/app/invoice-list';
import { PageHeader } from '@/components/app/page-header';
import { PaymentMethodCard } from '@/components/app/payment-method-card';
import { PlanUsageCard } from '@/components/app/plan-usage-card';
import { PricingTable } from '@/components/app/pricing-table';
import { INVOICES, PLANS, USAGE_METERS } from '../data';
import { AppLayout } from '../layouts';
import type { PageProps } from './types';

export function BillingPage(props: PageProps) {
  return (
    <AppLayout {...props} active="/app/billing">
      <PageHeader title="Billing" description="Your plan, how you pay, and what you have paid." breadcrumbs={[{ label: 'Ledger' }, { label: 'Billing' }]} />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <PlanUsageCard planName="Growth" price={624} interval="month" renewsOn="2026-10-01" meters={USAGE_METERS} />
        <div className="flex flex-col gap-6">
          <PaymentMethodCard brand="visa" last4="4242" expMonth={11} expYear={2028} holder="Nadia Rahman" isDefault />
          <InvoiceList invoices={INVOICES} />
        </div>
      </div>
      <section className="flex flex-col gap-4 pt-2">
        <h2 className="text-lg font-medium tracking-tight">Change plan</h2>
        <PricingTable plans={PLANS} defaultBilling="monthly" />
      </section>
    </AppLayout>
  );
}
