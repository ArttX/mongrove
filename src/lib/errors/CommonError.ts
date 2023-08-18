import type { MongroveErrorCodes } from "./codes.ts";
import { MongroveError } from "./Error.ts";

type MongroveErrorMeta = Record<string, unknown>;

/**
 * Error for common cases
 */
export class MongroveCommonError extends MongroveError {
    code: MongroveErrorCodes;
    meta: MongroveErrorMeta;

    constructor(code: MongroveErrorCodes, message: string, meta: MongroveErrorMeta = {}) {
        super(message);
        this.name = this.constructor.name;

        this.code = code;
        this.meta = meta;
    }

    toString(): string {
        const metaString = JSON.stringify(this.meta, null, 2);
        return `[${this.code}] ${this.name}: ${this.message} ${metaString}`;
    }

    /** Checks if caught error is instance of MongroveCommonError */
    static isInstanceOf(error: unknown): error is MongroveCommonError {
        return error instanceof MongroveCommonError;
    }
}
