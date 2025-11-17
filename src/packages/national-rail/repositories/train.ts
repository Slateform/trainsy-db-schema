import { BatchOperationOptions, doOperationInBatches } from '../../../utils/table';
import { NationalRailDb } from '../db';
import { NewTrain } from '../types';

export async function findTrainByRid(db: NationalRailDb, rid: string) {
  return await db.selectFrom('train').where('rid', '=', rid).selectAll().executeTakeFirst();
}

export async function findTrainsByOrigin(db: NationalRailDb, originTiploc: string, startDate: string) {
  return await db
    .selectFrom('train')
    .innerJoin('train_location', 'train.rid', 'train_location.train_rid')
    .where('train_location.location_tiploc', '=', originTiploc)
    .where('train.scheduled_start_date', '=', startDate)
    .selectAll('train')
    .execute();
}

export async function upsertTrains(db: NationalRailDb, trains: NewTrain[] | NewTrain, options: BatchOperationOptions = {}) {
  if (!Array.isArray(trains)) {
    trains = [trains];
  }

  return await doOperationInBatches(
    (values) =>
      db
        .insertInto('train')
        .values(values)
        .onConflict((oc) =>
          oc.column('rid').doUpdateSet((eb) => {
            const keys = Object.keys(values[0]) as (keyof NewTrain)[];
            return Object.fromEntries(keys.map((key) => [key, eb.ref(`excluded.${key}`)]));
          }),
        )
        .returningAll()
        .execute(),
    trains,
    options,
  );
}