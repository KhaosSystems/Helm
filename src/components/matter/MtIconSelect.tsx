import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  Bookmark,
  Box,
  Bug,
  CheckCircle,
  CheckSquare,
  Clipboard,
  Cloud,
  Code,
  Compass,
  Database,
  Eye,
  FileText,
  Filter,
  Flag,
  Folder,
  GitBranch,
  Globe,
  Hash,
  Inbox,
  Layers,
  Link,
  ListTodo,
  Lock,
  Package,
  Rocket,
  Search,
  Server,
  Settings,
  Settings2,
  Shield,
  Sparkles,
  Star,
  Tag,
  Target,
  Terminal,
  TrendingUp,
  Triangle,
  Users,
  Wrench,
  Zap,
  Circle,
  Square,
  Heart,
  MessageSquare,
  Bell,
  Calendar,
  Clock,
  Cpu,
  Flame,
  Globe2,
  HelpCircle,
  Key,
  LifeBuoy,
  List,
  Map,
  Microscope,
  Monitor,
  Puzzle,
  RefreshCw,
  Repeat,
  Shuffle,
  Sliders,
  Smartphone,
  Sword,
  Table,
  ThumbsUp,
  Ticket,
  Trash,
  Trophy,
  Truck,
  Unlink,
  User,
  Wifi,
} from 'lucide-react';
import { MtPopover } from './MtPopover';

// ── Curated icon registry ───────────────────────────────────────────────────

export const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  activity: Activity,
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  archive: Archive,
  bookmark: Bookmark,
  box: Box,
  bug: Bug,
  'check-circle': CheckCircle,
  'check-square': CheckSquare,
  clipboard: Clipboard,
  cloud: Cloud,
  code: Code,
  compass: Compass,
  database: Database,
  eye: Eye,
  'file-text': FileText,
  filter: Filter,
  flag: Flag,
  folder: Folder,
  'git-branch': GitBranch,
  globe: Globe,
  hash: Hash,
  inbox: Inbox,
  layers: Layers,
  link: Link,
  'list-todo': ListTodo,
  lock: Lock,
  package: Package,
  rocket: Rocket,
  search: Search,
  server: Server,
  settings: Settings,
  'settings-2': Settings2,
  shield: Shield,
  sparkles: Sparkles,
  star: Star,
  tag: Tag,
  target: Target,
  terminal: Terminal,
  'trending-up': TrendingUp,
  triangle: Triangle,
  users: Users,
  wrench: Wrench,
  zap: Zap,
  circle: Circle,
  square: Square,
  heart: Heart,
  'message-square': MessageSquare,
  bell: Bell,
  calendar: Calendar,
  clock: Clock,
  cpu: Cpu,
  flame: Flame,
  globe2: Globe2,
  'help-circle': HelpCircle,
  key: Key,
  'life-buoy': LifeBuoy,
  list: List,
  map: Map,
  microscope: Microscope,
  monitor: Monitor,
  puzzle: Puzzle,
  'refresh-cw': RefreshCw,
  repeat: Repeat,
  shuffle: Shuffle,
  sliders: Sliders,
  smartphone: Smartphone,
  sword: Sword,
  table: Table,
  'thumbs-up': ThumbsUp,
  ticket: Ticket,
  trash: Trash,
  trophy: Trophy,
  truck: Truck,
  unlink: Unlink,
  user: User,
  wifi: Wifi,
};

const ALL_ICON_KEYS = Object.keys(ICON_MAP);

// ── MtIconPreview ───────────────────────────────────────────────────────────

export function MtIconPreview({
  name,
  size = 16,
  className,
  color,
}: {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}) {
  const Icon = ICON_MAP[name];
  const iconNode = Icon ? <Icon size={size} className={className} /> : <Circle size={size} className={className} />;

  if (!color) {
    return iconNode;
  }

  return <span style={{ color }}>{iconNode}</span>;
}

// ── MtIconSelect ────────────────────────────────────────────────────────────

export type MtIconSelectProps = {
  value?: string;
  onChange: (value: string) => void;
  /** Size of the icon in the trigger button */
  size?: number;
  placeholder?: React.ReactNode;
};

export function MtIconSelect({ value, onChange, size = 16, placeholder }: MtIconSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return ALL_ICON_KEYS;
    return ALL_ICON_KEYS.filter((k) => k.includes(q));
  }, [query]);

  const handleSelect = (key: string) => {
    onChange(key);
    setOpen(false);
    setQuery('');
  };

  const trigger = (
    <button
      type="button"
      className="flex h-7 w-7 items-center justify-center rounded border border-border-default bg-surface-default hover:bg-surface-hover text-text-primary transition-colors"
      aria-label={value ? `Icon: ${value}` : 'Select icon'}
    >
      {value ? <MtIconPreview name={value} size={size} /> : (placeholder ?? <Circle size={size} />)}
    </button>
  );

  const content = (
    <div className="flex flex-col gap-2" style={{ width: '280px' }}>
      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          autoFocus
          type="text"
          placeholder="Search icons…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded border border-border-default bg-surface-default py-1.5 pl-7 pr-2 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-border-focus"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-8 gap-0.5 max-h-48 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="col-span-8 py-4 text-center text-xs text-text-muted">No icons found</div>
        ) : (
          filtered.map((key) => {
            const Icon = ICON_MAP[key]!;
            const isSelected = value === key;
            return (
              <button
                key={key}
                type="button"
                title={key}
                onClick={() => handleSelect(key)}
                className={`flex items-center justify-center rounded p-1.5 transition-colors ${
                  isSelected
                    ? 'bg-accent-primary/20 text-accent-primary'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                <Icon size={16} />
              </button>
            );
          })
        )}
      </div>

      {/* Footer label */}
      {value && (
        <div className="border-t border-border-default pt-1.5 text-xs text-text-muted">
          Selected: <span className="text-text-primary font-medium">{value}</span>
        </div>
      )}
    </div>
  );

  return (
    <MtPopover open={open} onOpenChange={setOpen} content={content} side="bottom" align="start">
      {trigger}
    </MtPopover>
  );
}
