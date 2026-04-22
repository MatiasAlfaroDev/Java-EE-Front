const MINUTO = 60;
const HORA   = 60 * MINUTO;
const DIA    = 24 * HORA;
const SEMANA = 7 * DIA;

export const fechaRelativa = (isoString: string): string => {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);

  if (diff < 60)         return 'ahora';
  if (diff < HORA)       return `hace ${Math.floor(diff / MINUTO)} min`;
  if (diff < DIA)        return `hace ${Math.floor(diff / HORA)} h`;
  if (diff < SEMANA)     return `hace ${Math.floor(diff / DIA)} d`;

  return new Date(isoString).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
  });
};

export const horaCorta = (isoString: string): string =>
  new Date(isoString).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

export const fechaLarga = (isoString: string): string =>
  new Date(isoString).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
