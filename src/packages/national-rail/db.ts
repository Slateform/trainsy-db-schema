import { Kysely, PostgresDialect } from "kysely";
import { Pool, PoolConfig } from "pg";
import { Database } from "./types";

export function createNationalRailDb(config: PoolConfig) {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool(config),
    })
  })
}