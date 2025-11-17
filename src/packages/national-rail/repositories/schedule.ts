import { BatchOperationOptions, doOperationInBatches } from '../../../utils/table';
import { NationalRailDb } from '../db';
import { NewSchedule, Schedule } from '../types';

export async function findScheduleByTrainUid(db: NationalRailDb, trainUid: string) {
  return await db.selectFrom('schedule').where('train_uid', '=', trainUid).selectAll().executeTakeFirst();
}

export async function upsertSchedules(db: NationalRailDb, schedules: NewSchedule[] | NewSchedule, options: BatchOperationOptions & { returning?: (keyof Schedule)[] }= {}) {
  if (!Array.isArray(schedules)) {
    schedules = [schedules];
  }

  return await doOperationInBatches(
    (values) => db
        .insertInto('schedule')
        .values(values)
        .onConflict((oc) =>
          oc.columns(['train_uid', 'start_date', 'end_date', 'stp_indicator', 'day_mask']).doUpdateSet((eb) => {
            const keys = Object.keys(values[0]) as (keyof NewSchedule)[];
            return Object.fromEntries(keys.map((key) => [key, eb.ref(`excluded.${key}`)]));
          }),
        )
        .returning(options.returning ?? [])
        .execute(),
    schedules,
    options,
  );
}