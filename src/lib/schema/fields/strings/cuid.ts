import { z, type ZodString } from "zod";
import type { ValidatorDefaultOptions } from "~/types";
import {
    Field,
    type CheckDefault,
    type CheckNone,
    type CheckNullable,
    type CheckOptional
} from "~/schema/types";

type FieldType = ZodString["_output"];
type ValidatorCuidOptions = ValidatorDefaultOptions<FieldType> & {
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

class CuidField<
    Default extends boolean,
    Optional extends boolean,
    Nullable extends boolean
> extends Field<ZodString, ValidatorCuidOptions, Default, Optional, Nullable> {}

/**
 * Creates `String` field, that validates `Cuid`
 * @param options - Cuid field options
 */
export function cuid(
    options: ValidatorCuidOptions & CheckDefault<FieldType>
): CuidField<true, false, false>;
export function cuid(options: ValidatorCuidOptions & CheckOptional): CuidField<false, true, false>;
export function cuid(options: ValidatorCuidOptions & CheckNullable): CuidField<false, false, true>;
export function cuid(options?: ValidatorCuidOptions & CheckNone): CuidField<false, false, false>;
export function cuid(options?: ValidatorCuidOptions): CuidField<boolean, boolean, boolean> {
    let validator = z.string().cuid();

    if (!options) return new CuidField(validator, {});

    // Field options
    if (options.min !== undefined) validator = validator.min(options.min);
    if (options.max !== undefined) validator = validator.max(options.max);
    if (options.regex !== undefined) validator = validator.regex(options.regex);
    if (options.includes !== undefined) validator = validator.includes(options.includes);
    if (options.startsWith !== undefined) validator = validator.startsWith(options.startsWith);
    if (options.endsWith !== undefined) validator = validator.endsWith(options.endsWith);

    // Default options
    if (options.nullable !== undefined) return new CuidField(validator.nullable(), options);
    if (options.optional !== undefined) return new CuidField(validator.optional(), options);
    if (options.default !== undefined)
        return new CuidField(validator.default(options.default), options);

    return new CuidField(validator, options);
}
