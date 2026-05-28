import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario } from '@/types/auth.types';

interface AuthState {
  usuario:       Usuario | null;
  accessToken:   string | null;
  isAutenticado: boolean;

  setSession: (usuario: Usuario, token: string) => void;
  setUsuario: (usuario: Usuario) => void;

  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      accessToken: null,
      isAutenticado: false,

      // 🔐 login completo
      setSession: (usuario, token) => {
        set({
          usuario,
          accessToken: token,
          isAutenticado: true,
        });
      },

      // 👤 update parcial de usuario
      setUsuario: (usuario) => set({ usuario }),

      // 🚪 logout limpio
      logout: async () => {
        const token = get().accessToken;

        // opcional: avisar backend
        if (token) {
          try {
            const { authService } = await import('@/services/auth.service');
            await authService.logout();
          } catch (e) {
            // ignoramos errores de red
          }
        }

        // 🔥 limpiar SOLO auth
        set({
          usuario: null,
          accessToken: null,
          isAutenticado: false,
        });
      },
    }),
    {
      name: 'terotalk-auth',
      storage: createJSONStorage(() => AsyncStorage),

      // ⚠️ importante: solo auth, no chats
      partialize: (state) => ({
        usuario: state.usuario,
        accessToken: state.accessToken,
        isAutenticado: state.isAutenticado,
      }),
    }
  )
);