# Create your own Remix plugin

_These are my personal notes for creating this Remix Plugin, in case you need some help creating your own_

## Getting Started

Fork whichever plugin is most similar to your needs. You can use this one, or play with all of them at [remix-alpha](https://remix-alpha.ethereum.org). For this project I cloned the `ethdocs` plugin, since it was most similar to my vision.

Skim through the [remix-plugin](https://github.com/ethereum/remix-plugin) Readme of course.

## Webpack / Typescript configuration

If you prefer to use the vanilla javascript/html method and use the CDN to import the plugin-client, then you can ignore this section

I'm new to Typescript, so I followed [this guide](https://alligator.io/typescript/new-project/) on using typescript and [this guide](https://github.com/BrianDGLS/express-ts) on setting up a new typescript project. https://www.codingforentrepreneurs.com/blog/typescript-setup-guide/

**Converting ethdocsPlugin => myPlugin**

_I already did these steps here, but just leaving notes so you know what happened._

The plugin needs two things to run properly 1) the `client`, and 2) `utils` which provides the typescript types. Initially I imported the `client` from a local folder (how ethdocs plugin does it), but I was kindly instructed to change this to importing via npm dependency `@remixproject/plugin`.

- `utils` were just copied directly from [remix-plugin/projects/utils/
  ](https://github.com/ethereum/remix-plugin/tree/master/projects/utils). You only need the ones you will use, but I find it helpful to view them all.
- I merged `tsconfig.json` with the "common" `tsconfig.json` in root of the remix-plugin repo. Same for `webpack.config.js` with `webpack.common.js`

## Developing

Now that you're ready to develop, there are two methods, but no real advantage for either. One issue I had was not being able to connect to my plugin, even though it was running. Switching between methods helped as a sanity check.

1. [Remix-alpha.ethereum.org](https://Remix-alpha.ethereum.org) allows you to add a local plugin. This is also where your plugin will appear once it has been completed and approved.
2. Host the remix IDE locally so you can code on the :airplane:

## Hosting

- The most common and totally free / easy method is to use www.surge.sh (e.g. https://remix-ethdoc-plugin.surge.sh). If you want to get fancy, see [this doc](https://surge.sh/help/deploying-continuously-using-git-hooks) on how to deploy to Surge continuously from a github repo.
- Use Github pages. [This guide](https://zubialevich.blogspot.com/2018/09/how-to-build-typescript-github-pages-app.html) might help if you're using typecript.
- Host it on your own server... but really, why bother?

## Publishing

Create a profile for your plugin using the correct keys in [the profile doc](https://github.com/ethereum/remix-plugin/blob/master/doc/deploy/profile.md). Then make a PR on `src/remixAppManager.js` [in the remix-ide repo](https://github.com/ethereum/remix-ide/blob/8d3a09f9b19060509d2789ced8e8d5ee6c9f6e9f/src/remixAppManager.js). Remember it will appear on remix-alpha first, before going to production. I have no idea what the process is for this :confused:

## Extras

Add a link to plugin documentation with a :book: icon next to the title, just add a "documentation" property to your `profile.js`. (note: This is not documented in the [Profile section](https://github.com/ethereum/remix-plugin/blob/master/doc/deploy/profile.md))

## Notes

### allow-popups issue

I wanted to to use external links, however the only option was `target="\_parent"` which forces the current window to change. Using `target="_blank"` did nothing.

I added `allow-popups` in Line 106 of `remix-plugin/projects/engine/src/plugin/iframe.ts` and made a [Pull request on the repo](https://github.com/ethereum/remix-plugin/pull/120). In a few days my change was added to the official Remix-IDE!

```js
this.iframe.setAttribute(
  "sandbox",
  "allow-scripts allow-same-origin allow-forms allow-top-navigation"
);
```
