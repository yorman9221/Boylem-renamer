import React from 'react';
import { 
  Shuffle, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  Info, 
  Repeat, 
  Star, 
  Radio, 
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import { FileGroup, InterleaveConfig, InterleavePattern } from '../types';
import { GROUP_COLOR_PALETTES } from './GroupsManager';

interface InterleaveConfigPanelProps {
  config: InterleaveConfig;
  onChange: (updated: Partial<InterleaveConfig>) => void;
  groups: FileGroup[];
  groupItemCounts?: { [groupId: string]: number };
}

export const InterleaveConfigPanel: React.FC<InterleaveConfigPanelProps> = ({
  config,
  onChange,
  groups,
  groupItemCounts = {},
}) => {
  const pattern: InterleavePattern = config.pattern || 'primary_pivot';
  const primaryGroupId =
    config.primaryGroupId && groups.some((g) => g.id === config.primaryGroupId)
      ? config.primaryGroupId
      : groups[0]?.id || '';

  const primaryGroup = groups.find((g) => g.id === primaryGroupId) || groups[0];
  const primaryCount = primaryGroup ? groupItemCounts[primaryGroup.id] || 0 : 0;

  // Secondary groups ordered
  const secondaryGroups = (
    config.cycleOrder.length > 0 ? config.cycleOrder : groups.map((g) => g.id)
  )
    .filter((id) => id !== primaryGroupId)
    .map((id) => groups.find((g) => g.id === id))
    .filter((g): g is FileGroup => Boolean(g));

  const totalSecondaryCount = secondaryGroups.reduce(
    (acc, g) => acc + (groupItemCounts[g.id] || 0),
    0
  );

  const orderedAllGroups = (
    config.cycleOrder.length > 0 ? config.cycleOrder : groups.map((g) => g.id)
  )
    .map((id) => groups.find((g) => g.id === id))
    .filter((g): g is FileGroup => Boolean(g));

  const allCounts = orderedAllGroups.map((g) => groupItemCounts[g.id] || 0);
  const maxAllCount = Math.max(0, ...allCounts);
  const minAllCount = allCounts.length > 0 ? Math.min(...allCounts) : 0;
  const hasDiscrepancy = maxAllCount > 0 && minAllCount < maxAllCount;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header with Enable Switch */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Shuffle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Intercalación Automática de Archivos
            </h3>
            <p className="text-xs text-slate-400">
              Alterna una carpeta principal con las demás o rota cíclicamente
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="toggle-interleave-enabled"
            checked={config.enabled}
            onChange={(e) => onChange({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          <span className="ml-2.5 text-xs font-semibold text-slate-200">
            {config.enabled ? 'Activado' : 'Desactivado'}
          </span>
        </label>
      </div>

      {config.enabled ? (
        <div className="space-y-4 pt-1">
          {/* 1. Mode Selector: Carpeta Principal vs Round-Robin */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>Modo de Intercalación:</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option A: Carpeta Principal intercalada con las demás */}
              <button
                type="button"
                onClick={() => onChange({ pattern: 'primary_pivot' })}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                  pattern === 'primary_pivot'
                    ? 'bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/50 shadow-md shadow-indigo-950/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    Carpeta Principal Intercalada
                  </span>
                  {pattern === 'primary_pivot' && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-medium border border-indigo-500/30">
                      Activo
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  La carpeta principal (ej. Jingles / Separadores) va intercalada entre cada archivo de las otras carpetas.
                </p>
                <div className="text-[10px] font-mono text-indigo-300 bg-slate-900/90 px-2 py-1 rounded border border-slate-800">
                  Principal ➔ B1 ➔ Principal ➔ C1 ➔ Principal ➔ D1...
                </div>
              </button>

              {/* Option B: Round Robin Circular */}
              <button
                type="button"
                onClick={() => onChange({ pattern: 'round_robin' })}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                  pattern === 'round_robin'
                    ? 'bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/50 shadow-md shadow-indigo-950/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                    Rotación Cíclica en Cadena
                  </span>
                  {pattern === 'round_robin' && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-medium border border-indigo-500/30">
                      Activo
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Turno continuo equitativo entre todos los grupos en secuencia fija.
                </p>
                <div className="text-[10px] font-mono text-slate-300 bg-slate-900/90 px-2 py-1 rounded border border-slate-800">
                  A1 ➔ B1 ➔ C1 ➔ D1 ➔ A2 ➔ B2 ➔ C2...
                </div>
              </button>
            </div>
          </div>

          {/* 2. Specific Settings for Primary Pivot */}
          {pattern === 'primary_pivot' && (
            <div className="bg-slate-950/80 border border-indigo-900/40 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Seleccionar Carpeta Principal:</span>
                </label>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Posición:</span>
                  <select
                    value={config.primaryPosition || 'before'}
                    onChange={(e) =>
                      onChange({ primaryPosition: e.target.value as 'before' | 'after' })
                    }
                    className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="before">Antes de cada archivo (Principal ➔ Secundario)</option>
                    <option value="after">Después de cada archivo (Secundario ➔ Principal)</option>
                  </select>
                </div>
              </div>

              {/* Group Selector Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {groups.map((group) => {
                  const isPrimary = group.id === primaryGroupId;
                  const palette = GROUP_COLOR_PALETTES[group.color] || GROUP_COLOR_PALETTES.indigo;
                  const count = groupItemCounts[group.id] || 0;

                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => onChange({ primaryGroupId: group.id })}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isPrimary
                          ? 'bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-500/40 text-white'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <Star
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isPrimary
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-500'
                          }`}
                        />
                        <span className="text-xs font-semibold truncate">{group.name}</span>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 shrink-0 ml-1.5">
                        {count} {count === 1 ? 'arch.' : 'arch.'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Visual Flow diagram for Primary Pivot */}
              <div className="bg-slate-900/90 border border-slate-800/90 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-semibold flex items-center gap-1.5 text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Flujo de intercalación resultante:
                  </span>
                  <span className="text-slate-400">
                    {primaryCount} en Principal vs {totalSecondaryCount} en Secundarias
                  </span>
                </div>

                <div className="flex items-center flex-wrap gap-1.5 text-xs font-mono">
                  {secondaryGroups.length === 0 ? (
                    <span className="text-slate-400 text-xs font-sans">
                      Añade más carpetas para intercalar con la Principal.
                    </span>
                  ) : (
                    <>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-amber-300" /> {primaryGroup?.name || 'Principal'} 1
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                        {secondaryGroups[0]?.name || 'Carpeta B'} 1
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-amber-300" /> {primaryGroup?.name || 'Principal'} 2
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                        {(secondaryGroups[1] || secondaryGroups[0])?.name} 1
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="text-slate-500 font-sans text-xs">...y así sucesivamente</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Visual Cycle Banner for Round Robin */}
          {pattern === 'round_robin' && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Secuencia cíclica continua:
                </span>
                <span className="text-slate-400 text-[11px]">
                  {groups.length} grupos
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-2 text-xs">
                {orderedAllGroups.map((group, index) => {
                  const palette = GROUP_COLOR_PALETTES[group.color] || GROUP_COLOR_PALETTES.indigo;
                  const count = groupItemCounts[group.id] || 0;
                  return (
                    <React.Fragment key={group.id}>
                      <div
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-medium ${palette.bg} ${palette.border} ${palette.text}`}
                      >
                        <span>{index + 1}.</span>
                        <span>{group.name}</span>
                        <span className="text-[10px] bg-slate-900/60 px-1.5 py-0.2 rounded text-slate-300 font-mono">
                          {count}
                        </span>
                      </div>
                      {index < orderedAllGroups.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Repeat / Loop Smaller Groups Toggle */}
          <div className="bg-slate-950/90 border border-indigo-900/50 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Repeat className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Copiar y repetir en bucle para emparejar cantidades
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="toggle-repeat-smaller-groups"
                  checked={config.repeatSmallerGroups}
                  onChange={(e) => onChange({ repeatSmallerGroups: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {pattern === 'primary_pivot' ? (
                <>
                  Si la <strong>Carpeta Principal ({primaryGroup?.name})</strong> tiene por ejemplo <strong>3 archivos (ej. jingles o separadores)</strong> y las carpetas secundarias tienen <strong>60 canciones</strong>, los 3 archivos principales se repetirán continuamente en ciclo (1, 2, 3, 1, 2, 3...) para que <strong>siempre haya un separador entre cada archivo</strong>.
                </>
              ) : (
                <>
                  Si tienes grupos con distinta cantidad de archivos (ej. 3 en A y 60 en B), los grupos menores se repetirán en ciclo hasta igualar al grupo mayor.
                </>
              )}
            </p>

            {config.repeatSmallerGroups && (
              <div className="text-[11px] text-emerald-300 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/40 flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                <span>
                  <strong>Bucle inteligente activo:</strong> Cada copia generada recibe su propio número correlativo consecutivo al inicio (ej. <code>001_...</code>, <code>002_...</code>) sin duplicar nombres y garantizando el orden perfecto en tu carpeta física.
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
          La intercalación está desactivada. Los archivos se procesarán en el orden estándar de cada grupo o en el orden manual de la lista.
        </div>
      )}
    </div>
  );
};
