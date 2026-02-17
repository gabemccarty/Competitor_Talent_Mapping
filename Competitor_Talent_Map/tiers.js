/**
 * Infer hierarchical tier (0-9) from job title.
 * 0 = highest (CEO), 9 = lowest (IC).
 */
const TIER_PATTERNS = [
  { tier: 0, patterns: [/ceo\b/i, /chief executive/i, /\bpresident\b/i] },
  { tier: 1, patterns: [/cto\b/i, /cfo\b/i, /coo\b/i, /cmo\b/i, /chief\s+\w+\s+officer/i, /chief\s+\w+\s+product/i] },
  { tier: 2, patterns: [/senior\s+director/i, /sr\.?\s+director/i] },
  { tier: 3, patterns: [/\bdirector\b/i, /head\s+of\s+/i] },
  { tier: 4, patterns: [/senior\s+manager/i, /manager\s+ii/i, /engineering\s+leader/i] },
  { tier: 5, patterns: [/\bmanager\b/i, /tech\s+lead\s+manager/i, /\btlm\b/i, /team\s+lead/i] },
  { tier: 6, patterns: [/tech\s+lead/i, /principal\s+engineer/i, /principal\s+ic/i, /principal\s+scientist/i] },
  { tier: 7, patterns: [/staff\s+engineer/i, /staff\s+scientist/i, /senior\s+staff/i] },
  { tier: 8, patterns: [/senior\s+engineer/i, /senior\s+\w+/i, /sr\.?\s+engineer/i, /sr\.?\s+\w+/i] },
  { tier: 9, patterns: [/engineer/i, /scientist/i, /designer/i, /analyst/i] },
];

export const tierLevelNames = {
  0: 'Top Executive',
  1: 'C-Suite Leadership',
  2: 'Senior Directors',
  3: 'Directors & Heads',
  4: 'Senior Managers',
  5: 'Managers & Team Leads',
  6: 'Tech Leads & Principal ICs',
  7: 'Staff Engineers',
  8: 'Senior Engineers',
  9: 'Engineers',
};

export function inferTier(title) {
  if (!title || typeof title !== 'string') return 9;
  const t = title.trim();
  for (const { tier, patterns } of TIER_PATTERNS) {
    if (patterns.some((p) => p.test(t))) return tier;
  }
  return 9;
}
