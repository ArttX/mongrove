import { z, type ZodType } from "zod";
import { ObjectId } from "mongodb";

import type { ValidatorDefaultOptions } from "~/types";
import {
    Field,
    type CheckDefault,
    type CheckNone,
    type CheckNullable,
    type CheckOptional
} from "~/schema/types";

type ObjectIdType = ZodType<ObjectId>;
type FieldType = () => ObjectIdType["_output"];
// eslint-disable-next-line @typescript-eslint/ban-types
type ValidatorObjectIdOptions = ValidatorDefaultOptions<FieldType> & {};

class ObjectIdField<
    Default extends boolean,
    Optional extends boolean,
    Nullable extends boolean
> extends Field<ObjectIdType, ValidatorObjectIdOptions, Default, Optional, Nullable> {}

/**
 * ### Creates MongoDb's `ObjectId` field
 * @param options - ObjectId field options
 */
export function objectId(
    options: ValidatorObjectIdOptions & CheckDefault<FieldType>
): ObjectIdField<true, false, false>;
export function objectId(
    options: ValidatorObjectIdOptions & CheckOptional
): ObjectIdField<false, true, false>;
export function objectId(
    options: ValidatorObjectIdOptions & CheckNullable
): ObjectIdField<false, false, true>;
export function objectId(
    options?: ValidatorObjectIdOptions & CheckNone
): ObjectIdField<false, false, false>;
export function objectId(
    options?: ValidatorObjectIdOptions
): ObjectIdField<boolean, boolean, boolean> {
    const validator = z.custom<ObjectId>(data => ObjectId.isValid(data as ObjectId));

    if (!options) return new ObjectIdField(validator, {});

    // Default options
    if (options.nullable !== undefined) return new ObjectIdField(validator.nullable(), options);
    if (options.optional !== undefined) return new ObjectIdField(validator.optional(), options);
    if (options.default !== undefined)
        return new ObjectIdField(validator.default(options.default), options);

    return new ObjectIdField(validator, options);
}
