import { Collection, MongoServerError, type Db } from "mongodb";
import { ZodError } from "zod";
import {
    MongroveErrorCodes,
    MongroveValidationError,
    MongroveServerError
} from "~/errors/index.ts";

import type {
    MongroveSchemaValidator,
    MongroveInsertOneOptions,
    MongroveBulkWriteOptions,
    MongroveFindOneAndReplaceOptions,
    MongroveFindOneAndUpdateOptions,
    MongroveReplaceOptions,
    MongroveUpdateOptions
} from "~/types";
import type {
    CollectionOptions,
    OptionalUnlessRequiredId,
    InsertOneResult,
    InsertManyResult,
    Filter,
    ModifyResult,
    UpdateFilter,
    UpdateResult,
    WithoutId,
    WithId,
    Document,
    PushOperator,
    SetFields
} from "mongodb";

export class MongroveCollection<
    Validator extends MongroveSchemaValidator,
    ColName extends keyof Validator,
    ColSchema extends Validator[ColName]["validator"]["_output"],
    Input extends
        Validator[ColName]["validator"]["_input"] = Validator[ColName]["validator"]["_input"]
> extends Collection<ColSchema> {
    private name: keyof Validator;
    private schema: Validator;

    constructor(schema: Validator, db: Db, name: ColName, options?: CollectionOptions) {
        // @ts-expect-error - Need to use internal constructor
        super(db, name, options);
        this.name = name;
        this.schema = schema;
    }

    /**
     * @throws {MongroveValidationError}
     * @throws {MongroveServerError}
     * @throws {Error}
     */
    // @ts-expect-error - Input document type excludes default fields as required
    public override async insertOne(
        doc: OptionalUnlessRequiredId<Input>,
        options?: MongroveInsertOneOptions
    ): Promise<InsertOneResult<ColSchema>> {
        const validate = options?.validate ?? true;
        try {
            if (validate) {
                const validDoc = this.schema[this.name].validator.parse(
                    doc
                ) as OptionalUnlessRequiredId<ColSchema>;
                return await super.insertOne(validDoc, options);
            } else {
                const unsafeDoc = doc as unknown as OptionalUnlessRequiredId<ColSchema>;
                return await super.insertOne(unsafeDoc, options);
            }
        } catch (err) {
            if (err instanceof ZodError)
                throw new MongroveValidationError(MongroveErrorCodes.Act_InsertFailed, err, {
                    operation: "insertOne",
                    collection: this.name.toString()
                });
            else if (err instanceof MongoServerError)
                throw new MongroveServerError(MongroveErrorCodes.Act_InsertFailed, err, {
                    operation: "insertOne",
                    collection: this.name.toString()
                });
            throw err;
        }
    }

    /**
     * @throws {MongroveValidationError}
     * @throws {MongroveServerError}
     * @throws {Error}
     */
    // @ts-expect-error - Input document type excludes default fields as required
    public override async insertMany(
        docs: OptionalUnlessRequiredId<Input>[],
        options?: MongroveBulkWriteOptions
    ): Promise<InsertManyResult<ColSchema>> {
        const validate = options?.validate ?? true;
        try {
            if (validate) {
                const validDocs = this.schema[this.name].validator
                    .array()
                    .parse(docs) as OptionalUnlessRequiredId<ColSchema>[];
                return await super.insertMany(validDocs, options);
            } else {
                const unsafeDocs = docs as unknown as OptionalUnlessRequiredId<ColSchema>[];
                return await super.insertMany(unsafeDocs, options);
            }
        } catch (err) {
            if (err instanceof ZodError)
                throw new MongroveValidationError(MongroveErrorCodes.Act_InsertFailed, err, {
                    operation: "insertMany",
                    collection: this.name.toString()
                });
            else if (err instanceof MongoServerError) {
                throw new MongroveServerError(MongroveErrorCodes.Act_InsertFailed, err, {
                    operation: "insertMany",
                    collection: this.name.toString()
                });
            }
            throw err;
        }
    }

    /**
     * @throws {MongroveValidationError}
     * @throws {MongroveServerError}
     * @throws {Error}
     */
    // @ts-expect-error - Input document type excludes default fields as required
    public override async findOneAndReplace(
        filter: Filter<ColSchema>,
        replacement: WithoutId<Input>,
        options: MongroveFindOneAndReplaceOptions & { includeResultMetadata: false }
    ): Promise<WithId<ColSchema> | null>;
    // @ts-expect-error - Input document type excludes default fields as required
    public override async findOneAndReplace(
        filter: Filter<ColSchema>,
        replacement: WithoutId<Input>,
        options: MongroveFindOneAndReplaceOptions & { includeResultMetadata: true }
    ): Promise<ModifyResult<ColSchema>>;
    // @ts-expect-error - Input document type excludes default fields as required
    public override async findOneAndReplace(
        filter: Filter<ColSchema>,
        replacement: WithoutId<Input>,
        options?: MongroveFindOneAndReplaceOptions
    ): Promise<ModifyResult<ColSchema>>; // TODO: In next major version change to WithId<TSchema|null>
    // @ts-expect-error - Input document type excludes default fields as required
    public override async findOneAndReplace(
        filter: Filter<ColSchema>,
        replacement: WithoutId<Input>,
        options: MongroveFindOneAndReplaceOptions & { includeResultMetadata: boolean }
    ): Promise<ModifyResult<ColSchema> | WithId<ColSchema> | null> {
        const validate = options?.validate ?? true;
        try {
            if (validate) {
                const validReplacement = this.schema[this.name].validator.parse(
                    replacement
                ) as WithoutId<ColSchema>;
                return await super.findOneAndReplace(filter, validReplacement, options);
            } else {
                const unsafeReplacement = replacement as unknown as WithoutId<ColSchema>;
                return await super.findOneAndReplace(filter, unsafeReplacement, options);
            }
        } catch (err) {
            if (err instanceof ZodError)
                throw new MongroveValidationError(MongroveErrorCodes.Act_ReplaceFailed, err, {
                    operation: "findOneAndReplace",
                    collection: this.name.toString()
                });
            else if (err instanceof MongoServerError) {
                throw new MongroveServerError(MongroveErrorCodes.Act_ReplaceFailed, err, {
                    operation: "findOneAndReplace",
                    collection: this.name.toString()
                });
            }
            throw err;
        }
    }

    /**
     * @throws {MongroveValidationError}
     * @throws {MongroveServerError}
     * @throws {Error}
     */
    public override async findOneAndUpdate(
        filter: Filter<ColSchema>,
        update: UpdateFilter<ColSchema>,
        options: MongroveFindOneAndUpdateOptions & { includeResultMetadata: false }
    ): Promise<WithId<ColSchema> | null>;
    public override async findOneAndUpdate(
        filter: Filter<ColSchema>,
        update: UpdateFilter<ColSchema>,
        options: MongroveFindOneAndUpdateOptions & { includeResultMetadata: true }
    ): Promise<ModifyResult<ColSchema>>;
    public override async findOneAndUpdate(
        filter: Filter<ColSchema>,
        update: UpdateFilter<ColSchema>,
        options?: MongroveFindOneAndUpdateOptions
    ): Promise<ModifyResult<ColSchema>>; // In next major version change to WithId<TSchema|null>
    public override async findOneAndUpdate(
        filter: Filter<ColSchema>,
        update: UpdateFilter<ColSchema>,
        options: MongroveFindOneAndUpdateOptions & { includeResultMetadata: boolean }
    ): Promise<ModifyResult<ColSchema> | WithId<ColSchema> | null> {
        const validate = options?.validate ?? true;
        try {
            if (validate) {
                // Partial validation
                const updateData = parseUpdateFilterToObject(update);
                // Not passing, so it not uses schema default field values
                this.schema[this.name].validator.partial().parse(updateData);
            }
            return await super.findOneAndUpdate(filter, update, options);
        } catch (err) {
            if (err instanceof ZodError)
                throw new MongroveValidationError(MongroveErrorCodes.Act_UpdateFailed, err, {
                    operation: "findOneAndUpdate",
                    collection: this.name.toString()
                });
            else if (err instanceof MongoServerError) {
                throw new MongroveServerError(MongroveErrorCodes.Act_UpdateFailed, err, {
                    operation: "findOneAndUpdate",
                    collection: this.name.toString()
                });
            }
            throw err;
        }
    }

    /**
     * @throws {MongroveValidationError}
     * @throws {MongroveServerError}
     * @throws {Error}
     */
    // @ts-expect-error - Input document type excludes default fields as required
    public override async replaceOne(
        filter: Filter<ColSchema>,
        replacement: WithoutId<Input>,
        options?: MongroveReplaceOptions
    ): Promise<Document | UpdateResult<ColSchema>> {
        const validate = options?.validate ?? true;
        try {
            if (validate) {
                const validReplacement = this.schema[this.name].validator.parse(
                    replacement
                ) as WithoutId<ColSchema>;
                return await super.replaceOne(filter, validReplacement, options);
            } else {
                const unsafeReplacement = replacement as unknown as WithoutId<ColSchema>;
                return await super.replaceOne(filter, unsafeReplacement, options);
            }
        } catch (err) {
            if (err instanceof ZodError)
                throw new MongroveValidationError(MongroveErrorCodes.Act_ReplaceFailed, err, {
                    operation: "replaceOne",
                    collection: this.name.toString()
                });
            else if (err instanceof MongoServerError) {
                throw new MongroveServerError(MongroveErrorCodes.Act_ReplaceFailed, err, {
                    operation: "replaceOne",
                    collection: this.name.toString()
                });
            }
            throw err;
        }
    }

    /**
     * @throws {MongroveValidationError}
     * @throws {MongroveServerError}
     * @throws {Error}
     */
    public override async updateOne(
        filter: Filter<ColSchema>,
        update: UpdateFilter<ColSchema> | Partial<ColSchema>,
        options?: MongroveUpdateOptions
    ): Promise<UpdateResult> {
        const validate = options?.validate ?? true;
        try {
            if (validate) {
                // Partial validation
                const updateData = parseUpdateFilterToObject(update);
                // Not passing, so it not uses schema default field values
                this.schema[this.name].validator.partial().parse(updateData);
            }
            return await super.updateOne(filter, update, options);
        } catch (err) {
            if (err instanceof ZodError)
                throw new MongroveValidationError(MongroveErrorCodes.Act_UpdateFailed, err, {
                    operation: "updateOne",
                    collection: this.name.toString()
                });
            else if (err instanceof MongoServerError) {
                throw new MongroveServerError(MongroveErrorCodes.Act_UpdateFailed, err, {
                    operation: "updateOne",
                    collection: this.name.toString()
                });
            }
            throw err;
        }
    }

    /**
     * @throws {MongroveValidationError}
     * @throws {MongroveServerError}
     * @throws {Error}
     */
    public override async updateMany(
        filter: Filter<ColSchema>,
        update: UpdateFilter<ColSchema>,
        options?: MongroveUpdateOptions
    ): Promise<UpdateResult> {
        const validate = options?.validate ?? true;
        try {
            if (validate) {
                // Partial validation
                const updateData = parseUpdateFilterToObject(update);
                // Not passing, so it not uses schema default field values
                this.schema[this.name].validator.partial().parse(updateData);
            }
            return await super.updateMany(filter, update, options);
        } catch (err) {
            if (err instanceof ZodError)
                throw new MongroveValidationError(MongroveErrorCodes.Act_UpdateFailed, err, {
                    operation: "updateMany",
                    collection: this.name.toString()
                });
            else if (err instanceof MongoServerError) {
                throw new MongroveServerError(MongroveErrorCodes.Act_UpdateFailed, err, {
                    operation: "updateMany",
                    collection: this.name.toString()
                });
            }
            throw err;
        }
    }
}

function parseUpdateFilterToObject<Schema extends Document>(
    updateFilter: UpdateFilter<Schema>
): Partial<Schema> {
    function parseArrayField(object: PushOperator<Schema> | SetFields<Schema> | undefined) {
        if (!object) return undefined;
        const result: Record<string, unknown> = {};
        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                const value = object[key];
                if (typeof value === "object" && value.$each && Array.isArray(value.$each))
                    result[key] = value.$each;
                else result[key] = [value];
            }
        }
        return result;
    }

    return Object.assign(
        {},
        updateFilter.$inc,
        updateFilter.$max,
        updateFilter.$min,
        updateFilter.$mul,
        parseArrayField(updateFilter.$addToSet),
        parseArrayField(updateFilter.$push),
        updateFilter.$set
    );
}
