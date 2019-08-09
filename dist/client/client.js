import { EventEmitter } from 'events';
import { callEvent, listenEvent, remixProfiles } from '../utils';
export const defaultOptions = {
    customTheme: false,
    customApi: remixProfiles,
    devMode: { port: 8080 }
};
/** Throw an error if client try to send a message before connection */
export function handleConnectionError(devMode) {
    const err = devMode
        ? `Make sure the port of the IDE is ${devMode.port}`
        : 'If you are using a local IDE, make sure to add devMode in client options';
    throw new Error(`Not connected to the IDE. ${err}`);
}
export class PluginClient {
    constructor(options = {}) {
        this.id = 0;
        this.isLoaded = false;
        this.events = new EventEmitter();
        this.options = {
            ...defaultOptions,
            ...options
        };
        this.events.once('loaded', () => (this.isLoaded = true));
    }
    // Wait until this connection is settled
    onload(cb) {
        return new Promise((res, rej) => {
            const loadFn = () => {
                res();
                if (cb)
                    cb();
            };
            this.isLoaded ? loadFn() : this.events.once('loaded', () => loadFn());
        });
    }
    /** Make a call to another plugin */
    call(name, key, ...payload) {
        if (!this.isLoaded)
            handleConnectionError(this.options.devMode);
        this.id++;
        return new Promise((res, rej) => {
            const eventName = callEvent(name, key, this.id);
            this.events.once(eventName, (result, error) => {
                const resultArray = Array.isArray(result) ? result : [result];
                error
                    ? rej(new Error(`Error from IDE : ${error}`))
                    : res(...resultArray);
            });
            this.events.emit('send', {
                action: 'request',
                name,
                key,
                payload,
                id: this.id
            });
        });
    }
    /** Listen on event from another plugin */
    on(name, key, cb) {
        const eventName = listenEvent(name, key);
        this.events.on(eventName, cb);
        this.events.emit('send', { action: 'listen', name, key, id: this.id });
    }
    /** Expose an event for the IDE */
    emit(key, ...payload) {
        if (!this.isLoaded)
            handleConnectionError(this.options.devMode);
        this.events.emit('send', { action: 'notification', key, payload });
    }
}
