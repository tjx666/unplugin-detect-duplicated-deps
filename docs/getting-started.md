# Getting Started

## Installation

```sh [pnpm]
pnpm -D add unplugin-detect-duplicated-deps
```

If you are using Yarn, NPM or Bun

:::code-group

```sh [yarn]
yarn add -D unplugin-detect-duplicated-deps
```

```sh [npm]
npm add -D unplugin-detect-duplicated-deps
```

```sh [bun]
bun add -D unplugin-detect-duplicated-deps
```

:::

## Add to config file

### Vite

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

### Webpack

```ts
// webpack.config.mjs
import UnpluginDetectDuplicatedDeps from 'unplugin-detect-duplicated-deps/webpack';

const config = {
  plugins: [UnpluginDetectDuplicatedDeps()],
};
export default config;
```

::: warning
Because [vite6 plan to deprecate commonjs node api](https://vitejs.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated), this plugin deprecate the commonjs support from 1.x. If you want use this plugin in commonjs environment, check [0.x](https://github.com/tjx666/unplugin-detect-duplicated-deps/tree/0.x)
:::
