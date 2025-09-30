/**
 * Shared blockquote styling configuration
 * Used by both Sanity Studio and Next.js frontend
 */

export const blockquoteStyles = {
  pushpin: {
    emoji: '📌',
    borderColor: '#265F80',
    backgroundColor: 'rgba(38, 95, 128, 0.05)',
    backgroundColorSolid: '#e0eef5',
  },
  warning: {
    emoji: '⚠️',
    borderColor: '#eab308',
    backgroundColor: '#fefce8',
    backgroundColorSolid: '#fefce8',
  },
  danger: {
    emoji: '🚫',
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
    backgroundColorSolid: '#fef2f2',
  },
  announcement: {
    emoji: '📢',
    borderColor: '#a855f7',
    backgroundColor: '#faf5ff',
    backgroundColorSolid: '#faf5ff',
  },
} as const;

export type BlockquoteType = keyof typeof blockquoteStyles;