import React, { useState, useMemo, useCallback } from 'react';
import { 
  FileGroup, 
  FileItem, 
  InterleaveConfig, 
  Preset, 
  RenameConfig 
} from './types';
import { DEFAULT_RENAME_CONFIG } from './utils/presets';
import { interleaveFiles } from './utils/interleaveEngine';
import { computeRenamedItems } from './utils/renameEngine';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { GroupsManager } from './components/GroupsManager';
import { InterleaveConfigPanel } from './components/InterleaveConfigPanel';
import { RenameConfigPanel } from './components/RenameConfigPanel';
import { FilePreviewTable } from './components/FilePreviewTable';
import { ExportModal } from './components/ExportModal';
import { PresetsModal } from './components/PresetsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { 
  Shuffle, 
  Sparkles, 
  FolderPlus, 
  FolderSync, 
  Wand2,
  FileCheck,
  RotateCcw,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const INITIAL_GROUPS: FileGroup[] = [
  {
    id: 'group-a',
    name: 'Carpeta Principal (Jingles / Intro)',
    color: 'amber',
    sortField: 'name',
    sortDirection: 'asc',
  },
  {
    id: 'group-b',
    name: 'Carpeta B (Música 1)',
    color: 'indigo',
    sortField: 'name',
    sortDirection: 'asc',
  },
  {
    id: 'group-c',
    name: 'Carpeta C (Música 2)',
    color: 'emerald',
    sortField: 'name',
    sortDirection: 'asc',
  },
];

const COLOR_OPTIONS = ['indigo', 'emerald', 'amber', 'rose', 'sky', 'purple'];

export default function App() {
  const [groups, setGroups] = useState<FileGroup[]>(INITIAL_GROUPS);
  const [items, setItems] = useState<FileItem[]>([]);
  const [renameConfig, setRenameConfig] = useState<RenameConfig>(DEFAULT_RENAME_CONFIG);
  const [interleaveConfig, setInterleaveConfig] = useState<InterleaveConfig>({
    enabled: true,
    pattern: 'primary_pivot',
    primaryGroupId: 'group-a',
    cycleOrder: ['group-b', 'group-c'],
    repeatSmallerGroups: true,
    primaryPosition: 'before',
  });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [isConfirmEmptyOpen, setIsConfirmEmptyOpen] = useState(false);

  // Add files from DropZone or Pickers
  const handleFilesAdded = useCallback(
    (rawFiles: { file: File; folderName?: string }[], targetGroupId?: string) => {
      setGroups((prevGroups) => {
        const updatedGroups = [...prevGroups];
        const folderNameToGroupId = new Map<string, string>();

        // Map existing groups
        for (const g of updatedGroups) {
          folderNameToGroupId.set(g.name.toLowerCase(), g.id);
        }

        // Look for new folder names to create groups dynamically
        for (const rf of rawFiles) {
          if (rf.folderName) {
            const lower = rf.folderName.toLowerCase();
            if (!folderNameToGroupId.has(lower)) {
              const nextColor =
                COLOR_OPTIONS[updatedGroups.length % COLOR_OPTIONS.length];
              const newG: FileGroup = {
                id: `group-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                name: rf.folderName,
                color: nextColor,
                sortField: 'name',
                sortDirection: 'asc',
              };
              updatedGroups.push(newG);
              folderNameToGroupId.set(lower, newG.id);
            }
          }
        }

        // Add items to state
        setItems((prevItems) => {
          const newItems: FileItem[] = rawFiles.map((rf, idx) => {
            let assignedGroupId = targetGroupId;
            if (!assignedGroupId) {
              if (rf.folderName && folderNameToGroupId.has(rf.folderName.toLowerCase())) {
                assignedGroupId = folderNameToGroupId.get(rf.folderName.toLowerCase());
              } else {
                // If no folder name and no explicit target, assign to first group or alternating
                assignedGroupId = updatedGroups[0]?.id || 'group-a';
              }
            }

            const fullName = rf.file.name;
            const lastDot = fullName.lastIndexOf('.');
            const ext = lastDot > 0 ? fullName.slice(lastDot) : '';

            return {
              id: `file-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
              file: rf.file,
              originalName: fullName,
              extension: ext,
              size: rf.file.size,
              lastModified: rf.file.lastModified || Date.now(),
              groupId: assignedGroupId || 'group-a',
              manualOrder: prevItems.length + idx,
            };
          });

          return [...prevItems, ...newItems];
        });

        // Ensure cycleOrder has all groups
        setInterleaveConfig((prev) => {
          const existingIds = new Set(prev.cycleOrder);
          const newCycle = [...prev.cycleOrder];
          for (const g of updatedGroups) {
            if (!existingIds.has(g.id)) {
              newCycle.push(g.id);
            }
          }
          return { ...prev, cycleOrder: newCycle };
        });

        return updatedGroups;
      });
    },
    []
  );

  // Group Management
  const handleAddGroup = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nextLetter = letters[groups.length] || `${groups.length + 1}`;
    const nextColor = COLOR_OPTIONS[groups.length % COLOR_OPTIONS.length];
    const newGroup: FileGroup = {
      id: `group-${Date.now()}`,
      name: `Carpeta ${nextLetter}`,
      color: nextColor,
      sortField: 'name',
      sortDirection: 'asc',
    };

    setGroups((prev) => [...prev, newGroup]);
    setInterleaveConfig((prev) => ({
      ...prev,
      cycleOrder: [...prev.cycleOrder, newGroup.id],
    }));
  };

  const handleUpdateGroup = (id: string, updates: Partial<FileGroup>) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const handleRemoveGroup = (id: string) => {
    if (groups.length <= 1) return;
    const remaining = groups.filter((g) => g.id !== id);
    const fallbackGroupId = remaining[0].id;

    // Reassign items from deleted group to the first remaining group
    setItems((prev) =>
      prev.map((it) => (it.groupId === id ? { ...it, groupId: fallbackGroupId } : it))
    );

    setGroups(remaining);
    setInterleaveConfig((prev) => ({
      ...prev,
      primaryGroupId: prev.primaryGroupId === id ? fallbackGroupId : prev.primaryGroupId,
      cycleOrder: prev.cycleOrder.filter((gid) => gid !== id),
    }));
  };

  const handleChangeCycleOrder = (newOrder: string[]) => {
    setInterleaveConfig((prev) => ({ ...prev, cycleOrder: newOrder }));
  };

  // Item Management
  const handleRemoveItem = (id: string) => {
    const targetId = id.includes('-rep-') ? id.split('-rep-')[0] : id;
    setItems((prev) => prev.filter((it) => it.id !== targetId && it.id !== id));
  };

  const handleChangeItemGroup = (itemId: string, newGroupId: string) => {
    const targetId = itemId.includes('-rep-') ? itemId.split('-rep-')[0] : itemId;
    setItems((prev) =>
      prev.map((it) => (it.id === targetId || it.id === itemId ? { ...it, groupId: newGroupId } : it))
    );
  };

  const handleMoveItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
      return;
    }

    setItems((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      // Re-assign manualOrder
      return copy.map((it, idx) => ({ ...it, manualOrder: idx }));
    });
  };

  // Reset rename config to clean default (original names without prefixes/numbering)
  const handleResetRenameConfig = () => {
    setRenameConfig({
      baseNameOption: 'original',
      customBaseName: '',
      prefix: '',
      suffix: '',
      enableNumbering: false,
      numberStart: 1,
      numberStep: 1,
      numberPadding: 3,
      numberPosition: 'start',
      numberSeparator: '_',
      enableDate: false,
      dateSource: 'current',
      dateFormat: 'YYYY-MM-DD',
      datePosition: 'prefix',
      dateSeparator: '_',
      findText: '',
      replaceText: '',
      matchCase: false,
      useRegex: false,
      replaceAll: true,
      textCase: 'unchanged',
      spaceOption: 'unchanged',
      removeSpecialChars: false,
      removeAccents: false,
      trimSpaces: true,
      extensionCase: 'lowercase',
    });
  };

  // Safe empty modal handlers
  const handleOpenConfirmEmpty = () => {
    setIsConfirmEmptyOpen(true);
  };

  const handleConfirmEmpty = () => {
    setItems([]);
  };

  // Apply Preset
  const handleApplyPreset = (preset: Preset) => {
    setRenameConfig(preset.renameConfig);
    setInterleaveConfig((prev) => ({
      ...prev,
      enabled: preset.interleaveEnabled,
    }));
  };

  // Helper to load sample files for quick testing (e.g. 3 jingles in Principal, 4 songs in B, 4 songs in C)
  const handleLoadDemoFiles = () => {
    const demoA = [
      'Jingle_01_Radio.mp3',
      'Jingle_02_Estacion.mp3',
      'Jingle_03_Identificador.mp3',
    ].map((name, i) => {
      const blob = new Blob(['demo audio content Principal'], { type: 'audio/mp3' });
      const file = new File([blob], name, { type: 'audio/mp3', lastModified: Date.now() - (3 - i) * 86400000 });
      return { file, folderName: 'Carpeta Principal (Jingles / Intro)' };
    });

    const demoB = [
      'Pop_01_Acoustic.mp3',
      'Pop_02_Electronic.mp3',
      'Pop_03_SummerHit.mp3',
      'Pop_04_NightDrive.mp3',
    ].map((name, i) => {
      const blob = new Blob(['demo audio content B'], { type: 'audio/mp3' });
      const file = new File([blob], name, { type: 'audio/mp3', lastModified: Date.now() - (8 - i) * 86400000 });
      return { file, folderName: 'Carpeta B (Música 1)' };
    });

    const demoC = [
      'Rock_01_Classic.mp3',
      'Rock_02_IndieVibe.mp3',
      'Rock_03_GuitarRiff.mp3',
      'Rock_04_Ballad.mp3',
    ].map((name, i) => {
      const blob = new Blob(['demo audio content C'], { type: 'audio/mp3' });
      const file = new File([blob], name, { type: 'audio/mp3', lastModified: Date.now() - (4 - i) * 86400000 });
      return { file, folderName: 'Carpeta C (Música 2)' };
    });

    handleFilesAdded([...demoA, ...demoB, ...demoC]);
  };

  // Group items count
  const groupItemCounts = useMemo(() => {
    const counts: { [groupId: string]: number } = {};
    for (const item of items) {
      counts[item.groupId] = (counts[item.groupId] || 0) + 1;
    }
    return counts;
  }, [items]);

  // 1. Process interleaving
  const interleavedItems = useMemo(() => {
    return interleaveFiles(items, groups, interleaveConfig);
  }, [items, groups, interleaveConfig]);

  // 2. Compute live renamed preview
  const processedItems = useMemo(() => {
    return computeRenamedItems(interleavedItems, renameConfig);
  }, [interleavedItems, renameConfig]);

  // Sample name for the rename panel badge
  const samplePreviewName = processedItems[0]?.newName || 'ejemplo_001.mp3';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header */}
      <Header
        onOpenPresets={() => setIsPresetsModalOpen(true)}
        onResetRenameConfig={handleResetRenameConfig}
        onResetAll={handleOpenConfirmEmpty}
        totalFiles={items.length}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Intro banner when no files */}
        {items.length === 0 && (
          <div className="bg-gradient-to-r from-indigo-950/50 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Renombrado en Masa & Intercalado Inteligente</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Renombra y alterna archivos entre múltiples carpetas
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Carga 2 o más carpetas (o grupos de archivos) para intercalarlos automáticamente en orden (A1, B1, A2, B2...), aplica numeración personalizada con ceros a la izquierda (001, 002...), reemplaza texto y exporta todo en un archivo ZIP sin salir de tu navegador.
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-start sm:items-end gap-2">
              <button
                type="button"
                id="btn-load-demo"
                onClick={handleLoadDemoFiles}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Wand2 className="w-4 h-4" />
                <span>Cargar Archivos de Prueba</span>
              </button>
              <span className="text-[11px] text-slate-400">
                Prueba el intercalado A1, B1, A2, B2 al instante
              </span>
            </div>
          </div>
        )}

        {/* DropZone Section */}
        <DropZone
          onFilesAdded={handleFilesAdded}
          groups={groups}
          totalFiles={items.length}
        />

        {/* Groups Manager & Interleave Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GroupsManager
              groups={groups}
              items={items}
              onAddGroup={handleAddGroup}
              onUpdateGroup={handleUpdateGroup}
              onRemoveGroup={handleRemoveGroup}
              cycleOrder={interleaveConfig.cycleOrder}
              onChangeCycleOrder={handleChangeCycleOrder}
              primaryGroupId={interleaveConfig.primaryGroupId}
              onSetPrimaryGroup={(id) =>
                setInterleaveConfig((prev) => ({ ...prev, primaryGroupId: id }))
              }
            />
          </div>

          <div className="lg:col-span-1">
            <InterleaveConfigPanel
              config={interleaveConfig}
              onChange={(updated) =>
                setInterleaveConfig((prev) => ({ ...prev, ...updated }))
              }
              groups={groups}
              groupItemCounts={groupItemCounts}
            />
          </div>
        </div>

        {/* Renaming Rules Panel */}
        <RenameConfigPanel
          config={renameConfig}
          onChange={(updated) =>
            setRenameConfig((prev) => ({ ...prev, ...updated }))
          }
          samplePreviewName={samplePreviewName}
          onReset={handleResetRenameConfig}
        />

        {/* Preview & Order Table */}
        <FilePreviewTable
          items={processedItems}
          groups={groups}
          onRemoveItem={handleRemoveItem}
          onMoveItem={handleMoveItem}
          onChangeItemGroup={handleChangeItemGroup}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onResetRenameConfig={handleResetRenameConfig}
          onClearAll={handleOpenConfirmEmpty}
        />
      </main>

      {/* Modals */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        items={processedItems}
      />

      <PresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        currentRenameConfig={renameConfig}
        currentInterleaveEnabled={interleaveConfig.enabled}
        onApplyPreset={handleApplyPreset}
      />

      <ConfirmModal
        isOpen={isConfirmEmptyOpen}
        onClose={() => setIsConfirmEmptyOpen(false)}
        onConfirm={handleConfirmEmpty}
        title="¿Vaciar todos los archivos?"
        description="Se eliminarán todos los archivos de la lista de trabajo y se liberará la memoria del navegador. Podrás arrastrar o cargar nuevos archivos cuando quieras."
        itemCount={items.length}
        confirmText="Sí, vaciar todo"
        cancelText="Cancelar"
      />
    </div>
  );
}
