import JSZip from 'jszip';
import { FileItem } from '../types';
import { formatDate } from './fileUtils';

export interface ZipProgress {
  percent: number;
  currentFile: string;
  processedCount: number;
  totalCount: number;
}

export async function exportFilesToZip(
  items: FileItem[],
  zipFilename: string = '',
  onProgress?: (progress: ZipProgress) => void
): Promise<Blob> {
  const zip = new JSZip();

  // Deduplicate target filenames within ZIP to avoid overwriting identical names
  const usedNames = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let finalName = (item.newName || item.originalName).trim();

    if (usedNames.has(finalName)) {
      const dotIndex = finalName.lastIndexOf('.');
      const base = dotIndex > 0 ? finalName.slice(0, dotIndex) : finalName;
      const ext = dotIndex > 0 ? finalName.slice(dotIndex) : '';
      let counter = 1;
      while (usedNames.has(`${base}_${counter}${ext}`)) {
        counter++;
      }
      finalName = `${base}_${counter}${ext}`;
    }
    usedNames.add(finalName);

    zip.file(finalName, item.file);

    if (onProgress) {
      onProgress({
        percent: Math.round(((i + 1) / items.length) * 50),
        currentFile: finalName,
        processedCount: i + 1,
        totalCount: items.length,
      });
    }
  }

  // Generate ZIP file with compression
  const blob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 5 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress({
          percent: 50 + Math.round(metadata.percent * 0.5),
          currentFile: metadata.currentFile || 'Comprimiendo...',
          processedCount: items.length,
          totalCount: items.length,
        });
      }
    }
  );

  return blob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

export function downloadSingleFile(item: FileItem): void {
  const name = item.newName || item.originalName;
  downloadBlob(item.file, name);
}

export function getDefaultZipName(): string {
  const dateStr = formatDate(Date.now(), 'YYYYMMDD_HHmm');
  return `boylemrenamer_${dateStr}.zip`;
}
