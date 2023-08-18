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
type ValidatorStringOptions = ValidatorDefaultOptions<FieldType> & {
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

class StringField<
    Default extends boolean,
    Optional extends boolean,
    Nullable extends boolean
> extends Field<ZodString, ValidatorStringOptions, Default, Optional, Nullable> {}

/**
 * ### Creates `String` field
 * @param options - String field options
 */
export function string(
    options: ValidatorStringOptions & CheckDefault<FieldType>
): StringField<true, false, false>;
export function string(
    options: ValidatorStringOptions & CheckOptional
): StringField<false, true, false>;
export function string(
    options: ValidatorStringOptions & CheckNullable
): StringField<false, false, true>;
export function string(
    options?: ValidatorStringOptions & CheckNone
): StringField<false, false, false>;
export function string(options?: ValidatorStringOptions): StringField<boolean, boolean, boolean> {
    let validator = z.string();

    if (!options) return new StringField(validator, {});

    // Field options
    if (options.min) validator = validator.min(options.min);
    if (options.max) validator = validator.max(options.max);
    if (options.regex) validator = validator.regex(options.regex);
    if (options.includes) validator = validator.includes(options.includes);
    if (options.startsWith) validator = validator.startsWith(options.startsWith);
    if (options.endsWith) validator = validator.endsWith(options.endsWith);

    // Default options
    if (options.nullable !== undefined) return new StringField(validator.nullable(), options);
    if (options.optional !== undefined) return new StringField(validator.optional(), options);
    if (options.default !== undefined)
        return new StringField(validator.default(options.default), options);

    return new StringField(validator, options);
}
