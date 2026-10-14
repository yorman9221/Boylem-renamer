import React, { useState } from 'react';
import { 
  Download, 
  X, 
  Archive, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  FileArchive
} from 'lucide-react';
import { FileItem } from '../types';
import { formatFileSize } from '../utils/fileUtils';
import { exportFilesToZip, downloadBlob, getDefaultZipName, ZipProgress } from '../utils/zipExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: FileItem[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  items,
}) => {
  const [zipName, setZipName] = useState(getDefaultZipName());
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ZipProgress | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalBytes = items.reduce((acc, it) => acc + it.size, 0);

  const handleExport = async () => {
    setIsProcessing(true);
    setProgress({ percent: 0, currentFile: 'Iniciando compresión...', processedCount: 0, totalCount: items.length });
    setErrorMsg(null);
    setIsDone(false);

    try {
      const finalZipName = zipName.trim().endsWith('.zip') ? zipName.trim() : `${zipName.trim()}.zip`;
      const blob = await exportFilesToZip(items, finalZipName, (prog) => {
        setProgress(prog);
      });

      downloadBlob(blob, finalZipName);
      setIsDone(true);
    } catch (err: unknown) {
      console.error('Error generating ZIP:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido al generar el archivo ZIP.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setIsDone(false);
      setProgress(null);
      setErrorMsg(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Exportar Archivos en ZIP
              </h3>
              <p className="text-xs text-slate-400">
                {items.length} archivos preparados ({formatFileSize(totalBytes)})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isProcessing && !isDone && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Nombre del archivo ZIP de descarga:
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={zipName}
                  onChange={(e) => setZipName(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
              <div className="flex justify-between">
                <span>Total de archivos:</span>
                <strong className="text-slate-200">{items.length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Tamaño estimado sin comprimir:</span>
                <strong className="text-slate-200">{formatFileSize(totalBytes)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Privacidad:</span>
                <strong className="text-emerald-400">Procesado localmente en tu navegador</strong>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/30 border border-rose-800/50 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Progress State */}
        {isProcessing && progress && (
          <div className="space-y-4 py-3 text-center">
            <div className="flex items-center justify-center space-x-2 text-indigo-400 font-semibold text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generando archivo ZIP... {progress.percent}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2.5 rounded-full transition-all duration-150"
                style={{ width: `${progress.percent}%` }}
              />
            </div>

            <div className="text-[11px] font-mono text-slate-400 truncate max-w-xs mx-auto">
              {progress.currentFile}
            </div>
          </div>
        )}

        {/* Success State */}
        {isDone && (
          <div className="space-y-3 py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">
              ¡Descarga iniciada exitosamente!
            </h4>
            <p className="text-xs text-slate-400">
              El archivo ZIP con tus {items.length} archivos renombrados e intercalados ha sido empaquetado y descargado.
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
          {!isProcessing && !isDone && (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirm-export"
                onClick={handleExport}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Iniciar Descarga</span>
              </button>
            </>
          )}

          {isDone && (
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
            >
              Listo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
