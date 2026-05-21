import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario } from '@/types/auth.types';

interface AuthState {
  usuario:       Usuario | null;
  accessToken:   string | null;
  isAutenticado: boolean;
  setSession:    (usuario: Usuario, token: string) => void;
  setUsuario:    (usuario: Usuario) => void;
  logout:        () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario:       null,
      accessToken:   null,
      isAutenticado: false,

      setSession: (usuario, token) => {
        set({ usuario, accessToken: token, isAutenticado: true });
      },

      setUsuario: (usuario) => set({ usuario }),

      logout: async () => {
        if (get().accessToken) {
          try { await import('@/services/auth.service').then(m => m.authService.logout()); }
          catch { /* ignorar */ }
        }
        set({ usuario: null, accessToken: null, isAutenticado: false });
      },
    }),
    {
      name: 'terotalk-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ usuario: state.usuario, accessToken: state.accessToken, isAutenticado: state.isAutenticado }),
    }
  )
);
