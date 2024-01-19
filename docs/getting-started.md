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
