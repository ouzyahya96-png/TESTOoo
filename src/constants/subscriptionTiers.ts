export type SubscriptionTier = 'FREE' | 'BASIC' | 'PREMIUM' | 'ELITE' | 'ALPHA';

export const PRISMA_TIER_MAP: Record<string, SubscriptionTier> = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
  ELITE: 'ELITE',
  ELITE_PREMIUM: 'ELITE',
  ALPHA_ULTIMATE: 'ALPHA'
};
