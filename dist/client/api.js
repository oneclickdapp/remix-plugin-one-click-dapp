/**
 * Create an Api
 * @param profile The profile of the api
 */
export function createApi(client, profile) {
    if (typeof profile.name !== 'string') {
        throw new Error('Profile should have a name');
    }
    const on = (event, cb) => {
        client.on.call(client, profile.name, event, cb);
    };
    const methods = (profile.methods || []).reduce((acc, method) => ({
        ...acc,
        [method]: client.call.bind(client, profile.name, method)
    }), {});
    return { on, ...methods };
}
/** Transform a list of profile into a map of API */
export function getApiMap(client, profiles) {
    return Object.keys(profiles).reduce((acc, name) => {
        const profile = profiles[name];
        return { ...acc, [name]: createApi(client, profile) };
    }, {});
}
////////////////
// COMMON API //
////////////////
/** Start listening on theme changed */
export async function listenOnThemeChanged(client, options) {
    if (options && options.customTheme)
        return;
    const cssLink = document.createElement('link');
    cssLink.setAttribute('rel', 'stylesheet');
    document.head.appendChild(cssLink);
    client.onload(async () => {
        client.on('theme', 'themeChanged', (_theme) => setTheme(cssLink, _theme));
        const theme = await client.call('theme', 'currentTheme');
        setTheme(cssLink, theme);
    });
    return cssLink;
}
function setTheme(cssLink, theme) {
    cssLink.setAttribute('href', theme.url);
    document.documentElement.style.setProperty('--theme', theme.quality);
}
