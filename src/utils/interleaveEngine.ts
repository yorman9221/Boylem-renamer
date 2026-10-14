import { FileGroup, FileItem, InterleaveConfig, SortDirection, SortField } from '../types';

export function sortItemsByCriteria(
  items: FileItem[],
  field: SortField,
  direction: SortDirection
): FileItem[] {
  const sorted = [...items];

  sorted.sort((a, b) => {
    let comparison = 0;
    switch (field) {
      case 'name':
        comparison = a.originalName.localeCompare(b.originalName, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
        break;
      case 'date':
        comparison = a.lastModified - b.lastModified;
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'manual':
      default:
        comparison = a.manualOrder - b.manualOrder;
        break;
    }
    return direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

export function interleaveFiles(
  items: FileItem[],
  groups: FileGroup[],
  interleaveConfig: InterleaveConfig
): FileItem[] {
  if (items.length === 0) return [];

  // If interleaving is disabled or only 1 group exists, sort per group and return
  if (!interleaveConfig.enabled || groups.length <= 1) {
    const result: FileItem[] = [];
    for (const group of groups) {
      const groupItems = items.filter((it) => it.groupId === group.id);
      const sorted = sortItemsByCriteria(groupItems, group.sortField, group.sortDirection);
      result.push(
        ...sorted.map((it) => ({
          ...it,
          isPrimaryGroup: it.groupId === interleaveConfig.primaryGroupId,
        }))
      );
    }
    const knownGroupIds = new Set(groups.map((g) => g.id));
    const unassigned = items.filter((it) => !knownGroupIds.has(it.groupId));
    result.push(...unassigned);
    return result;
  }

  // Pre-sort all items by group
  const groupQueues = new Map<string, FileItem[]>();
  for (const group of groups) {
    const groupItems = items.filter((it) => it.groupId === group.id);
    const sorted = sortItemsByCriteria(groupItems, group.sortField, group.sortDirection);
    groupQueues.set(group.id, sorted);
  }

  const pattern = interleaveConfig.pattern || 'primary_pivot';
  const primaryGroupId =
    interleaveConfig.primaryGroupId && groups.some((g) => g.id === interleaveConfig.primaryGroupId)
      ? interleaveConfig.primaryGroupId
      : groups[0]?.id || '';

  // =========================================================================
  // PATTERN 1: PRIMARY PIVOT (Carpeta principal intercalada con las demás)
  // Ej: Principal ➔ Carpeta B ➔ Principal ➔ Carpeta C ➔ Principal ➔ Carpeta B...
  // =========================================================================
  if (pattern === 'primary_pivot') {
    const primaryQueue = groupQueues.get(primaryGroupId) || [];

    // Secondary groups in cycle order
    const secondaryGroups = (
      interleaveConfig.cycleOrder.length > 0
        ? interleaveConfig.cycleOrder
        : groups.map((g) => g.id)
    )
      .filter((id) => id !== primaryGroupId)
      .map((id) => groups.find((g) => g.id === id))
      .filter((g): g is FileGroup => Boolean(g));

    // If there are no secondary groups, just return primary queue
    if (secondaryGroups.length === 0) {
      return primaryQueue.map((it) => ({ ...it, isPrimaryGroup: true }));
    }

    // Build the secondary stream by alternating secondary groups among each other
    const secondaryStream: FileItem[] = [];
    const secQueues = secondaryGroups.map((g) => groupQueues.get(g.id) || []);
    const maxSecCount = Math.max(0, ...secQueues.map((q) => q.length));

    if (maxSecCount > 0) {
      if (interleaveConfig.repeatSmallerGroups) {
        for (let i = 0; i < maxSecCount; i++) {
          for (const sg of secondaryGroups) {
            const q = groupQueues.get(sg.id);
            if (!q || q.length === 0) continue;

            const itemIdx = i % q.length;
            const cycle = Math.floor(i / q.length);
            const orig = q[itemIdx];

            if (cycle === 0) {
              secondaryStream.push({
                ...orig,
                isRepeated: false,
                repeatCycle: 1,
                isPrimaryGroup: false,
              });
            } else {
              secondaryStream.push({
                ...orig,
                id: `${orig.id}-rep-sec-${cycle}-${i}`,
                isRepeated: true,
                repeatCycle: cycle + 1,
                isPrimaryGroup: false,
              });
            }
          }
        }
      } else {
        let hasMore = true;
        let i = 0;
        while (hasMore) {
          hasMore = false;
          for (const sg of secondaryGroups) {
            const q = groupQueues.get(sg.id);
            if (q && i < q.length) {
              secondaryStream.push({
                ...q[i],
                isRepeated: false,
                isPrimaryGroup: false,
              });
              hasMore = true;
            }
          }
          i++;
        }
      }
    }

    // If secondary stream is empty, return primary queue
    if (secondaryStream.length === 0) {
      return primaryQueue.map((it) => ({ ...it, isPrimaryGroup: true }));
    }

    // If primary queue is empty, return secondary stream
    if (primaryQueue.length === 0) {
      return secondaryStream;
    }

    // Interleave primary queue with secondary stream (1 to 1 pairing)
    const result: FileItem[] = [];
    const totalSlots = secondaryStream.length;
    const isAfter = interleaveConfig.primaryPosition === 'after';

    for (let k = 0; k < totalSlots; k++) {
      let primaryItem: FileItem | null = null;

      if (interleaveConfig.repeatSmallerGroups) {
        const pIdx = k % primaryQueue.length;
        const pCycle = Math.floor(k / primaryQueue.length);
        const orig = primaryQueue[pIdx];

        if (pCycle === 0) {
          primaryItem = {
            ...orig,
            isRepeated: false,
            repeatCycle: 1,
            isPrimaryGroup: true,
          };
        } else {
          primaryItem = {
            ...orig,
            id: `${orig.id}-rep-pri-${pCycle}-${k}`,
            isRepeated: true,
            repeatCycle: pCycle + 1,
            isPrimaryGroup: true,
          };
        }
      } else {
        if (k < primaryQueue.length) {
          primaryItem = {
            ...primaryQueue[k],
            isRepeated: false,
            isPrimaryGroup: true,
          };
        }
      }

      const secItem = secondaryStream[k];

      if (isAfter) {
        result.push(secItem);
        if (primaryItem) result.push(primaryItem);
      } else {
        if (primaryItem) result.push(primaryItem);
        result.push(secItem);
      }
    }

    // If repeat is false and primary queue had more items than secondary stream
    if (!interleaveConfig.repeatSmallerGroups && primaryQueue.length > totalSlots) {
      for (let extra = totalSlots; extra < primaryQueue.length; extra++) {
        result.push({
          ...primaryQueue[extra],
          isRepeated: false,
          isPrimaryGroup: true,
        });
      }
    }

    return result;
  }

  // =========================================================================
  // PATTERN 2: ROUND-ROBIN (Cadena circular: A ➔ B ➔ C ➔ D ➔ A...)
  // =========================================================================
  const groupOrder =
    interleaveConfig.cycleOrder.length > 0
      ? interleaveConfig.cycleOrder
      : groups.map((g) => g.id);

  let maxGroupCount = 0;
  for (const g of groups) {
    if (groupOrder.includes(g.id)) {
      const q = groupQueues.get(g.id) || [];
      maxGroupCount = Math.max(maxGroupCount, q.length);
    }
  }

  if (maxGroupCount === 0) return [];

  const interleaved: FileItem[] = [];

  if (interleaveConfig.repeatSmallerGroups) {
    for (let index = 0; index < maxGroupCount; index++) {
      for (const groupId of groupOrder) {
        const queue = groupQueues.get(groupId);
        if (!queue || queue.length === 0) continue;

        const itemIndex = index % queue.length;
        const cycle = Math.floor(index / queue.length);
        const originalItem = queue[itemIndex];
        const isPrimary = groupId === primaryGroupId;

        if (cycle === 0) {
          interleaved.push({
            ...originalItem,
            isRepeated: false,
            repeatCycle: 1,
            isPrimaryGroup: isPrimary,
          });
        } else {
          interleaved.push({
            ...originalItem,
            id: `${originalItem.id}-rep-${cycle}-${index}`,
            isRepeated: true,
            repeatCycle: cycle + 1,
            isPrimaryGroup: isPrimary,
          });
        }
      }
    }
  } else {
    let hasMore = true;
    let index = 0;

    while (hasMore) {
      hasMore = false;
      for (const groupId of groupOrder) {
        const queue = groupQueues.get(groupId);
        if (queue && index < queue.length) {
          interleaved.push({
            ...queue[index],
            isPrimaryGroup: groupId === primaryGroupId,
          });
          hasMore = true;
        }
      }
      index++;
    }
  }

  // Include any files from groups not in cycleOrder
  const queuedGroupIds = new Set(groupOrder);
  for (const group of groups) {
    if (!queuedGroupIds.has(group.id)) {
      const remaining = groupQueues.get(group.id) || [];
      interleaved.push(
        ...remaining.map((it) => ({
          ...it,
          isPrimaryGroup: group.id === primaryGroupId,
        }))
      );
    }
  }

  return interleaved;
}
