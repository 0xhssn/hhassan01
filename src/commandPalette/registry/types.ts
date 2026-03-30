// ─── Command Palette Types ────────────────────────────────────────────────────

export type CommandCategory =
  | 'navigation'
  | 'actions'
  | 'settings'
  | 'theme'
  | 'editor'
  | 'search'
  | 'help'
  | string;

export interface KeyboardShortcut {
  /** The primary key (e.g. "k", "p", "Enter") */
  key: string;
  /** Whether the Ctrl / Cmd modifier is required */
  ctrlOrCmd?: boolean;
  /** Whether the Alt / Option modifier is required */
  alt?: boolean;
  /** Whether the Shift modifier is required */
  shift?: boolean;
}

export interface Command {
  /** Unique identifier for the command */
  id: string;
  /** Human-readable label shown in the palette */
  label: string;
  /** Optional description shown below the label */
  description?: string;
  /** Category used for grouping results */
  category: CommandCategory;
  /** Optional icon node rendered beside the label */
  icon?: React.ReactNode;
  /** Optional keyboard shortcut for this command */
  shortcut?: KeyboardShortcut;
  /** Keywords to improve search relevance (not displayed) */
  keywords?: string[];
  /** Function called when the command is executed */
  handler: () => void | Promise<void>;
  /** Whether the command should be hidden from results */
  hidden?: boolean;
  /** Whether the command is currently disabled */
  disabled?: boolean;
}

export interface CommandGroup {
  category: CommandCategory;
  label: string;
  commands: Command[];
}

export interface SearchResult {
  command: Command;
  /** 0–1 relevance score; higher = better match */
  score: number;
  /** Indices of matched characters in the label for highlighting */
  matchIndices: number[];
}
