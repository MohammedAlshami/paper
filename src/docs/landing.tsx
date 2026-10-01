'use client';

import * as React from 'react';
import { motion, MotionConfig, type Variants } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TEMPLATES } from '@/templates/registry';
import { cn } from '@/lib/utils';
import { COMPONENTS } from './registry';
import { ComponentCard } from './component-card';

gsap.registerPlugin(ScrollTrigger);

const REPO = 'https://github.com/MohammedAlshami/paper';

const PITCHES = [
  {
    title: 'Finished, not plumbing',
    body: 'A delivery tracker, a work order board, a parts inventory: whole screens for a real workflow, not another set of primitives.',
    illustration: '/illustrations/project-development.svg',
  },
  {
    title: 'Copy-paste, not a package',
    body: 'No version to chase. Copy the file into your project and own it from that moment on.',
    illustration: '/illustrations/puzzle.svg',
  },
  {
    title: 'Open by default',
    body: 'MapLibre GL and OpenFreeMap for the maps, Recharts for the charts: open source, no API keys, no per-load billing.',
    illustration: '/illustrations/target-accent.svg',
  },
];

const FEATURED_IDS = [
  'delivery-tracker-card',
  'store-locator',
  'dispatch-board',
  'work-order-board',
  'vehicle-health-card',
  'fleet-overview',
  'cost-breakdown-chart',
  'revenue-chart',
  'data-table',
];

const staggerParent: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };

const riseIn: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

/**
 * The landing page's two motion systems:
 * framer-motion for the entrances that should feel staged (headline, columns, cards),
 * GSAP for what should follow the scrollbar (the hero shot drifts and settles, templates stagger in).
 */
function useLandingAnimations(root: React.RefObject<HTMLDivElement | null>) {
  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-hero-shot]',
        { opacity: 0, y: 48, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out', delay: 0.15 },
      );

      gsap.to('[data-hero-parallax]', {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: { trigger: '[data-hero-shot]', start: 'top 70%', end: 'bottom top', scrub: 0.5 },
      });

      gsap.utils.toArray<HTMLElement>('[data-template-row]').forEach((row) => {
        gsap.from(row, {
          opacity: 0,
          y: 64,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 82%' },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [root]);
}

export function LandingPage() {
  const root = React.useRef<HTMLDivElement>(null);
  useLandingAnimations(root);

  return (
    <MotionConfig reducedMotion="user">
      <div ref={root}>
        <div className="flex flex-col gap-24 py-8 sm:gap-28 sm:py-12">
          <section className="flex flex-col items-center gap-8 sm:gap-10">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="max-w-2xl text-center text-4xl font-extrabold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl"
            >
              Back-office screens,
              <br />
              already <span className="hero-word">built</span>.
            </motion.h1>

            <div data-hero-parallax className="w-full">
              <img
                data-hero-shot
                src="/screenshots/templates/harbor.png"
                alt="Harbor, the retail back-office template"
                className="w-full rounded-xl border border-border"
              />
            </div>
          </section>

          <section className="flex min-h-screen flex-col justify-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerParent}
              className="grid grid-cols-1 items-start gap-14 text-center sm:grid-cols-3 sm:gap-10 lg:gap-16"
            >
              {PITCHES.map((pitch) => (
                <motion.div key={pitch.title} variants={riseIn} className="flex flex-col items-center gap-5">
                  <img
                    src={pitch.illustration}
                    alt=""
                    aria-hidden
                    className="h-32 w-32 object-contain sm:h-44 sm:w-44 lg:h-56 lg:w-56"
                  />
                  <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">{pitch.title}</h3>
                  <p className="max-w-xs text-sm leading-relaxed text-muted-foreground sm:text-base">{pitch.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          <section className="flex flex-col gap-8 sm:gap-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">A few of them</h2>
              <a href="/components" className="text-sm font-medium text-muted-foreground transition-colors hover:text-pink">
                Browse all {COMPONENTS.length} →
              </a>
            </div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={staggerParent}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
            >
              {FEATURED_IDS.map((id) => (
                <motion.div key={id} variants={riseIn}>
                  <ComponentCard id={id} />
                </motion.div>
              ))}
            </motion.div>
          </section>

          <section data-templates className="flex flex-col gap-8 sm:gap-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Four templates, ready to run</h2>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                  Whole sub-projects built only from these components: a delivery platform, a fleet workshop, a SaaS
                  starter and a retailer&apos;s back-office.
                </p>
              </div>
              <a href="/templates" className="text-sm font-medium text-muted-foreground transition-colors hover:text-pink">
                Browse all →
              </a>
            </div>
            <div className="flex flex-col gap-20 sm:gap-28">
              {TEMPLATES.map((template, index) => (
                <div
                  key={template.id}
                  data-template-row
                  className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16"
                >
                  <div className={cn('flex flex-col items-start gap-4', index % 2 === 1 && 'lg:order-2')}>
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      {String(index + 1).padStart(2, '0')} · {template.families.join(' · ')}
                    </span>
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{template.name}</h3>
                    <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">{template.tagline}</p>
                    <a
                      href={`/templates/${template.id}`}
                      className="mt-1 text-sm font-medium text-foreground no-underline transition-colors hover:text-pink"
                    >
                      Open the template →
                    </a>
                  </div>

                  <a
                    href={`/templates/${template.id}`}
                    className={cn(
                      'group block overflow-hidden rounded-xl border border-border no-underline',
                      index % 2 === 1 && 'lg:order-1',
                    )}
                  >
                    <img
                      src={`/screenshots/templates/${template.id}.png`}
                      alt={`${template.name} template`}
                      loading="lazy"
                      className="aspect-[16/10] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </a>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="-mb-24 mt-24 flex flex-col items-center gap-12 px-4 pb-24 text-center">
          <a
            href="/"
            className="text-[clamp(4rem,18vw,15rem)] font-extrabold leading-none tracking-tighter text-foreground transition-colors duration-300 hover:text-pink"
          >
            Paper
          </a>
          <nav className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              { label: 'Components', href: '/components' },
              { label: 'Templates', href: '/templates' },
              { label: 'Docs', href: '/quick-start' },
              { label: 'GitHub', href: REPO },
              { label: 'MCP', href: '/mcp/doc' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <p className="text-sm text-muted-foreground/70">© 2026 Paper. Copy the code, own the code.</p>
        </footer>
      </div>
    </MotionConfig>
  );
}
