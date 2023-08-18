import type { ZodError, ZodIssue } from "zod";
import type { MongroveErrorCodes } from "./codes.ts";
import { MongroveError } from "./Error.ts";

type MongroveErrorMeta = Record<string, unknown>;

/**
 * Error for failed validation.\
 * When schema validation fails, this error is thrown.\
 * Check for `code` to see query action.
 */
export class MongroveValidationError extends MongroveError {
    zodError: ZodError;
    code: MongroveErrorCodes;
    meta: MongroveErrorMeta;
    issues: ZodIssue[];

    constructor(code: MongroveErrorCodes, zodError: ZodError, meta: MongroveErrorMeta = {}) {
        super(fromZodError(zodError).message);
        this.name = this.constructor.name;

        this.zodError = zodError;
        this.code = code;
        this.meta = meta;
        this.issues = zodError.issues;
    }

    toString(): string {
        const metaString = JSON.stringify(this.meta, null, 2);
        return `[${this.code}] ${this.name}: ${this.message} ${metaString}`;
    }

    /** Checks if caught error is instance of MongroveValidationError */
    static isInstanceOf(error: unknown): error is MongroveValidationError {
        return error instanceof MongroveValidationError;
    }
}

type FromZodErrorReturn = { message: string };
function fromZodError(zodError: ZodError, options: FromZodErrorOptions = {}): FromZodErrorReturn {
    const {
        maxIssuesInMessage = 99, // I've got 99 problems but the b$tch ain't one
        issueSeparator = "; ",
        unionSeparator = ", or "
    } = options;

    const reason = zodError.errors
        // limit max number of issues printed in the reason section
        .slice(0, maxIssuesInMessage)
        // format error message
        .map(issue => fromZodIssue(issue, issueSeparator, unionSeparator))
        // concat as string
        .join(issueSeparator);

    const message = reason ? reason : "Validation error";

    return { message };
}

type FromZodErrorOptions = {
    maxIssuesInMessage?: number;
    issueSeparator?: string;
    unionSeparator?: string;
    prefixSeparator?: string;
    prefix?: string;
};

type NonEmptyArray<T> = [T, ...T[]];

function isNonEmptyArray<T>(value: T[]): value is NonEmptyArray<T> {
    return value.length !== 0;
}

function fromZodIssue(issue: ZodIssue, issueSeparator: string, unionSeparator: string): string {
    if (issue.code === "invalid_union") {
        return issue.unionErrors
            .reduce<string[]>((acc, zodError) => {
                const newIssues = zodError.issues
                    .map(issue => fromZodIssue(issue, issueSeparator, unionSeparator))
                    .join(issueSeparator);

                if (!acc.includes(newIssues)) {
                    acc.push(newIssues);
                }

                return acc;
            }, [])
            .join(unionSeparator);
    }

    if (isNonEmptyArray(issue.path)) {
        // handle array indices
        if (issue.path.length === 1) {
            const identifier = issue.path[0];

            if (typeof identifier === "number") {
                return `${issue.message} at index ${identifier}`;
            }
        }

        return `${issue.message} at "${joinPath(issue.path)}"`;
    }

    return issue.message;
}

const identifierRegex = /[$_\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*/u;

function joinPath(path: NonEmptyArray<string | number>): string {
    if (path.length === 1) {
        return path[0].toString();
    }

    return path.reduce<string>((acc, item) => {
        // handle numeric indices
        if (typeof item === "number") {
            return acc + "[" + item.toString() + "]";
        }

        // handle quoted values
        if (item.includes('"')) {
            return acc + '["' + escapeQuotes(item) + '"]';
        }

        // handle special characters
        if (!identifierRegex.test(item)) {
            return acc + '["' + item + '"]';
        }

        // handle normal values
        const separator = acc.length === 0 ? "" : ".";
        return acc + separator + item;
    }, "");
}

function escapeQuotes(str: string): string {
    return str.replace(/"/g, '\\"');
}
