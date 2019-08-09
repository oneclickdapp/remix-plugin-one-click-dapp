## Creating a plugin

## My Journal / Steps I took

_These are my personal notes for creating this Remix Plugin, in case you need some help creating your own_

Cloned the `ethdocs` plugin, which was most similar to my goal.

**tsconfig.json**

- Combined `tsconfig.json` with the config in root of the remix-plugin repo
- Added `client` and `utils` from the root directory
- Changed build folder path
- Installed required dependencies using npm

**Getting it running**

I'm new to Typescript, so I followed [this guide](https://alligator.io/typescript/new-project/).

### Publishing

Make a PR on `src/remixAppManager.js` [in the remix-ide repo](https://github.com/ethereum/remix-ide/blob/8d3a09f9b19060509d2789ced8e8d5ee6c9f6e9f/src/remixAppManager.js) to add a new plugin. Be sure to use the right keys [see this doc](https://github.com/ethereum/remix-plugin/blob/master/doc/deploy/profile.md).
