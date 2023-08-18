import { z, type ZodDate } from "zod";

import type { ValidatorDefaultOptions } from "~/types";
import {
    Field,
    type CheckDefault,
    type CheckNone,
    type CheckNullable,
    type CheckOptional
} from "~/schema/types";

type FieldType = () => ZodDate["_output"];
type ValidatorDateOptions = ValidatorDefaultOptions<FieldType> & {
    /** Minimal date allowed */
    min?: Date;
    /** Maximal date allowed */
    max?: Date;
};

class DateField<
    Default extends boolean,
    Optional extends boolean,
    Nullable extends boolean
> extends Field<ZodDate, ValidatorDateOptions, Default, Optional, Nullable> {}

/**
 * ### Creates `Date` field
 * @param options - Array field options
 */
export function date(
    options: ValidatorDateOptions & CheckDefault<FieldType>
): DateField<true, false, false>;
export function date(options: ValidatorDateOptions & CheckOptional): DateField<false, true, false>;
export function date(options: ValidatorDateOptions & CheckNullable): DateField<false, false, true>;
export function date(options?: ValidatorDateOptions & CheckNone): DateField<false, false, false>;
export function date(options?: ValidatorDateOptions): DateField<boolean, boolean, boolean> {
    let validator = z.date();

    if (!options) return new DateField(validator, {});

    // Field options
    if (options.min !== undefined) validator = validator.min(options.min);
    if (options.max !== undefined) validator = validator.max(options.max);

    // Default options
    if (options.nullable !== undefined) return new DateField(validator.nullable(), options);
    if (options.optional !== undefined) return new DateField(validator.optional(), options);
    if (options.default !== undefined)
        return new DateField(validator.default(options.default), options);

    return new DateField(validator, options);
}
