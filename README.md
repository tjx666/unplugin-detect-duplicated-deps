# unplugin-detect-duplicated-deps

[![npm](https://img.shields.io/npm/v/unplugin-detect-duplicated-deps.svg)](https://npmjs.com/package/unplugin-detect-duplicated-deps) [![downloads](https://img.shields.io/npm/dw/unplugin-detect-duplicated-deps)](https://npmjs.com/package/unplugin-detect-duplicated-deps) [![Unit Test](https://github.com/tjx666/unplugin-detect-duplicated-deps/actions/workflows/unit-test.yml/badge.svg)](https://github.com/tjx666/unplugin-detect-duplicated-deps/actions/workflows/unit-test.yml)

Detect duplicate packaged dependencies

![effect](docs/effect.png)

## Installation

```bash
npm i -D unplugin-detect-duplicated-deps
```

## Usage

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import UnpluginDetectDuplicatedDeps from 'unplugin-detect-duplicated-deps/vite';

export default defineConfig({
  plugins: [UnpluginDetectDuplicatedDeps()],
});
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import UnpluginDetectDuplicatedDeps from 'unplugin-detect-duplicated-deps/rollup';

export default {
  plugins: [UnpluginDetectDuplicatedDeps()],
};
```

<br></details>

## Related Projects

- [duplicate-package-checker-webpack-plugin](https://github.com/darrenscerri/duplicate-package-checker-webpack-plugin)
- [unplugin](https://github.com/unjs/unplugin)
- [unplugin-starter](https://github.com/sxzz/unplugin-starter)
- [bundlephobia](https://bundlephobia.com/) provide the api to get package size

## License

[MIT](./LICENSE) License © 2023-PRESENT [YuTengjing](https://github.com/tjx666)
