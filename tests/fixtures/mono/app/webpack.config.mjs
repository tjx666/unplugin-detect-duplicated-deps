import unpluginDetectDuplicatedDeps from 'unplugin-detect-duplicated-deps/webpack';

/** @type {import('webpack').Configuration} */
const config = {
    entry: './index.js',
    mode: 'production',
    stats: 'errors-only',
    output: {
        filename: 'bundle.mjs',
        libraryTarget: 'module',
    },
    experiments: {
        outputModule: true,
    },
    plugins: [unpluginDetectDuplicatedDeps()],
};

export default config;
