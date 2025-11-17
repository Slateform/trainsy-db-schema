export type BatchOperationOptions = {
  batchSize?: number;
};

export async function doOperationInBatches<T extends object, R>(
  operationFn: (items: T[]) => Promise<R[]>,
  items: T[],
  options: BatchOperationOptions = {}
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const promises: Promise<R[]>[] = [];
  const { batchSize = 1000 } = options;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    promises.push(operationFn(batch));
  }

  const results = await Promise.all(promises);
  return results.flat();
}