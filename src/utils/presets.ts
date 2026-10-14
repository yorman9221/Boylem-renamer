import { Preset, RenameConfig } from '../types';

export const DEFAULT_RENAME_CONFIG: RenameConfig = {
  baseNameOption: 'original',
  customBaseName: '',
  prefix: '',
  suffix: '',

  // Numbering
  enableNumbering: true,
  numberStart: 1,
  numberStep: 1,
  numberPadding: 3,
  numberPosition: 'start',
  numberSeparator: '_',

  // Date
  enableDate: false,
  dateSource: 'current',
  dateFormat: 'YYYY-MM-DD',
  datePosition: 'prefix',
  dateSeparator: '_',

  // Find & Replace
  findText: '',
  replaceText: '',
  matchCase: false,
  useRegex: false,
  replaceAll: true,

  // Character Cleanups
  textCase: 'unchanged',
  spaceOption: 'unchanged',
  removeSpecialChars: false,
  removeAccents: false,
  trimSpaces: true,

  // Extension
  extensionCase: 'lowercase',
};

export const BUILT_IN_PRESETS: Preset[] = [
  {
    id: 'preset-radio-primary-pivot',
    name: 'Carpeta Principal Intercalada (Radio / Jingles / Separadores)',
    description: 'Alterna una carpeta principal (como Jingles, intros o separadores) entre cada archivo de las demás carpetas musicales.',
    isBuiltIn: true,
    interleaveEnabled: true,
    renameConfig: {
      ...DEFAULT_RENAME_CONFIG,
      baseNameOption: 'original',
      enableNumbering: true,
      numberStart: 1,
      numberStep: 1,
      numberPadding: 3,
      numberPosition: 'start',
      numberSeparator: '_',
      trimSpaces: true,
      extensionCase: 'lowercase',
    },
  },
  {
    id: 'preset-interleave-dj',
    name: 'Intercalado Dinámico (A1, B1, A2, B2...)',
    description: 'Ideal para mezclar tracks, listas de audio o turnos alternados entre 2 o más carpetas.',
    isBuiltIn: true,
    interleaveEnabled: true,
    renameConfig: {
      ...DEFAULT_RENAME_CONFIG,
      baseNameOption: 'original',
      enableNumbering: true,
      numberStart: 1,
      numberStep: 1,
      numberPadding: 3,
      numberPosition: 'start',
      numberSeparator: '_',
      trimSpaces: true,
      extensionCase: 'lowercase',
    },
  },
  {
    id: 'preset-photos-date',
    name: 'Fotografías Cronológicas (YYYYMMDD_001)',
    description: 'Usa la fecha de captura/modificación del archivo y añade contador con ceros a la izquierda.',
    isBuiltIn: true,
    interleaveEnabled: false,
    renameConfig: {
      ...DEFAULT_RENAME_CONFIG,
      baseNameOption: 'custom',
      customBaseName: 'Foto',
      prefix: '',
      suffix: '',
      enableDate: true,
      dateSource: 'file_modified',
      dateFormat: 'YYYYMMDD',
      datePosition: 'prefix',
      dateSeparator: '_',
      enableNumbering: true,
      numberStart: 1,
      numberStep: 1,
      numberPadding: 3,
      numberPosition: 'end',
      numberSeparator: '_',
      extensionCase: 'lowercase',
    },
  },
  {
    id: 'preset-web-clean',
    name: 'Limpieza Web & SEO (minúsculas, kebab-case)',
    description: 'Elimina tildes y caracteres especiales, convierte a minúsculas y reemplaza espacios por guiones.',
    isBuiltIn: true,
    interleaveEnabled: false,
    renameConfig: {
      ...DEFAULT_RENAME_CONFIG,
      baseNameOption: 'original',
      enableNumbering: false,
      textCase: 'kebab',
      spaceOption: 'hyphen',
      removeSpecialChars: true,
      removeAccents: true,
      trimSpaces: true,
      extensionCase: 'lowercase',
    },
  },
  {
    id: 'preset-podcasts-audio',
    name: 'Episodios y Series (Capitulo_001)',
    description: 'Estructura uniforme para episodios de podcasts, audiolibros o series.',
    isBuiltIn: true,
    interleaveEnabled: false,
    renameConfig: {
      ...DEFAULT_RENAME_CONFIG,
      baseNameOption: 'custom',
      customBaseName: 'Episodio',
      enableNumbering: true,
      numberStart: 1,
      numberStep: 1,
      numberPadding: 3,
      numberPosition: 'after_base',
      numberSeparator: '_',
      extensionCase: 'lowercase',
    },
  },
  {
    id: 'preset-simple-prefix',
    name: 'Solo Prefijo + Nombre Original',
    description: 'Agrega un prefijo a todos los archivos conservando su nombre original.',
    isBuiltIn: true,
    interleaveEnabled: false,
    renameConfig: {
      ...DEFAULT_RENAME_CONFIG,
      baseNameOption: 'original',
      prefix: 'DOC_',
      enableNumbering: false,
      extensionCase: 'unchanged',
    },
  },
];

const LOCAL_STORAGE_PRESETS_KEY = 'batch_renamer_presets_v1';

export function getCustomPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRESETS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Preset[];
  } catch {
    return [];
  }
}

export function saveCustomPreset(preset: Omit<Preset, 'id'>): Preset {
  const customPresets = getCustomPresets();
  const newPreset: Preset = {
    ...preset,
    id: `preset_custom_${Date.now()}`,
    isBuiltIn: false,
  };
  const updated = [newPreset, ...customPresets];
  try {
    localStorage.setItem(LOCAL_STORAGE_PRESETS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving preset to localStorage', e);
  }
  return newPreset;
}

export function deleteCustomPreset(id: string): void {
  const customPresets = getCustomPresets();
  const updated = customPresets.filter((p) => p.id !== id);
  try {
    localStorage.setItem(LOCAL_STORAGE_PRESETS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting preset', e);
  }
}
