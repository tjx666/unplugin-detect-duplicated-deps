const config = require('@yutengjing/prettier-config');

config.overrides.push({
    files: 'src/options.ts',
    options: {
        // https://github.com/hosseinmd/prettier-plugin-jsdoc/issues/225
        plugins: [],
    },
});

module.exports = config;
