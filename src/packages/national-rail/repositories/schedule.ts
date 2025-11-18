import { sql } from 'kysely';
import { BatchOperationOptions, doOperationInBatches } from '../../../utils/table';
import { NationalRailDb } from '../db';
import { NewSchedule, Schedule } from '../types';

const getStpPriorityClause = (db: NationalRailDb) => db
  .case()
  .when(sql`stp_indicator = 'C'`).then(4)
  .when(sql`stp_indicator = 'N'`).then(3)
  .when(sql`stp_indicator = 'O'`).then(2)
  .else(1)
  .end();

export async function findScheduleByTrainUid(db: NationalRailDb, trainUid: string) {
  return await db.selectFrom('schedule').where('train_uid', '=', trainUid).selectAll().executeTakeFirst();
}

export async function findStationDeparturesOnDate(db: NationalRailDb, stationTiploc: string, departureDate: Date) {
  const dayValue = Math.pow(2, 7 - departureDate.getDay());
  
  const subquery = db
    .selectFrom('schedule')
    .distinctOn('schedule.train_uid')
    .where('schedule.start_date', '<=', departureDate)
    .where('schedule.end_date', '>=', departureDate)
    .innerJoin('schedule_location', 'schedule.id', 'schedule_location.schedule_id')
    .where('schedule_location.location_tiploc', '=', stationTiploc)
    .where('schedule_location.public_departure_time', '>=', departureDate.toLocaleTimeString(undefined, {
      hour12: false,
      timeStyle: 'medium',
      timeZone: 'UTC',
    }))
    .where(sql`day_mask & ${dayValue}`, '<>', 0)
    .selectAll('schedule')
    .select('schedule_location.public_departure_time as from_public_departure_time')
    // .select(() =>
    //   sql`
    //     (
    //       SELECT json_agg(to_jsonb(sl2) ORDER BY coalesce(sl2.working_departure_time, sl2.working_pass_time))
    //       FROM schedule_location sl2
    //       WHERE sl2.schedule_id = schedule.id
    //     )
    //   `.as('locations')
    // )
    .select(() =>
      sql`
        (
          SELECT json_agg(
            jsonb_build_object(
              'schedule_location', to_jsonb(sl2),
              'location', to_jsonb(loc)
            )
            ORDER BY sl2.location_sequence
          )
          FROM schedule_location sl2
          LEFT JOIN location loc
            ON loc.tiploc = sl2.location_tiploc
          WHERE sl2.schedule_id = schedule.id
        )
      `.as('locations')
    )
    .orderBy('schedule.train_uid')
    .orderBy(getStpPriorityClause(db), 'desc')
    .as('distinct_schedules');

  return await db
    .selectFrom(subquery)
    .selectAll()
    .orderBy('from_public_departure_time', 'asc')
    .limit(20)
    .execute();
}

export async function findDirectTrainsBetweenStations(db: NationalRailDb, fromTiploc: string, toTiploc: string, departureDate: Date) {
  const dayValue = Math.pow(2, 7 - departureDate.getDay());
  
  const subquery = db
    .selectFrom('schedule')
    .distinctOn('schedule.train_uid')
    .where('schedule.start_date', '<=', departureDate)
    .where('schedule.end_date', '>=', departureDate)
    .innerJoin("schedule_location as from_loc", "from_loc.schedule_id", "schedule.id")
    .innerJoin("schedule_location as to_loc", "to_loc.schedule_id", "schedule.id")
    .where('from_loc.location_tiploc', '=', fromTiploc)
    .where('to_loc.location_tiploc', '=', toTiploc)
    .whereRef('from_loc.location_sequence', '<', 'to_loc.location_sequence')
    .where('from_loc.public_departure_time', '>=', departureDate.toLocaleTimeString(undefined, {
      hour12: false,
      timeStyle: 'medium',
      timeZone: 'UTC',
    }))
    .where(sql`day_mask & ${dayValue}`, '<>', 0)
    .selectAll('schedule')
    .select('from_loc.public_departure_time as from_public_departure_time')
    .select('to_loc.public_arrival_time as to_public_arrival_time')
    .select(() =>
      sql`
        (
          SELECT json_agg(
            jsonb_build_object(
              'schedule_location', to_jsonb(sl2),
              'location', to_jsonb(loc)
            )
            ORDER BY sl2.location_sequence
          )
          FROM schedule_location sl2
          LEFT JOIN location loc
            ON loc.tiploc = sl2.location_tiploc
          WHERE sl2.schedule_id = schedule.id
        )
      `.as('locations')
    )
    .orderBy('schedule.train_uid')
    .orderBy(getStpPriorityClause(db), 'desc')
    .as('distinct_schedules');

  return await db
    .selectFrom(subquery)
    .selectAll()
    .orderBy('from_public_departure_time', 'asc')
    .limit(20)
    .execute();
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