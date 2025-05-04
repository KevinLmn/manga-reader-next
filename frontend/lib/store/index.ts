import { create } from 'zustand';

interface AppState {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>(set => ({
  isLoading: false,
  setIsLoading: loading => set({ isLoading: loading }),
}));
