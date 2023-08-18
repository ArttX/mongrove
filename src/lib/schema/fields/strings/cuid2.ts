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
type ValidatorCuid2Options = ValidatorDefaultOptions<FieldType> & {
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

class Cuid2Field<
    Default extends boolean,
    Optional extends boolean,
    Nullable extends boolean
> extends Field<ZodString, ValidatorCuid2Options, Default, Optional, Nullable> {}

/**
 * Creates `String` field, that validates `Cuid2`
 * @param options - Cuid2 field options
 */
export function cuid2(
    options: ValidatorCuid2Options & CheckDefault<FieldType>
): Cuid2Field<true, false, false>;
export function cuid2(
    options: ValidatorCuid2Options & CheckOptional
): Cuid2Field<false, true, false>;
export function cuid2(
    options: ValidatorCuid2Options & CheckNullable
): Cuid2Field<false, false, true>;
export function cuid2(options?: ValidatorCuid2Options & CheckNone): Cuid2Field<false, false, false>;
export function cuid2(options?: ValidatorCuid2Options): Cuid2Field<boolean, boolean, boolean> {
    let validator = z.string().cuid2();

    if (!options) return new Cuid2Field(validator, {});

    // Field options
    if (options.min !== undefined) validator = validator.min(options.min);
    if (options.max !== undefined) validator = validator.max(options.max);
    if (options.regex !== undefined) validator = validator.regex(options.regex);
    if (options.includes !== undefined) validator = validator.includes(options.includes);
    if (options.startsWith !== undefined) validator = validator.startsWith(options.startsWith);
    if (options.endsWith !== undefined) validator = validator.endsWith(options.endsWith);

    // Default options
    if (options.nullable !== undefined) return new Cuid2Field(validator.nullable(), options);
    if (options.optional !== undefined) return new Cuid2Field(validator.optional(), options);
    if (options.default !== undefined)
        return new Cuid2Field(validator.default(options.default), options);

    return new Cuid2Field(validator, options);
}
