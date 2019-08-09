/** Create the name of the event for a call */
export function callEvent(name, key, id) {
    return `[${name}] ${key}-${id}`;
}
/** Create the name of the event for a listen */
export function listenEvent(name, key) {
    return `[${name}] ${key}`;
}
