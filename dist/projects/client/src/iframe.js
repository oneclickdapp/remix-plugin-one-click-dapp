import { PluginClient } from './client';
import { listenEvent, callEvent } from '../../utils';
import { getApiMap, listenOnThemeChanged } from './api';
/**
 * Check if the sender has the right origin
 * @param origin The origin of the incoming message
 * @param devMode Devmode options
 */
export async function checkOrigin(origin, devMode = {}) {
    const localhost = devMode.port ? [
        `http://127.0.0.1:${devMode.port}`,
        `http://localhost:${devMode.port}`,
        `https://127.0.0.1:${devMode.port}`,
        `https://localhost:${devMode.port}`,
    ] : [];
    const origins = devMode.origins
        ? (typeof devMode.origins === 'string') ? [devMode.origins] : devMode.origins
        : [];
    const res = await fetch('https://raw.githubusercontent.com/ethereum/remix-plugin/master/projects/client/assets/origins.json');
    const defaultOrigins = await res.json();
    return [
        ...defaultOrigins,
        ...localhost,
        ...origins
    ].includes(origin);
}
/**
 * Start listening on the IDE though PostMessage
 * @param client A client to put the messages into
 */
export function connectIframe(client) {
    let isLoaded = false;
    async function getMessage(event) {
        if (!event.source)
            throw new Error('No source');
        // Check that the origin is the right one
        const devMode = client.options.devMode;
        const isGoodOrigin = await checkOrigin(event.origin, devMode);
        if (!isGoodOrigin)
            return;
        // Get the data
        if (!event.data)
            throw new Error('No data');
        const { action, key, name, payload, id, requestInfo, error } = event.data;
        try {
            // If handshake set isLoaded
            if (action === 'request' && key === 'handshake') {
                isLoaded = true;
                client.events.on('send', (msg) => {
                    event.source.postMessage(msg, event.origin);
                });
                client.events.emit('loaded');
                // Send back the list of methods exposed by the plugin
                const message = { action: 'response', name, key, id, payload: client.methods };
                event.source.postMessage(message, event.origin);
                return;
            }
            // Check if is isLoaded
            if (!isLoaded)
                throw new Error('Handshake before communicating');
            switch (action) {
                case 'notification': {
                    client.events.emit(listenEvent(name, key), ...payload);
                    break;
                }
                case 'response': {
                    client.events.emit(callEvent(name, key, id), payload, error);
                    break;
                }
                case 'request': {
                    if (!client[key]) {
                        throw new Error(`Method ${key} doesn't exist on plugin ${name}`);
                    }
                    client.currentRequest = requestInfo;
                    const result = await client[key](...payload);
                    const message = { action: 'response', name, key, id, payload: result };
                    event.source.postMessage(message, event.origin);
                    break;
                }
            }
        }
        catch (err) {
            const message = { action, name, key, id, error: err.message };
            event.source.postMessage(message, event.origin);
        }
    }
    window.addEventListener('message', getMessage, false);
}
/**
 * Create a plugin client that listen on PostMessage
 * @param options The options for the client
 */
export function createIframeClient(options = {}) {
    const client = new PluginClient(options);
    return buildIframeClient(client);
}
/**
 * Connect the client to the iframe
 * @param client A plugin client
 */
export function buildIframeClient(client) {
    // Add APIS
    const apis = getApiMap(client, client.options.customApi);
    Object.keys(apis).forEach(name => client[name] = apis[name]);
    // Listen on changes
    connectIframe(client);
    listenOnThemeChanged(client, client.options);
    return client;
}
