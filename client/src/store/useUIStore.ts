import { create } from 'zustand';

export interface UIState {
    navigationTarget: string | null;
    isCommandPaletteOpen: boolean;
    isSidebarCollapsed: boolean;
    setNavigationTarget: (id: string | null) => void;
    setCommandPaletteOpen: (isOpen: boolean) => void;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
    navigationTarget: null,
    isCommandPaletteOpen: false,
    isSidebarCollapsed: typeof window !== 'undefined' ? localStorage.getItem('algoforge_sidebar_collapsed') === 'true' : false,
    setNavigationTarget: (id: string | null) => set({ navigationTarget: id }),
    setCommandPaletteOpen: (isOpen: boolean) => set({ isCommandPaletteOpen: isOpen }),
    toggleSidebar: () => set((state) => {
        const next = !state.isSidebarCollapsed;
        try {
            localStorage.setItem('algoforge_sidebar_collapsed', String(next));
        } catch {
            // ignore
        }
        return { isSidebarCollapsed: next };
    }),
    setSidebarCollapsed: (collapsed: boolean) => {
        try {
            localStorage.setItem('algoforge_sidebar_collapsed', String(collapsed));
        } catch {
            // ignore
        }
        set({ isSidebarCollapsed: collapsed });
    },
}));