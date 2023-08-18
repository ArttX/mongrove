import { z } from "zod";
import type { ZodRawShape, ZodType, ZodObject } from "zod";
import type { Field } from "~/schema/types";
import type { ValidatorDefaultOptions, CreateIndexOptions } from "~/types";
import { isValidDefaultOptions } from "~/utils/fields.ts";
import { MongroveSchemaError } from "~/errors/SchemaError.ts";

// eslint-disable-next-line @typescript-eslint/ban-types
type ValidatorCollectionOptions = {};

type FieldOptions = ValidatorDefaultOptions;
type CollectionFields = Record<string, Field<ZodType, FieldOptions, boolean, boolean, boolean>>;

export class CollectionObject<Validator extends ZodObject<ZodRawShape> = ZodObject<ZodRawShape>> {
    readonly validator: Validator;
    readonly options: ValidatorCollectionOptions;
    readonly fieldIndexes: Map<string, CreateIndexOptions>;

    constructor(
        validator: Validator,
        options: ValidatorCollectionOptions,
        indexes: Map<string, CreateIndexOptions>
    ) {
        this.validator = validator;
        this.options = options;
        this.fieldIndexes = indexes;
    }
}

/**
 * ### Creates schema for Mongo [Collection](https://www.mongodb.com/docs/manual/core/databases-and-collections/#collections)
 * @param fields Define fields using field functions _(string(), number(), boolean(), etc.)_
 * @param options Collection options
 * @throws {MongroveSchemaError} - when invalid field options
 * @example
 * user: Collection({
 *   username: string()
 * })
 */
export function Collection<Fields extends CollectionFields>(
    fields: Fields,
    options?: ValidatorCollectionOptions
): CollectionObject<ZodObject<TransformedFields<Fields>>> {
    const collectionSchema = transformFields(fields);
    const fieldIndexMap = new Map<string, CreateIndexOptions>();

    for (const key in fields) {
        const field = fields[key];

        // Check for field default options
        if (!isValidDefaultOptions(field.options))
            throw new MongroveSchemaError(
                "Invalid Schema field options. Options `optional`, `nullable`, `default` are incompatible together. Please select one of them.",
                {
                    field: key
                }
            );

        // Set indexes
        const indexProps = field.options.index;
        if (indexProps) fieldIndexMap.set(key, indexProps);
    }

    const validator = z.strictObject(collectionSchema);

    if (!options) return new CollectionObject(validator, {}, fieldIndexMap);

    return new CollectionObject(validator, options, fieldIndexMap);
}

// ---

type TransformedFields<T extends CollectionFields> = {
    [K in keyof T]: T[K]["validator"];
};

function transformFields<T extends CollectionFields>(fields: T): TransformedFields<T> {
    const transformedFields: Partial<TransformedFields<T>> = {};

    for (const key in fields) {
        const { validator } = fields[key];
        transformedFields[key] = validator;
    }

    return transformedFields as TransformedFields<T>;
}
