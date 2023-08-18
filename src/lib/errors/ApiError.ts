import type { MongoAPIError } from "mongodb";
import { MongroveError } from "./Error.ts";

type MongroveErrorMeta = Record<string, unknown>;

/**
 * Error for MongoAPIError with additional information
 */
export class MongroveAPIError extends MongroveError {
    error: MongoAPIError;
    code: MongoAPIError["code"];
    meta: MongroveErrorMeta;

    constructor(error: MongoAPIError, meta: MongroveErrorMeta = {}) {
        super(error.message);
        this.name = this.constructor.name;

        this.error = error;
        this.code = error.code;
        this.meta = meta;
    }

    toString(): string {
        const metaString = JSON.stringify(this.meta, null, 2);
        return `[${this.code}] ${this.name}: ${this.message} ${metaString}`;
    }

    /** Checks if caught error is instance of MongroveAPIError */
    static isInstanceOf(error: unknown): error is MongroveAPIError {
        return error instanceof MongroveAPIError;
    }
}
