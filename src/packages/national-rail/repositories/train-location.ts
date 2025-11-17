import { BatchOperationOptions, doOperationInBatches } from '../../../utils/table';
import { NationalRailDb } from '../db';
import { NewTrainLocation, TrainLocation } from '../types';

export async function findTrainLocationById(db: NationalRailDb, id: number) {
  return await db.selectFrom('train_location').where('id', '=', id).selectAll().executeTakeFirst();
}

export async function findTrainLocationsByTrainRid(db: NationalRailDb, trainRid: string) {
  return await db
    .selectFrom('train_location')
    .where('train_rid', '=', trainRid)
    .selectAll()
    .execute();
}

export async function findTrainLocations(db: NationalRailDb, trainLocations: Partial<TrainLocation>[]) {
  const query = db.selectFrom('train_location').where((eb) => 
    eb.or([
      ...trainLocations.map((loc) =>
        eb.and(
          Object.entries(loc).map(([key, value]) => eb(key as keyof TrainLocation, '=', value)),
        ),
      ),
    ])
  );

  return await query.selectAll().execute();
}

export async function upsertTrainLocations(db: NationalRailDb, locations: NewTrainLocation[] | NewTrainLocation, options: BatchOperationOptions = {}) {
  if (!Array.isArray(locations)) {
    locations = [locations];
  }

  return await doOperationInBatches(
    (values) =>
      db
        .insertInto('train_location')
        .values(values)
        .onConflict((oc) =>
          oc
            .columns(['train_rid', 'location_tiploc', 'working_arrival_time', 'pass'])
            .doUpdateSet((eb) => {
              const keys = Object.keys(values[0]) as (keyof NewTrainLocation)[];
              return Object.fromEntries(keys.map((key) => [key, eb.ref(`excluded.${key}`)]));
            }),
        )
        .returningAll()
        .execute(),
    locations,
    options,
  );
}