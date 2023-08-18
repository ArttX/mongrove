import { z, type ZodEnum, type ZodString, type Writeable } from "zod";
import type { ValidatorDefaultOptions } from "~/schema/types";
import {
    Field,
    type CheckDefault,
    type CheckNone,
    type CheckNullable,
    type CheckOptional
} from "~/schema/types";

type FieldType = ZodString["_output"];
// eslint-disable-next-line @typescript-eslint/ban-types
type ValidatorEnumOptions = ValidatorDefaultOptions<FieldType> & {};

class EnumField<
    const T extends readonly [string, ...string[]],
    Default extends boolean,
    Optional extends boolean,
    Nullable extends boolean
> extends Field<ZodEnum<Writeable<T>>, ValidatorEnumOptions, Default, Optional, Nullable> {}

/**
 * ### Creates Enum field
 * @param options - Enum field options
 */
export function enumField<const T extends readonly [string, ...string[]]>(
    enumArray: T,
    options: ValidatorEnumOptions & CheckDefault<T[number]>
): EnumField<T, true, false, false>;
export function enumField<const T extends readonly [string, ...string[]]>(
    enumArray: T,
    options: ValidatorEnumOptions & CheckOptional
): EnumField<T, false, true, false>;
export function enumField<const T extends readonly [string, ...string[]]>(
    enumArray: T,
    options: ValidatorEnumOptions & CheckNullable
): EnumField<T, false, false, true>;
export function enumField<const T extends readonly [string, ...string[]]>(
    enumArray: T,
    options?: ValidatorEnumOptions & CheckNone
): EnumField<T, false, false, false>;
export function enumField<const T extends readonly [string, ...string[]]>(
    enumArray: T,
    options?: ValidatorEnumOptions
): EnumField<T, boolean, boolean, boolean> {
    const validator = z.enum(enumArray);

    if (!options) return new EnumField(validator, {});

    // Default options
    if (options.nullable !== undefined) return new EnumField(validator.nullable(), options);
    if (options.optional !== undefined) return new EnumField(validator.optional(), options);
    if (options.default !== undefined)
        return new EnumField(
            validator.default(options.default as z.util.noUndefined<Writeable<T>[number]>),
            options
        );

    return new EnumField(validator, options);
}
