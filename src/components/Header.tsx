import React from 'react';
import { 
  FolderSync, 
  ShieldCheck, 
  BookmarkCheck, 
  RotateCcw, 
  Sparkles,
  Layers,
  Trash2
} from 'lucide-react';

interface HeaderProps {
  onOpenPresets: () => void;
  onResetRenameConfig: () => void;
  onResetAll: () => void;
  totalFiles: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPresets,
  onResetRenameConfig,
  onResetAll,
  totalFiles,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <FolderSync className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                BoylemRenamer <span className="text-xs bg-indigo-500/20 text-indigo-300 font-medium px-2 py-0.5 rounded-full border border-indigo-500/30">Pro</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Renombrado masivo e intercalación automática de carpetas
            </p>
          </div>
        </div>

        {/* Privacy badge & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Local y Privado</span>
          </div>

          <button
            type="button"
            id="btn-open-presets"
            onClick={onOpenPresets}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Cargar o guardar plantillas de configuración"
          >
            <BookmarkCheck className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Plantillas</span>
          </button>

          <button
            type="button"
            id="btn-reset-rules"
            onClick={onResetRenameConfig}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
            title="Limpiar todas las reglas de renombrado y volver a nombres originales"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Limpiar Reglas</span>
          </button>

          {totalFiles > 0 && (
            <button
              type="button"
              id="btn-reset-all-files"
              onClick={onResetAll}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-white bg-rose-950/50 hover:bg-rose-900/70 border border-rose-800/60 rounded-lg transition-colors cursor-pointer"
              title="Vaciar y quitar todos los archivos cargados"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Vaciar ({totalFiles})</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
