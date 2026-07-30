import { create } from 'zustand';

export interface UIState {
    navigationTarget: string | null;
    isCommandPaletteOpen: boolean;
    setNavigationTarget: (id: string | null) => void;
    setCommandPaletteOpen: (isOpen: boolean) => void;
}

export const useQuestionStore = create<UIState>()((set) => ({
    navigationTarget: null,
    isCommandPaletteOpen: false,
    setNavigationTarget: (id: string | null) => set({ navigationTarget: id }),
    setCommandPaletteOpen: (isOpen: boolean) => set({ isCommandPaletteOpen: isOpen }),
}));