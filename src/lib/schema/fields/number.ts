import { z, type ZodNumber } from "zod";

import type { ValidatorDefaultOptions } from "~/types";
import {
    Field,
    type CheckDefault,
    type CheckNone,
    type CheckNullable,
    type CheckOptional
} from "~/schema/types";

type FieldType = ZodNumber["_output"];
type ValidatorNumberOptions = ValidatorDefaultOptions<FieldType> & {
    /** If `true`, accepts only integers (whole numbers) */
    int?: boolean;
    /** Type of number */
    type?: "positive" | "nonnegative" | "negative" | "nonpositive";
};

class NumberField<
    Default extends boolean,
    Optional extends boolean,
    Nullable extends boolean
> extends Field<ZodNumber, ValidatorNumberOptions, Default, Optional, Nullable> {}

/**
 * ### Creates `Number` field
 * @param options - Number field options
 */
export function number(
    options: ValidatorNumberOptions & CheckDefault<FieldType>
): NumberField<true, false, false>;
export function number(
    options: ValidatorNumberOptions & CheckOptional
): NumberField<false, true, false>;
export function number(
    options: ValidatorNumberOptions & CheckNullable
): NumberField<false, false, true>;
export function number(
    options?: ValidatorNumberOptions & CheckNone
): NumberField<false, false, false>;
export function number(options?: ValidatorNumberOptions): NumberField<boolean, boolean, boolean> {
    let validator = z.number();

    if (!options) return new NumberField(validator, {});

    // Field options
    if (options.int !== undefined) validator = validator.int();
    switch (options.type) {
        case "negative":
            validator = validator.negative();
            break;
        case "nonnegative":
            validator = validator.nonnegative();
            break;
        case "nonpositive":
            validator = validator.nonpositive();
            break;
        case "positive":
            validator = validator.positive();
            break;
    }

    // Default options
    if (options.nullable !== undefined) return new NumberField(validator.nullable(), options);
    if (options.optional !== undefined) return new NumberField(validator.optional(), options);
    if (options.default !== undefined)
        return new NumberField(validator.default(options.default), options);

    return new NumberField(validator, options);
}
