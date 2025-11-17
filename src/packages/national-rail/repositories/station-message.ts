import { BatchOperationOptions, doOperationInBatches } from '../../../utils/table';
import { NationalRailDb } from '../db';
import { NewStationMessage } from '../types';

export async function findStationMessageById(db: NationalRailDb, id: number) {
  return await db.selectFrom('station_message').where('id', '=', id).selectAll().executeTakeFirst();
}

export async function upsertStationMessages(db: NationalRailDb, messages: NewStationMessage[] | NewStationMessage, options: BatchOperationOptions = {}) {
  if (!Array.isArray(messages)) {
    messages = [messages];
  }

  return await doOperationInBatches(
    (values) =>
      db
        .insertInto('station_message')
        .values(values)
        .onConflict((oc) =>
          oc.columns(['id']).doUpdateSet((eb) => {
            const keys = Object.keys(values[0]) as (keyof NewStationMessage)[];
            return Object.fromEntries(keys.map((key) => [key, eb.ref(`excluded.${key}`)]));
          }),
        )
        .returningAll()
        .execute(),
    messages,
    options,
  );
}