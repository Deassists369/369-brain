// apps/cms-next/styles/crmTokens.ts

/**
 * Design tokens extracted from DEASSISTS-Portal-CRM-Phase1-Prototype-LOCKED-v2.html
 * These match the prototype CSS variables exactly.
 */

export const crmTokens = {
  // Primary green palette
  g: '#1D7A45', // Primary green
  gd: '#0d3d22', // Dark green
  gl: '#2a9458', // Light green (hover)
  gx: '#e8f5ee', // Extra light green (backgrounds)
  gxx: '#d0ecda', // Green border

  // Dark palette (panel headers)
  dk: '#0d1a10', // Darkest
  dk1: '#132d1c',
  dk2: '#1a3d26',

  // Amber palette
  am: '#c47b00', // Amber
  aml: '#fff8ee', // Amber light
  amx: '#fff0d0', // Amber extra light

  // Neutral palette
  cr: '#F6F7F4', // Cream background
  cd: '#edeee9', // Cream dark
  wh: '#ffffff', // White

  // Text colors
  t1: '#1a1a1a', // Primary text
  t2: '#4a4a4a', // Secondary text
  t3: '#888888', // Tertiary text
  t4: '#bbbbbb', // Quaternary text

  // Border colors
  bd: '#e5e5e0', // Border
  bdd: '#d0d0c8', // Border dark

  // Semantic colors
  red: '#c62828',
  redl: '#fef2f2',
  blu: '#1565c0',
  blul: '#e8f0fd',
  pur: '#6a1b9a',
  purl: '#f3e5f5',

  // Typography
  fontBody: "'Outfit', sans-serif",
  fontDisplay: "'Fraunces', serif",

  // Border radius
  r1: '6px',
  r2: '10px',
  r3: '14px',
  r4: '20px',

  // Shadows
  s1: '0 1px 3px rgba(0,0,0,.08)',
  s2: '0 4px 16px rgba(0,0,0,.10)',
  s3: '0 8px 32px rgba(0,0,0,.16)',

  // Layout dimensions
  sidebar: 230,
  header: 56,
  panel: 420,
} as const;

// Status badge color map
export const statusBadgeColors: Record<string, { bg: string; color: string }> =
  {
    New: { bg: '#e8f5ee', color: '#1D7A45' },
    'Follow Up': { bg: '#fff8ee', color: '#c47b00' },
    'Called 1': { bg: '#e8f0fd', color: '#1565c0' },
    'Called 2': { bg: '#e8f0fd', color: '#1565c0' },
    'Called 3': { bg: '#e8f0fd', color: '#1565c0' },
    Converted: { bg: '#ecfdf5', color: '#065f46' },
    Lost: { bg: '#fef2f2', color: '#c62828' },
  };

// Queue sidebar count badge variants
export const countBadgeVariants = {
  default: { bg: crmTokens.cd, color: crmTokens.t2 },
  hot: { bg: '#fee2e2', color: crmTokens.red },
  warn: { bg: crmTokens.amx, color: crmTokens.am },
  selected: { bg: 'rgba(29,122,69,.15)', color: crmTokens.g },
} as const;
