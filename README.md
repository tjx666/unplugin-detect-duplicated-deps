# unplugin-detect-duplicated-deps

[![npm](https://img.shields.io/npm/v/unplugin-detect-duplicated-deps.svg)](https://npmjs.com/package/unplugin-detect-duplicated-deps) [![downloads](https://img.shields.io/npm/dw/unplugin-detect-duplicated-deps)](https://npmjs.com/package/unplugin-detect-duplicated-deps) [![Unit Test](https://github.com/tjx666/unplugin-detect-duplicated-deps/actions/workflows/unit-test.yml/badge.svg)](https://github.com/tjx666/unplugin-detect-duplicated-deps/actions/workflows/unit-test.yml)

Detect duplicate packaged dependencies

![effect](./docs/images/effect.png)

## Installation

```bash
npm i -D unplugin-detect-duplicated-deps
```

## Usage

You can use the jsdoc to check option description and default value.

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import UnpluginDetectDuplicatedDeps from 'unplugin-detect-duplicated-deps/vite';

export default defineConfig({
  plugins: [UnpluginDetectDuplicatedDeps()],
});
```

<br>
</details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import UnpluginDetectDuplicatedDeps from 'unplugin-detect-duplicated-deps/rollup';

export default {
  plugins: [UnpluginDetectDuplicatedDeps()],
};
```

<br>
</details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.mjs
import UnpluginDetectDuplicatedDeps from 'unplugin-detect-duplicated-deps/webpack';

const config = {
  plugins: [UnpluginDetectDuplicatedDeps()],
};
```

<br>
</details>

## Use in commonjs environment

Because [vite6 plan to deprecate commonjs node api](https://vitejs.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated), this plugin deprecate the commonjs support from 1.x. If you want use this plugin in commonjs environment, check [0.x](https://github.com/tjx666/unplugin-detect-duplicated-deps/tree/0.x)

## Thanks

- [duplicate-package-checker-webpack-plugin](https://github.com/darrenscerri/duplicate-package-checker-webpack-plugin)
- [unplugin](https://github.com/unjs/unplugin)
- [unplugin-starter](https://github.com/sxzz/unplugin-starter)
- [bundlephobia](https://bundlephobia.com/) provide the api to get package size
- [vercel](https://vercel.com/) host documentation

## License

[MIT](./LICENSE) License © 2023-PRESENT [YuTengjing](https://github.com/tjx666)
