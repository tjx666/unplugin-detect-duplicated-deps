# Getting Started

## Installation

```sh
pnpm -D add unplugin-detect-duplicated-deps
```

If you are using Yarn, NPM or Bun

```sh
yarn add -D unplugin-detect-duplicated-deps
npm add -D unplugin-detect-duplicated-deps
bun add -D unplugin-detect-duplicated-deps
```

## Add to config file

### Vit

```ts
// vite.config.ts
import UnpluginDetectDuplicatedDeps from 'unplugin-detect-duplicated-deps/vite';

export default defineConfig({
  plugins: [UnpluginDetectDuplicatedDeps()],
});
```

### Rollup

```ts
// rollup.config.js
import UnpluginDetectDuplicatedDeps from 'unplugin-detect-duplicated-deps/rollup';

export default {
  plugins: [UnpluginDetectDuplicatedDeps()],
};
```

::: warning
Because [vite6 plan to deprecate commonjs node api](https://vitejs.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated), this plugin deprecate the commonjs support from 1.x. If you want use this plugin in commonjs environment, check [0.x](https://github.com/tjx666/unplugin-detect-duplicated-deps/tree/0.x)
:::
