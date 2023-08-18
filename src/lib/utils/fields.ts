import type { ValidatorDefaultOptions } from "~/schema/types";

export function isValidDefaultOptions(options: ValidatorDefaultOptions): boolean {
    const { nullable, optional, default: def } = options;
    if (nullable === undefined && optional === undefined && def === undefined) return true;
    if (
        (nullable !== undefined && (optional !== undefined || def !== undefined)) ||
        (optional !== undefined && (def !== undefined || nullable !== undefined)) ||
        (def !== undefined && (nullable !== undefined || optional !== undefined))
    )
        return false;
    return true;
}
