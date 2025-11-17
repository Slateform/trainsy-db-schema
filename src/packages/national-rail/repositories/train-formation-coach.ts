import { BatchOperationOptions, doOperationInBatches } from '../../../utils/table';
import { NationalRailDb } from '../db';
import { NewTrainFormationCoach } from '../types';

export async function findTrainFormationCoachesById(db: NationalRailDb, id: number) {
  return await db.selectFrom('train_formation_coach').where('id', '=', id).selectAll().execute();
}

export async function findTrainFormationCoachesByFormationId(db: NationalRailDb, formationId: number) {
  return await db
    .selectFrom('train_formation_coach')
    .where('train_formation_id', '=', formationId)
    .selectAll()
    .execute();
}

export async function upsertTrainFormationCoaches(db: NationalRailDb, coaches: NewTrainFormationCoach[] | NewTrainFormationCoach, options: BatchOperationOptions = {}) {
  if (!Array.isArray(coaches)) {
    coaches = [coaches];
  }

  return await doOperationInBatches(
    (values) =>
      db
        .insertInto('train_formation_coach')
        .values(values)
        .onConflict((oc) =>
          oc.columns(['train_formation_id', 'number']).doUpdateSet((eb) => {
            const keys = Object.keys(values[0]) as (keyof NewTrainFormationCoach)[];
            return Object.fromEntries(keys.map((key) => [key, eb.ref(`excluded.${key}`)]));
          }),
        )
        .returningAll()
        .execute(),
    coaches,
    options,
  );
}