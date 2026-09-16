import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '../store/useUIStore';

export const useKeyboardShortcuts = (setShowShortcutsDialog: (show: boolean) => void) => {
  const { toggleSidebar, isCommandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInputFocused = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;

      // Ctrl + B: Toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        if (!isInputFocused) {
          e.preventDefault();
          toggleSidebar();
        }
      }

      // Ctrl + K: Command palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }

      // If input is focused, don't trigger single-key shortcuts
      if (isInputFocused) return;

      // Shift + ? : Show shortcuts dialog
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setShowShortcutsDialog(true);
      }

      // N: Add Question (only on sheet page)
      if (e.key.toLowerCase() === 'n' && location.pathname === '/app/sheet') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-add-question-modal'));
      }

      // T: Add Topic (only on sheet page)
      if (e.key.toLowerCase() === 't' && location.pathname === '/app/sheet') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-add-topic-modal'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, isCommandPaletteOpen, setCommandPaletteOpen, location.pathname, setShowShortcutsDialog]);
};
