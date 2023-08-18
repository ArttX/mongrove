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
import type { ZodType } from "zod";
import type { MongroveCollection } from "./collection.ts";
import type { Schema } from "./schema/index.ts";

export type MongroveSchemaValidator = Record<string, CollectionObject>;

export type CreateIndexOptions = Pick<CreateIndexesOptions, "unique">;

export type ValidatorDefaultOptions<
    D extends ZodType["_output"] | (() => ZodType["_output"]) = unknown
> = {
    index?: CreateIndexOptions;
    default?: D;
    optional?: boolean;
    nullable?: boolean;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type MongroveQueryOptions = {};
export type MongroveInsertOneOptions = InsertOneOptions & MongroveQueryOptions;
export type MongroveBulkWriteOptions = BulkWriteOptions & MongroveQueryOptions;
export type MongroveFindOneAndReplaceOptions = FindOneAndReplaceOptions & MongroveQueryOptions;
export type MongroveFindOneAndUpdateOptions = FindOneAndUpdateOptions & MongroveQueryOptions;
export type MongroveReplaceOptions = ReplaceOptions & MongroveQueryOptions;
export type MongroveUpdateOptions = UpdateOptions & MongroveQueryOptions;

// Utils
/**
 * ### Exports collection field types from provided Mongrove collection type
 * @param Col - typeof MongroveCollection
 * @param Type - "output" | "input" - Schema type after/before parsing
 */
export type SchemaFromCollection<
    Col,
    Type extends "output" | "input" = "output"
> = Col extends MongroveCollection<MongroveSchemaValidator, string, infer O, infer I>
    ? Type extends "output"
        ? O
        : I
    : never;

/**
 * ### Exports schema type for further type utility functions
 * @param S - typeof Schema
 */
export type ExtractSchemaType<S extends Schema<MongroveSchemaValidator>> = S extends Schema<
    infer Validator
>
    ? Validator
    : never;

/**
 * ### Returns schema type of collection from provided schema type and collection name
 * @param V - typeof MongroveSchemaValidator _(Can be extracted using ExtractSchemaType)_
 * @param Name - name of collection
 * @param Type - "output" | "input" - Schema type after/before parsing
 */
export type SchemaOf<
    V extends MongroveSchemaValidator,
    Name extends keyof V,
    Type extends "output" | "input" = "output"
> = V extends MongroveSchemaValidator
    ? Type extends "output"
        ? V[Name]["validator"]["_output"]
        : V[Name]["validator"]["_input"]
    : never;
