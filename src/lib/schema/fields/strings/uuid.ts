import { z, type ZodString } from "zod";
import type { ValidatorDefaultOptions } from "~/schema/types";
import {
    Field,
    type CheckDefault,
    type CheckNone,
    type CheckNullable,
    type CheckOptional
} from "~/schema/types";

type FieldType = ZodString["_output"];
type ValidatorUuidOptions = ValidatorDefaultOptions<FieldType> & {
    /** Minimal length of string */
    min?: number;
    /** Maximal length of string */
    max?: number;
    /** Regex for validating provided string */
    regex?: RegExp;
    /** Check if input string includes provided string */
    includes?: string;
    /** Check if input string starts with provided string */
    startsWith?: string;
    /** Check if input string ends with provided string  */
    endsWith?: string;
};

class UuidField<
    Default extends boolean,
    Optional extends boolean,
    Nullable extends boolean
> extends Field<ZodString, ValidatorUuidOptions, Default, Optional, Nullable> {}

/**
 * Creates `String` field, that validates `Uuid`
 * @param options - Uuid field options
 */
export function uuid(
    options: ValidatorUuidOptions & CheckDefault<FieldType>
): UuidField<true, false, false>;
export function uuid(options: ValidatorUuidOptions & CheckOptional): UuidField<false, true, false>;
export function uuid(options: ValidatorUuidOptions & CheckNullable): UuidField<false, false, true>;
export function uuid(options?: ValidatorUuidOptions & CheckNone): UuidField<false, false, false>;
export function uuid(options?: ValidatorUuidOptions): UuidField<boolean, boolean, boolean> {
    let validator = z.string().uuid();

    if (!options) return new UuidField(validator, {});

    // Field options
    if (options.min !== undefined) validator = validator.min(options.min);
    if (options.max !== undefined) validator = validator.max(options.max);
    if (options.regex !== undefined) validator = validator.regex(options.regex);
    if (options.includes !== undefined) validator = validator.includes(options.includes);
    if (options.startsWith !== undefined) validator = validator.startsWith(options.startsWith);
    if (options.endsWith !== undefined) validator = validator.endsWith(options.endsWith);

    // Default options
    if (options.nullable !== undefined) return new UuidField(validator.nullable(), options);
    if (options.optional !== undefined) return new UuidField(validator.optional(), options);
    if (options.default !== undefined)
        return new UuidField(validator.default(options.default), options);

    return new UuidField(validator, options);
}
