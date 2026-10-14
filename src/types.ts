export type SortField = 'name' | 'date' | 'size' | 'manual';
export type SortDirection = 'asc' | 'desc';

export interface FileItem {
  id: string;
  file: File;
  originalName: string;
  extension: string;
  size: number;
  lastModified: number;
  groupId: string;
  manualOrder: number;
  newName?: string;
  hasConflict?: boolean;
  isRepeated?: boolean;
  repeatCycle?: number;
  isPrimaryGroup?: boolean;
}

export interface FileGroup {
  id: string;
  name: string;
  color: string;
  sortField: SortField;
  sortDirection: SortDirection;
}

export type BaseNameOption = 'original' | 'custom' | 'empty';
export type NumberPosition = 'start' | 'end' | 'after_base' | 'before_ext';
export type DateSource = 'current' | 'file_modified';
export type DateFormat = 'YYYY-MM-DD' | 'YYYYMMDD' | 'YYYY-MM-DD_HHmm' | 'DD-MM-YYYY' | 'YYYY';
export type DatePosition = 'prefix' | 'suffix' | 'after_base';
export type CaseOption = 'unchanged' | 'lowercase' | 'uppercase' | 'title' | 'camel' | 'snake' | 'kebab';
export type SpaceOption = 'unchanged' | 'underscore' | 'hyphen' | 'remove' | 'single_space';

export interface RenameConfig {
  baseNameOption: BaseNameOption;
  customBaseName: string;
  prefix: string;
  suffix: string;

  // Numbering
  enableNumbering: boolean;
  numberStart: number;
  numberStep: number;
  numberPadding: number; // e.g., 3 => 001, 002
  numberPosition: NumberPosition;
  numberSeparator: string;

  // Date & Time
  enableDate: boolean;
  dateSource: DateSource;
  dateFormat: DateFormat;
  datePosition: DatePosition;
  dateSeparator: string;

  // Find & Replace
  findText: string;
  replaceText: string;
  matchCase: boolean;
  useRegex: boolean;
  replaceAll: boolean;

  // Character Cleanups
  textCase: CaseOption;
  spaceOption: SpaceOption;
  removeSpecialChars: boolean;
  removeAccents: boolean;
  trimSpaces: boolean;

  // Extension
  extensionCase: 'unchanged' | 'lowercase' | 'uppercase';
}

export type InterleavePattern = 'primary_pivot' | 'round_robin';

export interface InterleaveConfig {
  enabled: boolean;
  pattern: InterleavePattern; // 'primary_pivot' = Principal intercalada entre cada una | 'round_robin' = Secuencia continua A->B->C
  primaryGroupId: string; // ID de la carpeta designada como principal
  cycleOrder: string[]; // array de groupIds secundarias o ciclo
  repeatSmallerGroups: boolean; // si es true, repite en bucle para emparejar
  primaryPosition: 'before' | 'after'; // si la principal va antes (P, B, P, C...) o después (B, P, C, P...)
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  isBuiltIn?: boolean;
  renameConfig: RenameConfig;
  interleaveEnabled: boolean;
}
