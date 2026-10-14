import React, { useState } from 'react';
import { 
  BookmarkCheck, 
  X, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles,
  Sliders,
  FolderSync
} from 'lucide-react';
import { Preset, RenameConfig } from '../types';
import { 
  BUILT_IN_PRESETS, 
  getCustomPresets, 
  saveCustomPreset, 
  deleteCustomPreset 
} from '../utils/presets';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRenameConfig: RenameConfig;
  currentInterleaveEnabled: boolean;
  onApplyPreset: (preset: Preset) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  currentRenameConfig,
  currentInterleaveEnabled,
  onApplyPreset,
}) => {
  const [customPresets, setCustomPresets] = useState<Preset[]>(getCustomPresets());
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');

  if (!isOpen) return null;

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const created = saveCustomPreset({
      name: newPresetName.trim(),
      description: newPresetDesc.trim() || 'Plantilla personalizada guardada por el usuario.',
      renameConfig: currentRenameConfig,
      interleaveEnabled: currentInterleaveEnabled,
    });

    setCustomPresets(getCustomPresets());
    setNewPresetName('');
    setNewPresetDesc('');
    setShowSaveForm(false);
  };

  const handleDelete = (id: string) => {
    deleteCustomPreset(id);
    setCustomPresets(getCustomPresets());
  };

  const handleSelect = (preset: Preset) => {
    onApplyPreset(preset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Plantillas de Configuración
              </h3>
              <p className="text-xs text-slate-400">
                Aplica ajustes predefinidos o guarda tus fórmulas favoritas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Button / Form */}
        {!showSaveForm ? (
          <button
            type="button"
            onClick={() => setShowSaveForm(true)}
            className="w-full py-2 px-3 bg-slate-800/80 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Guardar configuración actual como nueva plantilla</span>
          </button>
        ) : (
          <form onSubmit={handleSaveCurrent} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-200">
              Guardar configuración actual
            </div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Nombre de la plantilla (ej. Mis Fotos Viaje, DJ Sets A/B)"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                autoFocus
                required
              />
              <input
                type="text"
                placeholder="Descripción opcional"
                value={newPresetDesc}
                onChange={(e) => setNewPresetDesc(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowSaveForm(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
              >
                Guardar
              </button>
            </div>
          </form>
        )}

        {/* Presets List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* Custom Presets */}
          {customPresets.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-1">
                Tus Plantillas Guardadas
              </span>
              <div className="space-y-2">
                {customPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-3 bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-100">
                          {preset.name}
                        </span>
                        {preset.interleaveEnabled && (
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded">
                            Intercalado
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {preset.description}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelect(preset)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Cargar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(preset.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/20 transition-colors"
                        title="Eliminar plantilla"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Built-in Presets */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-1">
              Plantillas Predeterminadas
            </span>
            <div className="space-y-2">
              {BUILT_IN_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className="p-3 bg-slate-950/50 hover:bg-slate-800/40 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-200">
                        {preset.name}
                      </span>
                      {preset.interleaveEnabled && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded">
                          Intercalado
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {preset.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelect(preset)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Usar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
