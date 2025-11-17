import { BatchOperationOptions, doOperationInBatches } from '../../../utils/table';
import { NationalRailDb } from '../db';
import { NewTrainAssociation } from '../types';

export async function findTrainAssociationById(db: NationalRailDb, id: number) {
  return await db
    .selectFrom('train_association')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst();
}

export async function findTrainAssociationsByTrainLocationId(db: NationalRailDb, trainLocationId: number) {
  return await db
    .selectFrom('train_association')
    .where((eb) =>
      eb.or([
        eb('main_train_location_id', '=', trainLocationId),
        eb('associated_train_location_id', '=', trainLocationId),
      ]),
    )
    .selectAll()
    .execute();
}

export async function upsertTrainAssociations(db: NationalRailDb, associations: NewTrainAssociation[] | NewTrainAssociation, options: BatchOperationOptions = {}) {
  if (!Array.isArray(associations)) {
    associations = [associations];
  }

  return await doOperationInBatches(
    (values) =>
      db
        .insertInto('train_association')
        .values(values)
        .onConflict((oc) =>
          oc
            .columns(['main_train_location_id', 'associated_train_location_id', 'category'])
            .doUpdateSet((eb) => {
              const keys = Object.keys(values[0]) as (keyof NewTrainAssociation)[];
              return Object.fromEntries(keys.map((key) => [key, eb.ref(`excluded.${key}`)]));
            }),
        )
        .returningAll()
        .execute(),
    associations,
    options,
  );
}
