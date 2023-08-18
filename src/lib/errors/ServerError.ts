import type { MongoServerError } from "mongodb";
import type { MongroveErrorCodes } from "./codes.ts";
import { MongroveError } from "./Error.ts";

type MongroveErrorMeta = Record<string, unknown>;

/**
 * Error for MongoServerError with additional information
 */
export class MongroveServerError extends MongroveError {
    error: MongoServerError;
    code: MongroveErrorCodes;
    meta: MongroveErrorMeta;

    constructor(code: MongroveErrorCodes, error: MongoServerError, meta: MongroveErrorMeta = {}) {
        super(error.message);
        this.name = this.constructor.name;

        this.error = error;
        this.code = code;
        this.meta = meta;
    }

    toString(): string {
        const metaString = JSON.stringify(this.meta, null, 2);
        return `[${this.code}] ${this.name}: ${this.message} ${metaString}`;
    }

    /** Checks if caught error is instance of MongroveServerError */
    static isInstanceOf(error: unknown): error is MongroveServerError {
        return error instanceof MongroveServerError;
    }
}
