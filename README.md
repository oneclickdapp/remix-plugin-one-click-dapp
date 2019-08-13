# :repeat: :one: :collision: Remix One Click Plugin

**Generate a persistent interface for your smart contract directly from Remix.**

<img width=300 alignText="center" src="./resources/oneclickexample.png"/>

### Install

Within the [Remix IDE](remix.ethereum.org), click on the :electric_plug: symbol to open the plugin manager.

Search for "One Click Dapp" and hit "Activate".

### Usage

1. Compile a contract using the `Solidity Compiler` plugin.
2. Open the `One Click Dapp` plugin and select "Generate"

A **unique URL will be created** for your smart contract. Bookmark it for later, or send to a friend to show off your amazing contract :tada:

:shipit: Happy coding, you rock! :sunglasses:

## Contributing

`npm install` then `npm run serve`

In the plugin manager in [Remix (alpha)](http://remix-alpha.ethereum.org), select "Connect a local plugin"

## Create your own Remix plugin

_These are my personal notes for creating this Remix Plugin, in case you need some help creating your own_

Started with the Readme for [remix-plugin](https://github.com/ethereum/remix-plugin)

Cloned the `ethdocs` plugin, which was most similar to my goal.

**tsconfig.json**

- Combined `tsconfig.json` with the config in root of the remix-plugin repo
- Added `client` and `utils` from the root directory
- Changed build folder path
- Installed required dependencies using npm

**Getting it running**

I'm new to Typescript, so I followed [this guide](https://alligator.io/typescript/new-project/) on using typescript and [this guide](https://github.com/BrianDGLS/express-ts) on setting up a new typescript project. https://www.codingforentrepreneurs.com/blog/typescript-setup-guide/

### Publishing / Hosting

Make a PR on `src/remixAppManager.js` [in the remix-ide repo](https://github.com/ethereum/remix-ide/blob/8d3a09f9b19060509d2789ced8e8d5ee6c9f6e9f/src/remixAppManager.js) to add a new plugin. Be sure to use the right keys [see this doc](https://github.com/ethereum/remix-plugin/blob/master/doc/deploy/profile.md).

**Hosting**

- The most common method is to use www.surge.sh (e.g. https://remix-ethdoc-plugin.surge.sh). See [this doc](https://surge.sh/help/deploying-continuously-using-git-hooks) on how to deploy continuously from a github repo.
- OR use github pages and follow [this guide](https://zubialevich.blogspot.com/2018/09/how-to-build-typescript-github-pages-app.html)
- OR host it on your own server

### Notes

#### External links in an iframe

I'd like to use external links, however the only option is `target="\_parent"` which forces the current window to change. Using `target="_blank"` does nothing.

I added `allow-popups` in Line 106 of `remix-plugin/projects/engine/src/plugin/iframe.ts` and made a [Pull request on the repo](https://github.com/ethereum/remix-plugin/pull/120)

```js
this.iframe.setAttribute(
  'sandbox',
  'allow-scripts allow-same-origin allow-forms allow-top-navigation'
);
```

#### Profile

To add a link to plugin documentation with a :book: icon next to the title, just add a "documentation" property to your `profile.js`. (note: This is *unconfirmed*  and not documented in the [Profile docs](https://github.com/ethereum/remix-plugin/blob/master/doc/deploy/profile.md))

#### Random keep-going video to watch https://youtu.be/KSWqx8goqSY
