import { Modal } from './Modal';
import { Command, List, Plus, Search, PanelLeft } from 'lucide-react';

export function KeyboardShortcutsDialog({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: 'Open command palette', icon: Search },
    { keys: ['Ctrl', 'B'], description: 'Toggle sidebar', icon: PanelLeft },
    { keys: ['N'], description: 'Add new question (Sheet page)', icon: Plus },
    { keys: ['T'], description: 'Add new topic (Sheet page)', icon: List },
    { keys: ['Shift', '?'], description: 'Show keyboard shortcuts', icon: Command },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-4">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-border-dark last:border-0">
            <div className="flex items-center gap-3 text-text-main">
              <shortcut.icon className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-medium">{shortcut.description}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {shortcut.keys.map((key, kIndex) => (
                <kbd key={kIndex} className="px-2 py-1 text-xs font-semibold text-text-muted bg-bg-elevated border border-border-dark rounded-md">
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
