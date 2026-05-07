// El backend no tiene soporte de WebSocket/typing.
// Se mantiene la interfaz para compatibilidad con InputComposer.
export const useTyping = (_canalId: string) => {
  const onChangeText  = (_: string) => {};
  const detenerTyping = ()          => {};
  return { onChangeText, detenerTyping };
};
