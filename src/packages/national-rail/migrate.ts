import * as path from "node:path";
import { promises as fs } from "node:fs";
import { FileMigrationProvider, Kysely, Migrator } from "kysely";
import { Database } from "./types";

export const migrateToLatest = async (db: Kysely<Database>) => {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, "migrations"),
    })
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`National Rail migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.error(`Failed to execute National Rail migration "${it.migrationName}"`)
    }
  })

  if (error) {
    console.error('Failed to migrate National Rail database')
    console.error(error)
  }
};