export type CoastalCacheSummary = {
  count: number;
  message: string;
  timestamp: string;
  sizeKb?: number;
};

export const hasFirestorePersistence = true;

export async function enableFirestoreNetwork(): Promise<boolean> {
  return true;
}

export async function disableFirestoreNetwork(): Promise<boolean> {
  return true;
}

export async function syncWorkOrderToFirestore(workOrder: Record<string, any>) {
  return {
    success: true,
    id: workOrder?.id ?? 'local-cache',
    syncedAt: new Date().toISOString(),
  };
}

export async function syncServiceTypeToFirestore(service: Record<string, any>) {
  return {
    success: true,
    id: service?.id ?? 'service-local-cache',
    syncedAt: new Date().toISOString(),
  };
}

export async function deleteServiceTypeFromFirestore(serviceId: string) {
  return {
    success: true,
    id: serviceId,
    deletedAt: new Date().toISOString(),
  };
}

export async function syncCategoryToFirestore(category: Record<string, any>) {
  return {
    success: true,
    id: category?.id ?? 'category-local-cache',
    syncedAt: new Date().toISOString(),
  };
}

export async function deleteCategoryFromFirestore(categoryId: string) {
  return {
    success: true,
    id: categoryId,
    deletedAt: new Date().toISOString(),
  };
}

export async function precacheCoastalTravelData() {
  return {
    count: 0,
    message: 'Coastal mock cache initialized for offline travel mode.',
    timestamp: new Date().toISOString(),
  } satisfies CoastalCacheSummary;
}

export function getCoastalCacheState(): CoastalCacheSummary {
  return {
    count: 0,
    message: 'Local cache ready for offline travel mode.',
    timestamp: new Date().toISOString(),
  };
}

export function getCachedServiceRequests() {
  return [] as Array<Record<string, any>>;
}
