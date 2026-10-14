import React, { useState } from 'react';
import { 
  Type, 
  Hash, 
  Calendar, 
  Search, 
  Sparkles, 
  FileCode2,
  Sliders,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { 
  BaseNameOption, 
  CaseOption, 
  DateFormat, 
  DatePosition, 
  DateSource, 
  NumberPosition, 
  RenameConfig, 
  SpaceOption 
} from '../types';

interface RenameConfigPanelProps {
  config: RenameConfig;
  onChange: (updated: Partial<RenameConfig>) => void;
  samplePreviewName?: string;
  onReset?: () => void;
}

export const RenameConfigPanel: React.FC<RenameConfigPanelProps> = ({
  config,
  onChange,
  samplePreviewName,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'base' | 'numbering' | 'date' | 'replace' | 'cleanup'>('base');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header with live sample badge and Limpiar Reglas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Reglas de Renombrado en Lote
          </h3>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap">
          {samplePreviewName && (
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 max-w-full truncate">
              <span className="shrink-0 text-slate-500">Ejemplo:</span>
              <code className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-indigo-300 font-mono truncate max-w-xs">
                {samplePreviewName}
              </code>
            </div>
          )}

          {onReset && (
            <button
              type="button"
              id="btn-panel-reset-rules"
              onClick={onReset}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
              title="Limpiar todas las reglas y volver a nombres originales"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Limpiar Reglas</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/80">
        <button
          type="button"
          onClick={() => setActiveTab('base')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'base'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Estructura Base</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('numbering')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'numbering'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          <span>Numeración</span>
          {config.enableNumbering && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('date')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'date'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Fecha y Hora</span>
          {config.enableDate && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('replace')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'replace'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Buscar y Reemplazar</span>
          {config.findText && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cleanup')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'cleanup'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Limpieza y Formato</span>
          {(config.removeAccents || config.removeSpecialChars || config.textCase !== 'unchanged') && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
          )}
        </button>
      </div>

      {/* Tab 1: Estructura Base (Nombre, Prefijo, Sufijo) */}
      {activeTab === 'base' && (
        <div className="space-y-4 pt-1">
          {/* Base Name option */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Nombre base del archivo:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onChange({ baseNameOption: 'original' })}
                className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-colors cursor-pointer ${
                  config.baseNameOption === 'original'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Conservar original
              </button>
              <button
                type="button"
                onClick={() => onChange({ baseNameOption: 'custom' })}
                className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-colors cursor-pointer ${
                  config.baseNameOption === 'custom'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Texto nuevo
              </button>
              <button
                type="button"
                onClick={() => onChange({ baseNameOption: 'empty' })}
                className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-colors cursor-pointer ${
                  config.baseNameOption === 'empty'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Vacío (solo número/fecha)
              </button>
            </div>

            {config.baseNameOption === 'custom' && (
              <div className="pt-1">
                <input
                  type="text"
                  placeholder="Escribe el nombre base (ej. Pista, Documento, Video)"
                  value={config.customBaseName}
                  onChange={(e) => onChange({ customBaseName: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Prefix & Suffix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Prefijo (al principio):
              </label>
              <input
                type="text"
                placeholder="Ej. PRE_ o [Final]_"
                value={config.prefix}
                onChange={(e) => onChange({ prefix: e.target.value })}
                className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Sufijo (al final, antes de extensión):
              </label>
              <input
                type="text"
                placeholder="Ej. _editado o _v2"
                value={config.suffix}
                onChange={(e) => onChange({ suffix: e.target.value })}
                className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Extension settings */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs text-slate-300">
              <FileCode2 className="w-4 h-4 text-slate-400" />
              <span>Extensión de archivo:</span>
            </div>
            <select
              value={config.extensionCase}
              onChange={(e) =>
                onChange({ extensionCase: e.target.value as 'unchanged' | 'lowercase' | 'uppercase' })
              }
              className="bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="lowercase">Forzar minúsculas (.mp3, .jpg)</option>
              <option value="uppercase">Forzar MAYÚSCULAS (.MP3, .JPG)</option>
              <option value="unchanged">Conservar original</option>
            </select>
          </div>
        </div>
      )}

      {/* Tab 2: Numeración Consecutiva */}
      {activeTab === 'numbering' && (
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200">
                Habilitar numeración automática
              </span>
              <p className="text-[11px] text-slate-400">
                Agrega números consecutivos con ceros a la izquierda (001, 002, 003...)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableNumbering}
                onChange={(e) => onChange({ enableNumbering: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {config.enableNumbering && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Número Inicial:</label>
                  <input
                    type="number"
                    value={config.numberStart}
                    onChange={(e) => onChange({ numberStart: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Incremento / Paso:</label>
                  <input
                    type="number"
                    min="1"
                    value={config.numberStep}
                    onChange={(e) => onChange({ numberStep: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Ceros a la izquierda:</label>
                  <select
                    value={config.numberPadding}
                    onChange={(e) => onChange({ numberPadding: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value={1}>Sin ceros (1, 2, 3...)</option>
                    <option value={2}>2 dígitos (01, 02, 03...)</option>
                    <option value={3}>3 dígitos (001, 002, 003...)</option>
                    <option value={4}>4 dígitos (0001, 0002...)</option>
                    <option value={5}>5 dígitos (00001, 00002...)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Posición del número:</label>
                  <select
                    value={config.numberPosition}
                    onChange={(e) =>
                      onChange({ numberPosition: e.target.value as NumberPosition })
                    }
                    className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="start">Al inicio (ej. 001_Pista)</option>
                    <option value="end">Al final (ej. Pista_001)</option>
                    <option value="after_base">Después del nombre base</option>
                    <option value="before_ext">Antes de la extensión</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Separador:</label>
                  <select
                    value={config.numberSeparator}
                    onChange={(e) => onChange({ numberSeparator: e.target.value })}
                    className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="_">Guion bajo ( _ )</option>
                    <option value="-">Guion medio ( - )</option>
                    <option value=" ">Espacio ( &nbsp; )</option>
                    <option value=".">Punto ( . )</option>
                    <option value="">Sin separador</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Fecha y Hora */}
      {activeTab === 'date' && (
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200">
                Incluir fecha y hora
              </span>
              <p className="text-[11px] text-slate-400">
                Añade fecha actual o fecha original de modificación del archivo
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableDate}
                onChange={(e) => onChange({ enableDate: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {config.enableDate && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Origen de la fecha:</label>
                  <select
                    value={config.dateSource}
                    onChange={(e) => onChange({ dateSource: e.target.value as DateSource })}
                    className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="file_modified">Fecha de modificación del archivo</option>
                    <option value="current">Fecha y hora actual</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Formato:</label>
                  <select
                    value={config.dateFormat}
                    onChange={(e) => onChange({ dateFormat: e.target.value as DateFormat })}
                    className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2026-09-19)</option>
                    <option value="YYYYMMDD">YYYYMMDD (20260919)</option>
                    <option value="YYYY-MM-DD_HHmm">YYYY-MM-DD_HHmm (2026-09-19_1430)</option>
                    <option value="DD-MM-YYYY">DD-MM-YYYY (19-09-2026)</option>
                    <option value="YYYY">Solo Año YYYY (2026)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Posición de la fecha:</label>
                  <select
                    value={config.datePosition}
                    onChange={(e) => onChange({ datePosition: e.target.value as DatePosition })}
                    className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="prefix">Al principio (prefijo)</option>
                    <option value="suffix">Al final (sufijo)</option>
                    <option value="after_base">Después del nombre base</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Separador:</label>
                  <select
                    value={config.dateSeparator}
                    onChange={(e) => onChange({ dateSeparator: e.target.value })}
                    className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="_">Guion bajo ( _ )</option>
                    <option value="-">Guion medio ( - )</option>
                    <option value=" ">Espacio</option>
                    <option value="">Sin separador</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Buscar y Reemplazar */}
      {activeTab === 'replace' && (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Texto a buscar:
              </label>
              <input
                type="text"
                placeholder="Ej. copia, IMG_, borrador..."
                value={config.findText}
                onChange={(e) => onChange({ findText: e.target.value })}
                className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Reemplazar con:
              </label>
              <input
                type="text"
                placeholder="Dejar vacío para eliminar el texto buscado"
                value={config.replaceText}
                onChange={(e) => onChange({ replaceText: e.target.value })}
                className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.matchCase}
                onChange={(e) => onChange({ matchCase: e.target.checked })}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>Coincidir mayúsculas / minúsculas</span>
            </label>

            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.useRegex}
                onChange={(e) => onChange({ useRegex: e.target.checked })}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>Expresión regular (Regex)</span>
            </label>

            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.replaceAll}
                onChange={(e) => onChange({ replaceAll: e.target.checked })}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>Reemplazar todas las apariciones</span>
            </label>
          </div>

          {(config.findText || config.replaceText) && (
            <div className="pt-2 border-t border-slate-800/80 flex justify-end">
              <button
                type="button"
                onClick={() => onChange({ findText: '', replaceText: '' })}
                className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
              >
                Limpiar campos de búsqueda
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Limpieza y Formato (Mayúsculas, Caracteres especiales, Espacios) */}
      {activeTab === 'cleanup' && (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Conversión de mayúsculas / minúsculas:
              </label>
              <select
                value={config.textCase}
                onChange={(e) => onChange({ textCase: e.target.value as CaseOption })}
                className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="unchanged">Sin cambios (conservar original)</option>
                <option value="lowercase">minúsculas (todo en minúsculas)</option>
                <option value="uppercase">MAYÚSCULAS (TODO EN MAYÚSCULAS)</option>
                <option value="title">Title Case (Primera Letra De Cada Palabra)</option>
                <option value="camel">camelCase (formatoDesarrollador)</option>
                <option value="snake">snake_case (separado_por_guion_bajo)</option>
                <option value="kebab">kebab-case (separado-por-guion-medio)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Manejo de espacios:
              </label>
              <select
                value={config.spaceOption}
                onChange={(e) => onChange({ spaceOption: e.target.value as SpaceOption })}
                className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="unchanged">Sin cambios</option>
                <option value="underscore">Reemplazar por guion bajo (_)</option>
                <option value="hyphen">Reemplazar por guion medio (-)</option>
                <option value="remove">Eliminar todos los espacios</option>
                <option value="single_space">Normalizar a un solo espacio</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-4">
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.removeSpecialChars}
                onChange={(e) => onChange({ removeSpecialChars: e.target.checked })}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>Eliminar caracteres especiales (!@#$%/ etc.)</span>
            </label>

            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.removeAccents}
                onChange={(e) => onChange({ removeAccents: e.target.checked })}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>Eliminar tildes y diacríticos (á, é, ñ → a, e, n)</span>
            </label>

            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.trimSpaces}
                onChange={(e) => onChange({ trimSpaces: e.target.checked })}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>Recortar espacios en blanco al inicio y final</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
