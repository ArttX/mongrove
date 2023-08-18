import type { MongroveSchemaValidator } from "~/types";

type SchemaDefineOptions = {
    /**
     * ### Filters databases used with indexes update in schema
     * If function provided, filters out databases with given function,\
     * if not provided - uses default database from connection string.
     * @param dbName - given database name for check
     * @callback if returns true, then will include database in index update, else not.
     */
    filterDatabases?: (dbName: string) => boolean;
};

/**
 * ### Creates schema for database.
 * Uses key-value as definition.
 * - `key` - collection name
 * - `value` - `Collection()`
 * @example
 * const schema = new Schema({
 *     user: Collection({...})
 * });
 */
class Schema<Validator extends MongroveSchemaValidator> {
    private schema: Validator;
    private options: SchemaDefineOptions;

    constructor(schema: Validator, options: SchemaDefineOptions = {}) {
        this.schema = schema;
        this.options = options;
    }

    getSchema(): Validator {
        return this.schema;
    }

    getOptions(): SchemaDefineOptions {
        return this.options;
    }
}

export { Schema };
export * from "./NObject.ts";
export * from "./Collection.ts";
export * from "./fields/index.ts";
