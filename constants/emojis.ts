export const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '✅'] as const;

export type QuickEmoji = typeof QUICK_EMOJIS[number];
