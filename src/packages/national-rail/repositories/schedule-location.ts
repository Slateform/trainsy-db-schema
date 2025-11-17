import { BatchOperationOptions, doOperationInBatches } from '../../../utils/table';
import { NationalRailDb } from '../db';
import { NewScheduleLocation } from '../types';

export async function upsertScheduleLocations(db: NationalRailDb, scheduleLocations: NewScheduleLocation[] | NewScheduleLocation, options: BatchOperationOptions = {}) {
  if (!Array.isArray(scheduleLocations)) {
    scheduleLocations = [scheduleLocations];
  }

  return await doOperationInBatches(
    (values) =>
      db
        .insertInto('schedule_location')
        .values(values)
        .onConflict((oc) =>
          oc
            .columns(['schedule_id', 'location_tiploc', 'tiploc_instance'])
            .doUpdateSet((eb) => {
              const keys = Object.keys(values[0]) as (keyof NewScheduleLocation)[];
              return Object.fromEntries(keys.map((key) => [key, eb.ref(`excluded.${key}`)]));
            }),
        )
        .returningAll()
        .execute(),
    scheduleLocations,
    options,
  );
}