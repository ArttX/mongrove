import {
    z,
    type ZodType,
    type ZodObject,
    type ZodRawShape,
    type ZodOptional,
    type ZodNullable
} from "zod";
import type {
    Field,
    ValidatorDefaultOptions,
    ValidatorState,
    CheckNone,
    CheckNullable,
    CheckOptional
} from "~/schema/types";
import { isValidDefaultOptions } from "~/utils/fields.ts";
import { MongroveSchemaError } from "~/errors/SchemaError.ts";

// eslint-disable-next-line @typescript-eslint/ban-types
type ValidatorObjectOptions = Pick<ValidatorDefaultOptions, "nullable" | "optional"> & {};

type FieldOptions = ValidatorDefaultOptions;
type ObjectContent = Record<string, Field<ZodType, FieldOptions, boolean, boolean, boolean>>;

class ObjectField<
    Validator extends ZodObject<ZodRawShape>,
    Optional extends boolean,
    Nullable extends boolean
> {
    readonly validator: ValidatorState<Validator, false, Optional, Nullable>;
    readonly options: ValidatorObjectOptions;

    constructor(
        validator: ValidatorState<Validator, false, Optional, Nullable>,
        options: ValidatorObjectOptions
    ) {
        this.validator = validator;
        this.options = options;
    }
}

/**
 * ### Creates Nested Object in collection
 * @param fields Defined nested object fields
 * @param options
 * @example
 * city: Collection({
 *  location: NObject({ x: number(), y: number() })
 * })
 */
export function NObject<Fields extends ObjectContent>(
    fields: Fields,
    options?: ValidatorObjectOptions & Omit<CheckOptional, "default">
): ObjectField<ZodObject<TransformedFields<Fields>>, true, false>;
export function NObject<Fields extends ObjectContent>(
    fields: Fields,
    options?: ValidatorObjectOptions & Omit<CheckNullable, "default">
): ObjectField<ZodObject<TransformedFields<Fields>>, false, true>;
export function NObject<Fields extends ObjectContent>(
    fields: Fields,
    options?: ValidatorObjectOptions & Omit<CheckNone, "default">
): ObjectField<ZodObject<TransformedFields<Fields>>, false, false>;
export function NObject<Fields extends ObjectContent>(
    fields: Fields,
    options?: ValidatorObjectOptions
): ObjectField<ZodObject<TransformedFields<Fields>>, boolean, boolean> {
    const objectSchema = transformFields(fields);

    for (const key in fields) {
        const field = fields[key];

        // Check for field default options
        if (!isValidDefaultOptions(field.options))
            throw new MongroveSchemaError("Invalid Schema field options", {
                field: key
            });
    }

    const validator = z.strictObject(objectSchema);

    if (!options) return new ObjectField(validator, {});

    if (options.nullable !== undefined) return new ObjectField(validator.nullable(), options);
    if (options.optional !== undefined) return new ObjectField(validator.optional(), options);

    return new ObjectField(validator, options);
}

// ---

type TransformedFields<T extends ObjectContent> = {
    [K in keyof T]: T[K]["validator"];
};

function transformFields<T extends ObjectContent>(fields: T): TransformedFields<T> {
    const transformedFields: Partial<TransformedFields<T>> = {};

    for (const key in fields) {
        const { validator } = fields[key];
        transformedFields[key] = validator;
    }

    return transformedFields as TransformedFields<T>;
}
