import { z, type ZodType, type ZodArray, type ArrayCardinality } from "zod";

import type { ValidatorDefaultOptions } from "~/types";
import {
    Field,
    type CheckDefault,
    type CheckNone,
    type CheckNullable,
    type CheckOptional
} from "~/schema/types";

type InputType<T extends ZodType> = Field<T, object, false, false, false>;

type FieldType<T extends ZodType, I extends ArrayCardinality> = ZodArray<T, I>["_output"];
type ValidatorArrayOptions<T extends ZodType, I extends ArrayCardinality> = ValidatorDefaultOptions<
    FieldType<T, I>
> & {
    /** Should it contain at least one item */
    nonempty?: boolean;
    /** Must contain this or more items */
    min?: number;
    /** Must contain this or fewer items */
    max?: number;
    /** Must contain this items exactly */
    length?: number;
};

class ArrayField<
    T extends ZodType,
    I extends ArrayCardinality,
    Default extends boolean,
    Optional extends boolean,
    Nullable extends boolean
> extends Field<ZodArray<T, I>, ValidatorArrayOptions<T, I>, Default, Optional, Nullable> {}

/**
 * ### Creates `Array` field
 * @param field - Field with NO OPTIONS
 * @param options - Array field options
 */
export function array<T extends ZodType, I extends ArrayCardinality = "atleastone">(
    field: InputType<T>,
    options: ValidatorArrayOptions<T, I> & CheckDefault<FieldType<T, I>> & { nonempty: true }
): ArrayField<T, "atleastone", true, false, false>;
export function array<T extends ZodType, I extends ArrayCardinality = "atleastone">(
    field: InputType<T>,
    options: ValidatorArrayOptions<T, I> & CheckOptional & { nonempty: true }
): ArrayField<T, "atleastone", false, true, false>;
export function array<T extends ZodType, I extends ArrayCardinality = "atleastone">(
    field: InputType<T>,
    options: ValidatorArrayOptions<T, I> & CheckNullable & { nonempty: true }
): ArrayField<T, "atleastone", false, false, true>;
export function array<T extends ZodType, I extends ArrayCardinality = "atleastone">(
    field: InputType<T>,
    options: ValidatorArrayOptions<T, I> & CheckNone & { nonempty: true }
): ArrayField<T, "atleastone", false, false, false>;
export function array<T extends ZodType, I extends ArrayCardinality = "many">(
    field: InputType<T>,
    options: ValidatorArrayOptions<T, I> & CheckDefault<FieldType<T, I>> & { nonempty?: false }
): ArrayField<T, "many", true, false, false>;
export function array<T extends ZodType, I extends ArrayCardinality = "many">(
    field: InputType<T>,
    options: ValidatorArrayOptions<T, I> & CheckOptional & { nonempty?: false }
): ArrayField<T, "many", false, true, false>;
export function array<T extends ZodType, I extends ArrayCardinality = "many">(
    field: InputType<T>,
    options: ValidatorArrayOptions<T, I> & CheckNullable & { nonempty?: false }
): ArrayField<T, "many", false, false, true>;
export function array<T extends ZodType, I extends ArrayCardinality = "many">(
    field: InputType<T>,
    options?: ValidatorArrayOptions<T, I> & CheckNone & { nonempty?: false }
): ArrayField<T, "many", false, false, false>;
export function array<T extends ZodType, I extends ArrayCardinality = "many">(
    field: InputType<T>,
    options?: ValidatorArrayOptions<T, I>
): ArrayField<T, ArrayCardinality, boolean, boolean, boolean> {
    let validator = z.array(field.validator) as ZodArray<
        (typeof field)["validator"],
        ArrayCardinality
    >;

    if (!options) return new ArrayField(validator, {});

    // Field options
    if (options.nonempty !== undefined) validator = validator.nonempty();
    if (options.min !== undefined) validator = validator.min(options.min);
    if (options.max !== undefined) validator = validator.max(options.max);
    if (options.length !== undefined) validator = validator.length(options.length);

    // Default options
    if (options.nullable !== undefined) return new ArrayField(validator.nullable(), options);
    if (options.optional !== undefined) return new ArrayField(validator.optional(), options);
    if (options.default !== undefined)
        return new ArrayField(validator.default(options.default), options);

    return new ArrayField(validator, options);
}
