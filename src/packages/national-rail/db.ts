import { Kysely, PostgresDialect } from "kysely";
import { Pool, PoolConfig } from "pg";
import { Database } from "./types";

export type NationalRailDb = Kysely<Database>;

export function createDb(config: PoolConfig): NationalRailDb {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool(config),
    })
  })
}