export enum MongroveErrorCodes {
    Con_FailedConnect = "M1001",
    Con_FailedDisconnect = "M1002",

    Idx_FailedCreateIndexes = "M2003",

    Act_InsertFailed = "M4001",
    Act_ReadFailed = "M4002",
    Act_UpdateFailed = "M4003",
    Act_ReplaceFailed = "M4004",
    Act_DeleteFailed = "M4005",

    MissingFunction = "M6001"
}
