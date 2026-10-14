import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  FolderPlus, 
  FilePlus, 
  FolderSync, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { getFilesFromDataTransferItems } from '../utils/fileUtils';
import { FileGroup } from '../types';

interface DropZoneProps {
  onFilesAdded: (rawFiles: { file: File; folderName?: string }[], targetGroupId?: string) => void;
  groups: FileGroup[];
  activeGroupId?: string;
  totalFiles: number;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesAdded,
  groups,
  activeGroupId,
  totalFiles,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [selectedTargetGroup, setSelectedTargetGroup] = useState<string>('auto');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!e.dataTransfer) return;

    setIsLoading(true);
    try {
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        const extracted = await getFilesFromDataTransferItems(e.dataTransfer.items);
        if (extracted.length > 0) {
          const targetId = selectedTargetGroup === 'auto' ? undefined : selectedTargetGroup;
          onFilesAdded(extracted, targetId);
        }
      } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files).map((f) => ({ file: f }));
        const targetId = selectedTargetGroup === 'auto' ? undefined : selectedTargetGroup;
        onFilesAdded(files, targetId);
      }
    } catch (err) {
      console.error('Error handling dropped files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).map((f) => ({ file: f }));
      const targetId = selectedTargetGroup === 'auto' ? undefined : selectedTargetGroup;
      onFilesAdded(files, targetId);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesWithFolders = Array.from(e.target.files).map((file) => {
        // webkitRelativePath looks like: folderName/subfolder/filename.ext
        const relPath = file.webkitRelativePath || '';
        const parts = relPath.split('/');
        const folderName = parts.length > 1 ? parts[0] : undefined;
        return {
          file,
          folderName,
        };
      });

      const targetId = selectedTargetGroup === 'auto' ? undefined : selectedTargetGroup;
      onFilesAdded(filesWithFolders, targetId);
    }
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        id="hidden-file-input"
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is standard in all modern browsers
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderChange}
        className="hidden"
        id="hidden-folder-input"
      />

      <div
        id="dropzone-container"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-indigo-400 bg-indigo-950/40 ring-4 ring-indigo-500/20'
            : 'border-slate-700 hover:border-slate-600 bg-slate-900/60'
        } ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <div className="flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform ${
              isDragging
                ? 'scale-110 bg-indigo-600 text-white shadow-lg shadow-indigo-500/40'
                : 'bg-slate-800 text-indigo-400 border border-slate-700'
            }`}
          >
            {isDragging ? (
              <FolderSync className="w-7 h-7 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-semibold text-slate-100">
              {isDragging
                ? '¡Suelta tus archivos o carpetas aquí!'
                : 'Arrastra y suelta tus archivos o carpetas aquí'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Soporta selección múltiple y detección automática de carpetas para intercalación (Grupo A, Grupo B...)
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              id="btn-upload-files"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs sm:text-sm font-medium rounded-xl shadow-md shadow-indigo-600/20 transition-colors cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              <span>Seleccionar Archivos</span>
            </button>

            <button
              type="button"
              id="btn-upload-folder"
              onClick={() => folderInputRef.current?.click()}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 hover:text-white text-xs sm:text-sm font-medium rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-emerald-400" />
              <span>Cargar Carpeta Completa</span>
            </button>
          </div>

          {/* Group destination picker if groups exist */}
          {groups.length > 1 && (
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <span>Destino de carga:</span>
              <select
                id="select-target-group"
                value={selectedTargetGroup}
                onChange={(e) => setSelectedTargetGroup(e.target.value)}
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="auto">Detección automática por carpeta o grupo activo</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {totalFiles > 0 && (
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-800/40">
              <FileCheck className="w-3.5 h-3.5" />
              <span>{totalFiles} archivos cargados actualmente en memoria</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
