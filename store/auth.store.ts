import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario, SesionTokens } from '@/types/auth.types';

interface AuthState {
  usuario:       Usuario | null;
  accessToken:   string | null;
  isAutenticado: boolean;
  setSession:    (usuario: Usuario, tokens: SesionTokens) => Promise<void>;
  setUsuario:    (usuario: Usuario) => void;
  refreshTokens: () => Promise<void>;
  logout:        () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario:       null,
      accessToken:   null,
      isAutenticado: false,

      setSession: async (usuario, tokens) => {
        set({ usuario, accessToken: tokens.access_token, isAutenticado: true });
      },

      setUsuario: (usuario) => set({ usuario }),

      // El backend no tiene refresh token — si el token expira, se cierra sesión
      refreshTokens: async () => {
        await get().logout();
      },

      logout: async () => {
        if (get().accessToken) {
          try { await import('@/services/auth.service').then(m => m.authService.logout()); }
          catch { /* ignorar */ }
        }
        set({ usuario: null, accessToken: null, isAutenticado: false });
      },
    }),
    {
      name: 'chatee-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ usuario: state.usuario, isAutenticado: state.isAutenticado }),
    }
  )
);
