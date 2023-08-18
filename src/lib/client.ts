import { MongroveEmitter } from "./emitter.ts";
import { MongroveDb } from "./db.ts";
import {
    MongroveCommonError,
    MongroveAPIError,
    MongroveErrorCodes,
    MongroveServerError
} from "~/errors/index.ts";
import { MongoClient, MongoAPIError, MongoServerError } from "mongodb";

// Types
import type {
    DbOptions,
    MongoClientOptions,
    ClientSessionOptions,
    ClientSession,
    WithSessionCallback,
    ChangeStreamOptions,
    MongoOptions,
    ServerApi,
    BSONSerializeOptions,
    MongoError,
    Document
} from "mongodb";
import type { CreateIndexOptions, MongroveSchemaValidator } from "~/types";
import type { Schema } from "./schema/index.ts";

export type MongroveClientOptions = {
    mongoOptions?: MongoClientOptions;
};

export class MongroveClient<Validator extends MongroveSchemaValidator> {
    private eventEmitter: MongroveEmitter;
    private mongoClient: MongoClient;
    private schema: Schema<Validator>;

    private connected: boolean = false;

    constructor(url: string, schema: Schema<Validator>, options?: MongroveClientOptions) {
        this.eventEmitter = new MongroveEmitter();
        this.mongoClient = new MongoClient(url, options?.mongoOptions);
        this.schema = schema;

        // Listeners
        this.mongoClient.on("connectionReady", () => {
            this.connected = true;
            this.eventEmitter.emit("databaseConnected", this);
        });
        this.mongoClient.on("connectionClosed", () => {
            this.connected = false;
            this.eventEmitter.emit("databaseDisconnected", this);
        });
    }

    /** State for connection status */
    get isConnected(): Readonly<boolean> {
        return this.connected;
    }

    /** @see — MongoOptions */
    get options(): Readonly<MongoOptions> {
        return this.mongoClient.options;
    }

    get serverApi(): Readonly<ServerApi | undefined> {
        return this.mongoClient.serverApi;
    }

    get bsonOptions(): BSONSerializeOptions {
        return this.mongoClient.bsonOptions;
    }

    get events(): Readonly<MongroveEmitter> {
        return this.eventEmitter;
    }

    /**
     * Connect to MongoDB _(optional)_
     *
     * @throws {MongroveAPIError}
     * @throws {MongroveCommonError}
     */
    public async connect(): Promise<this> {
        try {
            await this.mongoClient.connect();
        } catch (err) {
            if (err instanceof MongoAPIError) throw new MongroveAPIError(err);
            if (err instanceof MongoServerError)
                throw new MongroveServerError(MongroveErrorCodes.Con_FailedConnect, err);
            throw err;
        }
        return this;
    }

    /**
     * Close the client and its underlying connections
     *
     * @param force - Force close, emitting no events
     *
     * @throws {MongroveAPIError}
     * @throws {MongroveCommonError}
     */
    public async disconnect(force?: boolean): Promise<void> {
        try {
            await this.mongoClient.close(force);
        } catch (err) {
            if (err instanceof MongoAPIError) throw new MongroveAPIError(err);
            if (err instanceof MongoServerError)
                throw new MongroveServerError(MongroveErrorCodes.Con_FailedDisconnect, err);
            throw err;
        }
    }

    /** Do ping to database to check connection */
    public async checkConnection(): Promise<boolean> {
        try {
            await this.mongoClient.db("admin").command({ ping: 1 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Create a new Db instance sharing the current socket connections.
     *
     * @param dbName - The name of the database we want to use. If not provided, use database name from connection string.
     * @param options - Optional settings for Db construction
     */
    public db(dbName?: string, options?: DbOptions): MongroveDb<Validator> {
        return new MongroveDb<Validator>(
            this.schema.getSchema(),
            this.mongoClient,
            dbName,
            options
        );
    }

    /** Starts a new session on the server */
    public startSession(options?: ClientSessionOptions): ClientSession {
        return this.mongoClient.startSession(options);
    }

    /**
     * Runs a given operation with an implicitly created session. The lifetime of the session
     * will be handled without the need for user interaction.
     *
     * NOTE: presently the operation MUST return a Promise (either explicit or implicitly as an async function)
     *
     * @param options - Optional settings for the command
     * @param callback - An callback to execute with an implicitly created session
     *
     * @throws {MongroveCommonError}
     * @throws {MongoInvalidArgumentError}
     */
    public withSession(callback: WithSessionCallback): Promise<void>;
    public withSession(options: ClientSessionOptions, callback: WithSessionCallback): Promise<void>;
    public withSession(
        optionsOrCallback: ClientSessionOptions | WithSessionCallback,
        callback?: WithSessionCallback
    ): Promise<void> {
        if (typeof optionsOrCallback === "function") {
            return this.mongoClient.withSession(optionsOrCallback);
        }
        if (!callback)
            throw new MongroveCommonError(
                MongroveErrorCodes.MissingFunction,
                "Missing callback function"
            );
        return this.mongoClient.withSession(optionsOrCallback, callback);
    }

    public watch(pipeline?: Document[], options?: ChangeStreamOptions) {
        return this.mongoClient.watch(pipeline, options);
    }

    /**
     * Creates indexes, that are defined in schema
     *
     * @throws {MongroveCommonError}
     */
    public async createIndexes(createOptions?: { recreate: boolean }): Promise<void> {
        // Get schema options
        const options = this.schema.getOptions();

        // Get list of all databases
        const admin = this.mongoClient.db().admin();
        const dbInfo = await admin.listDatabases();
        const allDevDatabases = dbInfo.databases.filter(
            ({ name }) => name !== "admin" && name !== "local"
        );
        const defaultDatabase = { name: this.mongoClient.db().databaseName };

        // Filter only selected ones
        const filteredDatabases = options
            ? options.filterDatabases
                ? allDevDatabases.filter(db => options.filterDatabases!(db.name))
                : [defaultDatabase]
            : [defaultDatabase];

        // Get schema
        const schema = this.schema.getSchema();

        console.log(`[Mongrove Indexes] Starting creating indexes`);

        // Create Single Field indexes
        try {
            for (const database of filteredDatabases) {
                console.log(`[Mongrove Indexes] Creating index for database: ${database.name}`);
                for (const colName in schema) {
                    const collection = schema[colName];
                    console.log(`[Mongrove Indexes] Creating index for collection: ${colName}`);
                    await this.createSingleFieldIndexes(
                        database,
                        colName,
                        collection.fieldIndexes,
                        createOptions?.recreate
                    );
                }
            }
            console.log(`[Mongrove Indexes] Successfully created indexes`);
        } catch (err) {
            console.log(`[Mongrove Indexes] Failed to create indexes`);
            throw new MongroveCommonError(
                MongroveErrorCodes.Idx_FailedCreateIndexes,
                (err as MongoError).message ?? "Failed to create indexes"
            );
        }
    }

    /** Creates missing indexes on collection */
    private async createSingleFieldIndexes(
        database: { name: string },
        collectionName: string,
        indexes: Map<string, CreateIndexOptions>,
        recreate: boolean = false
    ): Promise<void> {
        const currentDb = this.mongoClient.db(database.name);
        for (const [fieldName, options] of indexes) {
            const indexName = `IDX_MG:${collectionName}:${fieldName}`;
            const collection = currentDb.collection(collectionName);
            if (recreate) {
                try {
                    await collection.dropIndex(indexName);
                } catch (err) {
                    if (err instanceof MongoServerError) {
                        if (err.codeName === "NamespaceNotFound" || err.code === 26)
                            console.log(
                                `[Mongrove Indexes] Collection [${collectionName}] not exists, creating with index...`
                            );
                        else throw err;
                    } else throw err;
                }
            }
            await collection.createIndex({ [fieldName]: 1 }, { ...options, name: indexName });
        }
    }
}
