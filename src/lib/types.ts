import type { CollectionObject } from "./schema/Collection.ts";
import type {
    CreateIndexesOptions,
    InsertOneOptions,
    BulkWriteOptions,
    FindOneAndReplaceOptions,
    FindOneAndUpdateOptions,
    ReplaceOptions,
    UpdateOptions
} from "mongodb";

export type MongroveSchemaValidator = Record<string, CollectionObject>;

export type CreateIndexOptions = Pick<CreateIndexesOptions, "unique">;

// eslint-disable-next-line @typescript-eslint/ban-types
export type MongroveQueryOptions = {};
export type MongroveInsertOneOptions = InsertOneOptions & MongroveQueryOptions;
export type MongroveBulkWriteOptions = BulkWriteOptions & MongroveQueryOptions;
export type MongroveFindOneAndReplaceOptions = FindOneAndReplaceOptions & MongroveQueryOptions;
export type MongroveFindOneAndUpdateOptions = FindOneAndUpdateOptions & MongroveQueryOptions;
export type MongroveReplaceOptions = ReplaceOptions & MongroveQueryOptions;
export type MongroveUpdateOptions = UpdateOptions & MongroveQueryOptions;
