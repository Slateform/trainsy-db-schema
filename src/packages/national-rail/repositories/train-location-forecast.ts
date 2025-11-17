import { BatchOperationOptions, doOperationInBatches } from '../../../utils/table';
import { NationalRailDb } from '../db';
import { NewTrainLocationForecast } from '../types';

export async function findTrainLocationForecastById(db: NationalRailDb, id: number) {
  return await db
    .selectFrom('train_location_forecast')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst();
}

export async function findTrainLocationForecastsByTrainLocationId(db: NationalRailDb, trainLocationId: number) {
  return await db
    .selectFrom('train_location_forecast')
    .where('train_location_id', '=', trainLocationId)
    .selectAll()
    .execute();
}

export async function upsertTrainLocationForecasts(db: NationalRailDb, forecasts: NewTrainLocationForecast[] | NewTrainLocationForecast, options: BatchOperationOptions = {}) {
  if (!Array.isArray(forecasts)) {
    forecasts = [forecasts];
  }

  return await doOperationInBatches(
    (values) =>
      db
        .insertInto('train_location_forecast')
        .values(values)
        .onConflict((oc) =>
          oc.columns(['train_location_id', 'type']).doUpdateSet((eb) => {
            const keys = Object.keys(values[0]) as (keyof NewTrainLocationForecast)[];
            return Object.fromEntries(keys.map((key) => [key, eb.ref(`excluded.${key}`)]));
          }),
        )
        .returningAll()
        .execute(),
    forecasts,
    options,
  );
}