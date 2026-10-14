import { FileItem, RenameConfig } from '../types';
import { formatDate, splitFilename } from './fileUtils';

function applyCasing(text: string, casing: RenameConfig['textCase']): string {
  if (!text) return text;
  switch (casing) {
    case 'lowercase':
      return text.toLowerCase();
    case 'uppercase':
      return text.toUpperCase();
    case 'title':
      return text
        .toLowerCase()
        .replace(/(?:^|\s|\b|-|_)([a-záéíóúüñ])/g, (match) => match.toUpperCase());
    case 'camel': {
      const words = text
        .replace(/[-_]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
      return words
        .map((w, i) =>
          i === 0
            ? w.toLowerCase()
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        )
        .join('');
    }
    case 'snake':
      return text
        .trim()
        .replace(/\s+/g, '_')
        .replace(/-+/g, '_')
        .toLowerCase();
    case 'kebab':
      return text
        .trim()
        .replace(/\s+/g, '-')
        .replace(/_+/g, '-')
        .toLowerCase();
    case 'unchanged':
    default:
      return text;
  }
}

function applyCharacterCleanups(text: string, config: RenameConfig): string {
  let result = text;

  if (config.removeAccents) {
    result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  if (config.removeSpecialChars) {
    // Keep letters, digits, spaces, dots, underscores, and hyphens
    result = result.replace(/[^a-zA-Z0-9\s._-]/g, '');
  }

  if (config.spaceOption === 'underscore') {
    result = result.replace(/\s+/g, '_');
  } else if (config.spaceOption === 'hyphen') {
    result = result.replace(/\s+/g, '-');
  } else if (config.spaceOption === 'remove') {
    result = result.replace(/\s+/g, '');
  } else if (config.spaceOption === 'single_space') {
    result = result.replace(/\s+/g, ' ');
  }

  if (config.trimSpaces) {
    result = result.trim();
  }

  return result;
}

function applyFindAndReplace(text: string, config: RenameConfig): string {
  if (!config.findText) return text;

  try {
    if (config.useRegex) {
      let flags = '';
      if (config.replaceAll) flags += 'g';
      if (!config.matchCase) flags += 'i';
      const regex = new RegExp(config.findText, flags);
      return text.replace(regex, config.replaceText || '');
    } else {
      if (config.replaceAll) {
        const escaped = config.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const flags = config.matchCase ? 'g' : 'gi';
        const regex = new RegExp(escaped, flags);
        return text.replace(regex, config.replaceText || '');
      } else {
        if (!config.matchCase) {
          const escaped = config.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escaped, 'i');
          return text.replace(regex, config.replaceText || '');
        }
        return text.replace(config.findText, config.replaceText || '');
      }
    }
  } catch {
    // Return original if invalid regex
    return text;
  }
}

export function generateNewFilename(
  item: FileItem,
  index: number,
  config: RenameConfig,
  totalCount: number = 0
): string {
  const { name: originalBase, extension: originalExt } = splitFilename(item.originalName);

  // 1. Determine base name
  let baseName = '';
  if (config.baseNameOption === 'original') {
    baseName = originalBase;
  } else if (config.baseNameOption === 'custom') {
    baseName = config.customBaseName || '';
  } else {
    baseName = '';
  }

  // 2. Find and replace on base name
  baseName = applyFindAndReplace(baseName, config);

  // 3. Cleanups and Casing
  baseName = applyCharacterCleanups(baseName, config);
  baseName = applyCasing(baseName, config.textCase);

  // 4. Prefix & Suffix
  let prefix = config.prefix || '';
  let suffix = config.suffix || '';

  prefix = applyCharacterCleanups(prefix, config);
  suffix = applyCharacterCleanups(suffix, config);

  // 5. Generate Numbering
  let numberStr = '';
  if (config.enableNumbering) {
    const num = config.numberStart + index * config.numberStep;
    const maxProjected = config.numberStart + Math.max(0, totalCount - 1) * config.numberStep;
    const neededDigits = totalCount > 0 ? String(maxProjected).length : 1;
    const padding = Math.max(config.numberPadding, neededDigits);
    const padded = Math.abs(num).toString().padStart(padding, '0');
    numberStr = num < 0 ? `-${padded}` : padded;
  }

  // 6. Generate Date String
  let dateStr = '';
  if (config.enableDate) {
    const timestamp =
      config.dateSource === 'file_modified' ? item.lastModified : Date.now();
    dateStr = formatDate(timestamp, config.dateFormat);
  }

  // 7. Compose final name according to positions
  let composed = baseName;

  // Insert date
  if (dateStr) {
    const sep = config.dateSeparator || '_';
    if (config.datePosition === 'prefix') {
      composed = composed ? `${dateStr}${sep}${composed}` : dateStr;
    } else if (config.datePosition === 'suffix') {
      composed = composed ? `${composed}${sep}${dateStr}` : dateStr;
    } else if (config.datePosition === 'after_base') {
      composed = composed ? `${composed}${sep}${dateStr}` : dateStr;
    }
  }

  // Insert numbering
  if (numberStr) {
    const sep = config.numberSeparator || '_';
    if (config.numberPosition === 'start') {
      composed = composed ? `${numberStr}${sep}${composed}` : numberStr;
    } else if (config.numberPosition === 'end' || config.numberPosition === 'before_ext') {
      composed = composed ? `${composed}${sep}${numberStr}` : numberStr;
    } else if (config.numberPosition === 'after_base') {
      composed = composed ? `${composed}${sep}${numberStr}` : numberStr;
    }
  }

  // Add prefix and suffix
  if (prefix) {
    composed = `${prefix}${composed}`;
  }
  if (suffix) {
    composed = `${composed}${suffix}`;
  }

  // Fallback if empty
  if (!composed) {
    composed = `file_${index + 1}`;
  }

  // 8. Handle Extension
  let ext = originalExt;
  if (config.extensionCase === 'lowercase') {
    ext = ext.toLowerCase();
  } else if (config.extensionCase === 'uppercase') {
    ext = ext.toUpperCase();
  }

  return `${composed}${ext}`;
}

export function computeRenamedItems(
  items: FileItem[],
  config: RenameConfig
): FileItem[] {
  const nameOccurrences = new Map<string, number>();

  const renamed = items.map((item, index) => {
    const newName = generateNewFilename(item, index, config, items.length);
    nameOccurrences.set(newName, (nameOccurrences.get(newName) || 0) + 1);
    return {
      ...item,
      newName,
    };
  });

  // Mark duplicates
  return renamed.map((item) => ({
    ...item,
    hasConflict: (nameOccurrences.get(item.newName || '') || 0) > 1,
  }));
}
