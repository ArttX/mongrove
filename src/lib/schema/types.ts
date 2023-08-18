import {
    type ZodType,
    type ZodDefault,
    type ZodOptional,
    type ZodDate,
    type ZodNullable
} from "zod";
import type { ObjectId } from "mongodb";
import type { ValidatorDefaultOptions } from "~/types";

type If<O extends boolean, If extends ZodType, Else extends ZodType> = O extends true ? If : Else;

// prettier-ignore
type ValidatorState<
    T extends ZodType,
    Default extends boolean,
    Optional extends boolean,
    Nullable extends boolean
> = If<
    Nullable,
    ZodNullable<T>,
    If<
        Optional,
        ZodOptional<T>,
        If<Default, ZodDefault<T>, T>
    >
>;

type IsDate<T extends ZodType> = T extends ZodDate ? () => T["_output"] : T["_output"];
type IsObjectId<T extends ZodType> = T extends ZodType<ObjectId>
    ? () => T["_output"]
    : T["_output"];
type NeedsFn<T extends ZodType> = IsDate<T> | IsObjectId<T>;

export abstract class Field<
    T extends ZodType,
    O extends ValidatorDefaultOptions<NeedsFn<T>>,
    Default extends boolean,
    Optional extends boolean,
    Nullable extends boolean
> {
    readonly validator: ValidatorState<T, Default, Optional, Nullable>;
    readonly options: O;

    constructor(validator: ValidatorState<T, Default, Optional, Nullable>, options: O) {
        this.validator = validator;
        this.options = options;
    }
}

// Field overload check
export type CheckDefault<T> = { default: T; optional?: false; nullable?: false };
export type CheckOptional = { default?: undefined; optional: true; nullable?: false };
export type CheckNullable = { default?: undefined; optional?: false; nullable: true };
export type CheckNone = { default?: undefined; optional?: false; nullable?: false };
