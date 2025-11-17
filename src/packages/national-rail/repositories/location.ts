import { BatchOperationOptions, doOperationInBatches } from '../../../utils/table';
import { NationalRailDb } from '../db';
import { MakeRequired } from '../../../utils/types';
import { LocationUpdate, NewLocation } from '../types';

export async function findLocationByNlc(db: NationalRailDb, nlc: number) {
  return await db.selectFrom('location').where('nlc', '=', nlc).selectAll().executeTakeFirst();
}

export async function findLocationByTiploc(db: NationalRailDb, tiploc: string) {
  return await db
    .selectFrom('location')
    .where('tiploc', '=', tiploc)
    .selectAll()
    .executeTakeFirst();
}

export async function findLocationByStanox(db: NationalRailDb, stanox: string) {
  return await db
    .selectFrom('location')
    .where('stanox', '=', stanox)
    .selectAll()
    .executeTakeFirst();
}

export async function findLocationByThreeAlpha(db: NationalRailDb, threeAlpha: string) {
  return await db
    .selectFrom('location')
    .where('three_alpha', '=', threeAlpha)
    .selectAll()
    .executeTakeFirst();
}

export async function findLocationByUic(db: NationalRailDb, uic: string) {
  return await db.selectFrom('location').where('uic', '=', uic).selectAll().executeTakeFirst();
}

export async function upsertLocations(db: NationalRailDb, locations: NewLocation[] | NewLocation, options: BatchOperationOptions = {}) {
  if (!Array.isArray(locations)) {
    locations = [locations];
  }

  return await doOperationInBatches(
    (values) =>
      db
        .insertInto('location')
        .values(values)
        .onConflict((oc) =>
          oc.column('nlc').doUpdateSet((eb) => {
            const keys = Object.keys(values[0]) as (keyof NewLocation)[];
            return Object.fromEntries(keys.map((key) => [key, eb.ref(`excluded.${key}`)]));
          }),
        )
        .returningAll()
        .execute(),
    locations,
    options,
  );
}

export async function updateLocationsByTiploc(db: NationalRailDb, locations: MakeRequired<LocationUpdate, 'tiploc'>[], options: BatchOperationOptions = {}) {
  if (!Array.isArray(locations)) {
    locations = [locations];
  }

  return await doOperationInBatches(
    (values) =>
      Promise.all(
        values.map((location) =>
          db
            .updateTable('location')
            .set(location)
            .where('tiploc', '=', location.tiploc)
            .returningAll()
            .execute(),
        ),
      ),
    locations,
    options,
  );
}