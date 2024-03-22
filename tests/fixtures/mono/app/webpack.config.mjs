import unpluginDetectDuplicatedDeps from 'unplugin-detect-duplicated-deps/webpack';
import { resolve } from 'path';

/** @type {import('webpack').Configuration} */
const config = {
    entry: resolve(import.meta.dirname, './index.js'),
    mode: 'production',
    stats: 'none',
    output: {
        path: resolve(import.meta.dirname, './dist'),
        filename: 'bundle.mjs',
        libraryTarget: 'module',
    },
    experiments: {
        outputModule: true,
    },
    plugins: [unpluginDetectDuplicatedDeps()],
};

export default config;
