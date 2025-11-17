import { BatchOperationOptions, doOperationInBatches } from '../../../utils/table';
import { NationalRailDb } from '../db';
import { NewTrainFormation } from '../types';

export async function findTrainFormationById(db: NationalRailDb, id: number) {
  return await db.selectFrom('train_formation').where('id', '=', id).selectAll().executeTakeFirst();
}

export async function findTrainFormationsByTrainRid(db: NationalRailDb, trainRid: string) {
  return await db
    .selectFrom('train_formation')
    .where('train_rid', '=', trainRid)
    .selectAll()
    .execute();
}

export async function findTrainFormationsByFid(db: NationalRailDb, fid: string) {
  return await db.selectFrom('train_formation').where('fid', '=', fid).selectAll().execute();
}

export async function upsertTrainFormations(db: NationalRailDb, formations: NewTrainFormation[] | NewTrainFormation, options: BatchOperationOptions = {}) {
  if (!Array.isArray(formations)) {
    formations = [formations];
  }

  return await doOperationInBatches(
    (values) =>
      db
        .insertInto('train_formation')
        .values(values)
        .onConflict((oc) =>
          oc.columns(['train_rid', 'fid']).doUpdateSet((eb) => {
            const keys = Object.keys(values[0]) as (keyof NewTrainFormation)[];
            return Object.fromEntries(keys.map((key) => [key, eb.ref(`excluded.${key}`)]));
          }),
        )
        .returningAll()
        .execute(),
    formations,
    options,
  );
}