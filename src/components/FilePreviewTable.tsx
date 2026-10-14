import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Music, 
  Video, 
  Image as ImageIcon, 
  Archive, 
  Code, 
  File, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Download, 
  Search, 
  Layers, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  FolderSync,
  Repeat,
  Star
} from 'lucide-react';
import { FileGroup, FileItem } from '../types';
import { formatFileSize, formatDate, getFileCategory } from '../utils/fileUtils';
import { downloadSingleFile } from '../utils/zipExporter';
import { GROUP_COLOR_PALETTES } from './GroupsManager';

interface FilePreviewTableProps {
  items: FileItem[];
  groups: FileGroup[];
  onRemoveItem: (id: string) => void;
  onMoveItem: (fromIndex: number, toIndex: number) => void;
  onChangeItemGroup: (itemId: string, newGroupId: string) => void;
  onOpenExportModal: () => void;
  onResetRenameConfig: () => void;
  onClearAll?: () => void;
}

export const FilePreviewTable: React.FC<FilePreviewTableProps> = ({
  items,
  groups,
  onRemoveItem,
  onMoveItem,
  onChangeItemGroup,
  onOpenExportModal,
  onResetRenameConfig,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Filter items
  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedGroupFilter !== 'all') {
      result = result.filter((it) => it.groupId === selectedGroupFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (it) =>
          it.originalName.toLowerCase().includes(q) ||
          (it.newName && it.newName.toLowerCase().includes(q))
      );
    }

    return result;
  }, [items, selectedGroupFilter, searchQuery]);

  const conflictsCount = useMemo(() => {
    return items.filter((it) => it.hasConflict).length;
  }, [items]);

  const repeatedCount = useMemo(() => {
    return items.filter((it) => it.isRepeated).length;
  }, [items]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, validCurrentPage, pageSize]);

  // Drag & drop row reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    onMoveItem(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'audio':
        return <Music className="w-4 h-4 text-emerald-400" />;
      case 'video':
        return <Video className="w-4 h-4 text-indigo-400" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-pink-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-orange-400" />;
      case 'code':
        return <Code className="w-4 h-4 text-cyan-400" />;
      default:
        return <File className="w-4 h-4 text-slate-400" />;
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-slate-200">
          Aún no has agregado archivos
        </h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Arrastra y suelta tus archivos o carpetas en el área superior para ver la vista previa y renombrarlos en tiempo real.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Top Header & Export Call to Action */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40">
        <div>
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Vista Previa y Orden Final ({items.length})
            </h3>
            {repeatedCount > 0 && (
              <span className="flex items-center space-x-1 text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium">
                <Repeat className="w-3.5 h-3.5" />
                <span>{repeatedCount} copias en bucle</span>
              </span>
            )}
            {conflictsCount > 0 ? (
              <span className="flex items-center space-x-1 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{conflictsCount} nombres duplicados</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Nombres únicos</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Revisa cómo quedará cada archivo antes de exportar. Puedes reordenar o cambiar grupos.
          </p>
        </div>

        {/* Action Buttons: Limpiar Reglas, Vaciar Lista, Descargar ZIP */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            type="button"
            id="btn-table-reset-rules"
            onClick={onResetRenameConfig}
            className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
            title="Limpiar reglas y volver a nombres originales"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Limpiar Reglas</span>
          </button>

          {onClearAll && (
            <button
              type="button"
              id="btn-table-clear-all"
              onClick={onClearAll}
              className="px-3 py-2 text-xs font-medium text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
              title="Vaciar todos los archivos de la lista"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Vaciar Lista</span>
            </button>
          )}

          <button
            type="button"
            id="btn-export-zip"
            onClick={onOpenExportModal}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar ZIP ({items.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 sm:px-5 sm:py-3 border-b border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nombre original o nuevo..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Group filter & page size */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span>Grupo:</span>
            <select
              value={selectedGroupFilter}
              onChange={(e) => {
                setSelectedGroupFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none"
            >
              <option value="all">Todos los grupos ({items.length})</option>
              {groups.map((g) => {
                const count = items.filter((it) => it.groupId === g.id).length;
                return (
                  <option key={g.id} value={g.id}>
                    {g.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-slate-400">
            <span>Mostrar:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={1000}>1000</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conflicts warning alert banner */}
      {conflictsCount > 0 && (
        <div className="bg-amber-950/40 border-b border-amber-800/60 px-5 py-2.5 flex items-center space-x-2 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Atención:</strong> Hay {conflictsCount} archivos con nombres idénticos. Añade numeración automática o un identificador único para evitar sobreescrituras en el archivo ZIP.
          </span>
        </div>
      )}

      {/* Table List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-3 w-14 text-center">#</th>
              <th className="py-2.5 px-3 w-28">Grupo</th>
              <th className="py-2.5 px-4 min-w-[200px]">Nombre Original</th>
              <th className="py-2.5 px-4 min-w-[260px]">Nombre Nuevo (Resultado)</th>
              <th className="py-2.5 px-3 w-24">Tamaño</th>
              <th className="py-2.5 px-3 w-28 hidden lg:table-cell">Fecha</th>
              <th className="py-2.5 px-3 w-24 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginatedItems.map((item, localIdx) => {
              const globalIndex = (validCurrentPage - 1) * pageSize + localIdx;
              const group = groups.find((g) => g.id === item.groupId) || groups[0];
              const palette = group ? (GROUP_COLOR_PALETTES[group.color] || GROUP_COLOR_PALETTES.indigo) : GROUP_COLOR_PALETTES.indigo;
              const category = getFileCategory(item.extension);
              const isNameChanged = item.newName && item.newName !== item.originalName;

              return (
                <tr
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(globalIndex)}
                  onDragOver={(e) => handleDragOver(e, globalIndex)}
                  onDrop={() => handleDrop(globalIndex)}
                  className={`hover:bg-slate-800/40 transition-colors group ${
                    item.hasConflict ? 'bg-amber-950/20' : ''
                  }`}
                >
                  {/* Order Index */}
                  <td className="py-2 px-3 text-center font-mono text-slate-500 text-xs">
                    {globalIndex + 1}
                  </td>

                  {/* Group badge & changer */}
                  <td className="py-2 px-3">
                    <select
                      value={item.groupId}
                      onChange={(e) => onChangeItemGroup(item.id, e.target.value)}
                      className={`text-[11px] font-semibold rounded-md px-2 py-0.5 border focus:outline-none cursor-pointer ${palette.badge}`}
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.id} className="bg-slate-900 text-slate-200">
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Original Name */}
                  <td className="py-2 px-4 text-slate-300">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="shrink-0">{getIconForCategory(category)}</span>
                      <span className="truncate" title={item.originalName}>
                        {item.originalName}
                      </span>
                    </div>
                  </td>

                  {/* New Name */}
                  <td className="py-2 px-4">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-mono text-xs font-medium truncate ${
                          item.hasConflict
                            ? 'text-amber-400 font-bold'
                            : isNameChanged
                            ? 'text-indigo-300'
                            : 'text-slate-400'
                        }`}
                        title={item.newName || item.originalName}
                      >
                        {item.newName || item.originalName}
                      </span>
                      {item.isPrimaryGroup && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-sans shrink-0 flex items-center gap-1 font-semibold" title="Archivo de la Carpeta Principal">
                          <Star className="w-2.5 h-2.5 fill-amber-300" />
                          <span>Principal</span>
                        </span>
                      )}
                      {item.isRepeated && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded font-sans shrink-0 flex items-center gap-1" title="Archivo copiado y alternado en bucle para igualar la cantidad de la otra carpeta">
                          <Repeat className="w-2.5 h-2.5" />
                          <span>Bucle #{item.repeatCycle}</span>
                        </span>
                      )}
                      {item.hasConflict && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-sans shrink-0">
                          Duplicado
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Size */}
                  <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">
                    {formatFileSize(item.size)}
                  </td>

                  {/* Date */}
                  <td className="py-2 px-3 text-slate-500 text-[11px] hidden lg:table-cell">
                    {formatDate(item.lastModified, 'YYYY-MM-DD')}
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {/* Move up */}
                      <button
                        type="button"
                        onClick={() => onMoveItem(globalIndex, globalIndex - 1)}
                        disabled={globalIndex === 0}
                        className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed rounded hover:bg-slate-800"
                        title="Mover arriba"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move down */}
                      <button
                        type="button"
                        onClick={() => onMoveItem(globalIndex, globalIndex + 1)}
                        disabled={globalIndex === items.length - 1}
                        className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-20 disabled:cursor-not-allowed rounded hover:bg-slate-800"
                        title="Mover abajo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Download individual file */}
                      <button
                        type="button"
                        onClick={() => downloadSingleFile(item)}
                        className="p-1 text-slate-500 hover:text-indigo-400 rounded hover:bg-slate-800"
                        title="Descargar este archivo individual renombrado"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Remove item */}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-950/30"
                        title="Quitar de la lista"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination & Footer summary */}
      <div className="p-3 sm:px-5 sm:py-3 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <div>
          Mostrando {paginatedItems.length > 0 ? (validCurrentPage - 1) * pageSize + 1 : 0} a{' '}
          {Math.min(validCurrentPage * pageSize, filteredItems.length)} de{' '}
          {filteredItems.length} archivos
          {filteredItems.length !== items.length && ` (filtrados de ${items.length})`}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-mono text-slate-300">
              Página {validCurrentPage} de {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
