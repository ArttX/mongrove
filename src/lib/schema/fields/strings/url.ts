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
type ValidatorUrlOptions = ValidatorDefaultOptions<FieldType> & {
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

class UrlField<
    Default extends boolean,
    Optional extends boolean,
    Nullable extends boolean
> extends Field<ZodString, ValidatorUrlOptions, Default, Optional, Nullable> {}

/**
 * Creates `String` field, that validates `Url`
 * @param options - Url field options
 */
export function url(
    options: ValidatorUrlOptions & CheckDefault<FieldType>
): UrlField<true, false, false>;
export function url(options: ValidatorUrlOptions & CheckOptional): UrlField<false, true, false>;
export function url(options: ValidatorUrlOptions & CheckNullable): UrlField<false, false, true>;
export function url(options?: ValidatorUrlOptions & CheckNone): UrlField<false, false, false>;
export function url(options?: ValidatorUrlOptions): UrlField<boolean, boolean, boolean> {
    let validator = z.string().url();

    if (!options) return new UrlField(validator, {});

    // Field options
    if (options.min !== undefined) validator = validator.min(options.min);
    if (options.max !== undefined) validator = validator.max(options.max);
    if (options.regex !== undefined) validator = validator.regex(options.regex);
    if (options.includes !== undefined) validator = validator.includes(options.includes);
    if (options.startsWith !== undefined) validator = validator.startsWith(options.startsWith);
    if (options.endsWith !== undefined) validator = validator.endsWith(options.endsWith);

    // Default options
    if (options.nullable !== undefined) return new UrlField(validator.nullable(), options);
    if (options.optional !== undefined) return new UrlField(validator.optional(), options);
    if (options.default !== undefined)
        return new UrlField(validator.default(options.default), options);

    return new UrlField(validator, options);
}
