export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDate(timestamp: number, format: string = 'YYYY-MM-DD HH:mm'): string {
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '';

  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear().toString();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'YYYYMMDD':
      return `${year}${month}${day}`;
    case 'YYYY-MM-DD_HHmm':
      return `${year}-${month}-${day}_${hours}${minutes}`;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    case 'YYYY':
      return year;
    case 'YYYY-MM-DD HH:mm':
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}

export function splitFilename(fullName: string): { name: string; extension: string } {
  const lastDotIndex = fullName.lastIndexOf('.');
  if (lastDotIndex <= 0) {
    return { name: fullName, extension: '' };
  }
  return {
    name: fullName.slice(0, lastDotIndex),
    extension: fullName.slice(lastDotIndex),
  };
}

export type FileCategory = 'audio' | 'video' | 'image' | 'document' | 'archive' | 'code' | 'other';

export function getFileCategory(extension: string): FileCategory {
  const ext = extension.toLowerCase().replace('.', '');
  
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'aiff'].includes(ext)) {
    return 'audio';
  }
  if (['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v'].includes(ext)) {
    return 'video';
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico', 'heic'].includes(ext)) {
    return 'image';
  }
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv', 'odt'].includes(ext)) {
    return 'document';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
    return 'archive';
  }
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'java', 'cpp', 'c', 'php', 'sql', 'xml'].includes(ext)) {
    return 'code';
  }
  return 'other';
}

export interface ExtractedDropItem {
  file: File;
  folderName?: string;
  relativePath?: string;
}

// Recursively traverse webkit directory entries if dragged
export async function getFilesFromDataTransferItems(
  items: DataTransferItemList
): Promise<ExtractedDropItem[]> {
  const results: ExtractedDropItem[] = [];

  const readEntry = async (entry: FileSystemEntry, folderName?: string, path = ''): Promise<void> => {
    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry;
      await new Promise<void>((resolve) => {
        fileEntry.file(
          (file) => {
            results.push({
              file,
              folderName,
              relativePath: path ? `${path}/${file.name}` : file.name,
            });
            resolve();
          },
          () => resolve()
        );
      });
    } else if (entry.isDirectory) {
      const dirEntry = entry as FileSystemDirectoryEntry;
      const currentFolderName = folderName || dirEntry.name;
      const reader = dirEntry.createReader();

      const readAllEntries = async (): Promise<FileSystemEntry[]> => {
        const batch: FileSystemEntry[] = [];
        let done = false;
        while (!done) {
          const entries: FileSystemEntry[] = await new Promise((resolve) => {
            reader.readEntries(
              (res) => resolve(res),
              () => resolve([])
            );
          });
          if (entries.length === 0) {
            done = true;
          } else {
            batch.push(...entries);
          }
        }
        return batch;
      };

      const entries = await readAllEntries();
      for (const child of entries) {
        await readEntry(child, currentFolderName, path ? `${path}/${dirEntry.name}` : dirEntry.name);
      }
    }
  };

  const promises: Promise<void>[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry?.();
      if (entry) {
        promises.push(readEntry(entry));
      } else {
        const file = item.getAsFile();
        if (file) {
          results.push({ file });
        }
      }
    }
  }

  await Promise.all(promises);
  return results;
}
