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
type ValidatorIpOptions = ValidatorDefaultOptions<FieldType> & {
    /** Minimal length of string */
    min?: number;
    /** Maximal length of string */
    max?: number;
    /** Version of IP */
    version?: "v4" | "v6";
    /** Regex for validating provided string */
    regex?: RegExp;
    /** Check if input string includes provided string */
    includes?: string;
    /** Check if input string starts with provided string */
    startsWith?: string;
    /** Check if input string ends with provided string  */
    endsWith?: string;
};

class IpField<
    Default extends boolean,
    Optional extends boolean,
    Nullable extends boolean
> extends Field<ZodString, ValidatorIpOptions, Default, Optional, Nullable> {}

/**
 * Creates `String` field, that validates `Ip`
 * @param options - Ip field options
 */
export function ip(
    options: ValidatorIpOptions & CheckDefault<FieldType>
): IpField<true, false, false>;
export function ip(options: ValidatorIpOptions & CheckOptional): IpField<false, true, false>;
export function ip(options: ValidatorIpOptions & CheckNullable): IpField<false, false, true>;
export function ip(options?: ValidatorIpOptions & CheckNone): IpField<false, false, false>;
export function ip(options?: ValidatorIpOptions): IpField<boolean, boolean, boolean> {
    let validator = z.string().ip();

    if (!options) return new IpField(validator, {});

    // Field options
    if (options.version !== undefined) validator = z.string().ip({ version: options.version });
    if (options.min !== undefined) validator = validator.min(options.min);
    if (options.max !== undefined) validator = validator.max(options.max);
    if (options.regex !== undefined) validator = validator.regex(options.regex);
    if (options.includes !== undefined) validator = validator.includes(options.includes);
    if (options.startsWith !== undefined) validator = validator.startsWith(options.startsWith);
    if (options.endsWith !== undefined) validator = validator.endsWith(options.endsWith);

    // Default options
    if (options.nullable !== undefined) return new IpField(validator.nullable(), options);
    if (options.optional !== undefined) return new IpField(validator.optional(), options);
    if (options.default !== undefined)
        return new IpField(validator.default(options.default), options);

    return new IpField(validator, options);
}
