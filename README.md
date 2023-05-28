# unplugin-detect-duplicated-deps [![npm](https://img.shields.io/npm/v/unplugin-detect-duplicated-deps.svg)](https://npmjs.com/package/unplugin-detect-duplicated-deps)

[![Unit Test](https://github.com/tjx666/unplugin-detect-duplicated-deps/actions/workflows/unit-test.yml/badge.svg)](https://github.com/tjx666/unplugin-detect-duplicated-deps/actions/workflows/unit-test.yml)

Detect duplicate packaged dependencies

![effect](docs/effect.png)

> **Warning**
> This package is not yet stable. Please take special care before using it in a production environment

## Installation

```bash
npm i -D unplugin-detect-duplicated-deps
```

## Usage

```ts
// vite.config.ts
import UnpluginDetectDuplicatedDeps from 'unplugin-detect-duplicated-deps/vite';

export default defineConfig({
  plugins: [UnpluginDetectDuplicatedDeps()],
});
```

## License

[MIT](./LICENSE) License © 2023-PRESENT [YuTengjing](https://github.com/tjx666)
