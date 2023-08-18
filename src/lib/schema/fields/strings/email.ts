import { z, type ZodString } from "zod";
import {
    Field,
    type CheckDefault,
    type CheckNone,
    type CheckNullable,
    type CheckOptional,
    type ValidatorDefaultOptions
} from "~/schema/types";

type FieldType = EmailType["_output"];
type ValidatorEmailOptions = ValidatorDefaultOptions<FieldType> & {
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

type EmailType = ReturnType<ZodString["email"]>;

class EmailField<
    Default extends boolean,
    Optional extends boolean,
    Nullable extends boolean
> extends Field<EmailType, ValidatorEmailOptions, Default, Optional, Nullable> {}

/**
 * Creates `String` field, that validates `Email`
 * @param options - Email field options
 */
export function email(
    options: ValidatorEmailOptions & CheckDefault<FieldType>
): EmailField<true, false, false>;
export function email(
    options: ValidatorEmailOptions & CheckOptional
): EmailField<false, true, false>;
export function email(
    options: ValidatorEmailOptions & CheckNullable
): EmailField<false, false, true>;
export function email(options?: ValidatorEmailOptions & CheckNone): EmailField<false, false, false>;
export function email(options?: ValidatorEmailOptions): EmailField<boolean, boolean, boolean> {
    let validator = z.string().email();

    if (!options) return new EmailField(validator, {});

    // Field options
    if (options.min !== undefined) validator = validator.min(options.min);
    if (options.max !== undefined) validator = validator.max(options.max);
    if (options.regex !== undefined) validator = validator.regex(options.regex);
    if (options.includes !== undefined) validator = validator.includes(options.includes);
    if (options.startsWith !== undefined) validator = validator.startsWith(options.startsWith);
    if (options.endsWith !== undefined) validator = validator.endsWith(options.endsWith);

    // Default options
    if (options.nullable !== undefined) return new EmailField(validator.nullable(), options);
    if (options.optional !== undefined) return new EmailField(validator.optional(), options);
    if (options.default !== undefined)
        return new EmailField(validator.default(options.default), options);

    return new EmailField(validator, options);
}
