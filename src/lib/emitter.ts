/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from "events";

// Types
import type { MongroveClient } from "./client.ts";

type Events = {
    databaseConnected: (client: MongroveClient<any>) => void;
    databaseDisconnected: (client: MongroveClient<any>) => void;
};

type EventName = keyof Events;
type Listener = Events[EventName];
type Args = Parameters<Listener>;

class MongroveEmitter extends EventEmitter {
    on(eventName: EventName, listener: Listener): this {
        return super.on(eventName, listener);
    }
    once(eventName: EventName, listener: Listener): this {
        return super.once(eventName, listener);
    }
    emit(eventName: EventName, ...args: Args): boolean {
        return super.emit(eventName, ...args);
    }
}

export { MongroveEmitter };
