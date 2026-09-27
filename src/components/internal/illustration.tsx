import { cn } from '@/lib/utils';

/**
 * Illustrations from the Notion Resources freebie pack (Regular = black line art),
 * which sits naturally on the paper background. Swap these for your own art by
 * keeping the same keys.
 */
export const ILLUSTRATIONS = {
  search: '/illustrations/search.svg',
  notes: '/illustrations/notes.svg',
  work: '/illustrations/work.svg',
  build: '/illustrations/build.svg',
  launch: '/illustrations/launch.svg',
  target: '/illustrations/target.svg',
  thinking: '/illustrations/thinking.svg',
  time: '/illustrations/time.svg',
  money: '/illustrations/money.svg',
  growth: '/illustrations/growth.svg',
  team: '/illustrations/team.svg',
  deal: '/illustrations/deal.svg',
  key: '/illustrations/key.svg',
  beacon: '/illustrations/beacon.svg',
  puzzle: '/illustrations/puzzle.svg',
  balance: '/illustrations/balance.svg',
  newsletter: '/illustrations/newsletter.svg',
  review: '/illustrations/review.svg',
  typing: '/illustrations/typing.svg',
  stats: '/illustrations/stats.svg',
  shopping: '/illustrations/shopping.svg',
  payment: '/illustrations/payment.svg',
  chat: '/illustrations/chat.svg',
  delivery: '/illustrations/delivery.svg',
} as const;

export type IllustrationName = keyof typeof ILLUSTRATIONS;

export interface IllustrationProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  name: IllustrationName;
}

/** A single named illustration. Decorative by default; pass `alt` when it carries meaning. */
export function Illustration({ name, className, alt, ...props }: IllustrationProps) {
  return (
    <img
      src={ILLUSTRATIONS[name]}
      alt={alt ?? ''}
      aria-hidden={alt ? undefined : true}
      draggable={false}
      className={cn('select-none object-contain', className)}
      {...props}
    />
  );
}
