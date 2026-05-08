/* import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Usuario, SesionTokens } from '@/types/auth.types';
import { authService } from '@/services/auth.service';

 interface AuthState {
  usuario: Usuario | null;
  accessToken: string | null;
  isAutenticado: boolean;
  setSession: (usuario: Usuario, tokens: SesionTokens) => Promise<void>;
  setUsuario: (usuario: Usuario) => void;
  refreshTokens: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      accessToken: null,
      isAutenticado: false,

      setSession: async (usuario, tokens) => {
        await SecureStore.setItemAsync('refresh_token', tokens.refresh_token);
        set({ usuario, accessToken: tokens.access_token, isAutenticado: true });
      },

      setUsuario: (usuario) => set({ usuario }),

      refreshTokens: async () => {
        const rt = await SecureStore.getItemAsync('refresh_token');
        if (!rt) { await get().logout(); return; }
        try {
          const { data } = await authService.refresh(rt);
          await SecureStore.setItemAsync('refresh_token', data.refresh_token);
          set({ accessToken: data.access_token });
        } catch {
          await get().logout();
        }
      },

      logout: async () => {
        const rt = await SecureStore.getItemAsync('refresh_token');
        if (rt) {
          try { await authService.logout(rt); } catch { /* ignorar */ /*}
          await SecureStore.deleteItemAsync('refresh_token');
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
); */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario } from '@/types/auth.types';

interface AuthState {
  usuario: Usuario | null;
  accessToken: string | null;
  isAutenticado: boolean;

  setSession: (usuario: Usuario, token: string) => void;
  setUsuario: (usuario: Usuario) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      accessToken: null,
      isAutenticado: false,

      setSession: (usuario, token) => {
        set({
          usuario,
          accessToken: token,
          isAutenticado: true,
        });
      },

      setUsuario: (usuario) => set({ usuario }),

      logout: () => {
        set({
          usuario: null,
          accessToken: null,
          isAutenticado: false,
        });
      },
    }),
    {
      name: 'chatee-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
