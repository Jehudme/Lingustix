import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  showOnboarding: boolean;
  autoSaveInterval: number; // in milliseconds
}

interface SettingsActions {
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setAutoSaveInterval: (interval: number) => void;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      showOnboarding: true,
      autoSaveInterval: 3000, // 3 seconds default

      completeOnboarding: () => set({ showOnboarding: false }),
      resetOnboarding: () => set({ showOnboarding: true }),
      setAutoSaveInterval: (interval: number) => set({ autoSaveInterval: interval }),
    }),
    {
      name: 'lingustix-settings',
      partialize: (state) => ({
        showOnboarding: state.showOnboarding,
        autoSaveInterval: state.autoSaveInterval,
      }),
    }
  )
);
