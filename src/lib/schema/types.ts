import {
    type ZodType,
    type ZodDefault,
    type ZodOptional,
    type ZodDate,
    type ZodNullable
} from "zod";
import type { ObjectId } from "mongodb";
import type { MongroveSchemaValidator, CreateIndexOptions } from "~/types";
import type { MongroveCollection } from "../collection.ts";
import type { Schema } from "../schema/index.ts";

export type ValidatorDefaultOptions<
    D extends ZodType["_output"] | (() => ZodType["_output"]) = unknown
> = {
    index?: CreateIndexOptions;
    default?: D;
    optional?: boolean;
    nullable?: boolean;
};

type If<O extends boolean, If extends ZodType, Else extends ZodType> = O extends true ? If : Else;

// prettier-ignore
type ValidatorState<
    T extends ZodType,
    Default extends boolean,
    Optional extends boolean,
    Nullable extends boolean
> = If<
    Nullable,
    ZodNullable<T>,
    If<
        Optional,
        ZodOptional<T>,
        If<Default, ZodDefault<T>, T>
    >
>;

type IsDate<T extends ZodType> = T extends ZodDate ? () => T["_output"] : T["_output"];
type IsObjectId<T extends ZodType> = T extends ZodType<ObjectId>
    ? () => T["_output"]
    : T["_output"];
type NeedsFn<T extends ZodType> = IsDate<T> | IsObjectId<T>;

export abstract class Field<
    T extends ZodType,
    O extends ValidatorDefaultOptions<NeedsFn<T>>,
    Default extends boolean,
    Optional extends boolean,
    Nullable extends boolean
> {
    readonly validator: ValidatorState<T, Default, Optional, Nullable>;
    readonly options: O;

    constructor(validator: ValidatorState<T, Default, Optional, Nullable>, options: O) {
        this.validator = validator;
        this.options = options;
    }
}

// Field overload check
export type CheckDefault<T> = { default: T; optional?: false; nullable?: false };
export type CheckOptional = { default?: undefined; optional: true; nullable?: false };
export type CheckNullable = { default?: undefined; optional?: false; nullable: true };
export type CheckNone = { default?: undefined; optional?: false; nullable?: false };

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
