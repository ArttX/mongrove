import { Db } from "mongodb";
import { MongroveCollection } from "./collection.ts";

import type { MongroveSchemaValidator } from "~/types";
import type { MongoClient, DbOptions, CollectionOptions } from "mongodb";

export class MongroveDb<Validator extends MongroveSchemaValidator> extends Db {
    private schema: Validator;

    constructor(
        schema: Validator,
        client: MongoClient,
        databaseName?: string,
        options?: DbOptions | undefined
    ) {
        super(client, databaseName ?? client.db().databaseName, options);
        this.schema = schema;
    }

    // @ts-expect-error - collection not aligns with super class
    public override collection<
        ColName extends keyof Validator,
        ColSchema extends Validator[ColName]["validator"]["_output"]
    >(
        name: ColName,
        options?: CollectionOptions
    ): MongroveCollection<Validator, ColName, ColSchema> {
        return new MongroveCollection<Validator, ColName, ColSchema>(
            this.schema,
            // @ts-expect-error - This not align with types
            this,
            name,
            options
        );
    }
}
