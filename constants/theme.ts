export const theme = {
  // Fondos
  bg:          '#091525',
  panelBg:     '#0D1C30',
  sidebarBg:   '#070F1C',
  listBg:      '#0A1828',

  // Acento
  accent:      '#3B7DFF',
  accentDark:  '#1D5FD8',

  // Texto
  text:        '#D4E2F4',
  textMuted:   '#6B84A0',

  // Bordes
  border:      '#162540',

  // Burbujas de mensajes
  bubbleSent:  '#1B4AC8',
  bubbleRecv:  '#112030',

  // Inputs
  inputBg:     '#091525',

  // Estados
  online:      '#22C55E',
  error:       '#EF4444',
  warning:     '#F59E0B',

  // Interacciones
  unreadBg:    '#3B7DFF',
  activeRow:   'rgba(59,125,255,0.14)',
  hover:       'rgba(59,125,255,0.08)',
} as const;

export type Theme = typeof theme;
