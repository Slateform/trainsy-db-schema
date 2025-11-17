import { BatchOperationOptions, doOperationInBatches } from '../../../utils/table';
import { NationalRailDb } from '../db';
import { NewTrainFormationCoachLoading } from '../types';

export async function findTrainFormationCoachLoadingsByFormationId(db: NationalRailDb, formationId: number) {
  return await db
    .selectFrom('train_formation_coach_loading')
    .where('train_formation_coach_id', '=', formationId)
    .selectAll()
    .execute();
}

export async function upsertTrainFormationCoachLoadings(db: NationalRailDb, loadings: NewTrainFormationCoachLoading[] | NewTrainFormationCoachLoading, options: BatchOperationOptions = {}) {
  if (!Array.isArray(loadings)) {
    loadings = [loadings];
  }

  return await doOperationInBatches(
    (values) =>
      db
        .insertInto('train_formation_coach_loading')
        .values(values)
        .onConflict((oc) =>
          oc.columns(['train_formation_coach_id', 'train_location_id']).doUpdateSet((eb) => {
            const keys = Object.keys(values[0]) as (keyof NewTrainFormationCoachLoading)[];
            return Object.fromEntries(keys.map((key) => [key, eb.ref(`excluded.${key}`)]));
          }),
        )
        .returningAll()
        .execute(),
    loadings,
    options,
  );
}