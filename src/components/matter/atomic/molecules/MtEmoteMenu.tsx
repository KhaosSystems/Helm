import React from 'react';

interface MtEmoteMenuProps {
  items?: MtEmoteMenuItem[];
  className?: string;
  onItemSelect?: (item: MtEmoteMenuItem) => void;
}

const emoteItems: MtEmoteMenuItem[] = [
  { emoji: '👍', label: 'Thumbs up' },
  { emoji: '❤️', label: 'Heart' },
  { emoji: '😂', label: 'Joy' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🎉', label: 'Party' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '👀', label: 'Eyes' },
];


export interface MtEmoteMenuItem {
  emoji: React.ReactNode;
  label?: string;
  onSelect?: () => void;
  disabled?: boolean;
}
export function MtEmoteMenu({ items = emoteItems, className, onItemSelect }: MtEmoteMenuProps) {
  return (
    <div className={`grid grid-cols-4 gap-1 ${className ?? ''}`}>
      {items.map((item, index) => (
        <button
          key={`${String(item.emoji)}-${index}`}
          type="button"
          disabled={item.disabled}
          title={item.label}
          onClick={() => {
            if (item.disabled) return;
            item.onSelect?.();
            onItemSelect?.(item);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-md text-base outline-none transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {item.emoji}
        </button>
      ))}
    </div>
  );
}