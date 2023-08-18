import { MongroveError } from "./Error.ts";

type MongroveErrorMeta = Record<string, unknown>;

/**
 * Error for Schema issues
 */
export class MongroveSchemaError extends MongroveError {
    meta: MongroveErrorMeta;

    constructor(message: string, meta: MongroveErrorMeta = {}) {
        super(message);
        this.name = this.constructor.name;

        this.meta = meta;
    }

    toString(): string {
        const metaString = JSON.stringify(this.meta, null, 2);
        return `${this.name}: ${this.message} ${metaString}`;
    }

    /** Checks if caught error is instance of MongroveSchemaError */
    static isInstanceOf(error: unknown): error is MongroveSchemaError {
        return error instanceof MongroveSchemaError;
    }
}
