import React, { useState } from 'react';
import { 
  Folder, 
  Plus, 
  Trash2, 
  ArrowUpDown, 
  Edit3, 
  Check, 
  Layers,
  ArrowUp,
  ArrowDown,
  Star
} from 'lucide-react';
import { FileGroup, FileItem, SortDirection, SortField } from '../types';
import { formatFileSize } from '../utils/fileUtils';

interface GroupsManagerProps {
  groups: FileGroup[];
  items: FileItem[];
  onAddGroup: () => void;
  onUpdateGroup: (id: string, updates: Partial<FileGroup>) => void;
  onRemoveGroup: (id: string) => void;
  cycleOrder: string[];
  onChangeCycleOrder: (newOrder: string[]) => void;
  primaryGroupId?: string;
  onSetPrimaryGroup?: (id: string) => void;
}

export const GROUP_COLOR_PALETTES: { [key: string]: { bg: string; border: string; text: string; badge: string } } = {
  indigo: { bg: 'bg-indigo-950/40', border: 'border-indigo-700/60', text: 'text-indigo-300', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  emerald: { bg: 'bg-emerald-950/40', border: 'border-emerald-700/60', text: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  amber: { bg: 'bg-amber-950/40', border: 'border-amber-700/60', text: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  rose: { bg: 'bg-rose-950/40', border: 'border-rose-700/60', text: 'text-rose-300', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  sky: { bg: 'bg-sky-950/40', border: 'border-sky-700/60', text: 'text-sky-300', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  purple: { bg: 'bg-purple-950/40', border: 'border-purple-700/60', text: 'text-purple-300', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
};

export const GroupsManager: React.FC<GroupsManagerProps> = ({
  groups,
  items,
  onAddGroup,
  onUpdateGroup,
  onRemoveGroup,
  cycleOrder,
  onChangeCycleOrder,
  primaryGroupId,
  onSetPrimaryGroup,
}) => {
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const startRename = (group: FileGroup) => {
    setEditingGroupId(group.id);
    setEditingName(group.name);
  };

  const saveRename = (groupId: string) => {
    if (editingName.trim()) {
      onUpdateGroup(groupId, { name: editingName.trim() });
    }
    setEditingGroupId(null);
  };

  const moveInCycle = (index: number, direction: 'up' | 'down') => {
    const order = cycleOrder.length > 0 ? [...cycleOrder] : groups.map((g) => g.id);
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= order.length) return;

    const temp = order[index];
    order[index] = order[targetIdx];
    order[targetIdx] = temp;
    onChangeCycleOrder(order);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Grupos y Carpetas ({groups.length})
          </h3>
        </div>

        <button
          type="button"
          id="btn-add-group"
          onClick={onAddGroup}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-400" />
          <span>Nuevo Grupo</span>
        </button>
      </div>

      {/* List of groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {groups.map((group, index) => {
          const isPrimary = group.id === primaryGroupId;
          const palette = GROUP_COLOR_PALETTES[group.color] || GROUP_COLOR_PALETTES.indigo;
          const groupItems = items.filter((it) => it.groupId === group.id);
          const totalSize = groupItems.reduce((acc, it) => acc + it.size, 0);

          return (
            <div
              key={group.id}
              className={`border rounded-xl p-3.5 flex flex-col justify-between space-y-3 transition-colors ${
                isPrimary
                  ? 'bg-amber-950/30 border-amber-500/70 ring-1 ring-amber-500/40'
                  : `${palette.bg} ${palette.border}`
              }`}
            >
              {/* Header: Name, Primary badge, and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0 mr-2">
                  <div className={`w-3 h-3 rounded-full bg-current ${palette.text}`} />
                  {editingGroupId === group.id ? (
                    <div className="flex items-center space-x-1 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveRename(group.id)}
                        className="bg-slate-950 text-white text-xs px-2 py-1 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => saveRename(group.id)}
                        className="p-1 hover:bg-slate-800 rounded text-emerald-400"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="text-xs font-bold text-slate-100 truncate">
                        {group.name}
                      </span>
                      {isPrimary && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-semibold flex items-center gap-1 shrink-0">
                          <Star className="w-2.5 h-2.5 fill-amber-300" /> Principal
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => startRename(group)}
                        className="p-1 hover:bg-slate-800/80 rounded text-slate-400 hover:text-slate-200 transition-colors"
                        title="Renombrar grupo"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  {/* Set as Primary Button if not primary */}
                  {!isPrimary && onSetPrimaryGroup && (
                    <button
                      type="button"
                      onClick={() => onSetPrimaryGroup(group.id)}
                      className="p-1 text-slate-400 hover:text-amber-300 rounded hover:bg-slate-800 transition-colors"
                      title="Establecer como Carpeta Principal para intercalar"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Reorder cycle buttons */}
                  {groups.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => moveInCycle(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-slate-800"
                        title="Mover grupo hacia arriba en el ciclo de intercalación"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveInCycle(index, 'down')}
                        disabled={index === groups.length - 1}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-slate-800"
                        title="Mover grupo hacia abajo en el ciclo de intercalación"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </>
                  )}

                  {groups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveGroup(group.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-950/30 transition-colors"
                      title="Eliminar grupo (los archivos pasarán al primer grupo)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-800/60">
                <span>{groupItems.length} archivos</span>
                <span className="text-slate-400">{formatFileSize(totalSize)}</span>
              </div>

              {/* Sorting rules for this group */}
              <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between gap-1 text-[11px]">
                <div className="flex items-center space-x-1 text-slate-400">
                  <ArrowUpDown className="w-3 h-3" />
                  <span>Ordenar por:</span>
                </div>
                <div className="flex items-center space-x-1">
                  <select
                    value={group.sortField}
                    onChange={(e) =>
                      onUpdateGroup(group.id, { sortField: e.target.value as SortField })
                    }
                    className="bg-slate-900 text-slate-200 border border-slate-700/80 rounded px-1.5 py-0.5 text-[11px] focus:outline-none"
                  >
                    <option value="name">Nombre</option>
                    <option value="date">Fecha</option>
                    <option value="size">Tamaño</option>
                    <option value="manual">Manual</option>
                  </select>

                  {group.sortField !== 'manual' && (
                    <select
                      value={group.sortDirection}
                      onChange={(e) =>
                        onUpdateGroup(group.id, { sortDirection: e.target.value as SortDirection })
                      }
                      className="bg-slate-900 text-slate-200 border border-slate-700/80 rounded px-1 py-0.5 text-[11px] focus:outline-none"
                    >
                      <option value="asc">Asc</option>
                      <option value="desc">Desc</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
