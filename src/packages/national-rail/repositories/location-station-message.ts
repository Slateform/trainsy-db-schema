import { NationalRailDb } from '../db';
import { NewLocationStationMessage } from '../types';
import { BatchOperationOptions, doOperationInBatches } from '../../../utils/table';

export async function findStationMessagesByLocationThreeAlpha(db: NationalRailDb, locationThreeAlpha: string) {
  return await db
    .selectFrom('station_message')
    .innerJoin(
      'location_station_message',
      'station_message.id',
      'location_station_message.station_message_id',
    )
    .where('location_station_message.location_three_alpha', '=', locationThreeAlpha)
    .selectAll()
    .execute();
}

export async function upsertLocationStationMessages(db: NationalRailDb, messages: NewLocationStationMessage[] | NewLocationStationMessage, options: BatchOperationOptions = {}) {
  if (!Array.isArray(messages)) {
    messages = [messages];
  }

  return await doOperationInBatches(
    (values) =>
      db
        .insertInto('location_station_message')
        .values(values)
        .onConflict((oc) =>
          oc.columns(['location_three_alpha', 'station_message_id']).doUpdateSet((eb) => {
            const keys = Object.keys(values[0]) as (keyof NewLocationStationMessage)[];
            return Object.fromEntries(keys.map((key) => [key, eb.ref(`excluded.${key}`)]));
          }),
        )
        .returningAll()
        .execute(),
    messages,
    options,
  );
}
