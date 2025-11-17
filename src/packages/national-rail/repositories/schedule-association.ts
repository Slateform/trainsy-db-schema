import { BatchOperationOptions, doOperationInBatches } from '../../../utils/table';
import { NationalRailDb } from '../db';
import { NewScheduleAssociation } from '../types';

export async function upsertScheduleAssociations(
  db: NationalRailDb,
  scheduleAssociations: NewScheduleAssociation[] | NewScheduleAssociation,
  options: BatchOperationOptions = {},
) {
  if (!Array.isArray(scheduleAssociations)) {
    scheduleAssociations = [scheduleAssociations];
  }

  return await doOperationInBatches(
    (values) =>
      db
        .insertInto('schedule_association')
        .values(values)
        .onConflict((oc) =>
          oc
            .columns([
              'main_train_uid',
              'assoc_train_uid',
              'assoc_start_date',
              'assoc_end_date',
              'day_mask',
              'category',
              'location_tiploc',
              'base_location_suffix',
              'assoc_location_suffix',
              'stp_indicator',
            ])
            .doUpdateSet((eb) => {
              const keys = Object.keys(values[0]) as (keyof NewScheduleAssociation)[];
              return Object.fromEntries(keys.map((key) => [key, eb.ref(`excluded.${key}`)]));
            }),
        )
        .returningAll()
        .execute(),
    scheduleAssociations,
    options,
  );
}
