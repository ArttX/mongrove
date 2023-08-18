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
type ValidatorEmojiOptions = ValidatorDefaultOptions<FieldType> & {
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

class EmojiField<
    Default extends boolean,
    Optional extends boolean,
    Nullable extends boolean
> extends Field<ZodString, ValidatorEmojiOptions, Default, Optional, Nullable> {}

/**
 * Creates `String` field, that validates `Emoji`
 * @param options - Emoji field options
 */
export function emoji(
    options: ValidatorEmojiOptions & CheckDefault<FieldType>
): EmojiField<true, false, false>;
export function emoji(
    options: ValidatorEmojiOptions & CheckOptional
): EmojiField<false, true, false>;
export function emoji(
    options: ValidatorEmojiOptions & CheckNullable
): EmojiField<false, false, true>;
export function emoji(options?: ValidatorEmojiOptions & CheckNone): EmojiField<false, false, false>;
export function emoji(options?: ValidatorEmojiOptions): EmojiField<boolean, boolean, boolean> {
    let validator = z.string().emoji();

    if (!options) return new EmojiField(validator, {});

    // Field options
    if (options.min !== undefined) validator = validator.min(options.min);
    if (options.max !== undefined) validator = validator.max(options.max);
    if (options.regex !== undefined) validator = validator.regex(options.regex);
    if (options.includes !== undefined) validator = validator.includes(options.includes);
    if (options.startsWith !== undefined) validator = validator.startsWith(options.startsWith);
    if (options.endsWith !== undefined) validator = validator.endsWith(options.endsWith);

    // Default options
    if (options.nullable !== undefined) return new EmojiField(validator.nullable(), options);
    if (options.optional !== undefined) return new EmojiField(validator.optional(), options);
    if (options.default !== undefined)
        return new EmojiField(validator.default(options.default), options);

    return new EmojiField(validator, options);
}
