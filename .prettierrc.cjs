const config = require('@yutengjing/prettier-config');

config.overrides.push({
    files: ['src/options.ts', 'docs/configuration.md'],
    options: {
        // https://github.com/hosseinmd/prettier-plugin-jsdoc/issues/225
        plugins: [],
    },
});

module.exports = config;
