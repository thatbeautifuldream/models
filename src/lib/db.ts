import Dexie, { type EntityTable } from "dexie";
import type { TCachedData } from "@/types/api";
import { CACHE_STORE_NAME, DB_NAME } from "./constants";

export class ModelsDatabase extends Dexie {
  cache!: EntityTable<TCachedData & { id: string }, "id">;

  constructor() {
    super(DB_NAME);
    this.version(1).stores({
      [CACHE_STORE_NAME]: "id, timestamp",
    });
  }
}

export const db = new ModelsDatabase();
