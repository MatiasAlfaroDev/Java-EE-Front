const AVATAR_COLORS = [
  '#1A3558', '#2D1B69', '#0C3344', '#1B3A26',
  '#3B1F2B', '#1F2D3B', '#2B2600', '#1A2D44',
];

export const avatarColor = (str: string): string =>
  AVATAR_COLORS[(str || '').charCodeAt(0) % AVATAR_COLORS.length];

export const getInitials = (nombre: string): string => {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
};
