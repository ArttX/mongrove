import { z, type ZodType, type ZodObject, type ZodRawShape } from "zod";
import type { Field } from "~/schema/types";
import type { ValidatorDefaultOptions } from "~/schema/types";
import { isValidDefaultOptions } from "~/utils/fields.ts";
import { MongroveSchemaError } from "~/errors/SchemaError.ts";

// eslint-disable-next-line @typescript-eslint/ban-types
type ValidatorObjectOptions = {};

type FieldOptions = ValidatorDefaultOptions;
type ObjectContent = Record<string, Field<ZodType, FieldOptions, boolean, boolean, boolean>>;

class ObjectField<Validator extends ZodObject<ZodRawShape> = ZodObject<ZodRawShape>> {
    readonly validator: Validator;
    readonly options: ValidatorObjectOptions;

    constructor(validator: Validator, options: ValidatorObjectOptions) {
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
    options?: ValidatorObjectOptions
): ObjectField<ZodObject<TransformedFields<Fields>>> {
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
