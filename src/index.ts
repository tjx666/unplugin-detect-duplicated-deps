import { createFilter } from '@rollup/pluginutils';
import { createUnplugin } from 'unplugin';

import { resolveOption } from './core/options';
import type { Options } from './core/options';

export default createUnplugin<Options | undefined>((rawOptions = {}) => {
    const options = resolveOption(rawOptions);
    const filter = createFilter(options.include, options.exclude);

    const name = 'unplugin-starter';
    return {
        name,
        enforce: undefined,

        transformInclude(id) {
            return filter(id);
        },

        transform(code, id) {
            console.log(code, id);
            // eslint-disable-next-line unicorn/no-useless-undefined
            return undefined;
        },
    };
});
