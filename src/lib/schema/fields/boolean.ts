import { z, type ZodBoolean } from "zod";

import type { ValidatorDefaultOptions } from "~/schema/types";
import {
    Field,
    type CheckDefault,
    type CheckNone,
    type CheckNullable,
    type CheckOptional
} from "~/schema/types";

type FieldType = ZodBoolean["_output"];
// eslint-disable-next-line @typescript-eslint/ban-types
type ValidatorBooleanOptions = ValidatorDefaultOptions<FieldType> & {};

class BooleanField<
    Default extends boolean,
    Optional extends boolean,
    Nullable extends boolean
> extends Field<ZodBoolean, ValidatorBooleanOptions, Default, Optional, Nullable> {}

/**
 * ### Creates `Boolean` field
 * @param options - Boolean field options
 */
export function boolean(
    options: ValidatorBooleanOptions & CheckDefault<FieldType>
): BooleanField<true, false, false>;
export function boolean(
    options: ValidatorBooleanOptions & CheckOptional
): BooleanField<false, true, false>;
export function boolean(
    options: ValidatorBooleanOptions & CheckNullable
): BooleanField<false, false, true>;
export function boolean(
    options?: ValidatorBooleanOptions & CheckNone
): BooleanField<false, false, false>;
export function boolean(
    options?: ValidatorBooleanOptions
): BooleanField<boolean, boolean, boolean> {
    const validator = z.boolean();

    if (!options) return new BooleanField(validator, {});

    // Default options
    if (options.nullable !== undefined) return new BooleanField(validator.nullable(), options);
    if (options.default !== undefined)
        return new BooleanField(validator.default(options.default), options);
    if (options.optional !== undefined) return new BooleanField(validator.optional(), options);

    return new BooleanField(validator, options);
}
