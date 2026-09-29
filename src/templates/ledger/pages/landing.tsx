import { BarChart3, Bell, Lock, Users, Workflow, Zap } from 'lucide-react';
import { CtaBanner } from '@/components/app/cta-banner';
import { FaqList } from '@/components/app/faq-list';
import { FeatureGrid } from '@/components/app/feature-grid';
import { HeroSection } from '@/components/app/hero-section';
import { PricingTable } from '@/components/app/pricing-table';
import { RevenueChart } from '@/components/app/revenue-chart';
import { StatCardGrid } from '@/components/app/stat-card-grid';
import { TestimonialGrid } from '@/components/app/testimonial-grid';
import { FAQS, FEATURES, LOGOS, PLANS, REVENUE, STATS, TESTIMONIALS } from '../data';
import { MarketingLayout } from '../layouts';
import type { PageProps } from './types';

const ICONS = [<BarChart3 key="a" />, <Workflow key="b" />, <Lock key="c" />, <Bell key="d" />, <Users key="e" />, <Zap key="f" />];

export function LandingPage(props: PageProps) {
  const { base, navigate } = props;
  return (
    <MarketingLayout {...props}>
      <main className="mx-auto flex max-w-6xl flex-col gap-20 px-4 pb-20 sm:gap-28 sm:px-6">
        <HeroSection
          className="px-0"
          eyebrow="Now with automated reminders"
          title="Know where every dollar is, without the spreadsheet."
          description="Ledger keeps your customers, invoices and cash in one calm place, so month end takes an afternoon instead of a week."
          primaryAction={{ label: 'Start free', href: `${base}/register` }}
          secondaryAction={{ label: 'See the app', href: `${base}/app` }}
          logos={LOGOS}
          media={
            <div className="flex flex-col gap-4 p-3 sm:p-5">
              <StatCardGrid stats={STATS} period="vs last month" />
              <RevenueChart data={REVENUE} title="Revenue" />
            </div>
          }
        />

        <section id="product" className="scroll-mt-20">
          <FeatureGrid
            title="Everything the finance team asks for"
            description="And a few things they did not know they could ask for."
            columns={3}
            features={FEATURES.map((feature, index) => ({ ...feature, icon: ICONS[index] }))}
          />
        </section>

        <section id="customers" className="scroll-mt-20">
          <TestimonialGrid title="Teams that stopped dreading month end" testimonials={TESTIMONIALS} />
        </section>

        <section id="pricing" className="flex scroll-mt-20 flex-col gap-8">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-2 text-center">
            <h2 className="text-3xl font-medium tracking-tight">Simple pricing</h2>
            <p className="text-base text-muted-foreground">Start free and pay when the team grows. Switch to yearly and keep two months.</p>
          </div>
          <PricingTable plans={PLANS} onSelect={() => navigate('/register')} />
        </section>

        <section id="faq" className="mx-auto flex w-full max-w-2xl scroll-mt-20 flex-col gap-8">
          <h2 className="text-center text-3xl font-medium tracking-tight">Questions, answered</h2>
          <FaqList items={FAQS} defaultOpenId="q1" />
        </section>

        <CtaBanner
          title="Close the month in an afternoon."
          description="Start free. No card, no call, and your data is yours to export whenever you like."
          primaryAction={{ label: 'Start free', href: `${base}/register` }}
          secondaryAction={{ label: 'Sign in', href: `${base}/login` }}
        />
      </main>
    </MarketingLayout>
  );
}
